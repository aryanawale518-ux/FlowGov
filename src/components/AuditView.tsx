import React, { useState } from 'react';
import { AuditLog } from '../types';
import { History, Search, Filter, ArrowRight, ShieldCheck, User } from 'lucide-react';

interface AuditViewProps {
  logs: AuditLog[];
  onSelectFile?: (fileNumber: string) => void;
}

export const AuditView: React.FC<AuditViewProps> = ({ logs, onSelectFile }) => {
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');

  const filteredLogs = logs.filter(log => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        (log.fileNumber && log.fileNumber.toLowerCase().includes(q)) ||
        log.description.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedAction !== 'ALL' && log.action !== selectedAction) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            <History className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Government Audit Trail & Compliance Log
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete, tamper-evident chronological ledger of all file touches, transitions, and administrative approvals.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by file #, user name, action..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <div className="sm:w-64">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Recorded Actions</option>
            <option value="STAGE_APPROVED">Stage Approved</option>
            <option value="STAGE_RETURNED">Stage Returned (Loop)</option>
            <option value="FILE_CREATED">File Initiated</option>
            <option value="FILE_SUBMITTED">File Submitted</option>
            <option value="DOCUMENT_UPLOADED">Document Attached</option>
            <option value="COMPLETENESS_CHECK">Completeness Check</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 uppercase tracking-wider">
            Ledger Entries ({filteredLogs.length})
          </span>
          <span className="text-slate-400">Chronological sequence</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No matching ledger records found.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        log.action.includes('RETURN')
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : log.action.includes('APPROVE')
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {log.action.replace(/_/g, ' ')}
                    </span>

                    {log.fileNumber && (
                      <button
                        onClick={() => onSelectFile && onSelectFile(log.fileNumber!)}
                        className="font-bold text-blue-600 hover:underline"
                      >
                        File #{log.fileNumber}
                      </button>
                    )}
                  </div>

                  <p className="text-slate-800 text-xs leading-relaxed font-medium">
                    {log.description}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {log.userName} ({log.userRole})
                    </span>
                    <span>•</span>
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {log.fileNumber && onSelectFile && (
                  <button
                    onClick={() => onSelectFile(log.fileNumber!)}
                    className="self-start text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>View File</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
