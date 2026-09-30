import React, { useState } from 'react';
import { History, X, Search, ArrowRight, Download } from 'lucide-react';
import { ChangedCellRecord } from '../types/dataCleaner';

interface ChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  changes: ChangedCellRecord[];
  fileName: string;
}

export const ChangesModal: React.FC<ChangesModalProps> = ({
  isOpen,
  onClose,
  changes,
  fileName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [columnFilter, setColumnFilter] = useState('');

  if (!isOpen) return null;

  const columns = Array.from(new Set(changes.map((c) => c.columnName)));

  const filtered = changes.filter((c) => {
    const matchesCol = !columnFilter || c.columnName === columnFilter;
    const matchesSearch =
      !searchTerm ||
      String(c.originalValue).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(c.cleanedValue).toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.columnName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCol && matchesSearch;
  });

  const handleExportCsv = () => {
    const header = ['Row', 'Column', 'Original Value', 'Cleaned Value', 'Reason'];
    const rows = filtered.map((c) => [
      c.rowIndex,
      c.columnName,
      `"${String(c.originalValue).replace(/"/g, '""')}"`,
      `"${String(c.cleanedValue).replace(/"/g, '""')}"`,
      `"${c.reason || 'Cleaned'}"`,
    ]);
    const csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_changes_audit.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-4xl max-h-[85vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col text-slate-900 dark:text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/20 flex items-center justify-center">
              <History className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Detailed Changes Audit Log ({changes.length.toLocaleString()})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audit trail of modified cells for <span className="font-mono text-cyan-700 dark:text-cyan-300 font-bold">{fileName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search changed values..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={columnFilter}
              onChange={(e) => setColumnFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-200 text-xs font-medium"
            >
              <option value="">All Columns ({columns.length})</option>
              {columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold"
          >
            <Download className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Export Changes CSV</span>
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2.5 px-3 w-14">Row</th>
                  <th className="py-2.5 px-3">Column</th>
                  <th className="py-2.5 px-3">Original Value</th>
                  <th className="py-2.5 px-3"></th>
                  <th className="py-2.5 px-3">Cleaned Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-sans">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400 font-medium">
                      No changed cells match current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-mono font-bold text-slate-600 dark:text-slate-400">
                        #{item.rowIndex}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-200">
                        {item.columnName}
                      </td>
                      <td className="py-2 px-3 font-mono text-rose-800 dark:text-rose-300/90 bg-rose-50 dark:bg-rose-950/20 max-w-[200px] truncate" title={String(item.originalValue)}>
                        {item.originalValue === '' ? '<EMPTY>' : String(item.originalValue)}
                      </td>
                      <td className="py-2 px-2 text-slate-400 text-center">
                        <ArrowRight className="w-3 h-3 text-slate-500 inline" />
                      </td>
                      <td className="py-2 px-3 font-mono text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/20 max-w-[200px] truncate" title={String(item.cleanedValue)}>
                        {String(item.cleanedValue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <span className="font-medium">
            Showing {filtered.length.toLocaleString()} of {changes.length.toLocaleString()} modified cells
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
