import React, { useState, useEffect } from 'react';
import {
  GovernmentFile,
  Department,
  WorkflowTemplate,
  AnalyticsOverview,
  AuditLog,
  InAppNotification,
  UserProfile,
  UserRole
} from './types';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { FilesView } from './components/FilesView';
import { FileDetailView } from './components/FileDetailView';
import { OptimizationView } from './components/OptimizationView';
import { MyTasksView } from './components/MyTasksView';
import { AuditView } from './components/AuditView';
import { CreateFileModal } from './components/CreateFileModal';
import { SupabaseAuthModal } from './components/SupabaseAuthModal';
import { supabase } from './lib/supabase';

export default function App() {
  // Navigation & View State
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Core Data States
  const [files, setFiles] = useState<GovernmentFile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'user-admin',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@gov.example',
    role: 'ADMIN',
    departmentId: 'dept-admin',
    departmentName: 'Department of Administrative Reforms',
    designation: 'Principal Secretary / Department Head'
  });

  // Active File detail state
  const [selectedFile, setSelectedFile] = useState<GovernmentFile | null>(null);
  const [selectedFileAuditLogs, setSelectedFileAuditLogs] = useState<AuditLog[]>([]);
  const [initialFileFilter, setInitialFileFilter] = useState<string>('ALL');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Safe JSON fetch helper
  const parseJsonSafe = async <T,>(res: Response): Promise<T | null> => {
    try {
      if (!res.ok) return null;
      const ct = res.headers.get('content-type');
      if (ct && ct.includes('application/json')) {
        return (await res.json()) as T;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [
        filesRes,
        deptsRes,
        wfsRes,
        analyticsRes,
        logsRes,
        notifsRes,
        userRes
      ] = await Promise.all([
        fetch('/api/files'),
        fetch('/api/departments'),
        fetch('/api/workflows'),
        fetch('/api/analytics/overview'),
        fetch('/api/audit-logs'),
        fetch('/api/notifications'),
        fetch('/api/auth/current-user')
      ]);

      const filesData = await parseJsonSafe<{ files: GovernmentFile[] }>(filesRes);
      if (filesData?.files) {
        setFiles(filesData.files);
      }

      const d = await parseJsonSafe<{ departments: Department[] }>(deptsRes);
      if (d?.departments) {
        setDepartments(d.departments);
      }

      const w = await parseJsonSafe<{ workflows: WorkflowTemplate[] }>(wfsRes);
      if (w?.workflows) {
        setWorkflows(w.workflows);
      }

      const a = await parseJsonSafe<AnalyticsOverview>(analyticsRes);
      if (a) {
        setAnalytics(a);
      }

      const l = await parseJsonSafe<{ logs: AuditLog[] }>(logsRes);
      if (l?.logs) {
        setAuditLogs(l.logs);
      }

      const n = await parseJsonSafe<{ notifications: InAppNotification[] }>(notifsRes);
      if (n?.notifications) {
        setNotifications(n.notifications);
      }

      const u = await parseJsonSafe<{ user?: UserProfile } & UserProfile>(userRes);
      if (u) {
        setCurrentUser(u.user || u);
      }
    } catch (err) {
      console.error('Error loading FlowGov data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen to Supabase Auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setCurrentUser(prev => ({
          ...prev,
          id: `sb-${session.user.id.slice(0, 8)}`,
          email: session.user.email || prev.email,
          name:
            session.user.user_metadata?.name ||
            session.user.email?.split('@')[0].toUpperCase() ||
            prev.name,
          role: (session.user.user_metadata?.role as UserRole) || prev.role
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle Switch User Role
  const handleRoleSwitch = async (role: UserRole) => {
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('Error switching role:', err);
    }
  };

  // Select File to open Detail View
  const handleSelectFile = async (fileNumberOrId: string) => {
    try {
      const res = await fetch(`/api/files/${fileNumberOrId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedFile(data.file);
        setSelectedFileAuditLogs(data.auditLogs || []);
        setCurrentView('file-detail');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Error opening file:', err);
    }
  };

  // Notification read handler
  const handleNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Error reading notification:', err);
    }
  };

  // Update file in state after approval, return, or upload
  const handleFileUpdated = (updatedFile: GovernmentFile) => {
    setSelectedFile(updatedFile);
    setFiles(prev => prev.map(f => (f.id === updatedFile.id ? updatedFile : f)));
    // Refresh analytics & logs in background
    fetch('/api/analytics/overview')
      .then(res => (res.ok && res.headers.get('content-type')?.includes('application/json') ? res.json() : null))
      .then(data => { if (data) setAnalytics(data); })
      .catch(() => {});
    fetch(`/api/files/${updatedFile.id}`)
      .then(res => (res.ok && res.headers.get('content-type')?.includes('application/json') ? res.json() : null))
      .then(data => { if (data?.auditLogs) setSelectedFileAuditLogs(data.auditLogs); })
      .catch(() => {});
  };

  // Handle newly created file
  const handleFileCreated = (newFile: GovernmentFile) => {
    setFiles(prev => [newFile, ...prev]);
    handleSelectFile(newFile.fileNumber);
    // Refresh analytics in background
    fetch('/api/analytics/overview')
      .then(res => (res.ok && res.headers.get('content-type')?.includes('application/json') ? res.json() : null))
      .then(data => { if (data) setAnalytics(data); })
      .catch(() => {});
  };

  // Navigate to files with filter
  const handleNavigateToFiles = (filter?: string) => {
    setInitialFileFilter(filter || 'ALL');
    setCurrentView('files');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Count pending tasks for current role
  const pendingTasksCount = files.filter(f => {
    if (f.status === 'COMPLETED') return false;
    if (currentUser.role === 'OFFICER') {
      return (
        f.currentStageName.toLowerCase().includes('officer') ||
        f.currentStageName.toLowerCase().includes('review') ||
        f.currentStageName.toLowerCase().includes('approval')
      );
    }
    if (currentUser.role === 'CLERK') {
      return (
        f.status === 'RETURNED' ||
        f.status === 'DRAFT' ||
        f.currentStageName.toLowerCase().includes('intake')
      );
    }
    return f.status === 'OVERDUE';
  }).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onRoleSwitch={handleRoleSwitch}
        notifications={notifications}
        onNotificationRead={handleNotificationRead}
        onNavigateToFile={handleSelectFile}
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          if (view !== 'file-detail') setSelectedFile(null);
        }}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      {/* Main View Router */}
      {currentView === 'landing' ? (
        <LandingPage
          onEnterDemo={(role) => {
            if (role) handleRoleSwitch(role);
            setCurrentView('dashboard');
          }}
          onViewFile={handleSelectFile}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <Sidebar
              currentView={currentView}
              onViewChange={(view) => {
                setCurrentView(view);
                if (view !== 'file-detail') setSelectedFile(null);
              }}
              userRole={currentUser.role}
              onOpenCreateFile={() => setIsCreateModalOpen(true)}
              onSelectFile={handleSelectFile}
              activeFileId={selectedFile?.fileNumber}
              pendingTasksCount={pendingTasksCount}
              onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
            />
          </div>

          {/* Mobile Sidebar overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="relative z-10 w-72 max-w-[80vw] bg-slate-900 h-full shadow-2xl">
                <Sidebar
                  currentView={currentView}
                  onViewChange={(view) => {
                    setCurrentView(view);
                    if (view !== 'file-detail') setSelectedFile(null);
                    setSidebarOpen(false);
                  }}
                  userRole={currentUser.role}
                  onOpenCreateFile={() => {
                    setIsCreateModalOpen(true);
                    setSidebarOpen(false);
                  }}
                  onSelectFile={(f) => {
                    handleSelectFile(f);
                    setSidebarOpen(false);
                  }}
                  activeFileId={selectedFile?.fileNumber}
                  pendingTasksCount={pendingTasksCount}
                  onOpenSupabaseModal={() => {
                    setIsSupabaseModalOpen(true);
                    setSidebarOpen(false);
                  }}
                />
              </div>
            </div>
          )}

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {loading || !analytics ? (
              <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-slate-500">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-semibold">
                  Initializing FlowGov Process Intelligence Engine...
                </span>
              </div>
            ) : currentView === 'dashboard' ? (
              <DashboardView
                analytics={analytics}
                files={files}
                currentUser={currentUser}
                onSelectFile={handleSelectFile}
                onNavigateToOptimization={() => setCurrentView('optimization')}
                onNavigateToFiles={handleNavigateToFiles}
              />
            ) : currentView === 'files' ? (
              <FilesView
                files={files}
                departments={departments}
                onSelectFile={handleSelectFile}
                onOpenCreateFile={() => setIsCreateModalOpen(true)}
                initialFilter={initialFileFilter}
              />
            ) : currentView === 'file-detail' && selectedFile ? (
              <FileDetailView
                file={selectedFile}
                auditLogs={selectedFileAuditLogs}
                currentUser={currentUser}
                onBack={() => setCurrentView('files')}
                onFileUpdated={handleFileUpdated}
              />
            ) : currentView === 'optimization' ? (
              <OptimizationView
                analytics={analytics}
                onSelectFile={handleSelectFile}
              />
            ) : currentView === 'my-tasks' ? (
              <MyTasksView
                files={files}
                currentUser={currentUser}
                onSelectFile={handleSelectFile}
                onOpenCreateFile={() => setIsCreateModalOpen(true)}
              />
            ) : currentView === 'audit' ? (
              <AuditView
                logs={auditLogs}
                onSelectFile={handleSelectFile}
              />
            ) : (
              <DashboardView
                analytics={analytics}
                files={files}
                currentUser={currentUser}
                onSelectFile={handleSelectFile}
                onNavigateToOptimization={() => setCurrentView('optimization')}
                onNavigateToFiles={handleNavigateToFiles}
              />
            )}
          </main>
        </div>
      )}

      {/* Create File Modal */}
      <CreateFileModal
        departments={departments}
        workflows={workflows}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onFileCreated={handleFileCreated}
      />

      {/* Supabase PostgreSQL & Auth Integration Modal */}
      <SupabaseAuthModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        currentUser={currentUser}
        onUserUpdate={setCurrentUser}
      />
    </div>
  );
}
