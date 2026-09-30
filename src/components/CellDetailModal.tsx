import React from 'react';
import { AlertCircle, X, ShieldAlert } from 'lucide-react';

interface CellDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  detail: {
    column: string;
    rowIndex: number;
    value: any;
    reason?: string;
    originalValue?: any;
    cleanedValue?: any;
  } | null;
}

export const CellDetailModal: React.FC<CellDetailModalProps> = ({
  isOpen,
  onClose,
  detail,
}) => {
  if (!isOpen || !detail) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900/60 shadow-2xl flex flex-col text-slate-900 dark:text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-500/20 border border-rose-300 dark:border-rose-500/40 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-950 dark:text-white">Validation Error Inspector</h3>
              <p className="text-[11px] text-rose-700 dark:text-rose-300 font-semibold">
                Row #{detail.rowIndex} • Column: {detail.column}
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

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-600 dark:text-slate-400 font-bold block">Column:</span>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-cyan-800 dark:text-cyan-400 font-bold">
              {detail.column}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-600 dark:text-slate-400 font-bold block">Cell Value:</span>
            <div className="p-2.5 rounded-lg bg-rose-50/70 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 font-mono text-rose-800 dark:text-rose-300 font-bold break-all">
              {detail.value === '' || detail.value === null || detail.value === undefined
                ? '<BLANK / EMPTY>'
                : String(detail.value)}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-600 dark:text-slate-400 font-bold block">Status:</span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700/80 text-rose-900 dark:text-rose-300 font-bold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Invalid Format</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-600 dark:text-slate-400 font-bold block">Validation Reason:</span>
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200 leading-relaxed font-medium">
              {detail.reason || 'Failed column validation criteria.'}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            ℹ️ <strong>Safe Preservation Policy:</strong> To protect historical records, invalid values are never deleted or corrupted. The original value is preserved and highlighted in the exported file so officers can review it manually.
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
