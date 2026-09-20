import React from 'react';
import { GovernmentFile, UserProfile } from '../types';
import { StatusBadge, SlaBadge, PriorityBadge } from './StatusBadge';
import { CheckSquare, Clock, ArrowRight, ShieldCheck, FileCheck2, RotateCcw } from 'lucide-react';

interface MyTasksViewProps {
  files: GovernmentFile[];
  currentUser: UserProfile;
  onSelectFile: (fileNumber: string) => void;
  onOpenCreateFile: () => void;
}

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  files,
  currentUser,
  onSelectFile,
  onOpenCreateFile
}) => {
  // Filter files relevant to the active user's role or assigned to them
  const myTasks = files.filter(f => {
    if (f.status === 'COMPLETED') return false;

    if (currentUser.role === 'OFFICER') {
      return (
        f.currentStageName.toLowerCase().includes('officer') ||
        f.currentStageName.toLowerCase().includes('review') ||
        f.currentStageName.toLowerCase().includes('approval') ||
        f.currentStageName.toLowerCase().includes('sanction')
      );
    }
    if (currentUser.role === 'CLERK') {
      return (
        f.status === 'RETURNED' ||
        f.status === 'DRAFT' ||
        f.currentStageName.toLowerCase().includes('intake') ||
        f.currentStageName.toLowerCase().includes('verification')
      );
    }
    // Admin sees all in-progress
    return f.status === 'IN_PROGRESS' || f.status === 'OVERDUE' || f.status === 'RETURNED';
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckSquare className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Assigned Operational Dossiers
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Displaying administrative dossiers queued for attention by <strong>{currentUser.name}</strong> ({currentUser.role}).
          </p>
        </div>

        {currentUser.role === 'CLERK' && (
          <button
            onClick={onOpenCreateFile}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>+ Initiate New Dossier</span>
          </button>
        )}
      </div>

      {/* Tasks List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 uppercase tracking-wider">
            Queue Action Items ({myTasks.length})
          </span>
          <span className="text-slate-500">
            Sorted by urgency and SLA deadline
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {myTasks.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <CheckSquare className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">Your Action Queue Is Clear</p>
              <p className="text-xs text-slate-400 mt-1">
                No active dossiers currently require sign-off for role: {currentUser.role}.
              </p>
            </div>
          ) : (
            myTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onSelectFile(task.fileNumber)}
                className="p-4 hover:bg-slate-50/80 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-blue-600 text-sm">
                      {task.fileNumber}
                    </span>
                    <StatusBadge status={task.status} />
                    <SlaBadge slaStatus={task.slaStatus} />
                    <PriorityBadge priority={task.priority} />
                    {task.loopsCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-semibold">
                        <RotateCcw className="w-2.5 h-2.5" />
                        {task.loopsCount} loop
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 truncate">
                    {task.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>Dept: <strong className="text-slate-700">{task.departmentName}</strong></span>
                    <span>•</span>
                    <span>Awaiting at: <strong className="text-blue-700">{task.currentStageName}</strong></span>
                    <span>•</span>
                    <span>Elapsed: {task.totalDurationHours}h</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectFile(task.fileNumber);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <span>Action File</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
