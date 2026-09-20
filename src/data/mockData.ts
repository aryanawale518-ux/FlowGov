import {
  UserProfile,
  Department,
  WorkflowTemplate,
  GovernmentFile,
  AuditLog,
  InAppNotification,
  AnalyticsOverview,
  StageMetric,
  LoopMetric,
  ParallelizationCandidate,
  AiProcessInsight
} from '../types';

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

function getDateOffset(hoursAgo: number): string {
  const d = new Date(Date.now() - hoursAgo * 3600 * 1000);
  return d.toISOString();
}

export const SYNTHETIC_DEMO_FILES: GovernmentFile[] = [
  {
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
        id: 'stg-inst-1',
        fileId: 'file-fg-1042',
        stageId: 'stg-app',
        stageName: 'Application Intake',
        sequence: 1,
        assignedRole: 'CLERK',
        assignedToName: DEMO_USERS.clerk.name,
        status: 'COMPLETED',
        startedAt: getDateOffset(140),
        completedAt: getDateOffset(136),
        expectedDurationHours: 8,
        actualDurationHours: 4,
        slaStatus: 'WITHIN_LIMIT',
        remarks: 'All mandatory vendor documentation recorded at intake portal.'
      },
      {
        id: 'stg-inst-2',
        fileId: 'file-fg-1042',
        stageId: 'stg-doc-verif',
        stageName: 'Document Verification',
        sequence: 2,
        assignedRole: 'CLERK',
        assignedToName: DEMO_USERS.clerk.name,
        status: 'COMPLETED',
        startedAt: getDateOffset(136),
        completedAt: getDateOffset(128),
        expectedDurationHours: 8,
        actualDurationHours: 8,
        slaStatus: 'WITHIN_LIMIT',
        remarks: 'Verification completed against state vendor database.'
      },
      {
        id: 'stg-inst-3',
        fileId: 'file-fg-1042',
        stageId: 'stg-sec-rev',
        stageName: 'Section Review',
        sequence: 3,
        assignedRole: 'OFFICER',
        assignedToName: DEMO_USERS.officer.name,
        status: 'COMPLETED',
        startedAt: getDateOffset(128),
        completedAt: getDateOffset(112),
        expectedDurationHours: 16,
        actualDurationHours: 16,
        slaStatus: 'WITHIN_LIMIT',
        remarks: 'Technical scope scrutinised and cleared for financial concurrence.'
      },
      {
        id: 'stg-inst-4',
        fileId: 'file-fg-1042',
        stageId: 'stg-fin-rev',
        stageName: 'Financial Review',
        sequence: 4,
        assignedRole: 'OFFICER',
        assignedToName: DEMO_USERS.officer.name,
        status: 'COMPLETED',
        startedAt: getDateOffset(112),
        completedAt: getDateOffset(96),
        expectedDurationHours: 16,
        actualDurationHours: 16,
        slaStatus: 'WITHIN_LIMIT',
        remarks: 'Budget line verified under Head 3451-Scientific Modernisation.'
      },
      {
        id: 'stg-inst-5',
        fileId: 'file-fg-1042',
        stageId: 'stg-off-appr',
        stageName: 'Officer Review & Approval',
        sequence: 5,
        assignedRole: 'OFFICER',
        assignedToName: DEMO_USERS.officer.name,
        status: 'IN_PROGRESS',
        startedAt: getDateOffset(96),
        expectedDurationHours: 24,
        actualDurationHours: 92,
        slaStatus: 'EXCEEDED_LIMIT',
        remarks: 'Returned once for clarification on vendor calibration standards; resubmitted.',
        isReturned: true,
        clarificationReason: 'Clarification required regarding calibration certification validity.'
      },
      {
        id: 'stg-inst-6',
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
  },
  {
    id: 'file-fg-1043',
    fileNumber: 'FG-1043',
    title: 'Public Works Arterial Bypass Drainage Upgrade - Phase II',
    description: 'Reinforced concrete culvert overhaul and stormwater bypass along Western Bypass Sector 9.',
    workflowTemplateId: 'wf-procurement',
    workflowTemplateName: 'Procurement Request',
    departmentId: 'dept-pwd',
    departmentName: 'Public Works',
    createdBy: DEMO_USERS.clerk.id,
    createdByName: DEMO_USERS.clerk.name,
    currentStageId: 'stg-sec-rev',
    currentStageName: 'Section Review',
    status: 'RETURNED',
    priority: 'MEDIUM',
    slaStatus: 'APPROACHING_LIMIT',
    createdAt: getDateOffset(84),
    updatedAt: getDateOffset(6),
    totalDurationHours: 78,
    expectedTotalDurationHours: 72,
    loopsCount: 2,
    documents: [
      {
        id: 'doc-1043-1',
        fileId: 'file-fg-1043',
        name: 'PWD_Tender_Proposal_Bypass.pdf',
        documentType: 'Application Form',
        status: 'VERIFIED',
        uploadedAt: getDateOffset(84),
        fileSize: '3.2 MB'
      },
      {
        id: 'doc-1043-2',
        fileId: 'file-fg-1043',
        name: 'Civil_Engineer_Bill_of_Quantities.pdf',
        documentType: 'Technical Specification Certificate',
        status: 'PENDING',
        uploadedAt: getDateOffset(6),
        fileSize: '4.8 MB',
        aiNotes: 'Revised document uploaded after 2nd clarification loop'
      }
    ],
    stageInstances: [
      {
        id: 'stg-inst-43-1',
        fileId: 'file-fg-1043',
        stageId: 'stg-app',
        stageName: 'Application Intake',
        sequence: 1,
        assignedRole: 'CLERK',
        status: 'COMPLETED',
        startedAt: getDateOffset(84),
        completedAt: getDateOffset(80),
        expectedDurationHours: 8,
        actualDurationHours: 4,
        slaStatus: 'WITHIN_LIMIT'
      },
      {
        id: 'stg-inst-43-2',
        fileId: 'file-fg-1043',
        stageId: 'stg-doc-verif',
        stageName: 'Document Verification',
        sequence: 2,
        assignedRole: 'CLERK',
        status: 'COMPLETED',
        startedAt: getDateOffset(80),
        completedAt: getDateOffset(68),
        expectedDurationHours: 8,
        actualDurationHours: 12,
        slaStatus: 'APPROACHING_LIMIT'
      },
      {
        id: 'stg-inst-43-3',
        fileId: 'file-fg-1043',
        stageId: 'stg-sec-rev',
        stageName: 'Section Review',
        sequence: 3,
        assignedRole: 'OFFICER',
        status: 'RETURNED',
        startedAt: getDateOffset(68),
        expectedDurationHours: 16,
        actualDurationHours: 62,
        slaStatus: 'EXCEEDED_LIMIT',
        isReturned: true,
        clarificationReason: 'Concrete tensile test records missing from section annexure.'
      },
      {
        id: 'stg-inst-43-4',
        fileId: 'file-fg-1043',
        stageId: 'stg-fin-rev',
        stageName: 'Financial Review',
        sequence: 4,
        assignedRole: 'OFFICER',
        status: 'PENDING',
        expectedDurationHours: 16,
        slaStatus: 'WITHIN_LIMIT'
      },
      {
        id: 'stg-inst-43-5',
        fileId: 'file-fg-1043',
        stageId: 'stg-off-appr',
        stageName: 'Officer Review & Approval',
        sequence: 5,
        assignedRole: 'OFFICER',
        status: 'PENDING',
        expectedDurationHours: 24,
        slaStatus: 'WITHIN_LIMIT'
      },
      {
        id: 'stg-inst-43-6',
        fileId: 'file-fg-1043',
        stageId: 'stg-dispatch',
        stageName: 'Final Dispatch',
        sequence: 6,
        assignedRole: 'CLERK',
        status: 'PENDING',
        expectedDurationHours: 8,
        slaStatus: 'WITHIN_LIMIT'
      }
    ]
  },
  {
    id: 'file-fg-1044',
    fileNumber: 'FG-1044',
    title: 'State Secondary School Science Laboratory Modernisation Grant',
    description: 'Direct institutional grant for STEM equipment across 24 district model senior secondary schools.',
    workflowTemplateId: 'wf-admin-sanction',
    workflowTemplateName: 'Administrative Approval',
    departmentId: 'dept-education',
    departmentName: 'Education',
    createdBy: DEMO_USERS.clerk.id,
    createdByName: DEMO_USERS.clerk.name,
    currentStageId: 'stg-adm-5',
    currentStageName: 'Sanction Order Dispatch',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    slaStatus: 'WITHIN_LIMIT',
    createdAt: getDateOffset(90),
    updatedAt: getDateOffset(12),
    totalDurationHours: 64,
    expectedTotalDurationHours: 72,
    loopsCount: 0,
    documents: [
      {
        id: 'doc-1044-1',
        fileId: 'file-fg-1044',
        name: 'School_Allocation_List_Grant_2026.pdf',
        documentType: 'Project Proposal Note',
        status: 'VERIFIED',
        uploadedAt: getDateOffset(90),
        fileSize: '1.8 MB'
      }
    ],
    stageInstances: [
      {
        id: 'stg-44-1',
        fileId: 'file-fg-1044',
        stageId: 'stg-adm-1',
        stageName: 'Verification A (Technical Scope)',
        sequence: 1,
        assignedRole: 'CLERK',
        status: 'COMPLETED',
        startedAt: getDateOffset(90),
        completedAt: getDateOffset(80),
        expectedDurationHours: 12,
        actualDurationHours: 10,
        slaStatus: 'WITHIN_LIMIT'
      },
      {
        id: 'stg-44-2',
        fileId: 'file-fg-1044',
        stageId: 'stg-adm-2',
        stageName: 'Verification B (Budgetary Code)',
        sequence: 2,
        assignedRole: 'OFFICER',
        status: 'COMPLETED',
        startedAt: getDateOffset(80),
        completedAt: getDateOffset(70),
        expectedDurationHours: 12,
        actualDurationHours: 10,
        slaStatus: 'WITHIN_LIMIT'
      },
      {
        id: 'stg-44-3',
        fileId: 'file-fg-1044',
        stageId: 'stg-adm-3',
        stageName: 'Verification C (Legal Compliance)',
        sequence: 3,
        assignedRole: 'OFFICER',
        status: 'COMPLETED',
        startedAt: getDateOffset(70),
        completedAt: getDateOffset(54),
        expectedDurationHours: 16,
        actualDurationHours: 16,
        slaStatus: 'WITHIN_LIMIT'
      },
      {
        id: 'stg-44-4',
        fileId: 'file-fg-1044',
        stageId: 'stg-adm-4',
        stageName: 'Department Head Approval',
        sequence: 4,
        assignedRole: 'OFFICER',
        status: 'COMPLETED',
        startedAt: getDateOffset(54),
        completedAt: getDateOffset(32),
        expectedDurationHours: 24,
        actualDurationHours: 22,
        slaStatus: 'WITHIN_LIMIT'
      },
      {
        id: 'stg-44-5',
        fileId: 'file-fg-1044',
        stageId: 'stg-adm-5',
        stageName: 'Sanction Order Dispatch',
        sequence: 5,
        assignedRole: 'CLERK',
        status: 'COMPLETED',
        startedAt: getDateOffset(32),
        completedAt: getDateOffset(26),
        expectedDurationHours: 8,
        actualDurationHours: 6,
        slaStatus: 'WITHIN_LIMIT',
        remarks: 'Sanction Order #ED-2026-904 dispatched to all district treasury offices.'
      }
    ]
  },
  {
    id: 'file-fg-1045',
    fileNumber: 'FG-1045',
    title: 'Solar Micro-Grid Rural Electrification Feasibility Assessment',
    description: 'Pilot decentralised hybrid solar/battery micro-grid proposal for 18 unelectrified tribal hamlet clusters.',
    workflowTemplateId: 'wf-procurement',
    workflowTemplateName: 'Procurement Request',
    departmentId: 'dept-pwd',
    departmentName: 'Public Works',
    createdBy: DEMO_USERS.clerk.id,
    createdByName: DEMO_USERS.clerk.name,
    currentStageId: 'stg-fin-rev',
    currentStageName: 'Financial Review',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    slaStatus: 'WITHIN_LIMIT',
    createdAt: getDateOffset(42),
    updatedAt: getDateOffset(8),
    totalDurationHours: 34,
    expectedTotalDurationHours: 72,
    loopsCount: 0,
    documents: [],
    stageInstances: [
      {
        id: 'stg-45-1',
        fileId: 'file-fg-1045',
        stageId: 'stg-app',
        stageName: 'Application Intake',
        sequence: 1,
        assignedRole: 'CLERK',
        status: 'COMPLETED',
        startedAt: getDateOffset(42),
        completedAt: getDateOffset(38),
        expectedDurationHours: 8,
        actualDurationHours: 4,
        slaStatus: 'WITHIN_LIMIT'
      },
      {
        id: 'stg-45-2',
        fileId: 'file-fg-1045',
        stageId: 'stg-doc-verif',
        stageName: 'Document Verification',
        sequence: 2,
        assignedRole: 'CLERK',
        status: 'COMPLETED',
        startedAt: getDateOffset(38),
        completedAt: getDateOffset(30),
        expectedDurationHours: 8,
        actualDurationHours: 8,
        slaStatus: 'WITHIN_LIMIT'
      },
      {
        id: 'stg-45-3',
        fileId: 'file-fg-1045',
        stageId: 'stg-sec-rev',
        stageName: 'Section Review',
        sequence: 3,
        assignedRole: 'OFFICER',
        status: 'COMPLETED',
        startedAt: getDateOffset(30),
        completedAt: getDateOffset(16),
        expectedDurationHours: 16,
        actualDurationHours: 14,
        slaStatus: 'WITHIN_LIMIT'
      },
      {
        id: 'stg-45-4',
        fileId: 'file-fg-1045',
        stageId: 'stg-fin-rev',
        stageName: 'Financial Review',
        sequence: 4,
        assignedRole: 'OFFICER',
        status: 'IN_PROGRESS',
        startedAt: getDateOffset(16),
        expectedDurationHours: 16,
        actualDurationHours: 8,
        slaStatus: 'WITHIN_LIMIT'
      },
      {
        id: 'stg-45-5',
        fileId: 'file-fg-1045',
        stageId: 'stg-off-appr',
        stageName: 'Officer Review & Approval',
        sequence: 5,
        assignedRole: 'OFFICER',
        status: 'PENDING',
        expectedDurationHours: 24,
        slaStatus: 'WITHIN_LIMIT'
      },
      {
        id: 'stg-45-6',
        fileId: 'file-fg-1045',
        stageId: 'stg-dispatch',
        stageName: 'Final Dispatch',
        sequence: 6,
        assignedRole: 'CLERK',
        status: 'PENDING',
        expectedDurationHours: 8,
        slaStatus: 'WITHIN_LIMIT'
      }
    ]
  },
  {
    id: 'file-fg-1046',
    fileNumber: 'FG-1046',
    title: 'Central District Hospital Medical Oxygen Manifold Upgrade',
    description: 'Installation of automated dual cryogenic oxygen manifold and telemetry sensors for intensive care ward.',
    workflowTemplateId: 'wf-procurement',
    workflowTemplateName: 'Procurement Request',
    departmentId: 'dept-procurement',
    departmentName: 'Procurement',
    createdBy: DEMO_USERS.clerk.id,
    createdByName: DEMO_USERS.clerk.name,
    currentStageId: 'stg-app',
    currentStageName: 'Application Intake',
    status: 'SUBMITTED',
    priority: 'CRITICAL',
    slaStatus: 'WITHIN_LIMIT',
    createdAt: getDateOffset(4),
    updatedAt: getDateOffset(1),
    totalDurationHours: 3,
    expectedTotalDurationHours: 72,
    loopsCount: 0,
    documents: [],
    stageInstances: [
      {
        id: 'stg-46-1',
        fileId: 'file-fg-1046',
        stageId: 'stg-app',
        stageName: 'Application Intake',
        sequence: 1,
        assignedRole: 'CLERK',
        status: 'IN_PROGRESS',
        startedAt: getDateOffset(4),
        expectedDurationHours: 8,
        actualDurationHours: 3,
        slaStatus: 'WITHIN_LIMIT'
      },
      {
        id: 'stg-46-2',
        fileId: 'file-fg-1046',
        stageId: 'stg-doc-verif',
        stageName: 'Document Verification',
        sequence: 2,
        assignedRole: 'CLERK',
        status: 'PENDING',
        expectedDurationHours: 8,
        slaStatus: 'WITHIN_LIMIT'
      },
      {
        id: 'stg-46-3',
        fileId: 'file-fg-1046',
        stageId: 'stg-sec-rev',
        stageName: 'Section Review',
        sequence: 3,
        assignedRole: 'OFFICER',
        status: 'PENDING',
        expectedDurationHours: 16,
        slaStatus: 'WITHIN_LIMIT'
      },
      {
        id: 'stg-46-4',
        fileId: 'file-fg-1046',
        stageId: 'stg-fin-rev',
        stageName: 'Financial Review',
        sequence: 4,
        assignedRole: 'OFFICER',
        status: 'PENDING',
        expectedDurationHours: 16,
        slaStatus: 'WITHIN_LIMIT'
      },
      {
        id: 'stg-46-5',
        fileId: 'file-fg-1046',
        stageId: 'stg-off-appr',
        stageName: 'Officer Review & Approval',
        sequence: 5,
        assignedRole: 'OFFICER',
        status: 'PENDING',
        expectedDurationHours: 24,
        slaStatus: 'WITHIN_LIMIT'
      },
      {
        id: 'stg-46-6',
        fileId: 'file-fg-1046',
        stageId: 'stg-dispatch',
        stageName: 'Final Dispatch',
        sequence: 6,
        assignedRole: 'CLERK',
        status: 'PENDING',
        expectedDurationHours: 8,
        slaStatus: 'WITHIN_LIMIT'
      }
    ]
  }
];

export const SYNTHETIC_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    fileId: 'file-fg-1042',
    fileNumber: 'FG-1042',
    userId: DEMO_USERS.clerk.id,
    userName: DEMO_USERS.clerk.name,
    userRole: 'CLERK',
    action: 'FILE_CREATED',
    description: 'File FG-1042 created under Procurement Request workflow',
    createdAt: getDateOffset(140)
  },
  {
    id: 'log-2',
    fileId: 'file-fg-1042',
    fileNumber: 'FG-1042',
    userId: DEMO_USERS.clerk.id,
    userName: DEMO_USERS.clerk.name,
    userRole: 'CLERK',
    action: 'DOCUMENTS_VERIFIED',
    description: 'All four mandatory tender and technical documents verified against vendor registry',
    createdAt: getDateOffset(128)
  },
  {
    id: 'log-3',
    fileId: 'file-fg-1042',
    fileNumber: 'FG-1042',
    userId: DEMO_USERS.officer.id,
    userName: DEMO_USERS.officer.name,
    userRole: 'OFFICER',
    action: 'SECTION_REVIEW_PASSED',
    description: 'Technical scope and equipment specifications cleared by Section Officer',
    createdAt: getDateOffset(112)
  },
  {
    id: 'log-4',
    fileId: 'file-fg-1042',
    fileNumber: 'FG-1042',
    userId: DEMO_USERS.officer.id,
    userName: DEMO_USERS.officer.name,
    userRole: 'OFFICER',
    action: 'FILE_RETURNED',
    description: 'Returned from Officer Review to Section Review for calibration certificate clarification (Loop #1)',
    createdAt: getDateOffset(80)
  },
  {
    id: 'log-5',
    fileId: 'file-fg-1042',
    fileNumber: 'FG-1042',
    userId: DEMO_USERS.officer.id,
    userName: DEMO_USERS.officer.name,
    userRole: 'OFFICER',
    action: 'STAGE_RESUBMITTED',
    description: 'Calibration certificate re-verified with vendor; resubmitted to Officer Review',
    createdAt: getDateOffset(50)
  }
];

export const SYNTHETIC_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif-1',
    userId: DEMO_USERS.officer.id,
    title: 'SLA Exceeded: File #FG-1042',
    message: 'File FG-1042 has exceeded configured duration by 68 hours in Officer Review & Approval.',
    type: 'SLA_ALERT',
    fileNumber: 'FG-1042',
    createdAt: getDateOffset(4),
    read: false
  },
  {
    id: 'notif-2',
    userId: DEMO_USERS.officer.id,
    title: 'Clarification Returned: File #FG-1043',
    message: 'PWD tender bypass file returned for concrete test record clarification.',
    type: 'RETURNED',
    fileNumber: 'FG-1043',
    createdAt: getDateOffset(6),
    read: false
  },
  {
    id: 'notif-3',
    userId: DEMO_USERS.admin.id,
    title: 'Administrative Sanction Cleared',
    message: 'School Science Laboratory grant file FG-1044 completed procedural signoffs.',
    type: 'ASSIGNMENT',
    fileNumber: 'FG-1044',
    createdAt: getDateOffset(12),
    read: true
  }
];

/**
 * Pure TypeScript computation of Process Analytics from any file array.
 * Safe for client-side rendering with zero external dependencies.
 */
export function calculateAnalyticsOverview(files: GovernmentFile[]): AnalyticsOverview {
  const total = files.length;
  const completed = files.filter(f => f.status === 'COMPLETED').length;
  const overdue = files.filter(f => f.status === 'OVERDUE' || f.slaStatus === 'EXCEEDED_LIMIT').length;
  const active = total - completed;

  let totalDuration = 0;
  let countWithDuration = 0;
  for (const f of files) {
    if (f.totalDurationHours && f.totalDurationHours > 0) {
      totalDuration += f.totalDurationHours;
      countWithDuration++;
    }
  }
  const avgProcessingTimeHours = countWithDuration > 0
    ? Number((totalDuration / countWithDuration).toFixed(1))
    : 48;

  const completionRatePercent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const returnedCount = files.filter(f => f.status === 'RETURNED' || f.loopsCount > 0).length;
  const returnRatePercent = total > 0 ? Math.round((returnedCount / total) * 100) : 0;

  // Aggregate Stage Metrics across all files
  const stageMap: Record<string, { totalHours: number; count: number; expectedHours: number; overdueCount: number; sequence: number }> = {};

  for (const f of files) {
    for (const inst of f.stageInstances) {
      if (!stageMap[inst.stageName]) {
        stageMap[inst.stageName] = {
          totalHours: 0,
          count: 0,
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

  // Ensure standard stages exist even if file count is small
  const defaultStages = [
    { name: 'Application Intake', seq: 1, exp: 8, avg: 4.2, overdue: 0 },
    { name: 'Document Verification', seq: 2, exp: 8, avg: 9.8, overdue: 1 },
    { name: 'Section Review', seq: 3, exp: 16, avg: 19.4, overdue: 2 },
    { name: 'Financial Review', seq: 4, exp: 16, avg: 15.1, overdue: 0 },
    { name: 'Officer Review & Approval', seq: 5, exp: 24, avg: 92.0, overdue: 4 },
    { name: 'Final Dispatch', seq: 6, exp: 8, avg: 6.0, overdue: 0 }
  ];

  for (const d of defaultStages) {
    if (!stageMap[d.name]) {
      stageMap[d.name] = {
        totalHours: d.avg,
        count: 1,
        expectedHours: d.exp,
        overdueCount: d.overdue,
        sequence: d.seq
      };
    }
  }

  const stageMetrics: StageMetric[] = Object.entries(stageMap).map(([stageName, data]) => {
    const avgDuration = data.count > 0 ? Number((data.totalHours / data.count).toFixed(1)) : data.expectedHours;
    const overduePercentage = data.count > 0 ? Math.round((data.overdueCount / data.count) * 100) : 0;
    const delayRatio = avgDuration / Math.max(1, data.expectedHours);
    const bottleneckScore = Number((delayRatio * (Math.max(10, overduePercentage) / 100) * 10).toFixed(1));

    return {
      stageName,
      sequence: data.sequence,
      avgDurationHours: avgDuration,
      expectedDurationHours: data.expectedHours,
      filesProcessed: Math.max(data.count, 1),
      overdueCount: data.overdueCount,
      overduePercentage,
      bottleneckScore,
      isBottleneck: false
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

  const repeatedLoops: LoopMetric[] = [
    {
      stageA: 'Section Review',
      stageB: 'Officer Review & Approval',
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

  const insights: AiProcessInsight[] = [
    {
      id: 'ins-1',
      type: 'BOTTLENECK',
      title: 'Primary Bottleneck Identified in Officer Review',
      description: `${primaryBottleneck} exhibits an average processing duration of ${(stageMetrics.find(s => s.isBottleneck)?.avgDurationHours || 92) / 24 > 1 ? `${((stageMetrics.find(s => s.isBottleneck)?.avgDurationHours || 92) / 24).toFixed(1)} days` : `${stageMetrics.find(s => s.isBottleneck)?.avgDurationHours} hours`}, compared to the configured timeline of ${stageMetrics.find(s => s.isBottleneck)?.expectedDurationHours} hours.`,
      severity: 'HIGH',
      evidence: `${stageMetrics.find(s => s.isBottleneck)?.overduePercentage || 68}% of files entering this stage exceeded the configured timeline.`,
      recommendation: 'Consider establishing standardized verification summaries to reduce officer review latency, or evaluate delegation thresholds for routine low-value files.',
      metric: '3.8 days avg duration'
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
