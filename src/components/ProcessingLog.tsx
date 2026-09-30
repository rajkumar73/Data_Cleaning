import React from 'react';
import { ScrollText, AlertTriangle } from 'lucide-react';
import { FileItem } from '../types/dataCleaner';

interface ProcessingLogProps {
  activeFile: FileItem | null;
}

export const ProcessingLog: React.FC<ProcessingLogProps> = ({ activeFile }) => {
  if (!activeFile) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-xs">
        <ScrollText className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Processing Audit Log</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Detailed rule execution and transformation metrics per column will appear after cleaning.
        </p>
      </div>
    );
  }

  const logs = activeFile.processingLogs || [];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              7. Processing Audit Log
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
              {activeFile.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Rule-by-rule change and validation failure accounting.
          </p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 text-center font-medium">
          No audit entries recorded yet. Run "Start Batch Cleaning" to generate transformation logs.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="py-2.5 px-3">Column</th>
                <th className="py-2.5 px-3">Rule Applied</th>
                <th className="py-2.5 px-3">Changed Cells</th>
                <th className="py-2.5 px-3">Invalid Cells</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-sans">
              {logs.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-200">
                    {log.column}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-cyan-800 dark:text-cyan-300 font-mono text-[11px] border border-slate-200 dark:border-slate-700 font-bold">
                      {log.rule}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    <span
                      className={`inline-flex items-center gap-1 font-bold ${
                        log.changedCells > 0 ? 'text-cyan-700 dark:text-cyan-400' : 'text-slate-400'
                      }`}
                    >
                      {log.changedCells.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    <span
                      className={`inline-flex items-center gap-1 font-bold ${
                        log.invalidCells > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {log.invalidCells > 0 ? (
                        <>
                          <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          {log.invalidCells.toLocaleString()}
                        </>
                      ) : (
                        '0'
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
