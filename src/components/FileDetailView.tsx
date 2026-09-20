import React, { useState } from 'react';
import { GovernmentFile, AuditLog, UserProfile, UserRole } from '../types';
import { WorkflowTimeline } from './WorkflowTimeline';
import { AIInsightPanel } from './AIInsightPanel';
import { StatusBadge, SlaBadge, PriorityBadge } from './StatusBadge';
import {
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  FileText,
  History,
  AlertTriangle,
  Upload,
  Clock,
  Building,
  User,
  ShieldAlert,
  Send,
  Loader2
} from 'lucide-react';

interface FileDetailViewProps {
  file: GovernmentFile;
  auditLogs: AuditLog[];
  currentUser: UserProfile;
  onBack: () => void;
  onFileUpdated: (updatedFile: GovernmentFile) => void;
}

export const FileDetailView: React.FC<FileDetailViewProps> = ({
  file,
  auditLogs,
  currentUser,
  onBack,
  onFileUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'ai' | 'documents' | 'audit'>('timeline');
  const [actionLoading, setActionLoading] = useState(false);

  // Return modal state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('Warranty and specification clause clarification required.');

  // Approval remarks state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveRemarks, setApproveRemarks] = useState('Approved in accordance with departmental statutory procedures.');

  // Upload document state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Supporting Certificate');

  // Completeness check state
  const [completenessResult, setCompletenessResult] = useState<{
    isComplete: boolean;
    missingDocuments: string[];
    advisoryMessage: string;
  } | null>(null);
  const [checkingCompleteness, setCheckingCompleteness] = useState(false);

  const isOfficer = currentUser.role === 'OFFICER' || currentUser.role === 'ADMIN';
  const isClerk = currentUser.role === 'CLERK' || currentUser.role === 'ADMIN';

  // Handle Approve Stage
  const handleApproveStage = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/files/${file.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks: approveRemarks })
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data?.file) {
          onFileUpdated(data.file);
          setShowApproveModal(false);
          return;
        }
      }
      // Client-side fallback for static Vercel hosting
      const currentIdx = file.stageInstances.findIndex(s => s.stageId === file.currentStageId || s.stageName === file.currentStageName);
      const updatedStages = [...file.stageInstances];
      if (currentIdx !== -1) {
        updatedStages[currentIdx] = {
          ...updatedStages[currentIdx],
          status: 'COMPLETED',
          completedAt: new Date().toISOString(),
          remarks: approveRemarks || 'Procedurally signed off'
        };
      }
      const nextIdx = currentIdx + 1;
      const isFinished = nextIdx >= updatedStages.length;
      if (!isFinished) {
        updatedStages[nextIdx] = {
          ...updatedStages[nextIdx],
          status: 'IN_PROGRESS',
          startedAt: new Date().toISOString()
        };
      }
      const updatedFile: GovernmentFile = {
        ...file,
        status: isFinished ? 'COMPLETED' : 'IN_PROGRESS',
        slaStatus: isFinished ? 'WITHIN_LIMIT' : file.slaStatus,
        currentStageId: isFinished ? updatedStages[updatedStages.length - 1].stageId : updatedStages[nextIdx].stageId,
        currentStageName: isFinished ? 'Final Dispatch & Closed' : updatedStages[nextIdx].stageName,
        stageInstances: updatedStages,
        updatedAt: new Date().toISOString()
      };
      onFileUpdated(updatedFile);
      setShowApproveModal(false);
    } catch (err) {
      console.error('Error approving stage:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Return Stage
  const handleReturnStage = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/files/${file.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: returnReason })
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data?.file) {
          onFileUpdated(data.file);
          setShowReturnModal(false);
          return;
        }
      }
      // Client-side fallback for static Vercel hosting
      const currentIdx = file.stageInstances.findIndex(s => s.stageId === file.currentStageId || s.stageName === file.currentStageName);
      const targetIdx = Math.max(0, currentIdx - 2); // Return to prior review stage
      const updatedStages = file.stageInstances.map((s, idx) => {
        if (idx === currentIdx) {
          return {
            ...s,
            status: 'RETURNED' as const,
            isReturned: true,
            clarificationReason: returnReason,
            remarks: returnReason
          };
        }
        if (idx === targetIdx) {
          return {
            ...s,
            status: 'IN_PROGRESS' as const,
            startedAt: new Date().toISOString()
          };
        }
        return s;
      });
      const updatedFile: GovernmentFile = {
        ...file,
        status: 'RETURNED',
        loopsCount: (file.loopsCount || 0) + 1,
        currentStageId: updatedStages[targetIdx].stageId,
        currentStageName: updatedStages[targetIdx].stageName,
        stageInstances: updatedStages,
        updatedAt: new Date().toISOString()
      };
      onFileUpdated(updatedFile);
      setShowReturnModal(false);
    } catch (err) {
      console.error('Error returning file:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Document Upload
  const handleUploadDocument = async () => {
    if (!docName.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/files/${file.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: docName.trim(), documentType: docType })
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data?.file) {
          onFileUpdated(data.file);
          setShowUploadModal(false);
          setDocName('');
          return;
        }
      }
      // Client-side fallback
      const newDoc = {
        id: `doc-${Date.now()}`,
        fileId: file.id,
        name: docName.trim(),
        documentType: docType,
        status: 'VERIFIED' as const,
        uploadedAt: new Date().toISOString(),
        fileSize: '1.8 MB'
      };
      const updatedFile: GovernmentFile = {
        ...file,
        documents: [...file.documents, newDoc],
        updatedAt: new Date().toISOString()
      };
      onFileUpdated(updatedFile);
      setShowUploadModal(false);
      setDocName('');
    } catch (err) {
      console.error('Error uploading document:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle AI Completeness Check
  const runCompletenessCheck = async () => {
    setCheckingCompleteness(true);
    try {
      const res = await fetch('/api/documents/check-completeness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowTemplateId: file.workflowTemplateId,
          uploadedDocTypes: file.documents.map(d => d.documentType)
        })
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        setCompletenessResult(data);
        return;
      }
      // Client-side fallback check
      const expectedDocTypes = [
        'Application Form',
        'Vendor Identity Proof',
        'Technical Specification Certificate',
        'Financial Statement / Price Quotation'
      ];
      const uploadedTypes = new Set(file.documents.map(d => d.documentType));
      const missing = expectedDocTypes.filter(t => !uploadedTypes.has(t));
      setCompletenessResult({
        isComplete: missing.length === 0,
        missingDocuments: missing,
        advisoryMessage: missing.length === 0
          ? 'All statutory required documents verified. Dossier is procedurally eligible for executive approval.'
          : `Deficiency detected: ${missing.length} statutory document(s) missing before approval signoff.`
      });
    } catch (err) {
      console.error('Completeness check error:', err);
    } finally {
      setCheckingCompleteness(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button & Title Bar */}
      <div className="flex flex-col gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors self-start cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Files Repository</span>
        </button>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  File #{file.fileNumber}
                </span>
                <StatusBadge status={file.status} />
                <SlaBadge slaStatus={file.slaStatus} />
                <PriorityBadge priority={file.priority} />
                {file.loopsCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800 font-semibold">
                    <RotateCcw className="w-3 h-3" />
                    {file.loopsCount} loop(s) detected
                  </span>
                )}
              </div>

              <h2 className="text-base font-semibold text-slate-800 mt-2">
                {file.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-3xl">
                {file.description}
              </p>
            </div>

            {/* Officer / Clerk Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {isOfficer && file.status !== 'COMPLETED' && (
                <>
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Current Stage</span>
                  </button>

                  <button
                    onClick={() => setShowReturnModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Return for Clarification</span>
                  </button>
                </>
              )}

              {isClerk && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Document</span>
                </button>
              )}
            </div>
          </div>

          {/* Metadata quick stats */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Department</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {file.departmentName}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Workflow Template</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {file.workflowTemplateName}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Initiated By</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {file.createdByName}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Current Stage</span>
              <span className="font-semibold text-blue-600 mt-0.5 block">
                {file.currentStageName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors -mb-px ${
            activeTab === 'timeline'
              ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Workflow Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors -mb-px ${
            activeTab === 'ai'
              ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>AI Delay Diagnosis ("Why is this stuck?")</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors -mb-px ${
            activeTab === 'documents'
              ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Dossier Documents ({file.documents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors -mb-px ${
            activeTab === 'audit'
              ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Workflow Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Procedural Stage Sequence & Timing Status
            </h3>
            <span className="text-xs text-slate-500">
              Total Elapsed: <strong>{file.totalDurationHours}h</strong> / Expected SLA: <strong>{file.expectedTotalDurationHours}h</strong>
            </span>
          </div>

          <WorkflowTimeline stages={file.stageInstances} currentStageId={file.currentStageId} />
        </div>
      )}

      {/* Tab 2: AI Delay Diagnosis */}
      {activeTab === 'ai' && (
        <AIInsightPanel file={file} />
      )}

      {/* Tab 3: Documents & Completeness Check */}
      {activeTab === 'documents' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Attached Dossier Documentation
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory documents attached to this file for administrative evaluation.
              </p>
            </div>

            <button
              onClick={runCompletenessCheck}
              disabled={checkingCompleteness}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 self-start sm:self-auto"
            >
              {checkingCompleteness ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              )}
              <span>Run Completeness Analysis</span>
            </button>
          </div>

          {/* Completeness banner if run */}
          {completenessResult && (
            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed ${
                completenessResult.isComplete
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2 font-bold mb-1">
                {completenessResult.isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                )}
                <span>
                  {completenessResult.isComplete
                    ? 'Dossier Complete: All Required Documents Accounted For'
                    : 'Completeness Alert: Missing Required Documentation'}
                </span>
              </div>
              <p>{completenessResult.advisoryMessage}</p>
              {completenessResult.missingDocuments.length > 0 && (
                <div className="mt-2 pl-4 border-l-2 border-amber-300">
                  <span className="font-semibold block">Missing Items:</span>
                  <ul className="list-disc pl-4 space-y-0.5 mt-0.5">
                    {completenessResult.missingDocuments.map((m, idx) => (
                      <li key={idx} className="font-medium">{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Document list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {file.documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-slate-900 truncate">
                    {doc.name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Type: <span className="font-medium text-slate-700">{doc.documentType}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>Uploaded by {doc.uploadedBy || 'Clerk'}</span>
                    <span>{doc.fileSize || '1.5 MB'}</span>
                  </div>
                  {doc.aiNotes && (
                    <div className="mt-1.5 text-[10px] text-indigo-600 bg-indigo-50/70 px-1.5 py-0.5 rounded">
                      {doc.aiNotes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Immutable Procedural Audit History
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological log of administrative touches, status transitions, and officer actions for File #{file.fileNumber}.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No audit events recorded.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-700 mt-0.5">{log.description}</p>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Actor: <strong className="text-slate-600">{log.userName}</strong> ({log.userRole})
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Approve Stage Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Approve Stage: {file.currentStageName}</span>
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Recording approval will mark this stage complete and forward the dossier to the next procedural step in the workflow.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Officer Remarks / Sanction Note
              </label>
              <textarea
                rows={3}
                value={approveRemarks}
                onChange={(e) => setApproveRemarks(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveStage}
                disabled={actionLoading}
                className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Approval</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return for Clarification Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-600" />
              <span>Return Dossier for Clarification</span>
            </h3>

            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              Returning a file creates a measurable <strong>workflow loop</strong> recorded in the process intelligence metrics.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Clarification / Missing Detail
              </label>
              <textarea
                rows={3}
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReturnStage}
                disabled={actionLoading || !returnReason.trim()}
                className="inline-flex items-center gap-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Record Return & Loop</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              <span>Attach Statutory Document</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Document Title
              </label>
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="e.g. Financial_Quotation_and_Audit_Statement.pdf"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Statutory Document Category
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Financial Statement / Price Quotation">Financial Statement / Price Quotation</option>
                <option value="Technical Specification Certificate">Technical Specification Certificate</option>
                <option value="Vendor Identity Proof">Vendor Identity Proof</option>
                <option value="Supporting Certificate">Supporting Certificate</option>
                <option value="Clarification Response Note">Clarification Response Note</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadDocument}
                disabled={actionLoading || !docName.trim()}
                className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Attach to Dossier</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
