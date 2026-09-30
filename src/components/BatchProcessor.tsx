import React from 'react';
import {
  Play,
  Pause,
  Square,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Zap,
} from 'lucide-react';
import { FileItem } from '../types/dataCleaner';

interface BatchProcessorProps {
  files: FileItem[];
  isProcessing: boolean;
  isPaused: boolean;
  currentProcessingIndex: number;
  onStartProcessing: () => void;
  onPauseProcessing: () => void;
  onResumeProcessing: () => void;
  onCancelProcessing: () => void;
}

export const BatchProcessor: React.FC<BatchProcessorProps> = ({
  files,
  isProcessing,
  isPaused,
  currentProcessingIndex,
  onStartProcessing,
  onPauseProcessing,
  onResumeProcessing,
  onCancelProcessing,
}) => {
  const totalFiles = files.length;
  const completedCount = files.filter((f) => f.status === 'Completed').length;
  const failedCount = files.filter((f) => f.status === 'Failed').length;
  const overallPercentage = totalFiles > 0 ? Math.round((completedCount / totalFiles) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Controls & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              4. Batch Processing Engine
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Process each queued file independently with auto-isolation on errors.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!isProcessing ? (
            <button
              onClick={onStartProcessing}
              disabled={totalFiles === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Batch Cleaning</span>
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={onResumeProcessing}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  onClick={onPauseProcessing}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-amber-700 dark:text-amber-300 text-xs font-bold transition"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </button>
              )}

              <button
                onClick={onCancelProcessing}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/80 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs font-bold transition"
              >
                <Square className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Overall Progress Meter */}
      <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-300">
            {isProcessing
              ? `Processing File ${currentProcessingIndex + 1} of ${totalFiles}`
              : totalFiles > 0 && completedCount === totalFiles
              ? 'Batch Cleaning Completed Successfully!'
              : `Ready to process ${totalFiles} file(s)`}
          </span>
          <span className="font-mono text-cyan-700 dark:text-cyan-400 font-bold">
            {overallPercentage}% ({completedCount}/{totalFiles} Completed)
          </span>
        </div>

        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${overallPercentage}%` }}
          />
        </div>

        {failedCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 pt-1 font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{failedCount} file(s) failed or encountered errors. Other files continued processing normally.</span>
          </div>
        )}
      </div>

      {/* Multi-file batch live cards */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
          {files.map((file, idx) => (
            <div
              key={file.id}
              className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 font-mono ${
                file.status === 'Processing'
                  ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-300 dark:border-cyan-500/80 text-cyan-950 dark:text-cyan-200 font-bold animate-pulse'
                  : file.status === 'Completed'
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                  : file.status === 'Failed'
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300'
                  : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">#{idx + 1}</span>
                <span className="truncate font-sans font-medium text-slate-900 dark:text-slate-100" title={file.name}>
                  {file.name}
                </span>
              </div>

              <div className="shrink-0 flex items-center gap-1 font-sans">
                {file.status === 'Ready' && (
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Waiting
                  </span>
                )}
                {file.status === 'Processing' && (
                  <span className="text-cyan-700 dark:text-cyan-400 text-[11px] font-bold flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> {file.progress}%
                  </span>
                )}
                {file.status === 'Completed' && (
                  <span className="text-emerald-700 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Done
                  </span>
                )}
                {file.status === 'Failed' && (
                  <span className="text-rose-700 dark:text-rose-400 text-[11px] font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Failed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
