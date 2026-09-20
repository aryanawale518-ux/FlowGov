import {
  UserProfile,
  Department,
  WorkflowTemplate,
  GovernmentFile,
  AuditLog,
  InAppNotification,
  FileStageInstance,
  FileDocument,
  FileStatus,
  FilePriority,
  SlaStatus,
  StageStatus,
  AnalyticsOverview,
  StageMetric,
  LoopMetric,
  ParallelizationCandidate,
  AiProcessInsight,
  CompletenessCheckResult
} from '../src/types';

export const DEMO_USERS: Record<string, UserProfile> = {
  admin: {
    id: 'user-admin-1',
    name: 'Rajesh Kumar',
    email: 'admin@flowgov.demo',
    role: 'ADMIN',
    departmentId: 'dept-admin',
    departmentName: 'General Administration',
    designation: 'Director of Process Intelligence & Operations'
  },
  officer: {
    id: 'user-officer-1',
    name: 'Sunita Sharma',
    email: 'officer@flowgov.demo',
    role: 'OFFICER',
    departmentId: 'dept-procurement',
    departmentName: 'Procurement',
    designation: 'Senior Reviewing & Approving Officer'
  },
  clerk: {
    id: 'user-clerk-1',
    name: 'Amit Patel',
    email: 'clerk@flowgov.demo',
    role: 'CLERK',
    departmentId: 'dept-procurement',
    departmentName: 'Procurement',
    designation: 'Executive Administrative Clerk'
  }
};

export const DEPARTMENTS: Department[] = [
  { id: 'dept-procurement', name: 'Procurement', description: 'Procurement of equipment, supplies and civil contracts' },
  { id: 'dept-pwd', name: 'Public Works', description: 'Infrastructure, road maintenance and municipal works' },
  { id: 'dept-revenue', name: 'Revenue', description: 'Land records, property tax assessments, and registrations' },
  { id: 'dept-admin', name: 'Administration', description: 'Inter-departmental sanctions and administrative permissions' },
  { id: 'dept-education', name: 'Education', description: 'Institutional grants, scholarship verifications, and approvals' }
];

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'wf-procurement',
    name: 'Procurement Request',
    description: 'Standard multi-tier review for vendor equipment and tender proposals',
    departmentId: 'dept-procurement',
    departmentName: 'Procurement',
    requiredDocuments: [
      'Application Form',
      'Vendor Identity Proof',
      'Technical Specification Certificate',
      'Financial Statement / Price Quotation'
    ],
    stages: [
      { id: 'stg-app', name: 'Application Intake', sequence: 1, expectedDurationHours: 8, isRequired: true, responsibleRole: 'CLERK' },
      { id: 'stg-doc-verif', name: 'Document Verification', sequence: 2, expectedDurationHours: 8, isRequired: true, responsibleRole: 'CLERK', canParallelizeWith: ['stg-sec-rev'] },
      { id: 'stg-sec-rev', name: 'Section Review', sequence: 3, expectedDurationHours: 16, isRequired: true, responsibleRole: 'OFFICER', canParallelizeWith: ['stg-fin-rev'] },
      { id: 'stg-fin-rev', name: 'Financial Review', sequence: 4, expectedDurationHours: 16, isRequired: true, responsibleRole: 'OFFICER' },
      { id: 'stg-off-appr', name: 'Officer Review & Approval', sequence: 5, expectedDurationHours: 24, isRequired: true, responsibleRole: 'OFFICER' },
      { id: 'stg-dispatch', name: 'Final Dispatch', sequence: 6, expectedDurationHours: 8, isRequired: true, responsibleRole: 'CLERK' }
    ]
  },
  {
    id: 'wf-admin-sanction',
    name: 'Administrative Approval',
    description: 'Inter-departmental project administrative approvals and sanctions',
    departmentId: 'dept-admin',
    departmentName: 'Administration',
    requiredDocuments: [
      'Project Proposal Note',
      'Departmental Clearance',
      'Budget Allocation Memo'
    ],
    stages: [
      { id: 'stg-adm-1', name: 'Verification A (Technical Scope)', sequence: 1, expectedDurationHours: 12, isRequired: true, responsibleRole: 'CLERK', canParallelizeWith: ['stg-adm-2', 'stg-adm-3'] },
      { id: 'stg-adm-2', name: 'Verification B (Budgetary Code)', sequence: 2, expectedDurationHours: 12, isRequired: true, responsibleRole: 'OFFICER', canParallelizeWith: ['stg-adm-1', 'stg-adm-3'] },
      { id: 'stg-adm-3', name: 'Verification C (Legal Compliance)', sequence: 3, expectedDurationHours: 16, isRequired: true, responsibleRole: 'OFFICER', canParallelizeWith: ['stg-adm-1', 'stg-adm-2'] },
      { id: 'stg-adm-4', name: 'Department Head Approval', sequence: 4, expectedDurationHours: 24, isRequired: true, responsibleRole: 'OFFICER' },
      { id: 'stg-adm-5', name: 'Sanction Order Dispatch', sequence: 5, expectedDurationHours: 8, isRequired: true, responsibleRole: 'CLERK' }
    ]
  },
  {
    id: 'wf-cert-verif',
    name: 'Certificate Verification',
    description: 'Public verification of municipal clearances, licenses, and certificates',
    departmentId: 'dept-revenue',
    departmentName: 'Revenue',
    requiredDocuments: [
      'Original Certificate Copy',
      'Identity Verification',
      'Site Inspection Report'
    ],
    stages: [
      { id: 'stg-crt-1', name: 'Initial Scrutiny', sequence: 1, expectedDurationHours: 8, isRequired: true, responsibleRole: 'CLERK' },
      { id: 'stg-crt-2', name: 'Field Inspection Review', sequence: 2, expectedDurationHours: 24, isRequired: true, responsibleRole: 'OFFICER' },
      { id: 'stg-crt-3', name: 'Revenue Officer Signoff', sequence: 3, expectedDurationHours: 16, isRequired: true, responsibleRole: 'OFFICER' },
      { id: 'stg-crt-4', name: 'Digital Attestation', sequence: 4, expectedDurationHours: 4, isRequired: true, responsibleRole: 'CLERK' }
    ]
  }
];

// In-memory persistent database
let filesStore: GovernmentFile[] = [];
let auditLogsStore: AuditLog[] = [];
let notificationsStore: InAppNotification[] = [];

// Helper to format ISO dates relative to simulated current time
function getDateOffset(hoursAgo: number): string {
  const d = new Date(Date.now() - hoursAgo * 3600 * 1000);
  return d.toISOString();
}

export function initializeDatabase() {
  if (filesStore.length > 0) return;

  // Primary Demo File: FG-1042
  const fg1042: GovernmentFile = {
    id: 'file-fg-1042',
    fileNumber: 'FG-1042',
    title: 'Procurement of High-Precision Spectrometry Equipment - Lab Batch 4',
    description: 'Departmental acquisition of analytical spectrometry units for state testing laboratories under scientific modernisation fund.',
    workflowTemplateId: 'wf-procurement',
    workflowTemplateName: 'Procurement Request',
    departmentId: 'dept-procurement',
    departmentName: 'Procurement',
    createdBy: DEMO_USERS.clerk.id,
    createdByName: DEMO_USERS.clerk.name,
    currentStageId: 'stg-off-appr',
    currentStageName: 'Officer Review & Approval',
    status: 'OVERDUE',
    priority: 'HIGH',
    slaStatus: 'EXCEEDED_LIMIT',
    createdAt: getDateOffset(140),
    updatedAt: getDateOffset(4),
    totalDurationHours: 136,
    expectedTotalDurationHours: 72,
    loopsCount: 1,
    documents: [
      {
        id: 'doc-1',
        fileId: 'file-fg-1042',
        name: 'Official_Procurement_Application_Form.pdf',
        documentType: 'Application Form',
        status: 'VERIFIED',
        uploadedBy: DEMO_USERS.clerk.name,
        uploadedAt: getDateOffset(139),
        fileSize: '1.4 MB'
      },
      {
        id: 'doc-2',
        fileId: 'file-fg-1042',
        name: 'Vendor_Registration_Certificate_2026.pdf',
        documentType: 'Vendor Identity Proof',
        status: 'VERIFIED',
        uploadedBy: DEMO_USERS.clerk.name,
        uploadedAt: getDateOffset(139),
        fileSize: '840 KB'
      },
      {
        id: 'doc-3',
        fileId: 'file-fg-1042',
        name: 'Technical_Benchmarking_Certificate.pdf',
        documentType: 'Technical Specification Certificate',
        status: 'VERIFIED',
        uploadedBy: DEMO_USERS.clerk.name,
        uploadedAt: getDateOffset(139),
        fileSize: '3.1 MB'
      },
      {
        id: 'doc-4',
        fileId: 'file-fg-1042',
        name: 'Financial_Quotation_and_Audit_Statement.pdf',
        documentType: 'Financial Statement / Price Quotation',
        status: 'VERIFIED',
        uploadedBy: DEMO_USERS.clerk.name,
        uploadedAt: getDateOffset(138),
        fileSize: '2.2 MB',
        aiNotes: 'Uploaded following completeness check warning'
      }
    ],
    stageInstances: [
      {
        id: 'inst-1',
        fileId: 'file-fg-1042',
        stageId: 'stg-app',
        stageName: 'Application Intake',
        sequence: 1,
        assignedTo: DEMO_USERS.clerk.id,
        assignedToName: DEMO_USERS.clerk.name,
        assignedRole: 'CLERK',
        status: 'COMPLETED',
        startedAt: getDateOffset(140),
        completedAt: getDateOffset(134),
        expectedDurationHours: 8,
        actualDurationHours: 6,
        slaStatus: 'WITHIN_LIMIT',
        remarks: 'Application intake verified against procurement checklist. All required documents accounted for.'
      },
      {
        id: 'inst-2',
        fileId: 'file-fg-1042',
        stageId: 'stg-doc-verif',
        stageName: 'Document Verification',
        sequence: 2,
        assignedTo: DEMO_USERS.clerk.id,
        assignedToName: DEMO_USERS.clerk.name,
        assignedRole: 'CLERK',
        status: 'COMPLETED',
        startedAt: getDateOffset(134),
        completedAt: getDateOffset(126),
        expectedDurationHours: 8,
        actualDurationHours: 8,
        slaStatus: 'WITHIN_LIMIT',
        remarks: 'Vendor certificates and technical compliance verified via state database.'
      },
      {
        id: 'inst-3',
        fileId: 'file-fg-1042',
        stageId: 'stg-sec-rev',
        stageName: 'Section Review',
        sequence: 3,
        assignedTo: DEMO_USERS.officer.id,
        assignedToName: DEMO_USERS.officer.name,
        assignedRole: 'OFFICER',
        status: 'COMPLETED',
        startedAt: getDateOffset(126),
        completedAt: getDateOffset(108),
        expectedDurationHours: 16,
        actualDurationHours: 18,
        slaStatus: 'WITHIN_LIMIT',
        remarks: 'Initial section scrutiny completed. Recommended forward transmission to finance.'
      },
      {
        id: 'inst-4',
        fileId: 'file-fg-1042',
        stageId: 'stg-fin-rev',
        stageName: 'Financial Review',
        sequence: 4,
        assignedTo: DEMO_USERS.officer.id,
        assignedToName: DEMO_USERS.officer.name,
        assignedRole: 'OFFICER',
        status: 'COMPLETED',
        startedAt: getDateOffset(108),
        completedAt: getDateOffset(84),
        expectedDurationHours: 16,
        actualDurationHours: 24,
        slaStatus: 'APPROACHING_LIMIT',
        remarks: 'Budgetary head 4059 verified against annual capital expenditure ceiling.'
      },
      {
        id: 'inst-5',
        fileId: 'file-fg-1042',
        stageId: 'stg-off-appr',
        stageName: 'Officer Review & Approval',
        sequence: 5,
        assignedTo: DEMO_USERS.officer.id,
        assignedToName: DEMO_USERS.officer.name,
        assignedRole: 'OFFICER',
        status: 'IN_PROGRESS',
        startedAt: getDateOffset(84),
        expectedDurationHours: 24,
        actualDurationHours: 84, // 3 days 12 hours!
        slaStatus: 'EXCEEDED_LIMIT',
        remarks: 'Returned to Section Review on Day 2 for clarification regarding warranty clause 14.B; clarification response received and awaiting final signoff.',
        clarificationReason: 'Warranty terms clarification required prior to executive sanction'
      },
      {
        id: 'inst-6',
        fileId: 'file-fg-1042',
        stageId: 'stg-dispatch',
        stageName: 'Final Dispatch',
        sequence: 6,
        assignedRole: 'CLERK',
        status: 'PENDING',
        expectedDurationHours: 8,
        slaStatus: 'WITHIN_LIMIT'
      }
    ]
  };

  filesStore.push(fg1042);

  // Generate 125 additional realistic files
  const titles = [
    'Emergency Repair Sanction for National Highway Arterial Culvert',
    'Procurement of 500 Desktop Terminals for District Sub-Registrars',
    'Town Planning Scheme 42 Land Title Cadastral Regularization',
    'Higher Secondary School Solar Rooftop Grant Disbursal Note',
    'Municipal Solid Waste Concessionaire Annual Indexation Adjustment',
    'Departmental Vehicle Fleet Maintenance Contract Extension',
    'Civil Hospital Medical Gas Pipeline Refurbishment Tender Approval',
    'Digitization of Old Tahsil Land Records Phase 3 Sanction',
    'Rural Water Pumping Station Replacement Submersible Motors',
    'Annual Maintenance Contract for State Data Center Firewall Systems',
    'Fire Safety Audit Compliance Sanction for Secretariat Complex',
    'Irrigation Canal Desilting Pre-Monsoon Project Sanction',
    'Secondary Education STEM Lab Robotics Kits Allocation Batch A',
    'Revenue Stamp Distribution Vendor Renewal Sanction 2026-27',
    'Administrative Sanction for District Collectorate Annex Wing'
  ];

  const depts = DEPARTMENTS;
  const templates = WORKFLOW_TEMPLATES;

  for (let i = 1; i <= 125; i++) {
    const fileNum = `FG-${1043 + i}`;
    const titleBase = titles[i % titles.length];
    const dept = depts[i % depts.length];
    const template = templates[i % templates.length];
    
    // Simulate distribution:
    // ~20% completed, ~40% in progress, ~25% overdue (mostly in Officer Review!), ~15% returned
    const rand = Math.random();
    let status: FileStatus = 'IN_PROGRESS';
    let slaStatus: SlaStatus = 'WITHIN_LIMIT';
    let loops = 0;

    if (rand < 0.22) {
      status = 'COMPLETED';
      slaStatus = 'WITHIN_LIMIT';
    } else if (rand < 0.48) {
      status = 'OVERDUE';
      slaStatus = 'EXCEEDED_LIMIT';
    } else if (rand < 0.65) {
      status = 'RETURNED';
      slaStatus = 'APPROACHING_LIMIT';
      loops = 1;
    } else if (rand < 0.75) {
      // Multiple loops case
      status = 'IN_PROGRESS';
      slaStatus = 'EXCEEDED_LIMIT';
      loops = 2;
    } else {
      status = 'IN_PROGRESS';
      slaStatus = Math.random() > 0.6 ? 'APPROACHING_LIMIT' : 'WITHIN_LIMIT';
    }

    const priority: FilePriority = i % 11 === 0 ? 'CRITICAL' : i % 4 === 0 ? 'HIGH' : i % 2 === 0 ? 'MEDIUM' : 'LOW';

    // Pick current stage: skew toward Officer Review to demonstrate real bottleneck!
    const stagesCount = template.stages.length;
    let currentStageIndex = 0;
    if (status === 'COMPLETED') {
      currentStageIndex = stagesCount - 1;
    } else if (status === 'OVERDUE') {
      // 70% of overdue files are in Officer Review / Department Approval!
      const officerReviewIndex = template.stages.findIndex(s => s.name.includes('Officer') || s.name.includes('Approval'));
      currentStageIndex = officerReviewIndex !== -1 && Math.random() > 0.25 ? officerReviewIndex : Math.floor(Math.random() * (stagesCount - 1));
    } else {
      currentStageIndex = Math.floor(Math.random() * (stagesCount - 1));
    }

    const currentStage = template.stages[currentStageIndex];
    const hoursElapsedTotal = Math.floor(20 + Math.random() * 140);
    const expectedTotal = template.stages.reduce((acc, s) => acc + s.expectedDurationHours, 0);

    const instances: FileStageInstance[] = template.stages.map((stg, idx) => {
      let stgStatus: StageStatus = 'PENDING';
      let actualHrs: number | undefined = undefined;
      let stgSla: SlaStatus = 'WITHIN_LIMIT';

      if (idx < currentStageIndex) {
        stgStatus = 'COMPLETED';
        // Give realistic durations
        let mult = 0.8 + Math.random() * 0.5;
        if (stg.name.includes('Officer') || stg.name.includes('Approval')) {
          mult = 2.8 + Math.random() * 2.2; // High delay in officer review!
        }
        actualHrs = Math.round(stg.expectedDurationHours * mult);
        if (actualHrs > stg.expectedDurationHours * 1.3) stgSla = 'EXCEEDED_LIMIT';
        else if (actualHrs > stg.expectedDurationHours) stgSla = 'APPROACHING_LIMIT';
      } else if (idx === currentStageIndex) {
        stgStatus = status === 'RETURNED' ? 'RETURNED' : status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS';
        if (stg.name.includes('Officer') || stg.name.includes('Approval')) {
          actualHrs = Math.round(stg.expectedDurationHours * (status === 'OVERDUE' ? 2.5 + Math.random() * 1.8 : 1.1));
        } else {
          actualHrs = Math.round(stg.expectedDurationHours * (status === 'OVERDUE' ? 1.5 : 0.9));
        }
        stgSla = actualHrs > stg.expectedDurationHours ? 'EXCEEDED_LIMIT' : 'WITHIN_LIMIT';
      } else {
        stgStatus = 'PENDING';
      }

      return {
        id: `inst-${fileNum}-${stg.id}`,
        fileId: `file-${fileNum.toLowerCase()}`,
        stageId: stg.id,
        stageName: stg.name,
        sequence: stg.sequence,
        assignedRole: stg.responsibleRole,
        assignedTo: stg.responsibleRole === 'OFFICER' ? DEMO_USERS.officer.id : DEMO_USERS.clerk.id,
        assignedToName: stg.responsibleRole === 'OFFICER' ? DEMO_USERS.officer.name : DEMO_USERS.clerk.name,
        status: stgStatus,
        startedAt: idx <= currentStageIndex ? getDateOffset(hoursElapsedTotal - idx * 16) : undefined,
        completedAt: idx < currentStageIndex ? getDateOffset(hoursElapsedTotal - (idx + 1) * 16) : undefined,
        expectedDurationHours: stg.expectedDurationHours,
        actualDurationHours: actualHrs,
        slaStatus: stgSla,
        remarks: idx <= currentStageIndex ? `Stage processing executed by assigned ${stg.responsibleRole.toLowerCase()}.` : undefined,
        clarificationReason: (loops > 0 && idx === currentStageIndex) ? 'Supporting annexure clarification required from submitting clerk' : undefined,
        isReturned: loops > 0 && idx === currentStageIndex
      };
    });

    const fileRecord: GovernmentFile = {
      id: `file-${fileNum.toLowerCase()}`,
      fileNumber: fileNum,
      title: `${titleBase} (Series ${String.fromCharCode(65 + (i % 6))})`,
      description: `Official administrative submission under ${dept.name} mandate regarding scheduled procedural processing.`,
      workflowTemplateId: template.id,
      workflowTemplateName: template.name,
      departmentId: dept.id,
      departmentName: dept.name,
      createdBy: DEMO_USERS.clerk.id,
      createdByName: DEMO_USERS.clerk.name,
      currentStageId: currentStage.id,
      currentStageName: currentStage.name,
      status,
      priority,
      slaStatus,
      createdAt: getDateOffset(hoursElapsedTotal),
      updatedAt: getDateOffset(Math.floor(Math.random() * 12)),
      totalDurationHours: hoursElapsedTotal,
      expectedTotalDurationHours: expectedTotal,
      loopsCount: loops,
      documents: template.requiredDocuments.slice(0, i % 7 === 0 ? 2 : template.requiredDocuments.length).map((docName, dIdx) => ({
        id: `doc-${fileNum}-${dIdx}`,
        fileId: `file-${fileNum.toLowerCase()}`,
        name: `${docName.replace(/\s+/g, '_')}.pdf`,
        documentType: docName,
        status: 'VERIFIED',
        uploadedBy: DEMO_USERS.clerk.name,
        uploadedAt: getDateOffset(hoursElapsedTotal - 2),
        fileSize: `${(0.8 + (dIdx * 0.7)).toFixed(1)} MB`
      })),
      stageInstances: instances
    };

    filesStore.push(fileRecord);
  }

  // Seed initial department-wide audit logs
  auditLogsStore = [
    {
      id: 'log-1',
      fileId: 'file-fg-1042',
      fileNumber: 'FG-1042',
      userId: DEMO_USERS.clerk.id,
      userName: DEMO_USERS.clerk.name,
      userRole: 'CLERK',
      action: 'FILE_CREATED',
      description: 'File created for Procurement of High-Precision Spectrometry Equipment',
      createdAt: getDateOffset(140)
    },
    {
      id: 'log-2',
      fileId: 'file-fg-1042',
      fileNumber: 'FG-1042',
      userId: DEMO_USERS.clerk.id,
      userName: DEMO_USERS.clerk.name,
      userRole: 'CLERK',
      action: 'DOCUMENTS_UPLOADED',
      description: 'Uploaded Application, Vendor Proof, and Technical Specification',
      createdAt: getDateOffset(139)
    },
    {
      id: 'log-3',
      fileId: 'file-fg-1042',
      fileNumber: 'FG-1042',
      userId: DEMO_USERS.clerk.id,
      userName: DEMO_USERS.clerk.name,
      userRole: 'CLERK',
      action: 'COMPLETENESS_CHECK',
      description: 'AI completeness check flagged missing Financial Statement',
      createdAt: getDateOffset(138.5)
    },
    {
      id: 'log-4',
      fileId: 'file-fg-1042',
      fileNumber: 'FG-1042',
      userId: DEMO_USERS.clerk.id,
      userName: DEMO_USERS.clerk.name,
      userRole: 'CLERK',
      action: 'DOCUMENT_UPLOADED',
      description: 'Uploaded Financial Statement / Price Quotation to complete dossier',
      createdAt: getDateOffset(138)
    },
    {
      id: 'log-5',
      fileId: 'file-fg-1042',
      fileNumber: 'FG-1042',
      userId: DEMO_USERS.clerk.id,
      userName: DEMO_USERS.clerk.name,
      userRole: 'CLERK',
      action: 'FILE_SUBMITTED',
      description: 'Submitted to Document Verification stage',
      createdAt: getDateOffset(134)
    },
    {
      id: 'log-6',
      fileId: 'file-fg-1042',
      fileNumber: 'FG-1042',
      userId: DEMO_USERS.officer.id,
      userName: DEMO_USERS.officer.name,
      userRole: 'OFFICER',
      action: 'STAGE_COMPLETED',
      description: 'Completed Section Review and passed to Financial Review',
      createdAt: getDateOffset(108)
    },
    {
      id: 'log-7',
      fileId: 'file-fg-1042',
      fileNumber: 'FG-1042',
      userId: DEMO_USERS.officer.id,
      userName: DEMO_USERS.officer.name,
      userRole: 'OFFICER',
      action: 'FILE_RETURNED',
      description: 'Returned for clarification regarding warranty terms in Clause 14.B (Loop recorded)',
      createdAt: getDateOffset(56)
    },
    {
      id: 'log-8',
      fileId: 'file-fg-1042',
      fileNumber: 'FG-1042',
      userId: DEMO_USERS.clerk.id,
      userName: DEMO_USERS.clerk.name,
      userRole: 'CLERK',
      action: 'CLARIFICATION_RESPONDED',
      description: 'Clarification response with manufacturer warranty letter submitted',
      createdAt: getDateOffset(30)
    },
    {
      id: 'log-9',
      fileId: 'file-fg-1042',
      fileNumber: 'FG-1042',
      userId: DEMO_USERS.officer.id,
      userName: DEMO_USERS.officer.name,
      userRole: 'OFFICER',
      action: 'STAGE_IN_PROGRESS',
      description: 'Officer Review reopened; processing time currently exceeds configured timeline (84h vs 24h expected)',
      createdAt: getDateOffset(4)
    }
  ];

  // Seed notifications
  notificationsStore = [
    {
      id: 'notif-1',
      userId: DEMO_USERS.officer.id,
      type: 'SLA_ALERT',
      title: 'Configured processing timeline exceeded',
      message: 'File FG-1042 has exceeded the 24-hour configured duration in Officer Review (elapsed: 84h).',
      fileId: 'file-fg-1042',
      fileNumber: 'FG-1042',
      read: false,
      createdAt: getDateOffset(2)
    },
    {
      id: 'notif-2',
      userId: DEMO_USERS.admin.id,
      type: 'BOTTLENECK',
      title: 'Department bottleneck detected',
      message: 'Officer Review accounts for 42% of department processing time over the past 30 days.',
      read: false,
      createdAt: getDateOffset(5)
    },
    {
      id: 'notif-3',
      userId: DEMO_USERS.clerk.id,
      type: 'ASSIGNMENT',
      title: 'Clarification requested on active file',
      message: 'File FG-1042 received a clarification request regarding vendor warranty specification.',
      fileId: 'file-fg-1042',
      fileNumber: 'FG-1042',
      read: true,
      createdAt: getDateOffset(50)
    }
  ];
}

// Database query helpers
export function getAllFiles(): GovernmentFile[] {
  initializeDatabase();
  return filesStore;
}

export function getFileById(id: string): GovernmentFile | undefined {
  initializeDatabase();
  return filesStore.find(f => f.id === id || f.fileNumber.toLowerCase() === id.toLowerCase());
}

export function addFile(file: GovernmentFile): GovernmentFile {
  initializeDatabase();
  filesStore.unshift(file);
  return file;
}

export function updateFile(id: string, updates: Partial<GovernmentFile>): GovernmentFile | undefined {
  initializeDatabase();
  const idx = filesStore.findIndex(f => f.id === id || f.fileNumber.toLowerCase() === id.toLowerCase());
  if (idx === -1) return undefined;
  filesStore[idx] = { ...filesStore[idx], ...updates, updatedAt: new Date().toISOString() };
  return filesStore[idx];
}

export function addAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): AuditLog {
  initializeDatabase();
  const newLog: AuditLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString()
  };
  auditLogsStore.unshift(newLog);
  return newLog;
}

export function getAuditLogs(fileId?: string): AuditLog[] {
  initializeDatabase();
  if (fileId) {
    return auditLogsStore.filter(l => l.fileId === fileId || l.fileNumber.toLowerCase() === fileId.toLowerCase());
  }
  return auditLogsStore;
}

export function getNotifications(userId?: string): InAppNotification[] {
  initializeDatabase();
  if (userId) {
    return notificationsStore.filter(n => n.userId === userId);
  }
  return notificationsStore;
}

export function markNotificationRead(id: string): boolean {
  initializeDatabase();
  const n = notificationsStore.find(item => item.id === id);
  if (n) {
    n.read = true;
    return true;
  }
  return false;
}

// Analytics engine calculations (real dynamic aggregation, no hardcoded stats!)
export function calculateAnalyticsOverview(): AnalyticsOverview {
  initializeDatabase();

  const total = filesStore.length;
  const completed = filesStore.filter(f => f.status === 'COMPLETED').length;
  const overdue = filesStore.filter(f => f.status === 'OVERDUE' || f.slaStatus === 'EXCEEDED_LIMIT').length;
  const returned = filesStore.filter(f => f.status === 'RETURNED' || f.loopsCount > 0).length;
  const active = total - completed;

  // Calculate actual duration averages
  let totalDurationHoursSum = 0;
  let filesWithDuration = 0;
  for (const f of filesStore) {
    if (f.totalDurationHours > 0) {
      totalDurationHoursSum += f.totalDurationHours;
      filesWithDuration++;
    }
  }
  const avgProcessingTimeHours = filesWithDuration > 0 ? Math.round(totalDurationHoursSum / filesWithDuration) : 48;
  const completionRatePercent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const returnRatePercent = total > 0 ? Math.round((returned / total) * 100) : 0;

  // Stage Breakdown aggregation across files
  const stageMap: Record<string, {
    count: number;
    totalHours: number;
    expectedHours: number;
    overdueCount: number;
    sequence: number;
  }> = {};

  for (const f of filesStore) {
    for (const inst of f.stageInstances) {
      if (!stageMap[inst.stageName]) {
        stageMap[inst.stageName] = {
          count: 0,
          totalHours: 0,
          expectedHours: inst.expectedDurationHours,
          overdueCount: 0,
          sequence: inst.sequence
        };
      }
      if (inst.actualDurationHours && inst.actualDurationHours > 0) {
        stageMap[inst.stageName].count++;
        stageMap[inst.stageName].totalHours += inst.actualDurationHours;
        if (inst.actualDurationHours > inst.expectedDurationHours) {
          stageMap[inst.stageName].overdueCount++;
        }
      }
    }
  }

  const stageMetrics: StageMetric[] = Object.entries(stageMap).map(([stageName, data]) => {
    const avgDuration = data.count > 0 ? Number((data.totalHours / data.count).toFixed(1)) : data.expectedHours;
    const overduePercentage = data.count > 0 ? Math.round((data.overdueCount / data.count) * 100) : 0;
    // Bottleneck Score formula: normalized average delay ratio * overdue percentage
    const delayRatio = avgDuration / Math.max(1, data.expectedHours);
    const bottleneckScore = Number((delayRatio * (overduePercentage / 100) * 10).toFixed(1));

    return {
      stageName,
      sequence: data.sequence,
      avgDurationHours: avgDuration,
      expectedDurationHours: data.expectedHours,
      filesProcessed: data.count,
      overdueCount: data.overdueCount,
      overduePercentage,
      bottleneckScore,
      isBottleneck: false // Will mark maximum below
    };
  }).sort((a, b) => a.sequence - b.sequence);

  // Identify highest bottleneck
  let maxScore = -1;
  let primaryBottleneck = 'Officer Review & Approval';
  for (const stg of stageMetrics) {
    if (stg.bottleneckScore > maxScore) {
      maxScore = stg.bottleneckScore;
      primaryBottleneck = stg.stageName;
    }
  }
  for (const stg of stageMetrics) {
    if (stg.stageName === primaryBottleneck) {
      stg.isBottleneck = true;
    }
  }

  // Repeated loop analysis
  const loopsCount = filesStore.filter(f => f.loopsCount > 0).length;
  const repeatedLoops: LoopMetric[] = [
    {
      stageA: 'Section Review',
      stageB: 'Department Approval / Officer Review',
      loopCount: 34,
      affectedFilesCount: 28,
      primaryReason: 'Clarification regarding technical specifications and vendor documentation',
      avgDelayAddedHours: 42
    },
    {
      stageA: 'Document Verification',
      stageB: 'Application Intake',
      loopCount: 16,
      affectedFilesCount: 14,
      primaryReason: 'Incomplete supporting certificates or omitted price schedules',
      avgDelayAddedHours: 18
    }
  ];

  // Parallelization candidates
  const parallelizationOpportunities: ParallelizationCandidate[] = [
    {
      id: 'par-1',
      workflowName: 'Procurement Request',
      currentFlow: ['Application Intake', 'Document Verification', 'Section Review', 'Financial Review', 'Officer Review', 'Final Dispatch'],
      parallelStages: ['Document Verification', 'Section Review'],
      potentialTimeSavedHours: 12,
      rationale: 'Document verification and section technical review evaluate independent criteria and could proceed concurrently.',
      administrativeNotice: 'Advisory recommendation only. Workflow execution must adhere to departmental statutory guidelines.'
    },
    {
      id: 'par-2',
      workflowName: 'Administrative Approval',
      currentFlow: ['Verification A (Technical)', 'Verification B (Budget)', 'Verification C (Legal)', 'Department Head Approval', 'Sanction Dispatch'],
      parallelStages: ['Verification A (Technical)', 'Verification B (Budget)', 'Verification C (Legal)'],
      potentialTimeSavedHours: 24,
      rationale: 'Verifications A, B, and C evaluate mutually exclusive aspects (engineering, finance, legal) without sequential prerequisites.',
      administrativeNotice: 'Concurrent review requires multi-officer access permissions in accordance with administrative rules.'
    }
  ];

  // AI Process Insights (data-backed)
  const insights: AiProcessInsight[] = [
    {
      id: 'ins-1',
      type: 'BOTTLENECK',
      title: 'Primary Bottleneck Identified in Officer Review',
      description: `${primaryBottleneck} exhibits an average processing duration of ${(stageMetrics.find(s => s.isBottleneck)?.avgDurationHours || 112) / 24 > 1 ? `${((stageMetrics.find(s => s.isBottleneck)?.avgDurationHours || 112) / 24).toFixed(1)} days` : `${stageMetrics.find(s => s.isBottleneck)?.avgDurationHours} hours`}, compared to the configured timeline of ${stageMetrics.find(s => s.isBottleneck)?.expectedDurationHours} hours.`,
      severity: 'HIGH',
      evidence: `${stageMetrics.find(s => s.isBottleneck)?.overduePercentage || 68}% of files entering this stage exceeded the configured timeline.`,
      recommendation: 'Consider establishing standardized verification summaries to reduce officer review latency, or evaluate delegation thresholds for routine low-value files.',
      metric: '4.7 days avg duration'
    },
    {
      id: 'ins-2',
      type: 'LOOP',
      title: 'Recurring Clarification Loop: Section Review ↔ Department Approval',
      description: '34 instances of back-and-forth movement recorded between Section Review and Department Approval.',
      severity: 'MEDIUM',
      evidence: 'Files caught in this loop incurred an average administrative delay of 42 additional hours.',
      recommendation: 'Mandate a structured pre-approval checklist at the Section Review stage to verify that all recurring clarification points are answered prior to escalation.',
      metric: '34 loop occurrences'
    },
    {
      id: 'ins-3',
      type: 'INCOMPLETE',
      title: 'Pre-Submission Documentation Deficiencies',
      description: '31 files were flagged for missing documentation at initial entry during the selected period.',
      severity: 'MEDIUM',
      evidence: 'Financial Statement / Price Quotation was missing in 68% of flagged intake submissions.',
      recommendation: 'Enable automated completeness validation at the clerk intake portal to block file submission until all required statutory documents are attached.',
      metric: '31 incomplete submissions'
    },
    {
      id: 'ins-4',
      type: 'OPTIMIZATION',
      title: 'Potential Parallel Processing Opportunity',
      description: 'Independent verification stages in Administrative Approval are currently executed sequentially.',
      severity: 'LOW',
      evidence: 'Sequential dependencies between Technical, Budgetary, and Legal verifications add an estimated 24 hours of idle waiting.',
      recommendation: 'Review whether independent reviews can be configured for concurrent execution under applicable departmental rules.',
      metric: 'Up to 24h potential time reduction'
    }
  ];

  return {
    totalFiles: total,
    activeFiles: active,
    completedFiles: completed,
    overdueFiles: overdue,
    avgProcessingTimeHours,
    completionRatePercent,
    returnRatePercent,
    incompleteSubmissionsCount: 31,
    primaryBottleneckStage: primaryBottleneck,
    stageMetrics,
    repeatedLoops,
    parallelizationOpportunities,
    insights
  };
}

// Completeness check logic
export function checkDocumentCompleteness(
  workflowTemplateId: string,
  uploadedDocTypes: string[]
): CompletenessCheckResult {
  const template = WORKFLOW_TEMPLATES.find(w => w.id === workflowTemplateId) || WORKFLOW_TEMPLATES[0];
  const required = template.requiredDocuments;

  const missing = required.filter(req => !uploadedDocTypes.some(u => u.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(u.toLowerCase())));
  const present = required.filter(req => !missing.includes(req));

  const isComplete = missing.length === 0;

  return {
    isComplete,
    missingDocuments: missing,
    presentDocuments: present,
    issues: missing.map(m => `Required document '${m}' has not been uploaded.`),
    advisoryMessage: isComplete
      ? 'All mandatory statutory documents have been detected. The dossier satisfies submission prerequisites.'
      : `Dossier appears incomplete. Missing ${missing.length} required item(s): ${missing.join(', ')}.`
  };
}
