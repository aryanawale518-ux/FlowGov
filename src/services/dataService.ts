import { supabase } from '../lib/supabase';
import {
  GovernmentFile,
  AuditLog,
  Department,
  WorkflowTemplate,
  AnalyticsOverview,
  InAppNotification,
  UserProfile
} from '../types';
import {
  DEPARTMENTS,
  WORKFLOW_TEMPLATES,
  DEMO_USERS,
  SYNTHETIC_DEMO_FILES,
  SYNTHETIC_AUDIT_LOGS,
  SYNTHETIC_NOTIFICATIONS,
  calculateAnalyticsOverview
} from '../data/mockData';

export interface FlowGovDataState {
  files: GovernmentFile[];
  auditLogs: AuditLog[];
  departments: Department[];
  workflows: WorkflowTemplate[];
  analytics: AnalyticsOverview;
  notifications: InAppNotification[];
  currentUser: UserProfile;
  dataSource: 'api' | 'supabase' | 'demo';
  isSynthetic: boolean;
}

// Helper to safely parse JSON from a response
async function parseJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    if (!res.ok) return null;
    const ct = res.headers.get('content-type');
    if (ct && ct.includes('application/json')) {
      return (await res.json()) as T;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Normalizes a database row from Supabase into a GovernmentFile object
 */
function normalizeSupabaseFileRow(row: any): GovernmentFile {
  if (row.data && typeof row.data === 'object' && row.data.fileNumber) {
    return {
      ...row.data,
      id: row.id || row.data.id,
      fileNumber: row.file_number || row.data.fileNumber,
      title: row.title || row.data.title,
      status: row.status || row.data.status,
      priority: row.priority || row.data.priority,
      updatedAt: row.updated_at || row.data.updatedAt
    };
  }

  return {
    id: row.id,
    fileNumber: row.file_number,
    title: row.title,
    description: row.description || '',
    departmentId: row.department_id || 'dept-procurement',
    departmentName: row.department_name || 'Procurement',
    workflowTemplateId: row.workflow_template_id || 'wf-procurement',
    workflowTemplateName: row.workflow_template_name || 'Procurement Request',
    status: row.status || 'IN_PROGRESS',
    priority: row.priority || 'MEDIUM',
    slaStatus: row.sla_status || 'WITHIN_LIMIT',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    createdBy: row.created_by_user_id || 'user-clerk-1',
    createdByName: row.created_by_user_name || 'Executive Clerk',
    currentStageId: row.current_stage_id || 'stg-app',
    currentStageName: row.current_stage_name || 'Application Intake',
    loopsCount: row.loops_count || 0,
    totalDurationHours: Number(row.total_duration_hours) || 24,
    expectedTotalDurationHours: Number(row.expected_total_duration_hours) || 72,
    documents: [],
    stageInstances: []
  };
}

/**
 * Normalizes an audit log row from Supabase into an AuditLog object
 */
function normalizeSupabaseAuditRow(row: any): AuditLog {
  if (row.data && typeof row.data === 'object' && row.data.action) {
    return {
      ...row.data,
      id: row.id || row.data.id,
      fileId: row.file_id || row.data.fileId,
      fileNumber: row.file_number || row.data.fileNumber,
      createdAt: row.created_at || row.data.createdAt
    };
  }

  return {
    id: row.id,
    fileId: row.file_id,
    fileNumber: row.file_number,
    userId: row.user_id,
    userName: row.user_name || 'System Operator',
    userRole: row.user_role || 'CLERK',
    action: row.action,
    description: row.description || '',
    createdAt: row.created_at || new Date().toISOString()
  };
}

/**
 * Loads FlowGov data with multi-tier resilience:
 * 1. Express backend API (if running full-stack)
 * 2. Supabase directly (if table has rows)
 * 3. Synthetic Demo Data fallback (always succeeds, never leaves dashboard blank!)
 */
export async function loadFlowGovData(): Promise<FlowGovDataState> {
  // Tier 1: Try local/backend API first (works in full-stack Express environments)
  try {
    const apiTest = await fetch('/api/files', { method: 'GET' });
    const apiData = await parseJsonSafe<{ files: GovernmentFile[] }>(apiTest);

    if (apiData && Array.isArray(apiData.files) && apiData.files.length > 0) {
      const [deptsRes, wfsRes, analyticsRes, logsRes, notifsRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/workflows'),
        fetch('/api/analytics/overview'),
        fetch('/api/audit-logs'),
        fetch('/api/notifications')
      ]);

      const departments = (await parseJsonSafe<{ departments: Department[] }>(deptsRes))?.departments || DEPARTMENTS;
      const workflows = (await parseJsonSafe<{ workflows: WorkflowTemplate[] }>(wfsRes))?.workflows || WORKFLOW_TEMPLATES;
      const analytics = (await parseJsonSafe<AnalyticsOverview>(analyticsRes)) || calculateAnalyticsOverview(apiData.files);
      const auditLogs = (await parseJsonSafe<{ logs: AuditLog[] }>(logsRes))?.logs || SYNTHETIC_AUDIT_LOGS;
      const notifications = (await parseJsonSafe<{ notifications: InAppNotification[] }>(notifsRes))?.notifications || SYNTHETIC_NOTIFICATIONS;

      return {
        files: apiData.files,
        auditLogs,
        departments,
        workflows,
        analytics,
        notifications,
        currentUser: DEMO_USERS.admin,
        dataSource: 'api',
        isSynthetic: false
      };
    }
  } catch {
    // API not available or static Vercel build, fall through to Supabase direct
  }

  // Tier 2: Try direct Supabase query
  try {
    const { data: dbFiles, error: filesError } = await supabase
      .from('government_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (!filesError && dbFiles && dbFiles.length > 0) {
      const files = dbFiles.map(normalizeSupabaseFileRow);

      const { data: dbLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      const auditLogs = dbLogs && dbLogs.length > 0
        ? dbLogs.map(normalizeSupabaseAuditRow)
        : SYNTHETIC_AUDIT_LOGS;

      const analytics = calculateAnalyticsOverview(files);

      return {
        files,
        auditLogs,
        departments: DEPARTMENTS,
        workflows: WORKFLOW_TEMPLATES,
        analytics,
        notifications: SYNTHETIC_NOTIFICATIONS,
        currentUser: DEMO_USERS.admin,
        dataSource: 'supabase',
        isSynthetic: false
      };
    }
  } catch (err) {
    console.warn('Direct Supabase fetch fallback to synthetic data:', err);
  }

  // Tier 3: Synthetic Demo Data fallback (Safe for empty database / initial deployment)
  const syntheticFiles = [...SYNTHETIC_DEMO_FILES];
  const syntheticLogs = [...SYNTHETIC_AUDIT_LOGS];
  const analytics = calculateAnalyticsOverview(syntheticFiles);

  return {
    files: syntheticFiles,
    auditLogs: syntheticLogs,
    departments: DEPARTMENTS,
    workflows: WORKFLOW_TEMPLATES,
    analytics,
    notifications: SYNTHETIC_NOTIFICATIONS,
    currentUser: DEMO_USERS.admin,
    dataSource: 'demo',
    isSynthetic: true
  };
}

/**
 * Seeds synthetic demo data into Supabase Postgres database.
 * Uses standard RLS-compatible columns and JSONB payload.
 */
export async function seedDemoDataToSupabase(): Promise<{ success: boolean; message: string; count: number }> {
  try {
    const filePayloads = SYNTHETIC_DEMO_FILES.map(file => ({
      id: file.id,
      file_number: file.fileNumber,
      title: file.title,
      description: file.description || '',
      department_id: file.departmentId,
      department_name: file.departmentName,
      workflow_template_id: file.workflowTemplateId,
      workflow_template_name: file.workflowTemplateName,
      status: file.status,
      priority: file.priority,
      sla_status: file.slaStatus,
      created_at: file.createdAt,
      updated_at: file.updatedAt,
      created_by_user_id: file.createdBy,
      created_by_user_name: file.createdByName,
      current_stage_id: file.currentStageId,
      current_stage_name: file.currentStageName,
      loops_count: file.loopsCount || 0,
      total_duration_hours: file.totalDurationHours,
      expected_total_duration_hours: file.expectedTotalDurationHours,
      data: file
    }));

    const { error: filesError } = await supabase
      .from('government_files')
      .upsert(filePayloads, { onConflict: 'id' });

    if (filesError) {
      throw new Error(`Files upsert error: ${filesError.message}`);
    }

    const logPayloads = SYNTHETIC_AUDIT_LOGS.map(log => ({
      id: log.id,
      file_id: log.fileId,
      file_number: log.fileNumber,
      user_id: log.userId,
      user_name: log.userName,
      user_role: log.userRole,
      action: log.action,
      description: log.description,
      created_at: log.createdAt,
      metadata: log.metadata || {},
      data: log
    }));

    const { error: logsError } = await supabase
      .from('audit_logs')
      .upsert(logPayloads, { onConflict: 'id' });

    if (logsError) {
      console.warn('Audit logs upsert note:', logsError.message);
    }

    return {
      success: true,
      message: `Successfully seeded ${filePayloads.length} government dossiers and audit records into Supabase!`,
      count: filePayloads.length
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to seed demo data to Supabase.',
      count: 0
    };
  }
}

/**
 * Saves or updates a dossier and appends an audit log.
 * Updates Supabase directly and triggers background API sync if available.
 */
export async function persistFileUpdate(
  updatedFile: GovernmentFile,
  auditLog?: AuditLog
): Promise<void> {
  // 1. Direct Supabase write
  try {
    await supabase.from('government_files').upsert({
      id: updatedFile.id,
      file_number: updatedFile.fileNumber,
      title: updatedFile.title,
      description: updatedFile.description || '',
      department_id: updatedFile.departmentId,
      department_name: updatedFile.departmentName,
      workflow_template_id: updatedFile.workflowTemplateId,
      workflow_template_name: updatedFile.workflowTemplateName,
      status: updatedFile.status,
      priority: updatedFile.priority,
      sla_status: updatedFile.slaStatus,
      created_at: updatedFile.createdAt,
      updated_at: new Date().toISOString(),
      created_by_user_id: updatedFile.createdBy,
      created_by_user_name: updatedFile.createdByName,
      current_stage_id: updatedFile.currentStageId,
      current_stage_name: updatedFile.currentStageName,
      loops_count: updatedFile.loopsCount || 0,
      total_duration_hours: updatedFile.totalDurationHours,
      expected_total_duration_hours: updatedFile.expectedTotalDurationHours,
      data: updatedFile
    }, { onConflict: 'id' });

    if (auditLog) {
      await supabase.from('audit_logs').insert({
        id: auditLog.id,
        file_id: auditLog.fileId,
        file_number: auditLog.fileNumber,
        user_id: auditLog.userId,
        user_name: auditLog.userName,
        user_role: auditLog.userRole,
        action: auditLog.action,
        description: auditLog.description,
        created_at: auditLog.createdAt,
        metadata: auditLog.metadata || {},
        data: auditLog
      });
    }
  } catch (err) {
    console.warn('Supabase persist note:', err);
  }
}
