import React, { useState } from 'react';
import { Department, WorkflowTemplate, GovernmentFile } from '../types';
import {
  X,
  PlusCircle,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Sparkles,
  Loader2,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface CreateFileModalProps {
  departments: Department[];
  workflows: WorkflowTemplate[];
  isOpen: boolean;
  onClose: () => void;
  onFileCreated: (file: GovernmentFile) => void;
}

export const CreateFileModal: React.FC<CreateFileModalProps> = ({
  departments,
  workflows,
  isOpen,
  onClose,
  onFileCreated
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState('Procurement of Laboratory Equipment - Batch 5');
  const [description, setDescription] = useState('Acquisition of precision testing devices for state scientific diagnostics center under modernization programme.');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'dept-procurement');
  const [workflowTemplateId, setWorkflowTemplateId] = useState(workflows[0]?.id || 'wf-procurement');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');

  // Document checklist simulation (starts with 3 documents, intentionally missing Financial Statement!)
  const [uploadedDocs, setUploadedDocs] = useState<Array<{ name: string; documentType: string }>>([
    { name: 'Application_Form_Filled.pdf', documentType: 'Application Form' },
    { name: 'Vendor_Identity_Verification.pdf', documentType: 'Vendor Identity Proof' },
    { name: 'Technical_Specification_Compliance.pdf', documentType: 'Technical Specification Certificate' }
  ]);

  const [completenessResult, setCompletenessResult] = useState<{
    isComplete: boolean;
    missingDocuments: string[];
    advisoryMessage: string;
  } | null>(null);

  const [checkingCompleteness, setCheckingCompleteness] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Quick helper to simulate adding the missing Financial Statement
  const addMissingFinancialStatement = () => {
    if (!uploadedDocs.some(d => d.documentType.includes('Financial'))) {
      setUploadedDocs(prev => [
        ...prev,
        {
          name: 'Certified_Financial_Price_Schedule.pdf',
          documentType: 'Financial Statement / Price Quotation'
        }
      ]);
      setCompletenessResult(null);
    }
  };

  const runCompletenessCheck = async () => {
    setCheckingCompleteness(true);
    try {
      const res = await fetch('/api/documents/check-completeness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowTemplateId,
          uploadedDocTypes: uploadedDocs.map(d => d.documentType)
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCompletenessResult(data);
      }
    } catch (err) {
      console.error('Completeness check error:', err);
    } finally {
      setCheckingCompleteness(false);
    }
  };

  const handleSubmitFile = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          departmentId,
          workflowTemplateId,
          priority,
          documents: uploadedDocs
        })
      });
      if (res.ok) {
        const data = await res.json();
        // Submit the file so it enters stage 1
        const submitRes = await fetch(`/api/files/${data.file.id}/submit`, { method: 'POST' });
        if (submitRes.ok) {
          const submitData = await submitRes.json();
          onFileCreated(submitData.file);
        } else {
          onFileCreated(data.file);
        }
        onClose();
      }
    } catch (err) {
      console.error('File creation error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTemplate = workflows.find(w => w.id === workflowTemplateId) || workflows[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Initiate New Administrative File (Clerk Portal)
            </h2>
            <p className="text-xs text-slate-500">
              {step === 1 ? 'Step 1: Enter dossier details & select workflow' : 'Step 2: Upload documents & AI completeness check'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {step === 1 ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  File / Dossier Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Workflow Template *
                  </label>
                  <select
                    value={workflowTemplateId}
                    onChange={(e) => setWorkflowTemplateId(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {workflows.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Priority Classification
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="CRITICAL">Critical Priority</option>
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Subject Reference
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                <span className="font-bold block mb-1">Configured Workflow Stages:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedTemplate?.stages.map((stg, idx) => (
                    <span
                      key={stg.id}
                      className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] font-medium"
                    >
                      {idx + 1}. {stg.name} ({stg.expectedDurationHours}h)
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Document checklist & Completeness Check */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Mandatory Statutory Checklist for {selectedTemplate.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verify that all required documents are attached before submission.
                    </p>
                  </div>

                  <button
                    onClick={runCompletenessCheck}
                    disabled={checkingCompleteness}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                  >
                    {checkingCompleteness ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Run AI Completeness Check</span>
                  </button>
                </div>

                {/* Completeness Result Alert Banner */}
                {completenessResult && (
                  <div
                    className={`p-4 rounded-xl border text-xs leading-relaxed ${
                      completenessResult.isComplete
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-amber-50 border-amber-300 text-amber-900'
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
                          ? 'All required documents detected. Dossier ready for submission.'
                          : 'This file appears incomplete.'}
                      </span>
                    </div>
                    <p>{completenessResult.advisoryMessage}</p>

                    {!completenessResult.isComplete && (
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-amber-200">
                        <span className="text-[11px] font-semibold text-amber-800">
                          Missing: {completenessResult.missingDocuments.join(', ')}
                        </span>
                        <button
                          type="button"
                          onClick={addMissingFinancialStatement}
                          className="px-2.5 py-1 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded shadow-xs cursor-pointer"
                        >
                          + Upload Missing Financial Statement
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Attached Documents List */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-700">
                    Currently Attached Documents ({uploadedDocs.length}):
                  </div>
                  {uploadedDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-emerald-600" />
                        <div>
                          <span className="font-semibold text-slate-800 block">{doc.name}</span>
                          <span className="text-[11px] text-slate-500">Category: {doc.documentType}</span>
                        </div>
                      </div>
                      <span className="text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              ← Back to Details
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>

            {step === 1 ? (
              <button
                type="button"
                onClick={() => {
                  setStep(2);
                  // Automatically trigger initial completeness check on step 2 entry to mirror Demo Step 1
                  runCompletenessCheck();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                <span>Continue to Document Checklist</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitFile}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Submit File to Workflow</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
