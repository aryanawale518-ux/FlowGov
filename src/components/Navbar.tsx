import React, { useState } from 'react';
import { UserProfile, InAppNotification, UserRole } from '../types';
import {
  Layers,
  Bell,
  Search,
  Check,
  Shield,
  UserCheck,
  FileText,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
  Database
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile;
  onRoleSwitch: (role: UserRole) => void;
  notifications: InAppNotification[];
  onNotificationRead: (id: string) => void;
  onOpenSearch?: () => void;
  onNavigateToFile?: (fileNumber: string) => void;
  currentView: string;
  onViewChange: (view: string) => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  onOpenSupabaseModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onRoleSwitch,
  notifications,
  onNotificationRead,
  onOpenSearch,
  onNavigateToFile,
  currentView,
  onViewChange,
  onToggleSidebar,
  sidebarOpen,
  onOpenSupabaseModal
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [quickSearchInput, setQuickSearchInput] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchInput.trim() && onNavigateToFile) {
      onNavigateToFile(quickSearchInput.trim());
      setQuickSearchInput('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white select-none">
      {/* Top synthetic prototype notice banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 text-amber-50 text-[11px] font-medium py-1 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse"></span>
        <span>
          <strong>PROTOTYPE — SYNTHETIC DATA:</strong> This demonstration platform models administrative workflow bottlenecks using simulated government dossier records.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2 -ml-2 text-slate-400 hover:text-white lg:hidden rounded-lg hover:bg-slate-800"
                aria-label="Toggle navigation"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <div
              onClick={() => onViewChange('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs text-white group-hover:bg-blue-500 transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold tracking-tight text-white">FLOWGOV</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/60 uppercase">
                    GovTech AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block font-normal">
                  Find the bottleneck. Understand the delay. Improve the process.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Search bar */}
          <form onSubmit={handleQuickSearch} className="hidden md:flex flex-1 max-w-xs relative">
            <input
              type="text"
              value={quickSearchInput}
              onChange={(e) => setQuickSearchInput(e.target.value)}
              placeholder="Jump to file (e.g. FG-1042)..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </form>

          {/* Right actions: Landing page link, notifications, Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Landing page preview toggle */}
            <button
              onClick={() => onViewChange(currentView === 'landing' ? 'dashboard' : 'landing')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors hidden sm:inline-flex items-center gap-1.5 ${
                currentView === 'landing'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{currentView === 'landing' ? 'Open Dashboard' : 'Public Overview'}</span>
            </button>

              {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowRoleDropdown(false);
                }}
                className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-slate-900 animate-in fade-in-50 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Process Notifications
                    </span>
                    <span className="text-xs text-slate-500">
                      {unreadCount} unread
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500">
                        No notifications recorded.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            onNotificationRead(n.id);
                            if (n.fileNumber && onNavigateToFile) {
                              onNavigateToFile(n.fileNumber);
                              setShowNotifications(false);
                            }
                          }}
                          className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                            !n.read ? 'bg-blue-50/50 font-medium' : 'text-slate-600'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="font-semibold text-slate-900">{n.title}</span>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1"></span>
                            )}
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Supabase Integration Button */}
            {onOpenSupabaseModal && (
              <button
                onClick={onOpenSupabaseModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 text-xs font-medium transition-colors"
                title="Supabase Auth & Database (Project: qptakshpxktkyfsihxcy)"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Supabase</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </button>
            )}

            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowRoleDropdown(!showRoleDropdown);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  {currentUser.role === 'ADMIN' ? (
                    <Shield className="w-3.5 h-3.5" />
                  ) : currentUser.role === 'OFFICER' ? (
                    <UserCheck className="w-3.5 h-3.5" />
                  ) : (
                    <FileText className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-white leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-blue-400 font-medium leading-tight">
                    Role: {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-slate-900 animate-in fade-in-50 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Demo Persona Switcher
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Toggle active user role to evaluate permissions and workflows:
                    </p>
                  </div>

                  <div className="p-1 space-y-1">
                    <button
                      onClick={() => {
                        onRoleSwitch('ADMIN');
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs text-left transition-colors ${
                        currentUser.role === 'ADMIN'
                          ? 'bg-blue-50 text-blue-900 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-indigo-100 text-indigo-700">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">Department Head / Admin</div>
                          <div className="text-[11px] text-slate-500">Rajesh Kumar (Intelligence & Analytics)</div>
                        </div>
                      </div>
                      {currentUser.role === 'ADMIN' && <Check className="w-4 h-4 text-blue-600" />}
                    </button>

                    <button
                      onClick={() => {
                        onRoleSwitch('OFFICER');
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs text-left transition-colors ${
                        currentUser.role === 'OFFICER'
                          ? 'bg-blue-50 text-blue-900 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-700">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">Reviewing Officer</div>
                          <div className="text-[11px] text-slate-500">Sunita Sharma (Review & Approval)</div>
                        </div>
                      </div>
                      {currentUser.role === 'OFFICER' && <Check className="w-4 h-4 text-blue-600" />}
                    </button>

                    <button
                      onClick={() => {
                        onRoleSwitch('CLERK');
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs text-left transition-colors ${
                        currentUser.role === 'CLERK'
                          ? 'bg-blue-50 text-blue-900 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-amber-100 text-amber-700">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">Clerk / Employee</div>
                          <div className="text-[11px] text-slate-500">Amit Patel (Intake & Uploads)</div>
                        </div>
                      </div>
                      {currentUser.role === 'CLERK' && <Check className="w-4 h-4 text-blue-600" />}
                    </button>

                    {onOpenSupabaseModal && (
                      <div className="pt-2 mt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setShowRoleDropdown(false);
                            onOpenSupabaseModal();
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-lg text-xs bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-950 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-emerald-200 text-emerald-800">
                              <Database className="w-3.5 h-3.5" />
                            </div>
                            <div className="text-left">
                              <div className="font-bold">Supabase Auth & DB</div>
                              <div className="text-[10px] text-emerald-700">Project: qptakshpxktkyfsihxcy</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded">
                            Config
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
