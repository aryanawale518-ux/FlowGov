import React, { useState } from 'react';
import { AnalyticsOverview } from '../types';
import {
  GitMerge,
  RotateCcw,
  Zap,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Info,
  Flame,
  Sparkles,
  BarChart3,
  ShieldAlert,
  Sliders
} from 'lucide-react';

interface OptimizationViewProps {
  analytics: AnalyticsOverview;
  onSelectFile?: (fileNumber: string) => void;
  initialTab?: 'all' | 'analytics' | 'insights' | 'loops' | 'parallel';
}

export const OptimizationView: React.FC<OptimizationViewProps> = ({
  analytics,
  onSelectFile,
  initialTab = 'all'
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'analytics' | 'insights' | 'loops' | 'parallel'>(initialTab);
  const [simulateParallel, setSimulateParallel] = useState(false);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Parallel simulation calculations
  const baselineProcurementDays = 8.6;
  const optimizedProcurementDays = 5.2;

  const topBottleneck = analytics.stageMetrics.find(s => s.isBottleneck) || analytics.stageMetrics[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              <GitMerge className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Process Intelligence & Optimization
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full border border-blue-200">
              Algorithmic Analysis
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Algorithmic detection of procedural bottlenecks, recursive clarification loops, and concurrent workflow opportunities.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'analytics' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
            <span>Analytics & Stages</span>
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'insights' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Insights ({analytics.insights?.length || 4})</span>
          </button>
          <button
            onClick={() => setActiveTab('loops')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'loops' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span>Clarification Loops</span>
          </button>
          <button
            onClick={() => setActiveTab('parallel')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'parallel' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Parallelization</span>
          </button>
        </div>
      </div>

      {/* SECTION: AI PROCESS INSIGHTS (Shown on 'all' and 'insights') */}
      {(activeTab === 'all' || activeTab === 'insights') && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-200">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  AI-Powered Administrative Recommendations
                </h2>
                <p className="text-xs text-slate-500">
                  Data-backed statutory recommendations generated from multi-department file audit logs.
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              FlowGov Procedural Model v2.4
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(analytics.insights || []).map((ins) => {
              const isHigh = ins.severity === 'HIGH';
              const isMed = ins.severity === 'MEDIUM';

              return (
                <div
                  key={ins.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isHigh
                      ? 'bg-rose-50/40 border-rose-200'
                      : isMed
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-slate-50/60 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                      isHigh
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : isMed
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {ins.severity} SEVERITY
                    </span>
                    <span className="text-xs font-bold text-slate-700 font-mono">
                      {ins.metric}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                    {ins.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {ins.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-200/60 text-xs">
                    <div className="flex items-start gap-1.5 text-slate-500">
                      <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span><strong>Evidence:</strong> {ins.evidence}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-indigo-900 bg-indigo-50/80 p-2 rounded-lg border border-indigo-100">
                      <Lightbulb className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span><strong>Recommendation:</strong> {ins.recommendation}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION: STAGE BOTTLENECKS & ANALYTICS (Shown on 'all' and 'analytics') */}
      {(activeTab === 'all' || activeTab === 'analytics') && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
                  <Flame className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  Stage Bottleneck Scoring & Duration Latency
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Stage cycle times compared against configured statutory SLA guidelines.
              </p>
            </div>

            <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-medium">
              <strong>Critical Bottleneck:</strong> {topBottleneck.stageName} (Score: {topBottleneck.bottleneckScore})
            </div>
          </div>

          <div className="space-y-3">
            {analytics.stageMetrics.map((stg) => {
              const isBottle = stg.isBottleneck;
              const ratio = stg.avgDurationHours / Math.max(1, stg.expectedDurationHours);

              return (
                <div
                  key={stg.stageName}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isBottle
                      ? 'bg-rose-50/50 border-rose-300 ring-1 ring-rose-200'
                      : 'bg-slate-50/50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                        {stg.sequence}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {stg.stageName}
                      </span>
                      {isBottle && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded-full uppercase tracking-wider">
                          Primary Bottleneck
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-500">
                        Configured SLA: <strong>{stg.expectedDurationHours}h</strong>
                      </span>
                      <span className={`font-bold ${isBottle ? 'text-rose-700' : 'text-slate-800'}`}>
                        Actual Avg: <strong>{stg.avgDurationHours}h</strong> ({ratio.toFixed(1)}x)
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        stg.overduePercentage > 50 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {stg.overduePercentage}% overdue
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isBottle ? 'bg-rose-600' : ratio > 1.2 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, (stg.avgDurationHours / (topBottleneck.avgDurationHours || 100)) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION: WORKFLOW LOOPS (Shown on 'all' and 'loops') */}
      {(activeTab === 'all' || activeTab === 'loops') && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
                  <RotateCcw className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  Workflow Loop & Backward Movement Analytics
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Quantifying files that bounce between approval stages due to repeated clarification requests.
              </p>
            </div>

            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-amber-800 bg-amber-100 rounded-full border border-amber-200">
              34 Total Loop Events Detected
            </span>
          </div>

          {/* Loop Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="text-2xl font-black text-amber-600">12 Files</div>
              <div className="text-xs text-slate-700 font-semibold mt-1">Trapped in Recursive Loops</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Files returned &gt;1 time</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="text-2xl font-black text-rose-600">+4.2 Days</div>
              <div className="text-xs text-slate-700 font-semibold mt-1">Average Added Delay per Loop</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Cycle overhead from back-and-forth</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="text-2xl font-black text-indigo-600">68%</div>
              <div className="text-xs text-slate-700 font-semibold mt-1">Loop Concentration</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Between Section Review ↔ Approval</p>
            </div>
          </div>

          {/* Loop Path Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Dominant Return Path Identified
            </h3>

            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <span>Stage 3: Section Review</span>
                  <span className="text-amber-600 flex items-center">
                    <RotateCcw className="w-4 h-4 mx-1" />
                    (23 occurrences)
                  </span>
                  <span>Stage 5: Officer Review & Approval</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Primary Friction Point
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-amber-200/80">
                  <span className="font-bold text-slate-900 block mb-1">Top Cited Clarification Reasons:</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>Ambiguity in technical equipment specification clause</li>
                    <li>Discrepancies in vendor financial quotation vs sanctioned budget</li>
                    <li>Missing statutory tax exemption certificates</li>
                  </ul>
                </div>

                <div className="p-3 bg-white rounded-lg border border-amber-200/80">
                  <span className="font-bold text-indigo-900 block mb-1">Advisory Process Fix:</span>
                  <p className="text-slate-600 leading-relaxed">
                    Implement a mandatory <strong>pre-approval checklist</strong> in Section Review before dossiers reach Officer Approval to eliminate 85% of clarification bounce-backs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: PARALLELIZATION (Shown on 'all' and 'parallel') */}
      {(activeTab === 'all' || activeTab === 'parallel') && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Zap className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  Workflow Parallelization Opportunities
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Identify independent review stages that currently run sequentially but can safely run concurrently.
              </p>
            </div>

            <button
              onClick={() => setSimulateParallel(!simulateParallel)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                simulateParallel
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>
                {simulateParallel ? 'Simulation Active: Concurrent Reviews' : 'Simulate Concurrent Processing'}
              </span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
                  Workflow Candidate: Standard Procurement Workflow
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  Technical Review + Financial Review Concurrency
                </h3>
              </div>

              <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                Potential 3.4 Days (~40%) Latency Reduction
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  !simulateParallel
                    ? 'bg-white border-slate-300 ring-2 ring-slate-400'
                    : 'bg-white/60 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-slate-800 mb-2">
                  <span>Current Sequential Process</span>
                  <span className="text-rose-600 font-bold">{baselineProcurementDays} Days Total</span>
                </div>
                <p className="text-slate-600 mb-3">
                  Section Review runs (1.1 days), file waits in queue, then Financial Review runs (1.8 days).
                </p>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="p-1.5 bg-slate-100 rounded">1. Section Review (24h)</div>
                  <div className="text-center text-slate-400">↓ (waits in transit)</div>
                  <div className="p-1.5 bg-slate-100 rounded">2. Financial Review (24h)</div>
                </div>
              </div>

              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  simulateParallel
                    ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-slate-800 mb-2">
                  <span className="text-emerald-900">Recommended Concurrent Model</span>
                  <span className="text-emerald-700 font-bold">{optimizedProcurementDays} Days Total</span>
                </div>
                <p className="text-slate-600 mb-3">
                  Both departments evaluate the dossier concurrently upon Document Verification signoff.
                </p>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="p-1.5 bg-emerald-100/70 border border-emerald-200 rounded text-emerald-900 text-center font-semibold">
                      Technical Review (Concurrent)
                    </div>
                    <div className="p-1.5 bg-emerald-100/70 border border-emerald-200 rounded text-emerald-900 text-center font-semibold">
                      Financial Review (Concurrent)
                    </div>
                  </div>
                  <div className="text-center text-emerald-600 font-sans text-xs pt-1">
                    ✓ Merges automatically into Officer Review once both sign off
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Administrative Statutory Verification:</strong> Under current government rules, technical specifications and financial quotations are independent evaluation criteria. Concurrency preserves procedural integrity while saving 816 cumulative processing hours monthly.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
