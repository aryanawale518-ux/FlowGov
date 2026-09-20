import React from 'react';
import {
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  GitMerge,
  ShieldCheck,
  FileCheck2,
  FileSpreadsheet,
  Clock
} from 'lucide-react';
import { UserRole } from '../types';

interface LandingPageProps {
  onEnterDemo: (role?: UserRole) => void;
  onViewFile: (fileNumber: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterDemo, onViewFile }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI-Powered Government Process Intelligence Layer</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Find the bottleneck.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
              Understand the delay.
            </span><br />
            Improve the process.
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            FlowGov is an assistive decision-support platform designed to reduce unnecessary administrative friction, identify workflow bottlenecks, explain why files are delayed, and detect repeated process loops—without replacing human decision-makers.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => onEnterDemo('ADMIN')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Interactive Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onViewFile('FG-1042')}
              className="px-5 py-3 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-400" />
              <span>Inspect Demo File #FG-1042</span>
            </button>
          </div>

          {/* Abstract Workflow Visual with Highlighted Bottleneck */}
          <div className="pt-10 max-w-4xl mx-auto">
            <div className="p-5 sm:p-6 bg-slate-850/80 rounded-2xl border border-slate-750 backdrop-blur-xs shadow-2xl text-left">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
                <span className="font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Live Administrative Workflow Stream
                </span>
                <span className="text-amber-400 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  Bottleneck Detected at Stage 4
                </span>
              </div>

              {/* Horizontal workflow steps */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Stage 1</div>
                  <div className="text-xs font-bold text-white mt-1">Application Intake</div>
                  <div className="text-[11px] text-emerald-400 mt-2 font-medium">0.8 days avg ✓</div>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Stage 2</div>
                  <div className="text-xs font-bold text-white mt-1">Doc Verification</div>
                  <div className="text-[11px] text-emerald-400 mt-2 font-medium">1.0 days avg ✓</div>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Stage 3</div>
                  <div className="text-xs font-bold text-white mt-1">Section Review</div>
                  <div className="text-[11px] text-emerald-400 mt-2 font-medium">1.1 days avg ✓</div>
                </div>

                <div className="p-3 bg-rose-950/40 rounded-xl border-2 border-rose-500/80 shadow-lg shadow-rose-950/50 relative">
                  <span className="absolute -top-2.5 right-2 px-1.5 py-0.5 bg-rose-600 text-white rounded text-[9px] font-bold uppercase tracking-wider">
                    Bottleneck
                  </span>
                  <div className="text-[10px] font-semibold text-rose-300 uppercase">Stage 4</div>
                  <div className="text-xs font-bold text-white mt-1">Officer Review</div>
                  <div className="text-[11px] text-rose-400 mt-2 font-bold">4.7 days avg (Exceeded)</div>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 col-span-2 sm:col-span-1">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Stage 5</div>
                  <div className="text-xs font-bold text-white mt-1">Final Dispatch</div>
                  <div className="text-[11px] text-emerald-400 mt-2 font-medium">0.6 days avg ✓</div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Process Intelligence Finding:</strong> Officer Review accounts for 58% of aggregate cycle latency. 34 files underwent repetitive back-and-forth returns with Section Review.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution Contrast */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
            The Fundamental Problem
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Digitizing Paperwork Is Not Enough
          </h3>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Existing government e-office systems can digitize documents and track file movements, but digitization alone does not reveal <em>why</em> a workflow is slow, <em>where</em> bottlenecks concentrate, or <em>why</em> files repeatedly move backward.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Traditional Systems */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              Traditional Government Systems
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✗</span>
                <span>Records only current location, not operational delay causation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✗</span>
                <span>Back-and-forth clarification loops remain unmeasured.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✗</span>
                <span>Incomplete dossiers enter approval queues, triggering repeated returns.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✗</span>
                <span>Requires manual audits to discover process-level bottlenecks.</span>
              </li>
            </ul>
          </div>

          {/* FlowGov Process Intelligence */}
          <div className="p-6 bg-white rounded-2xl border-2 border-blue-600 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              FlowGov Intelligence Layer
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span><strong>Bottleneck Detection:</strong> Maps stage durations and scores process latency.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span><strong>Loop Analytics:</strong> Automatically quantifies repeated clarification cycles.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span><strong>Pre-Submission AI Check:</strong> Prevents missing documents from entering the queue.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span><strong>Parallelization Advisory:</strong> Identifies stages that could run concurrently.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Simulated Prototype Metrics */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              Prototype Simulation Metrics
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-3">
              Measurable Demonstration Outcomes
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
              <div className="text-3xl sm:text-4xl font-black text-blue-400">87%</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Within Configured Timeline</div>
              <p className="text-[11px] text-slate-400 mt-1">Across simulated files</p>
            </div>

            <div className="p-5 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">23%</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Fewer Incomplete Submissions</div>
              <p className="text-[11px] text-slate-400 mt-1">Via pre-intake checklist</p>
            </div>

            <div className="p-5 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
              <div className="text-3xl sm:text-4xl font-black text-amber-400">31</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Bottleneck Cases Flagged</div>
              <p className="text-[11px] text-slate-400 mt-1">Isolated to Officer Review</p>
            </div>

            <div className="p-5 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
              <div className="text-3xl sm:text-4xl font-black text-indigo-400">12</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Workflow Loops Detected</div>
              <p className="text-[11px] text-slate-400 mt-1">Section ↔ Approval cycles</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Persona Entry Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
          Experience FlowGov in Action
        </h3>
        <p className="text-sm text-slate-600 mb-8 max-w-xl mx-auto">
          No sign-up or credentials required. Select a role below to launch the prototype with preloaded synthetic departmental workflows:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => onEnterDemo('ADMIN')}
            className="p-5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-xl text-left shadow-xs transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role 1</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">Department Head</div>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Explore bottleneck analytics, repeated loops, and natural-language queries.
            </p>
          </button>

          <button
            onClick={() => onEnterDemo('OFFICER')}
            className="p-5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-xl text-left shadow-xs transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role 2</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">Reviewing Officer</div>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Review assigned files, approve stages, or return dossiers for clarification.
            </p>
          </button>

          <button
            onClick={() => onEnterDemo('CLERK')}
            className="p-5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-xl text-left shadow-xs transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role 3</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">Clerk / Employee</div>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Initiate new files and test the AI pre-submission document checklist.
            </p>
          </button>
        </div>
      </section>
    </div>
  );
};
