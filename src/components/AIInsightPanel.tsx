import React, { useState } from 'react';
import { AiFileExplanation, GovernmentFile } from '../types';
import { Sparkles, HelpCircle, CheckCircle, ArrowRight, RefreshCw, Info } from 'lucide-react';

interface AIInsightPanelProps {
  file: GovernmentFile;
  initialExplanation?: AiFileExplanation;
}

export const AIInsightPanel: React.FC<AIInsightPanelProps> = ({ file, initialExplanation }) => {
  const [explanation, setExplanation] = useState<AiFileExplanation | undefined>(initialExplanation);
  const [loading, setLoading] = useState(false);

  const fetchExplanation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/explain-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: file.id })
      });
      if (res.ok) {
        const data = await res.json();
        setExplanation(data);
      }
    } catch (err) {
      console.error('Error fetching file explanation:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!explanation) {
      fetchExplanation();
    }
  }, [file.id]);

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-xl p-5 border border-slate-800 shadow-md">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">
              AI Process Intelligence & Delay Diagnosis
            </h3>
            <p className="text-xs text-slate-400">
              Evidence-based operational explanation for File #{file.fileNumber}
            </p>
          </div>
        </div>

        <button
          onClick={fetchExplanation}
          disabled={loading}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
          title="Re-analyze file workflow status"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      {loading && !explanation ? (
        <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
          <span>Synthesizing workflow timeline & audit trail data...</span>
        </div>
      ) : explanation ? (
        <div className="mt-4 space-y-4">
          {/* Status highlight strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
            <div>
              <span className="text-slate-400 block">Current Stage</span>
              <span className="font-semibold text-white">{explanation.currentStage}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Elapsed vs Expected</span>
              <span
                className={`font-semibold ${
                  explanation.isOverdue ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {explanation.timeElapsedFormatted} / {explanation.expectedTimeFormatted}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Status Assessment</span>
              <span
                className={`font-semibold inline-flex items-center gap-1 ${
                  explanation.isOverdue ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    explanation.isOverdue ? 'bg-rose-400' : 'bg-emerald-400'
                  }`}
                ></span>
                {explanation.isOverdue
                  ? 'Exceeded Configured Timeline'
                  : 'Within Expected Limits'}
              </span>
            </div>
          </div>

          {/* Potential Reasons */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              Observed Operational Factors
            </h4>
            <ul className="space-y-2 text-xs text-slate-200">
              {explanation.potentialReasons.map((reason, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40"
                >
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Suggested Next Action */}
          <div className="p-3.5 rounded-lg bg-indigo-950/40 border border-indigo-800/50">
            <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
              Suggested Next Action
            </h4>
            <p className="text-xs text-indigo-100 font-medium leading-relaxed">
              {explanation.suggestedNextAction}
            </p>
          </div>

          {/* Confidence & Advisory Note */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              Confidence Indicator: <strong className="text-slate-200">{explanation.confidence}</strong>
            </span>
            <span className="flex items-center gap-1 text-slate-400 italic">
              <Info className="w-3 h-3 text-slate-400" />
              Assistive decision support only. Does not alter administrative rules.
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
};
