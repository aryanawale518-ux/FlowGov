import React, { useState } from 'react';
import { WorkflowTemplate, GovernmentFile } from '../types';
import {
  GitBranch,
  Clock,
  FileCheck,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Users,
  FileText
} from 'lucide-react';

interface WorkflowViewProps {
  workflows: WorkflowTemplate[];
  files: GovernmentFile[];
  onSelectFile?: (fileNumber: string) => void;
  onNavigateToFiles?: (filter?: string) => void;
}

export const WorkflowView: React.FC<WorkflowViewProps> = ({
  workflows,
  files,
  onSelectFile,
  onNavigateToFiles
}) => {
  const [selectedWfId, setSelectedWfId] = useState<string>(workflows[0]?.id || 'wf-procurement');

  const currentWf = workflows.find(w => w.id === selectedWfId) || workflows[0];
  const matchingFiles = files.filter(f => f.workflowTemplateId === selectedWfId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              <GitBranch className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Government Workflow Pipelines
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
              {workflows.length} Active Templates
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Standardized multi-stage procedural pipelines, statutory SLA standards, and mandatory document requirements.
          </p>
        </div>

        {onNavigateToFiles && (
          <button
            onClick={() => onNavigateToFiles('ALL')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs cursor-pointer transition-colors"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>View All Active Files ({files.length})</span>
          </button>
        )}
      </div>

      {/* Workflow Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {workflows.map((wf) => {
          const isSelected = wf.id === selectedWfId;
          const count = files.filter(f => f.workflowTemplateId === wf.id).length;
          const totalHours = wf.stages.reduce((acc, s) => acc + s.expectedDurationHours, 0);

          return (
            <button
              key={wf.id}
              onClick={() => setSelectedWfId(wf.id)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/60 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 rounded">
                  {wf.departmentName}
                </span>
                <span className="text-xs font-bold text-blue-600">
                  {count} {count === 1 ? 'dossier' : 'dossiers'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {wf.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {wf.description}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  {wf.stages.length} Stages
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {totalHours}h SLA Standard
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {currentWf && (
        <div className="space-y-6">
          {/* Active Workflow Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Configured Procedural Pipeline
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  {currentWf.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentWf.description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span className="text-slate-500 block">Total Pipeline SLA:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {currentWf.stages.reduce((acc, s) => acc + s.expectedDurationHours, 0)} Hours (~{(currentWf.stages.reduce((acc, s) => acc + s.expectedDurationHours, 0) / 24).toFixed(1)} days)
                  </span>
                </div>
              </div>
            </div>

            {/* Stages Flow Diagram */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
                Sequential Stage Architecture
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                {currentWf.stages.map((stg, idx) => {
                  const isLast = idx === currentWf.stages.length - 1;
                  const canParallel = stg.canParallelizeWith && stg.canParallelizeWith.length > 0;

                  return (
                    <div
                      key={stg.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                            {stg.sequence}
                          </span>
                          <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                            stg.responsibleRole === 'OFFICER'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {stg.responsibleRole}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {stg.name}
                        </h4>

                        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>SLA: <strong>{stg.expectedDurationHours}h</strong></span>
                        </div>

                        {canParallel && (
                          <div className="mt-2 text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 rounded px-1.5 py-1">
                            <span className="font-semibold">Parallel Candidate</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>{stg.isRequired ? 'Mandatory' : 'Optional'}</span>
                        {!isLast && <ArrowRight className="w-3 h-3 text-slate-300" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Required Documents Checklist */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Mandatory Statutory Documents for Verification
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {currentWf.requiredDocuments.map((docName, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-medium">{docName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dossiers currently in this workflow */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Active Dossiers In This Pipeline ({matchingFiles.length})
              </h3>
              <span className="text-xs text-slate-500">
                Tracked under FlowGov Process Engine
              </span>
            </div>

            {matchingFiles.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No dossiers currently active in this pipeline.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {matchingFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => onSelectFile && onSelectFile(file.fileNumber)}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600">
                          {file.fileNumber}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          {file.title}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                        <span>Current Stage: <strong className="text-slate-700">{file.currentStageName}</strong></span>
                        <span>Duration: <strong>{file.totalDurationHours}h</strong></span>
                        {file.loopsCount > 0 && (
                          <span className="text-amber-600 font-semibold">{file.loopsCount} loop(s)</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                        file.status === 'OVERDUE' ? 'bg-rose-100 text-rose-700' :
                        file.status === 'RETURNED' ? 'bg-amber-100 text-amber-700' :
                        file.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {file.status}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
