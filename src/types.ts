export type UserRole = 'ADMIN' | 'OFFICER' | 'CLERK';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  departmentName: string;
  designation: string;
  avatarUrl?: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
}

export interface WorkflowStageTemplate {
  id: string;
  name: string;
  sequence: number;
  expectedDurationHours: number;
  isRequired: boolean;
  responsibleRole: UserRole;
  canParallelizeWith?: string[]; // IDs of stages that could run concurrently
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  departmentId: string;
  departmentName: string;
  stages: WorkflowStageTemplate[];
  requiredDocuments: string[];
}

export type FileStatus = 'DRAFT' | 'SUBMITTED' | 'IN_PROGRESS' | 'RETURNED' | 'COMPLETED' | 'OVERDUE';
export type FilePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type StageStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'RETURNED' | 'SKIPPED';
export type SlaStatus = 'WITHIN_LIMIT' | 'APPROACHING_LIMIT' | 'EXCEEDED_LIMIT';

export interface FileStageInstance {
  id: string;
  fileId: string;
  stageId: string;
  stageName: string;
  sequence: number;
  assignedTo?: string;
  assignedToName?: string;
  assignedRole: UserRole;
  status: StageStatus;
  startedAt?: string;
  completedAt?: string;
  expectedDurationHours: number;
  actualDurationHours?: number;
  slaStatus: SlaStatus;
  remarks?: string;
  clarificationReason?: string;
  isReturned?: boolean;
}

export type DocumentStatus = 'PENDING' | 'VERIFIED' | 'MISSING' | 'FLAGGED';

export interface FileDocument {
  id: string;
  fileId: string;
  name: string;
  documentType: string;
  status: DocumentStatus;
  uploadedBy?: string;
  uploadedAt: string;
  fileSize?: string;
  aiNotes?: string;
}

export interface GovernmentFile {
  id: string;
  fileNumber: string;
  title: string;
  description: string;
  workflowTemplateId: string;
  workflowTemplateName: string;
  departmentId: string;
  departmentName: string;
  createdBy: string;
  createdByName: string;
  currentStageId: string;
  currentStageName: string;
  status: FileStatus;
  priority: FilePriority;
  slaStatus: SlaStatus;
  createdAt: string;
  updatedAt: string;
  totalDurationHours: number;
  expectedTotalDurationHours: number;
  loopsCount: number;
  stageInstances: FileStageInstance[];
  documents: FileDocument[];
}

export interface AuditLog {
  id: string;
  fileId: string;
  fileNumber: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  description: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface AiFileExplanation {
  fileId: string;
  fileNumber: string;
  currentStage: string;
  timeElapsedFormatted: string;
  expectedTimeFormatted: string;
  isOverdue: boolean;
  potentialReasons: string[];
  suggestedNextAction: string;
  confidence: 'High' | 'Medium' | 'Low';
  advisoryNote: string;
}

export interface AiProcessInsight {
  id: string;
  type: 'BOTTLENECK' | 'DELAY' | 'LOOP' | 'INCOMPLETE' | 'OPTIMIZATION' | 'ANOMALY';
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  evidence: string;
  recommendation: string;
  departmentName?: string;
  metric?: string;
}

export interface StageMetric {
  stageName: string;
  sequence: number;
  avgDurationHours: number;
  expectedDurationHours: number;
  filesProcessed: number;
  overdueCount: number;
  overduePercentage: number;
  bottleneckScore: number;
  isBottleneck: boolean;
}

export interface LoopMetric {
  stageA: string;
  stageB: string;
  loopCount: number;
  affectedFilesCount: number;
  primaryReason: string;
  avgDelayAddedHours: number;
}

export interface ParallelizationCandidate {
  id: string;
  workflowName: string;
  currentFlow: string[];
  parallelStages: string[];
  potentialTimeSavedHours: number;
  rationale: string;
  administrativeNotice: string;
}

export interface AnalyticsOverview {
  totalFiles: number;
  activeFiles: number;
  completedFiles: number;
  overdueFiles: number;
  avgProcessingTimeHours: number;
  completionRatePercent: number;
  returnRatePercent: number;
  incompleteSubmissionsCount: number;
  primaryBottleneckStage: string;
  stageMetrics: StageMetric[];
  repeatedLoops: LoopMetric[];
  parallelizationOpportunities: ParallelizationCandidate[];
  insights: AiProcessInsight[];
}

export interface CompletenessCheckResult {
  isComplete: boolean;
  missingDocuments: string[];
  presentDocuments: string[];
  issues: string[];
  advisoryMessage: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  type: 'ASSIGNMENT' | 'SLA_ALERT' | 'RETURNED' | 'BOTTLENECK';
  title: string;
  message: string;
  fileId?: string;
  fileNumber?: string;
  read: boolean;
  createdAt: string;
}
