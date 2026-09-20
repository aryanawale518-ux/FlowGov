import React, { useState, useMemo } from 'react';
import { GovernmentFile, Department } from '../types';
import { StatusBadge, PriorityBadge, SlaBadge } from './StatusBadge';
import { Search, Filter, FolderOpen, ArrowUpDown, ChevronRight, RotateCcw } from 'lucide-react';

interface FilesViewProps {
  files: GovernmentFile[];
  departments: Department[];
  onSelectFile: (fileNumber: string) => void;
  onOpenCreateFile: () => void;
  initialFilter?: string;
}

export const FilesView: React.FC<FilesViewProps> = ({
  files,
  departments,
  onSelectFile,
  onOpenCreateFile,
  initialFilter = 'ALL'
}) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState(initialFilter);
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | 'OVERDUE' | 'LOOPS' | 'COMPLETED'>('ALL');

  const filteredFiles = useMemo(() => {
    return files.filter(f => {
      // Search matching
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          f.fileNumber.toLowerCase().includes(q) ||
          f.title.toLowerCase().includes(q) ||
          f.departmentName.toLowerCase().includes(q) ||
          f.currentStageName.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Department filter
      if (selectedDept !== 'ALL' && f.departmentId !== selectedDept && f.departmentName !== selectedDept) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'OVERDUE') {
          if (f.status !== 'OVERDUE' && f.slaStatus !== 'EXCEEDED_LIMIT') return false;
        } else if (f.status !== selectedStatus) {
          return false;
        }
      }

      // Priority filter
      if (selectedPriority !== 'ALL' && f.priority !== selectedPriority) {
        return false;
      }

      // Quick tab filter
      if (activeTab === 'OVERDUE' && f.status !== 'OVERDUE' && f.slaStatus !== 'EXCEEDED_LIMIT') {
        return false;
      }
      if (activeTab === 'LOOPS' && f.loopsCount === 0) {
        return false;
      }
      if (activeTab === 'COMPLETED' && f.status !== 'COMPLETED') {
        return false;
      }

      return true;
    });
  }, [files, search, selectedDept, selectedStatus, selectedPriority, activeTab]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Administrative Files & Dossier Repository
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse active departmental files, track processing cycle times, and inspect stage-by-stage progression.
          </p>
        </div>

        <button
          onClick={onOpenCreateFile}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>Initiate New Dossier</span>
        </button>
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-1 border-b border-slate-200 text-xs">
        <button
          onClick={() => {
            setActiveTab('ALL');
            setSelectedStatus('ALL');
          }}
          className={`px-3 py-2 rounded-t-lg font-semibold transition-colors border-b-2 -mb-px ${
            activeTab === 'ALL'
              ? 'text-blue-600 border-blue-600 bg-blue-50/40'
              : 'text-slate-600 border-transparent hover:text-slate-900'
          }`}
        >
          All Dossiers ({files.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('OVERDUE');
            setSelectedStatus('ALL');
          }}
          className={`px-3 py-2 rounded-t-lg font-semibold transition-colors border-b-2 -mb-px ${
            activeTab === 'OVERDUE'
              ? 'text-rose-600 border-rose-600 bg-rose-50/40'
              : 'text-slate-600 border-transparent hover:text-slate-900'
          }`}
        >
          Exceeded Timeline ({files.filter(f => f.status === 'OVERDUE' || f.slaStatus === 'EXCEEDED_LIMIT').length})
        </button>

        <button
          onClick={() => {
            setActiveTab('LOOPS');
            setSelectedStatus('ALL');
          }}
          className={`px-3 py-2 rounded-t-lg font-semibold transition-colors border-b-2 -mb-px ${
            activeTab === 'LOOPS'
              ? 'text-amber-600 border-amber-600 bg-amber-50/40'
              : 'text-slate-600 border-transparent hover:text-slate-900'
          }`}
        >
          Repeated Loops ({files.filter(f => f.loopsCount > 0).length})
        </button>

        <button
          onClick={() => {
            setActiveTab('COMPLETED');
            setSelectedStatus('ALL');
          }}
          className={`px-3 py-2 rounded-t-lg font-semibold transition-colors border-b-2 -mb-px ${
            activeTab === 'COMPLETED'
              ? 'text-emerald-600 border-emerald-600 bg-emerald-50/40'
              : 'text-slate-600 border-transparent hover:text-slate-900'
          }`}
        >
          Completed ({files.filter(f => f.status === 'COMPLETED').length})
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by file #, title, stage..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Department Select */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Select */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="OVERDUE">Overdue (Exceeded Timeline)</option>
              <option value="RETURNED">Returned (Clarification)</option>
              <option value="COMPLETED">Completed</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          {/* Priority Select */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">File # & Loops</th>
                <th className="py-3 px-4">Dossier Title & Department</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4">Timeline Performance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No matching files found</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting search keywords or status filters.</p>
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr
                    key={file.id}
                    onClick={() => onSelectFile(file.fileNumber)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-blue-600 whitespace-nowrap">
                      <span>{file.fileNumber}</span>
                      {file.loopsCount > 0 && (
                        <span
                          className="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-semibold"
                          title="File moved backward for clarification"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          {file.loopsCount} loop
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-xs sm:max-w-md">
                      <div className="font-semibold text-slate-900 line-clamp-1">{file.title}</div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-2 mt-0.5">
                        <span>{file.departmentName}</span>
                        <span>•</span>
                        <span>{file.workflowTemplateName}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                      {file.currentStageName}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <SlaBadge slaStatus={file.slaStatus} />
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Elapsed: {file.totalDurationHours}h / Expected: {file.expectedTotalDurationHours}h
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={file.status} />
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <PriorityBadge priority={file.priority} />
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFile(file.fileNumber);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        <span>Open</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer row counter */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Showing {filteredFiles.length} of {files.length} recorded files</span>
          <span>Prototype Synthetic Dataset</span>
        </div>
      </div>
    </div>
  );
};
