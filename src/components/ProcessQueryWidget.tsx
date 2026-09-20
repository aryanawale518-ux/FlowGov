import React, { useState } from 'react';
import { Sparkles, Send, HelpCircle, Loader2, Database, AlertCircle } from 'lucide-react';

interface ProcessQueryWidgetProps {
  onStageSelect?: (stageName: string) => void;
}

const PRESET_QUERIES = [
  'Why are procurement files taking longer this month?',
  'Which workflow stage has the highest average processing time?',
  'How many files are currently overdue and where?',
  'What recurring issues are causing file returns between Section Review and Approval?'
];

export const ProcessQueryWidget: React.FC<ProcessQueryWidgetProps> = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [evidenceData, setEvidenceData] = useState<Record<string, unknown> | null>(null);

  const handleSubmit = async (textToSubmit?: string) => {
    const q = textToSubmit || query;
    if (!q.trim() || loading) return;

    setLoading(true);
    setResponse(null);
    setEvidenceData(null);

    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      });
      if (res.ok) {
        const data = await res.json();
        setResponse(data.answer);
        setEvidenceData(data.evidenceData);
      } else {
        setResponse('Unable to retrieve process intelligence. Please verify database connection.');
      }
    } catch (err) {
      console.error('Error running process query:', err);
      setResponse('An error occurred while querying process analytics. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Process Intelligence Natural Language Query
            </h3>
            <p className="text-xs text-slate-500">
              Ask questions directly grounded in active workflow logs, stage timings, and return loops
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-full border border-indigo-200">
          <Database className="w-3 h-3" />
          Data-Grounded Query
        </span>
      </div>

      {/* Preset Query Chips */}
      <div className="mt-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          Recommended Analytical Questions
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(preset);
                handleSubmit(preset);
              }}
              className="px-3 py-1.5 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors text-left font-medium"
            >
              "{preset}"
            </button>
          ))}
        </div>
      </div>

      {/* Query Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="mt-4 flex gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a workflow question (e.g., 'What is causing delays in Officer Review?')..."
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-lg shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>Query</span>
        </button>
      </form>

      {/* Response Display */}
      {loading && (
        <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center gap-2 text-xs text-slate-600">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Analyzing departmental stage logs and synthesizing evidence-based answer...</span>
        </div>
      )}

      {response && !loading && (
        <div className="mt-4 p-4 rounded-lg bg-slate-900 text-slate-100 border border-slate-800 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Evidence-Backed Response
            </span>
            <span className="text-[11px] text-slate-400">
              Generated from real records
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
            {response}
          </p>

          {evidenceData && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-4 text-[11px] text-slate-400">
              {Object.entries(evidenceData).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1">
                  <span className="capitalize text-slate-400 font-medium">
                    {k.replace(/([A-Z])/g, ' $1')}:
                  </span>
                  <strong className="text-slate-200">{String(v)}</strong>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2.5 flex items-center gap-1 text-[11px] text-slate-400 italic">
            <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />
            Advisory administrative analysis. Metrics reflect synthetic prototype dataset.
          </div>
        </div>
      )}
    </div>
  );
};
