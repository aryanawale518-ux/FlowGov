import React from 'react';
import { AnalyticsOverview, GovernmentFile, UserProfile, AuditLog } from '../types';
import { MetricCard } from './MetricCard';
import { StatusBadge, PriorityBadge, SlaBadge } from './StatusBadge';
import { ProcessQueryWidget } from './ProcessQueryWidget';
import {
  Files,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Flame,
  GitPullRequest,
  Sparkles,
  ArrowUpRight,
  TrendingDown,
  RotateCcw,
  AlertTriangle,
  Lightbulb,
  FileSpreadsheet,
  Database,
  History,
  Activity,
  Layers,
  CheckCircle,
  FileClock,
  ArrowRight
} from 'lucide-react';

interface DashboardViewProps {
  analytics: AnalyticsOverview;
  files: GovernmentFile[];
  currentUser: UserProfile;
  onSelectFile: (fileNumber: string) => void;
  onNavigateToOptimization: () => void;
  onNavigateToFiles: (filter?: string) => void;
  isSynthetic?: boolean;
  onSeedData?: () => void;
  auditLogs?: AuditLog[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analytics,
  files,
  currentUser,
  onSelectFile,
  onNavigateToOptimization,
  onNavigateToFiles,
  isSynthetic = false,
  onSeedData,
  auditLogs = []
}) => {
  const topBottleneck = analytics.stageMetrics.find(s => s.isBottleneck) || analytics.stageMetrics[0];
  const overdueFiles = files.filter(f => f.status === 'OVERDUE' || f.slaStatus === 'EXCEEDED_LIMIT').slice(0, 5);

  const pendingCount = files.filter(f => f.status === 'DRAFT' || f.status === 'SUBMITTED').length;
  const inProgressCount = files.filter(f => f.status === 'IN_PROGRESS' || f.status === 'RETURNED').length;
  const completedCount = analytics.completedFiles || files.filter(f => f.status === 'COMPLETED').length;
  const overdueCount = analytics.overdueFiles || files.filter(f => f.status === 'OVERDUE').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Prototype — Synthetic Data Banner */}
      {isSynthetic && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wider bg-amber-500 text-slate-950 rounded-md font-mono shrink-0 shadow-xs">
              Prototype — Synthetic Data
            </span>
            <div className="text-xs">
              <span className="font-bold text-amber-900">Standard Administrative Workflow Dataset Active: </span>
              <span className="text-amber-800">
                Displaying realistic government procurement, administrative sanction, and certificate verification dossiers.
              </span>
            </div>
          </div>
          {onSeedData && (
            <button
              onClick={onSeedData}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Seed Demo Data to Supabase</span>
            </button>
          )}
        </div>
      )}

      {/* Welcome & Role Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Process Intelligence Dashboard
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-md">
              Live Aggregate Metrics
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Analyzing workflow friction, stage cycle times, and clarification loops across departments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToOptimization}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
          >
            <GitPullRequest className="w-4 h-4" />
            <span>Process Optimization Insights</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <MetricCard
          title="Total Files"
          value={analytics.totalFiles}
          subtitle="All active & closed"
          icon={<Files className="w-4 h-4" />}
          onClick={() => onNavigateToFiles('ALL')}
        />

        <MetricCard
          title="Pending"
          value={pendingCount}
          subtitle="Intake & scrutiny"
          icon={<FileClock className="w-4 h-4" />}
          onClick={() => onNavigateToFiles('ALL')}
        />

        <MetricCard
          title="In Progress"
          value={inProgressCount}
          subtitle="Active in stages"
          icon={<Clock className="w-4 h-4" />}
          onClick={() => onNavigateToFiles('IN_PROGRESS')}
        />

        <MetricCard
          title="Completed"
          value={completedCount}
          subtitle={`${analytics.completionRatePercent}% completion rate`}
          icon={<CheckCircle2 className="w-4 h-4" />}
          trend={{ label: 'Procedural signoffs', isPositive: true }}
          onClick={() => onNavigateToFiles('COMPLETED')}
        />

        <MetricCard
          title="Overdue"
          value={overdueCount}
          subtitle="Exceeded timeline"
          icon={<AlertOctagon className="w-4 h-4" />}
          alert={overdueCount > 0}
          trend={{ label: 'Exceeding SLA limits', isPositive: false }}
          onClick={() => onNavigateToFiles('OVERDUE')}
        />

        <MetricCard
          title="Avg Processing Time"
          value={`${analytics.avgProcessingTimeHours}h`}
          subtitle="~2.1 days per dossier"
          icon={<Clock className="w-4 h-4" />}
        />
      </div>

      {/* Top Bottleneck & Workflow Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Top Bottleneck Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
                  <Flame className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Top Bottleneck Stage
                </h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded-full uppercase tracking-wide">
                Score: {topBottleneck.bottleneckScore}
              </span>
            </div>

            <div className="space-y-2.5">
              <div>
                <span className="text-xs text-slate-500 block">Stage Designation:</span>
                <span className="text-base font-bold text-slate-900">
                  {topBottleneck.stageName}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">SLA Expected:</span>
                  <strong className="text-slate-700">{topBottleneck.expectedDurationHours} Hours</strong>
                </div>
                <div className="p-2 bg-rose-50 rounded-lg border border-rose-100">
                  <span className="text-rose-500 block text-[11px]">Actual Average:</span>
                  <strong className="text-rose-800">{topBottleneck.avgDurationHours} Hours</strong>
                </div>
              </div>

              <p className="text-xs text-slate-600 pt-1">
                {topBottleneck.overduePercentage}% of dossiers entering this stage exceed configured SLA limits.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToOptimization}
            className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition-colors cursor-pointer"
          >
            <span>Analyze Bottleneck Root Causes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Workflow Status Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
                <Layers className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Workflow Status
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              {files.length} Total Records
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div
              onClick={() => onNavigateToFiles('ALL')}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span className="font-medium text-slate-700">Pending / Intake</span>
              </div>
              <span className="font-bold text-slate-900">{pendingCount}</span>
            </div>

            <div
              onClick={() => onNavigateToFiles('IN_PROGRESS')}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="font-medium text-slate-700">In Progress</span>
              </div>
              <span className="font-bold text-slate-900">{inProgressCount}</span>
            </div>

            <div
              onClick={() => onNavigateToFiles('RETURNED')}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="font-medium text-slate-700">Returned for Clarification</span>
              </div>
              <span className="font-bold text-amber-600">{files.filter(f => f.status === 'RETURNED').length}</span>
            </div>

            <div
              onClick={() => onNavigateToFiles('OVERDUE')}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="font-medium text-slate-700">Overdue SLA Limit</span>
              </div>
              <span className="font-bold text-rose-600">{overdueCount}</span>
            </div>

            <div
              onClick={() => onNavigateToFiles('COMPLETED')}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="font-medium text-slate-700">Completed & Dispatched</span>
              </div>
              <span className="font-bold text-emerald-600">{completedCount}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-purple-50 text-purple-600 border border-purple-200">
                  <Activity className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Recent Activity
                </h3>
              </div>
              <span className="text-xs text-slate-500">Audit Stream</span>
            </div>

            <div className="space-y-3">
              {auditLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="text-xs space-y-0.5 border-l-2 border-blue-500 pl-2.5 py-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-slate-900">{log.fileNumber}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 line-clamp-1">{log.description}</p>
                  <span className="text-[10px] text-slate-400 font-medium">by {log.userName} ({log.userRole})</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateToFiles('ALL')}
            className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          >
            <span>View Complete Audit Stream</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stage Duration Breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
                <Flame className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Process Bottleneck Detection & Stage Duration Breakdown
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Historical stage duration metrics highlighting where administrative files experience the longest queues.
            </p>
          </div>

          <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-medium">
            <strong>Key Finding:</strong> {topBottleneck.stageName} is currently the largest contributor to total processing time.
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {analytics.stageMetrics.map((stage) => {
            const isHighBottleneck = stage.isBottleneck;

            return (
              <div
                key={stage.stageName}
                className={`p-3.5 rounded-xl border transition-all ${
                  isHighBottleneck
                    ? 'bg-rose-50/40 border-rose-300 ring-1 ring-rose-200'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">
                      Stage {stage.sequence}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {stage.stageName}
                    </span>
                    {isHighBottleneck && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded-full uppercase tracking-wide">
                        Primary Bottleneck (Score: {stage.bottleneckScore})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500">
                      Configured SLA: <strong>{stage.expectedDurationHours}h</strong>
                    </span>
                    <span className={`font-bold ${isHighBottleneck ? 'text-rose-600' : 'text-slate-700'}`}>
                      Average Actual: <strong>{stage.avgDurationHours}h</strong>
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHighBottleneck ? 'bg-rose-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.round((stage.avgDurationHours / 120) * 100))}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{stage.filesProcessed} files processed through this stage</span>
                  <span className={stage.overduePercentage > 30 ? 'text-rose-600 font-semibold' : ''}>
                    {stage.overduePercentage}% of files exceeded configured timeline at this stage
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Process Intelligence Findings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              AI Process Intelligence Findings
            </h2>
          </div>
          <span className="text-xs text-slate-500">Synthesized from departmental event logs</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.insights.map((insight) => (
            <div
              key={insight.id}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {insight.type === 'BOTTLENECK' && (
                      <span className="p-1.5 rounded bg-rose-100 text-rose-700">
                        <Flame className="w-4 h-4" />
                      </span>
                    )}
                    {insight.type === 'LOOP' && (
                      <span className="p-1.5 rounded bg-amber-100 text-amber-700">
                        <RotateCcw className="w-4 h-4" />
                      </span>
                    )}
                    {insight.type === 'INCOMPLETE' && (
                      <span className="p-1.5 rounded bg-blue-100 text-blue-700">
                        <AlertTriangle className="w-4 h-4" />
                      </span>
                    )}
                    {insight.type === 'OPTIMIZATION' && (
                      <span className="p-1.5 rounded bg-emerald-100 text-emerald-700">
                        <Lightbulb className="w-4 h-4" />
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {insight.type}
                    </span>
                  </div>

                  {insight.metric && (
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                      {insight.metric}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {insight.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {insight.description}
                </p>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                  <div>
                    <strong className="text-slate-900">Evidence:</strong> {insight.evidence}
                  </div>
                  <div>
                    <strong className="text-indigo-900">Advisory Recommendation:</strong> {insight.recommendation}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Natural Language Process Query */}
      <ProcessQueryWidget />

      {/* Priority Actionable Dossiers Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Dossiers Requiring Administrative Attention
            </h2>
            <p className="text-xs text-slate-500">
              Files with exceeded processing timelines or pending clarification returns
            </p>
          </div>

          <button
            onClick={() => onNavigateToFiles('OVERDUE')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All ({analytics.overdueFiles})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">File Number</th>
                <th className="py-2.5 px-3">Title & Department</th>
                <th className="py-2.5 px-3">Current Stage</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Timeline Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {overdueFiles.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => onSelectFile(f.fileNumber)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-bold text-blue-600 whitespace-nowrap">
                    {f.fileNumber}
                    {f.loopsCount > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-semibold">
                        {f.loopsCount} loop
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900 line-clamp-1">{f.title}</div>
                    <div className="text-slate-400 text-[11px]">{f.departmentName}</div>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-800">
                    {f.currentStageName}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <StatusBadge status={f.status} />
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <SlaBadge slaStatus={f.slaStatus} />
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFile(f.fileNumber);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                    >
                      Open Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
