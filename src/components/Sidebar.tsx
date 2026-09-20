import React from 'react';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  GitMerge,
  History,
  PlusCircle,
  Sparkles,
  Zap,
  FileSpreadsheet,
  Database
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  userRole: UserRole;
  onOpenCreateFile: () => void;
  onSelectFile?: (fileNumber: string) => void;
  activeFileId?: string;
  pendingTasksCount?: number;
  onOpenSupabaseModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  userRole,
  onOpenCreateFile,
  onSelectFile,
  pendingTasksCount = 0,
  onOpenSupabaseModal
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Intelligence Dashboard',
      icon: LayoutDashboard,
      badge: userRole === 'ADMIN' ? 'Head View' : undefined
    },
    {
      id: 'files',
      label: 'All Dossiers / Files',
      icon: FolderOpen
    },
    {
      id: 'my-tasks',
      label: 'My Assigned Tasks',
      icon: CheckSquare,
      badgeCount: pendingTasksCount > 0 ? pendingTasksCount : undefined
    },
    {
      id: 'optimization',
      label: 'Process Optimization',
      icon: GitMerge,
      highlight: true
    },
    {
      id: 'audit',
      label: 'Audit Trail Explorer',
      icon: History
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 select-none min-h-[calc(100vh-4rem)]">
      {/* Action button */}
      <div className="p-4 border-b border-slate-800">
        <button
          onClick={onOpenCreateFile}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Initiate New Dossier</span>
        </button>
      </div>

      {/* Main navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-800 text-slate-400 rounded">
                  {item.badge}
                </span>
              )}

              {item.badgeCount !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                  {item.badgeCount}
                </span>
              )}

              {item.highlight && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              )}
            </button>
          );
        })}

        {/* Hackathon Benchmark Spotlight */}
        <div className="pt-6 px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Hackathon Demo Spotlight
        </div>

        <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Primary Benchmark Dossier</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            File #FG-1042 illustrates delay in Officer Review and repeated loops.
          </p>
          <button
            onClick={() => onSelectFile && onSelectFile('FG-1042')}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-xs font-medium text-slate-200 bg-slate-700 hover:bg-slate-650 hover:text-white rounded-lg border border-slate-600 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
            <span>Open FG-1042</span>
          </button>
        </div>

        {/* Supabase Status & Config Quickcard */}
        {onOpenSupabaseModal && (
          <div
            onClick={onOpenSupabaseModal}
            className="p-3 bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-800/40 rounded-xl space-y-1.5 cursor-pointer transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Supabase Live</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-[10px] text-emerald-400/80 font-mono">
              DB & Auth: qptakshpxktkyfsihxcy
            </p>
            <div className="text-[10px] text-emerald-300/70 group-hover:text-emerald-200 flex items-center justify-between pt-0.5">
              <span>PostgreSQL & Auth</span>
              <span className="underline">Configure &rarr;</span>
            </div>
          </div>
        )}
      </nav>

      {/* Footer information */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>FlowGov v1.0 MVP</span>
        </div>
        <span className="text-slate-400 text-[10px]">Open Hackathon</span>
      </div>
    </aside>
  );
};
