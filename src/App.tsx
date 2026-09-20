import React, { useState, useEffect, useCallback } from 'react';
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
import { WorkflowView } from './components/WorkflowView';
import { OptimizationView } from './components/OptimizationView';
import { MyTasksView } from './components/MyTasksView';
import { AuditView } from './components/AuditView';
import { SettingsView } from './components/SettingsView';
import { CreateFileModal } from './components/CreateFileModal';
import { SupabaseAuthModal } from './components/SupabaseAuthModal';
import { supabase } from './lib/supabase';
import { loadFlowGovData, seedDemoDataToSupabase } from './services/dataService';
import { calculateAnalyticsOverview } from './data/mockData';
import { CheckCircle2, AlertCircle } from 'lucide-react';

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
  const [isSyntheticData, setIsSyntheticData] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  // Show auto-dismissing toast
  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }, []);

  // Resilient data loading using 3-tier strategy (API -> Supabase -> Demo Fallback)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadFlowGovData();
      setFiles(data.files);
      setDepartments(data.departments);
      setWorkflows(data.workflows);
      setAnalytics(data.analytics);
      setAuditLogs(data.auditLogs);
      setNotifications(data.notifications);
      setIsSyntheticData(data.isSynthetic);

      if (data.currentUser) {
        setCurrentUser(prev => ({
          ...prev,
          ...data.currentUser
        }));
      }
    } catch (err) {
      console.error('Error in FlowGov load sequence:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Listen to Supabase Auth state changes
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
        showToast(`Authenticated as ${session.user.email}`, 'success');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData, showToast]);

  // Handle Switch User Role (Optimistic local switch + optional API notification)
  const handleRoleSwitch = async (role: UserRole) => {
    const roleProfiles: Record<UserRole, Partial<UserProfile>> = {
      ADMIN: {
        id: 'user-admin',
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@gov.example',
        role: 'ADMIN',
        departmentId: 'dept-admin',
        departmentName: 'Department of Administrative Reforms',
        designation: 'Principal Secretary / Department Head'
      },
      OFFICER: {
        id: 'user-officer-1',
        name: 'Sunita Sharma',
        email: 'sunita.sharma@gov.example',
        role: 'OFFICER',
        departmentId: 'dept-procurement',
        departmentName: 'State Procurement & Logistics Wing',
        designation: 'Joint Director & Sanctioning Officer'
      },
      CLERK: {
        id: 'user-clerk-1',
        name: 'Amit Patel',
        email: 'amit.patel@gov.example',
        role: 'CLERK',
        departmentId: 'dept-procurement',
        departmentName: 'State Procurement & Logistics Wing',
        designation: 'Senior Administrative Clerk / Scrutiny Operator'
      }
    };

    const newProfile = { ...currentUser, ...roleProfiles[role] } as UserProfile;
    setCurrentUser(newProfile);
    showToast(`Switched active role to ${role}`, 'success');

    try {
      await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
    } catch {
      // Ignored for static hosting
    }
  };

  // Select File to open Detail View (Guaranteed instant rendering)
  const handleSelectFile = async (fileNumberOrId: string) => {
    const targetFile = files.find(
      f => f.fileNumber === fileNumberOrId || f.id === fileNumberOrId
    );

    if (targetFile) {
      setSelectedFile(targetFile);
      const relatedLogs = auditLogs.filter(
        l => l.fileId === targetFile.id || l.fileNumber === targetFile.fileNumber
      );
      setSelectedFileAuditLogs(relatedLogs);
      setCurrentView('file-detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Attempt background fetch to enrich with latest server-side audit logs if available
    try {
      const res = await fetch(`/api/files/${fileNumberOrId}`);
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data?.file) {
          setSelectedFile(data.file);
          if (data.auditLogs) {
            setSelectedFileAuditLogs(data.auditLogs);
          }
          if (!targetFile) {
            setCurrentView('file-detail');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      }
    } catch {
      // Offline / fallback handled
    }
  };

  // Seed Demo Data to Supabase
  const handleSeedDemoData = async () => {
    showToast('Synchronizing demo workflow dataset to Supabase...', 'success');
    const res = await seedDemoDataToSupabase();
    if (res.success) {
      showToast('Demo dataset successfully seeded to Supabase tables!', 'success');
      await fetchData();
    } else {
      showToast(`Seeding notice: ${res.message || 'Demo data loaded in memory.'}`, 'error');
    }
  };

  // Notification read handler
  const handleNotificationRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    } catch {
      // Local update preserved
    }
  };

  // Update file in state after approval, return, or upload
  const handleFileUpdated = (updatedFile: GovernmentFile) => {
    setSelectedFile(updatedFile);
    const updatedFiles = files.map(f => (f.id === updatedFile.id ? updatedFile : f));
    setFiles(updatedFiles);

    // Compute updated analytics immediately
    const newAnalytics = calculateAnalyticsOverview(updatedFiles);
    setAnalytics(newAnalytics);

    showToast(`Dossier ${updatedFile.fileNumber} updated (${updatedFile.status})`, 'success');
  };

  // Handle newly created file
  const handleFileCreated = (newFile: GovernmentFile) => {
    const updatedFiles = [newFile, ...files];
    setFiles(updatedFiles);
    setAnalytics(calculateAnalyticsOverview(updatedFiles));
    setSelectedFile(newFile);
    setCurrentView('file-detail');
    showToast(`New dossier ${newFile.fileNumber} successfully registered!`, 'success');
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
        f.currentStageName.toLowerCase().includes('intake') ||
        f.currentStageName.toLowerCase().includes('verification') ||
        f.currentStageName.toLowerCase().includes('scrutiny')
      );
    }
    return f.status === 'OVERDUE' || f.loopsCount > 0;
  }).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 bg-slate-900 text-white border border-slate-700">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        notifications={notifications}
        onRoleSwitch={handleRoleSwitch}
        onNotificationRead={handleNotificationRead}
        onNavigateToFile={handleSelectFile}
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      {/* Primary Layout Router */}
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
          <div className="hidden lg:block w-64 shrink-0">
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
              isSyntheticData={isSyntheticData}
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
                  isSyntheticData={isSyntheticData}
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
                isSynthetic={isSyntheticData}
                onSeedData={handleSeedDemoData}
                auditLogs={auditLogs}
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
            ) : currentView === 'workflow' ? (
              <WorkflowView
                workflows={workflows}
                files={files}
                onSelectFile={handleSelectFile}
                onNavigateToFiles={handleNavigateToFiles}
              />
            ) : currentView === 'analytics' ? (
              <OptimizationView
                analytics={analytics}
                onSelectFile={handleSelectFile}
                initialTab="analytics"
              />
            ) : currentView === 'insights' ? (
              <OptimizationView
                analytics={analytics}
                onSelectFile={handleSelectFile}
                initialTab="insights"
              />
            ) : currentView === 'loops' ? (
              <OptimizationView
                analytics={analytics}
                onSelectFile={handleSelectFile}
                initialTab="loops"
              />
            ) : currentView === 'optimization' ? (
              <OptimizationView
                analytics={analytics}
                onSelectFile={handleSelectFile}
                initialTab="all"
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
            ) : currentView === 'settings' ? (
              <SettingsView
                currentUser={currentUser}
                onRoleSwitch={handleRoleSwitch}
                isSyntheticData={isSyntheticData}
                onSeedDemoData={handleSeedDemoData}
                onRefreshData={fetchData}
                onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
              />
            ) : (
              <DashboardView
                analytics={analytics}
                files={files}
                currentUser={currentUser}
                onSelectFile={handleSelectFile}
                onNavigateToOptimization={() => setCurrentView('optimization')}
                onNavigateToFiles={handleNavigateToFiles}
                isSynthetic={isSyntheticData}
                onSeedData={handleSeedDemoData}
                auditLogs={auditLogs}
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
