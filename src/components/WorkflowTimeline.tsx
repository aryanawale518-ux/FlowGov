import React from 'react';
import { FileStageInstance } from '../types';
import { CheckCircle2, Clock, RotateCcw, AlertTriangle, Circle } from 'lucide-react';
import { SlaBadge } from './StatusBadge';

interface WorkflowTimelineProps {
  stages: FileStageInstance[];
  currentStageId: string;
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ stages, currentStageId }) => {
  return (
    <div className="space-y-6">
      <div className="relative">
        {stages.map((stage, idx) => {
          const isCurrent = stage.stageId === currentStageId;
          const isCompleted = stage.status === 'COMPLETED';
          const isReturned = stage.status === 'RETURNED' || stage.isReturned;
          const isPending = stage.status === 'PENDING';
          const isLast = idx === stages.length - 1;

          return (
            <div key={stage.id} className="relative flex items-start gap-4 pb-8 last:pb-0">
              {/* Vertical connector line */}
              {!isLast && (
                <div
                  className={`absolute top-8 left-4 w-0.5 h-[calc(100%-2rem)] -ml-px ${
                    isCompleted ? 'bg-emerald-300' : 'bg-slate-200'
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Status icon node */}
              <div
                className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                  isCompleted
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                    : isReturned
                    ? 'bg-amber-50 border-amber-500 text-amber-600'
                    : isCurrent
                    ? 'bg-blue-50 border-blue-600 text-blue-600 ring-4 ring-blue-50'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isReturned ? (
                  <RotateCcw className="w-4 h-4" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 animate-pulse" />
                ) : (
                  <Circle className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Stage content */}
              <div
                className={`flex-1 p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-slate-50/70 border-blue-200 shadow-xs'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Stage {stage.sequence}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {stage.stageName}
                    </h4>
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-100 text-blue-800 rounded-full">
                        Current Active Stage
                      </span>
                    )}
                  </div>

                  <SlaBadge slaStatus={stage.slaStatus} />
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block font-medium">Assigned Role:</span>
                    <span className="font-semibold text-slate-800">
                      {stage.assignedRole} {stage.assignedToName ? `(${stage.assignedToName})` : ''}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Configured SLA:</span>
                    <span className="font-medium text-slate-700">
                      {stage.expectedDurationHours >= 24
                        ? `${stage.expectedDurationHours / 24} day(s) (${stage.expectedDurationHours}h)`
                        : `${stage.expectedDurationHours} hours`}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Actual Elapsed:</span>
                    <span
                      className={`font-semibold ${
                        stage.actualDurationHours && stage.actualDurationHours > stage.expectedDurationHours
                          ? 'text-rose-700'
                          : 'text-slate-800'
                      }`}
                    >
                      {stage.actualDurationHours !== undefined
                        ? stage.actualDurationHours >= 24
                          ? `${Math.floor(stage.actualDurationHours / 24)}d ${stage.actualDurationHours % 24}h (${stage.actualDurationHours}h)`
                          : `${stage.actualDurationHours} hours`
                        : isPending
                        ? 'Not yet started'
                        : 'In progress'}
                    </span>
                  </div>
                </div>

                {stage.remarks && (
                  <div className="mt-3 p-2.5 bg-slate-100/70 border border-slate-200/60 rounded-lg text-xs text-slate-700">
                    <span className="font-semibold text-slate-900 block mb-0.5">Recorded Remarks:</span>
                    {stage.remarks}
                  </div>
                )}

                {stage.clarificationReason && (
                  <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-950 block">Clarification Return Reason:</span>
                      {stage.clarificationReason}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
