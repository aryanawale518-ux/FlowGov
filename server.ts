import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  DEMO_USERS,
  DEPARTMENTS,
  WORKFLOW_TEMPLATES,
  getAllFiles,
  getFileById,
  addFile,
  updateFile,
  addAuditLog,
  getAuditLogs,
  getNotifications,
  markNotificationRead,
  calculateAnalyticsOverview,
  checkDocumentCompleteness
} from './server/data';
import { explainFileDelay, answerProcessQuery } from './server/gemini';
import { GovernmentFile, FileStageInstance, FileDocument, SlaStatus } from './src/types';
import {
  checkSupabaseConnection,
  syncFileToSupabase,
  syncAuditLogToSupabase
} from './server/supabase';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Current session demo role (defaults to admin for richest preview, easy switch in UI)
  let currentActiveRole = 'ADMIN';

  // API routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'FlowGov Process Intelligence', timestamp: new Date().toISOString() });
  });

  // Current user & demo role
  const handleGetCurrentUser = (req: express.Request, res: express.Response) => {
    const roleKey = currentActiveRole.toLowerCase();
    const user = DEMO_USERS[roleKey] || DEMO_USERS.admin;
    res.json({ user, availableRoles: DEMO_USERS, ...user });
  };
  app.get('/api/auth/me', handleGetCurrentUser);
  app.get('/api/auth/current-user', handleGetCurrentUser);

  app.post('/api/auth/switch-role', (req, res) => {
    const { role } = req.body;
    if (role && DEMO_USERS[role.toLowerCase()]) {
      currentActiveRole = role.toUpperCase();
      res.json({ success: true, user: DEMO_USERS[role.toLowerCase()] });
    } else {
      res.status(400).json({ error: 'Invalid role' });
    }
  });

  // Departments & Workflows
  app.get('/api/departments', (req, res) => {
    res.json({ departments: DEPARTMENTS });
  });

  app.get('/api/workflows', (req, res) => {
    res.json({ workflows: WORKFLOW_TEMPLATES });
  });

  // Files list with comprehensive filtering
  app.get('/api/files', (req, res) => {
    const { search, department, status, priority, stage, overdueOnly, loopOnly } = req.query;
    let files = getAllFiles();

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      files = files.filter(f =>
        f.fileNumber.toLowerCase().includes(q) ||
        f.title.toLowerCase().includes(q) ||
        f.departmentName.toLowerCase().includes(q) ||
        f.currentStageName.toLowerCase().includes(q)
      );
    }

    if (department && typeof department === 'string' && department !== 'ALL') {
      files = files.filter(f => f.departmentId === department || f.departmentName === department);
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      files = files.filter(f => f.status === status);
    }

    if (priority && typeof priority === 'string' && priority !== 'ALL') {
      files = files.filter(f => f.priority === priority);
    }

    if (stage && typeof stage === 'string' && stage !== 'ALL') {
      files = files.filter(f => f.currentStageName.toLowerCase().includes(stage.toLowerCase()));
    }

    if (overdueOnly === 'true') {
      files = files.filter(f => f.status === 'OVERDUE' || f.slaStatus === 'EXCEEDED_LIMIT');
    }

    if (loopOnly === 'true') {
      files = files.filter(f => f.loopsCount > 0);
    }

    res.json({ total: files.length, files });
  });

  // Single file details
  app.get('/api/files/:id', (req, res) => {
    const file = getFileById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    const auditLogs = getAuditLogs(file.id);
    res.json({ file, auditLogs });
  });

  // Create new file (Clerk)
  app.post('/api/files', (req, res) => {
    const { title, description, workflowTemplateId, departmentId, priority, documents } = req.body;
    const template = WORKFLOW_TEMPLATES.find(w => w.id === workflowTemplateId) || WORKFLOW_TEMPLATES[0];
    const dept = DEPARTMENTS.find(d => d.id === departmentId) || DEPARTMENTS[0];

    const fileCount = getAllFiles().length;
    const fileNumber = `FG-${1043 + fileCount}`;
    const now = new Date().toISOString();

    const stageInstances: FileStageInstance[] = template.stages.map((stg, idx) => ({
      id: `inst-${fileNumber}-${stg.id}`,
      fileId: `file-${fileNumber.toLowerCase()}`,
      stageId: stg.id,
      stageName: stg.name,
      sequence: stg.sequence,
      assignedRole: stg.responsibleRole,
      assignedTo: stg.responsibleRole === 'OFFICER' ? DEMO_USERS.officer.id : DEMO_USERS.clerk.id,
      assignedToName: stg.responsibleRole === 'OFFICER' ? DEMO_USERS.officer.name : DEMO_USERS.clerk.name,
      status: idx === 0 ? 'IN_PROGRESS' : 'PENDING',
      startedAt: idx === 0 ? now : undefined,
      expectedDurationHours: stg.expectedDurationHours,
      actualDurationHours: idx === 0 ? 0 : undefined,
      slaStatus: 'WITHIN_LIMIT'
    }));

    const fileDocs: FileDocument[] = Array.isArray(documents)
      ? documents.map((doc: { name: string; documentType: string }, idx: number) => ({
          id: `doc-${fileNumber}-${idx}`,
          fileId: `file-${fileNumber.toLowerCase()}`,
          name: doc.name,
          documentType: doc.documentType,
          status: 'VERIFIED',
          uploadedBy: DEMO_USERS.clerk.name,
          uploadedAt: now,
          fileSize: '1.8 MB'
        }))
      : [];

    const newFile: GovernmentFile = {
      id: `file-${fileNumber.toLowerCase()}`,
      fileNumber,
      title: title || `Administrative Submission - ${template.name}`,
      description: description || 'Official departmental workflow dossier initiated via FlowGov clerk intake.',
      workflowTemplateId: template.id,
      workflowTemplateName: template.name,
      departmentId: dept.id,
      departmentName: dept.name,
      createdBy: DEMO_USERS.clerk.id,
      createdByName: DEMO_USERS.clerk.name,
      currentStageId: template.stages[0].id,
      currentStageName: template.stages[0].name,
      status: 'DRAFT',
      priority: priority || 'MEDIUM',
      slaStatus: 'WITHIN_LIMIT',
      createdAt: now,
      updatedAt: now,
      totalDurationHours: 0,
      expectedTotalDurationHours: template.stages.reduce((a, b) => a + b.expectedDurationHours, 0),
      loopsCount: 0,
      stageInstances,
      documents: fileDocs
    };

    addFile(newFile);

    const createdLog = addAuditLog({
      fileId: newFile.id,
      fileNumber: newFile.fileNumber,
      userId: DEMO_USERS.clerk.id,
      userName: DEMO_USERS.clerk.name,
      userRole: 'CLERK',
      action: 'FILE_CREATED',
      description: `File ${newFile.fileNumber} created under ${template.name}`
    });

    // Background sync to Supabase
    syncFileToSupabase(newFile).catch(() => {});
    syncAuditLogToSupabase(createdLog).catch(() => {});

    res.status(201).json({ file: newFile });
  });

  // Submit file into workflow
  app.post('/api/files/:id/submit', (req, res) => {
    const file = getFileById(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });

    const now = new Date().toISOString();
    // Complete first stage and move to stage 2
    const updatedStages = [...file.stageInstances];
    if (updatedStages[0]) {
      updatedStages[0].status = 'COMPLETED';
      updatedStages[0].completedAt = now;
      updatedStages[0].actualDurationHours = 1;
    }
    if (updatedStages[1]) {
      updatedStages[1].status = 'IN_PROGRESS';
      updatedStages[1].startedAt = now;
      file.currentStageId = updatedStages[1].stageId;
      file.currentStageName = updatedStages[1].stageName;
    }

    const updated = updateFile(file.id, {
      status: 'IN_PROGRESS',
      stageInstances: updatedStages,
      updatedAt: now
    });

    const submitLog = addAuditLog({
      fileId: file.id,
      fileNumber: file.fileNumber,
      userId: DEMO_USERS.clerk.id,
      userName: DEMO_USERS.clerk.name,
      userRole: 'CLERK',
      action: 'FILE_SUBMITTED',
      description: `File submitted to ${file.currentStageName}`
    });

    if (updated) syncFileToSupabase(updated).catch(() => {});
    syncAuditLogToSupabase(submitLog).catch(() => {});

    res.json({ file: updated });
  });

  // Approve current stage
  app.post('/api/files/:id/approve', (req, res) => {
    const file = getFileById(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });

    const { remarks } = req.body;
    const now = new Date().toISOString();
    const stages = [...file.stageInstances];
    const currentIdx = stages.findIndex(s => s.stageId === file.currentStageId);

    if (currentIdx === -1) return res.status(400).json({ error: 'Invalid stage' });

    // Mark current stage completed
    stages[currentIdx].status = 'COMPLETED';
    stages[currentIdx].completedAt = now;
    stages[currentIdx].remarks = remarks || 'Approved by reviewing officer in accordance with standard procedure.';

    let nextStageId = file.currentStageId;
    let nextStageName = file.currentStageName;
    let fileStatus = file.status;

    if (currentIdx + 1 < stages.length) {
      stages[currentIdx + 1].status = 'IN_PROGRESS';
      stages[currentIdx + 1].startedAt = now;
      nextStageId = stages[currentIdx + 1].stageId;
      nextStageName = stages[currentIdx + 1].stageName;
      fileStatus = 'IN_PROGRESS';
    } else {
      fileStatus = 'COMPLETED';
    }

    const updated = updateFile(file.id, {
      status: fileStatus,
      currentStageId: nextStageId,
      currentStageName: nextStageName,
      stageInstances: stages,
      slaStatus: 'WITHIN_LIMIT',
      updatedAt: now
    });

    const approveLog = addAuditLog({
      fileId: file.id,
      fileNumber: file.fileNumber,
      userId: DEMO_USERS.officer.id,
      userName: DEMO_USERS.officer.name,
      userRole: 'OFFICER',
      action: fileStatus === 'COMPLETED' ? 'FILE_COMPLETED' : 'STAGE_APPROVED',
      description: `Stage '${stages[currentIdx].stageName}' approved. ${remarks ? `Remarks: ${remarks}` : ''}`
    });

    if (updated) syncFileToSupabase(updated).catch(() => {});
    syncAuditLogToSupabase(approveLog).catch(() => {});

    res.json({ file: updated });
  });

  // Return file for clarification (creates a workflow loop)
  app.post('/api/files/:id/return', (req, res) => {
    const file = getFileById(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });

    const { reason, targetStageId } = req.body;
    const now = new Date().toISOString();
    const stages = [...file.stageInstances];
    const currentIdx = stages.findIndex(s => s.stageId === file.currentStageId);

    if (currentIdx === -1) return res.status(400).json({ error: 'Invalid current stage' });

    // Record return on current stage
    stages[currentIdx].status = 'RETURNED';
    stages[currentIdx].clarificationReason = reason || 'Clarification required regarding supporting documentation.';
    stages[currentIdx].isReturned = true;

    // Step back to earlier stage (default: previous stage or Section Review)
    let returnIdx = Math.max(0, currentIdx - 1);
    if (targetStageId) {
      const specifiedIdx = stages.findIndex(s => s.stageId === targetStageId);
      if (specifiedIdx !== -1) returnIdx = specifiedIdx;
    }

    stages[returnIdx].status = 'IN_PROGRESS';
    stages[returnIdx].startedAt = now;

    const newLoopsCount = file.loopsCount + 1;

    const updated = updateFile(file.id, {
      status: 'RETURNED',
      currentStageId: stages[returnIdx].stageId,
      currentStageName: stages[returnIdx].stageName,
      stageInstances: stages,
      loopsCount: newLoopsCount,
      updatedAt: now
    });

    const returnLog = addAuditLog({
      fileId: file.id,
      fileNumber: file.fileNumber,
      userId: DEMO_USERS.officer.id,
      userName: DEMO_USERS.officer.name,
      userRole: 'OFFICER',
      action: 'FILE_RETURNED',
      description: `Returned from '${stages[currentIdx].stageName}' to '${stages[returnIdx].stageName}' for clarification: "${reason || 'Documentation clarification'}" (Loop #${newLoopsCount})`
    });

    if (updated) syncFileToSupabase(updated).catch(() => {});
    syncAuditLogToSupabase(returnLog).catch(() => {});

    res.json({ file: updated });
  });


  // Add document to file
  app.post('/api/files/:id/documents', (req, res) => {
    const file = getFileById(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });

    const { name, documentType } = req.body;
    const newDoc: FileDocument = {
      id: `doc-${file.fileNumber}-${file.documents.length + 1}`,
      fileId: file.id,
      name: name || `${documentType}.pdf`,
      documentType: documentType || 'Supporting Certificate',
      status: 'VERIFIED',
      uploadedBy: DEMO_USERS.clerk.name,
      uploadedAt: new Date().toISOString(),
      fileSize: '1.9 MB'
    };

    const updatedDocs = [...file.documents, newDoc];
    const updated = updateFile(file.id, { documents: updatedDocs });

    addAuditLog({
      fileId: file.id,
      fileNumber: file.fileNumber,
      userId: DEMO_USERS.clerk.id,
      userName: DEMO_USERS.clerk.name,
      userRole: 'CLERK',
      action: 'DOCUMENT_UPLOADED',
      description: `Uploaded document: ${newDoc.name} (${newDoc.documentType})`
    });

    res.json({ file: updated, document: newDoc });
  });

  // Document Completeness Check (AI / Rule check)
  app.post('/api/documents/check-completeness', (req, res) => {
    const { workflowTemplateId, uploadedDocTypes } = req.body;
    const result = checkDocumentCompleteness(workflowTemplateId, uploadedDocTypes || []);
    res.json(result);
  });

  // Analytics Overview
  app.get('/api/analytics/overview', (req, res) => {
    const overview = calculateAnalyticsOverview();
    res.json(overview);
  });

  // AI "Why is this file stuck?" explanation
  app.post('/api/ai/explain-file', async (req, res) => {
    const { fileId } = req.body;
    const file = getFileById(fileId);
    if (!file) return res.status(404).json({ error: 'File not found' });

    const explanation = await explainFileDelay(file);
    res.json(explanation);
  });

  // Natural Language Process Query
  app.post('/api/ai/query', async (req, res) => {
    const { question } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question string is required' });
    }

    const analytics = calculateAnalyticsOverview();
    const result = await answerProcessQuery(question, analytics);
    res.json(result);
  });

  // Audit Logs
  app.get('/api/audit-logs', (req, res) => {
    const { fileId } = req.query;
    const logs = getAuditLogs(typeof fileId === 'string' ? fileId : undefined);
    res.json({ logs });
  });

  // Notifications
  app.get('/api/notifications', (req, res) => {
    const { userId } = req.query;
    const notifs = getNotifications(typeof userId === 'string' ? userId : undefined);
    res.json({ notifications: notifs });
  });

  app.post('/api/notifications/:id/read', (req, res) => {
    const success = markNotificationRead(req.params.id);
    res.json({ success });
  });

  // Supabase PostgreSQL & Auth integration status
  app.get('/api/supabase/status', async (req, res) => {
    const status = await checkSupabaseConnection();
    res.json(status);
  });

  // Sync all in-memory dossiers and audit records to Supabase tables
  app.post('/api/supabase/sync-all', async (req, res) => {
    try {
      const files = getAllFiles();
      const logs = getAuditLogs();
      let syncedFiles = 0;
      let syncedLogs = 0;

      for (const file of files) {
        const ok = await syncFileToSupabase(file);
        if (ok) syncedFiles++;
      }

      for (const log of logs) {
        const ok = await syncAuditLogToSupabase(log);
        if (ok) syncedLogs++;
      }

      res.json({
        success: true,
        syncedFiles,
        totalFiles: files.length,
        syncedLogs,
        totalLogs: logs.length,
        message: `Synced ${syncedFiles}/${files.length} files and ${syncedLogs}/${logs.length} audit logs to Supabase.`
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  // Explicit 404 for unknown /api/* routes so API calls never return index.html
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FlowGov server running on http://localhost:${PORT}`);
  });
}

startServer();
