import React from 'react';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  GitBranch,
  BarChart3,
  Sparkles,
  GitMerge,
  History,
  Settings,
  PlusCircle,
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
  isSyntheticData?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  userRole,
  onOpenCreateFile,
  onSelectFile,
  pendingTasksCount = 0,
  onOpenSupabaseModal,
  isSyntheticData = false
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: userRole === 'ADMIN' ? 'Head View' : undefined
    },
    {
      id: 'files',
      label: 'Government Files',
      icon: FolderOpen
    },
    {
      id: 'my-tasks',
      label: 'My Tasks',
      icon: CheckSquare,
      badgeCount: pendingTasksCount > 0 ? pendingTasksCount : undefined
    },
    {
      id: 'workflow',
      label: 'Workflow',
      icon: GitBranch
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3
    },
    {
      id: 'insights',
      label: 'AI Insights',
      icon: Sparkles,
      highlight: true
    },
    {
      id: 'optimization',
      label: 'Process Optimization',
      icon: GitMerge
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: History
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <aside className="w-full h-full bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 select-none">
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
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Platform Views
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
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

        {/* Benchmark Spotlight */}
        <div className="pt-4 px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Spotlight File
        </div>

        <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Benchmark Bottleneck</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            File #FG-1042 exhibits Officer Review delay and clarification loops.
          </p>
          <button
            onClick={() => onSelectFile && onSelectFile('FG-1042')}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-xs font-medium text-slate-200 bg-slate-700 hover:bg-slate-650 hover:text-white rounded-lg border border-slate-600 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
            <span>Open FG-1042</span>
          </button>
        </div>

        {/* Database Quickcard */}
        {onOpenSupabaseModal && (
          <div
            onClick={onOpenSupabaseModal}
            className="p-3 bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-800/40 rounded-xl space-y-1.5 cursor-pointer transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Supabase DB</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-[10px] text-emerald-400/80 font-mono">
              qptakshpxktkyfsihxcy
            </p>
            <span className="inline-block text-[10px] text-slate-400 group-hover:text-emerald-300">
              {isSyntheticData ? 'Click to seed demo data →' : 'Live Sync Active →'}
            </span>
          </div>
        )}
      </nav>
    </aside>
  );
};
