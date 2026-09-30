import React from 'react';
import {
  Trash2,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Eye,
  ListOrdered,
  AlertTriangle,
} from 'lucide-react';
import { FileItem } from '../types/dataCleaner';
import {
  detectVillageOrBaseName,
  downloadBlob,
  generateDatasetCsvBlob,
  generateDatasetExcelBlob,
} from '../utils/excelExporter';

interface FileQueueProps {
  files: FileItem[];
  activeFileId: string | null;
  onSelectActiveFile: (fileId: string) => void;
  selectedFileIds: Set<string>;
  onToggleSelectFile: (fileId: string) => void;
  onSelectAllFiles: (selectAll: boolean) => void;
  onRemoveSelected: () => void;
  onClearAll: () => void;
  onRemoveSingle: (fileId: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export const FileQueue: React.FC<FileQueueProps> = ({
  files,
  activeFileId,
  onSelectActiveFile,
  selectedFileIds,
  onToggleSelectFile,
  onSelectAllFiles,
  onRemoveSelected,
  onClearAll,
  onRemoveSingle,
}) => {
  const allSelected = files.length > 0 && selectedFileIds.size === files.length;

  const handleDownloadFile = (e: React.MouseEvent, file: FileItem, kind: 'correct' | 'incorrect') => {
    e.stopPropagation();
    const village = detectVillageOrBaseName(file);
    const ext = file.type === 'CSV' ? 'csv' : 'xlsx';
    const filename = `${village}_${kind}.${ext}`;

    const headers = file.headers;
    const rows = kind === 'correct'
      ? (file.correctRows || file.cleanedData || file.originalData)
      : (file.incorrectRows || []);

    const vGrid = kind === 'correct'
      ? file.correctValidationGrid
      : file.incorrectValidationGrid;

    let blob: Blob;
    if (ext === 'csv') {
      blob = generateDatasetCsvBlob(headers, rows, vGrid, kind === 'incorrect');
    } else {
      blob = generateDatasetExcelBlob(headers, rows, vGrid, kind === 'correct' ? 'CorrectData' : 'IncorrectData', kind === 'incorrect');
    }

    downloadBlob(blob, filename);
  };

  if (files.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-xs">
        <ListOrdered className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-800">फाईल यादी रिकामी आहे (File Queue Empty)</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Excel (.xlsx, .xls) किंवा CSV फाईल अपलोड करा किंवा 'नमुना शेतकरी डेटा लोड करा' बटनावर क्लिक करा.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
      {/* Queue Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            2. फाईल यादी (File Queue - {files.length})
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRemoveSelected}
            disabled={selectedFileIds.size === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>निवडलेल्या फाईल्स काढा ({selectedFileIds.size})</span>
          </button>

          <button
            onClick={onClearAll}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            सर्व काढा (Clear All)
          </button>
        </div>
      </div>

      {/* Queue Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-[300px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-100 text-slate-800 font-bold border-b border-slate-200 z-10">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAllFiles(e.target.checked)}
                  className="rounded bg-white border-slate-300 text-blue-600 focus:ring-0"
                />
              </th>
              <th className="py-2.5 px-3">फाईलचे नाव (File Name)</th>
              <th className="py-2.5 px-3 w-20">प्रकार</th>
              <th className="py-2.5 px-3 w-20">आकार</th>
              <th className="py-2.5 px-3 w-20">एकूण नोंदी</th>
              <th className="py-2.5 px-3 w-40">तपासणी निकाल (Correct / Errors)</th>
              <th className="py-2.5 px-3 w-28">स्थिती</th>
              <th className="py-2.5 px-3 w-24 text-right">कृती</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {files.map((file) => {
              const isActive = file.id === activeFileId;
              const isChecked = selectedFileIds.has(file.id);
              const isCompleted = file.status === 'Completed' || (file.cleanedData && file.cleanedData.length > 0);

              const correctCount = file.correctCount ?? (file.cleanedData?.length || file.rowsCount);
              const incorrectCount = file.incorrectCount ?? 0;

              return (
                <tr
                  key={file.id}
                  onClick={() => onSelectActiveFile(file.id)}
                  className={`cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-blue-50/70 border-l-4 border-l-blue-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td
                    className="py-2.5 px-3 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleSelectFile(file.id)}
                      className="rounded bg-white border-slate-300 text-blue-600 focus:ring-0"
                    />
                  </td>

                  <td className="py-2.5 px-3 font-sans flex items-center gap-2">
                    <FileSpreadsheet
                      className={`w-4 h-4 shrink-0 ${
                        file.type === 'CSV' ? 'text-emerald-600' : 'text-blue-600'
                      }`}
                    />
                    <div className="truncate max-w-xs sm:max-w-md font-sans">
                      <span className="font-semibold text-slate-900" title={file.name}>
                        {file.name}
                      </span>
                    </div>
                    {isActive && (
                      <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                        निवडलेली
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        file.type === 'CSV'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}
                    >
                      {file.type}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-slate-600">{formatBytes(file.size)}</td>

                  <td className="py-2.5 px-3 text-slate-900 font-bold">
                    {file.rowsCount.toLocaleString()}
                  </td>

                  {/* Correct / Incorrect Summary Badges */}
                  <td className="py-2.5 px-3">
                    {isCompleted ? (
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span
                          className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1"
                          title="100% बरोबर नोंदी"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {correctCount}
                        </span>
                        {incorrectCount > 0 ? (
                          <span
                            className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold border border-rose-200 flex items-center gap-1"
                            title="त्रुटी असलेल्या नोंदी"
                          >
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            {incorrectCount}
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-bold">0 त्रुटी ✓</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 font-sans">
                    {file.status === 'Ready' && (
                      <span className="inline-flex items-center gap-1 text-slate-600 text-[11px] font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> तयार
                      </span>
                    )}
                    {file.status === 'Processing' && (
                      <span className="inline-flex items-center gap-1 text-blue-700 text-[11px] font-bold animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> तपासत आहे...
                      </span>
                    )}
                    {file.status === 'Completed' && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> पूर्ण झाले
                      </span>
                    )}
                    {file.status === 'Failed' && (
                      <span className="inline-flex items-center gap-1 text-rose-700 text-[11px] font-bold" title={file.errorMessage}>
                        <AlertCircle className="w-3.5 h-3.5" /> अयशस्वी
                      </span>
                    )}
                    {file.status === 'Paused' && (
                      <span className="inline-flex items-center gap-1 text-amber-700 text-[11px] font-bold">
                        थांबवले
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectActiveFile(file.id)}
                        className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-700"
                        title="डेटा पहा व दुरुस्त करा (Preview & Edit)"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {isCompleted && (
                        <>
                          <button
                            onClick={(e) => handleDownloadFile(e, file, 'correct')}
                            className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-700"
                            title="Download Correct File (_correct)"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => onRemoveSingle(file.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600"
                        title="यादीतून काढा (Remove file)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
