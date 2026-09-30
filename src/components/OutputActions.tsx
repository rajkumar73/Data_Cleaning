import React, { useMemo, useState } from 'react';
import {
  Download,
  FolderOpen,
  CheckCircle2,
  FileSpreadsheet,
  AlertTriangle,
  Layers,
  ArrowDownToLine,
  Check,
  Edit2,
  Calculator,
  ListOrdered,
} from 'lucide-react';
import { FileItem } from '../types/dataCleaner';
import {
  computeDatasetTotals,
  detectVillageOrBaseName,
} from '../utils/excelExporter';

interface OutputActionsProps {
  files: FileItem[];
  activeFile: FileItem | null;
  onDownloadCorrect: (customBaseName?: string) => void;
  onDownloadIncorrect: (customBaseName?: string) => void;
  onDownloadBoth: (customBaseName?: string) => void;
  onDownloadAllCompleted: () => void;
  outputDirectoryName: string;
  onSelectOutputFolder: () => void;
  onClearOutputFolder?: () => void;
  exportFormat: 'xlsx' | 'csv';
  onToggleExportFormat: (format: 'xlsx' | 'csv') => void;
}

export const OutputActions: React.FC<OutputActionsProps> = ({
  files,
  activeFile,
  onDownloadCorrect,
  onDownloadIncorrect,
  onDownloadBoth,
  onDownloadAllCompleted,
  outputDirectoryName,
  onSelectOutputFolder,
  onClearOutputFolder,
  exportFormat,
  onToggleExportFormat,
}) => {
  const isCurrentCompleted = activeFile?.status === 'Completed' || (activeFile && activeFile.cleanedData && activeFile.cleanedData.length > 0);
  const completedFiles = files.filter(
    (f) => f.status === 'Completed' || (f.cleanedData && f.cleanedData.length > 0)
  );

  const detectedVillage = activeFile ? detectVillageOrBaseName(activeFile) : 'Data';
  const [customName, setCustomName] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState(false);

  const effectiveBaseName = customName.trim() ? customName.trim() : detectedVillage;

  const correctCount = activeFile?.correctCount ?? (activeFile?.cleanedData?.length || activeFile?.originalData.length || 0);
  const incorrectCount = activeFile?.incorrectCount ?? 0;

  const correctFileName = activeFile
    ? `${effectiveBaseName}_correct.${exportFormat}`
    : `data_correct.${exportFormat}`;
  const incorrectFileName = activeFile
    ? `${effectiveBaseName}_incorrect.${exportFormat}`
    : `data_incorrect.${exportFormat}`;

  // Live computed totals for Area and Amount in both datasets
  const correctTotals = useMemo(() => {
    if (!activeFile) return { totalArea: 0, totalAmount: 0 };
    const rows = activeFile.correctRows || activeFile.cleanedData || activeFile.originalData;
    return computeDatasetTotals(activeFile.headers, rows);
  }, [activeFile]);

  const incorrectTotals = useMemo(() => {
    if (!activeFile || !activeFile.incorrectRows) return { totalArea: 0, totalAmount: 0 };
    return computeDatasetTotals(activeFile.headers, activeFile.incorrectRows);
  }, [activeFile]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              8. Output & Export (स्वतंत्र फाईल्स • बेरीज • चढता अनुक्रमांक)
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            1. <strong>Correct File:</strong> फक्त 100% बरोबर डेटा (रिकामा नसलेला) | 2. <strong>Incorrect File:</strong> त्रुटी/रिक्त असलेला डेटा (Zip नको - Direct Download)
          </p>
        </div>

        {/* Format Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">फॉरमॅट:</span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => onToggleExportFormat('xlsx')}
              className={`px-3 py-1 rounded-md font-bold transition ${
                exportFormat === 'xlsx'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Excel (.xlsx)
            </button>
            <button
              onClick={() => onToggleExportFormat('csv')}
              className={`px-3 py-1 rounded-md font-bold transition ${
                exportFormat === 'csv'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              CSV (.csv)
            </button>
          </div>
        </div>
      </div>

      {/* Village / Base Name Configuration Box */}
      {activeFile && (
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">
              गावाचे / फाईलचे नाव (Prefix):
            </span>
            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customName || detectedVillage}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="गावाचे नाव प्रविष्ट करा..."
                  className="px-2 py-1 text-xs font-mono font-bold bg-white border border-blue-400 rounded-lg text-slate-900 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => setIsEditingName(false)}
                  className="p-1 rounded bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                  title="सेव्ह करा"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-blue-300 font-mono font-bold text-xs text-blue-900">
                  {effectiveBaseName}
                </span>
                <button
                  onClick={() => {
                    setCustomName(effectiveBaseName);
                    setIsEditingName(true);
                  }}
                  className="p-1 rounded text-blue-700 hover:text-blue-900 hover:bg-blue-100 transition"
                  title="नाव बदला (Edit village/file name)"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">तयार होणाऱ्या फाईल्स:</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {correctFileName}
            </span>
            <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              {incorrectFileName}
            </span>
          </div>
        </div>
      )}

      {/* Main Download Action Buttons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* 1. Correct File Download */}
        <div className="p-4 rounded-xl border border-emerald-300 bg-gradient-to-b from-emerald-50/50 to-white flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                1. Correct Data
              </span>
              <span className="text-xs font-mono font-bold text-emerald-800">
                {correctCount.toLocaleString()} नोंदी
              </span>
            </div>
            <h3 className="text-xs font-bold text-slate-800 mt-2">
              फक्त १००% बरोबर डेटा (रिकामा नसलेला)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono truncate" title={correctFileName}>
              {correctFileName}
            </p>

            {/* Area & Amount Totals Summary */}
            <div className="mt-2.5 p-2 bg-emerald-100/50 rounded-lg border border-emerald-200 text-[11px] space-y-1 font-mono text-emerald-950">
              <div className="flex justify-between">
                <span className="font-bold flex items-center gap-1">
                  <Calculator className="w-3 h-3 text-emerald-700" /> एकूण क्षेत्र:
                </span>
                <span className="font-bold">{correctTotals.totalArea.toFixed(2)} हेक्टर</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold flex items-center gap-1">
                  <Calculator className="w-3 h-3 text-emerald-700" /> एकूण रक्कम:
                </span>
                <span className="font-bold">₹ {correctTotals.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-[10px] text-emerald-700 pt-0.5 border-t border-emerald-200/60 flex items-center gap-1">
                <ListOrdered className="w-3 h-3" />
                <span>अनुक्रमांक १ ते {correctCount} चढत्या क्रमाने + शेवटी एकूण बेरीज</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onDownloadCorrect(effectiveBaseName)}
            disabled={!isCurrentCompleted || correctCount === 0}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Download Correct File</span>
          </button>
        </div>

        {/* 2. Incorrect File Download */}
        <div className="p-4 rounded-xl border border-rose-300 bg-gradient-to-b from-rose-50/50 to-white flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                2. Incorrect Data
              </span>
              <span className="text-xs font-mono font-bold text-rose-800">
                {incorrectCount.toLocaleString()} त्रुटी / रिक्त
              </span>
            </div>
            <h3 className="text-xs font-bold text-slate-800 mt-2">
              त्रुटी किंवा रिकामा डाटा (तपासणीसाठी)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono truncate" title={incorrectFileName}>
              {incorrectFileName}
            </p>

            {/* Area & Amount Totals Summary */}
            <div className="mt-2.5 p-2 bg-rose-100/50 rounded-lg border border-rose-200 text-[11px] space-y-1 font-mono text-rose-950">
              <div className="flex justify-between">
                <span className="font-bold flex items-center gap-1">
                  <Calculator className="w-3 h-3 text-rose-700" /> एकूण क्षेत्र:
                </span>
                <span className="font-bold">{incorrectTotals.totalArea.toFixed(2)} हेक्टर</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold flex items-center gap-1">
                  <Calculator className="w-3 h-3 text-rose-700" /> एकूण रक्कम:
                </span>
                <span className="font-bold">₹ {incorrectTotals.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-[10px] text-rose-700 pt-0.5 border-t border-rose-200/60 flex items-center gap-1">
                <ListOrdered className="w-3 h-3" />
                <span>त्रुटी स्तंभ जोडलेला + शेवटी एकूण बेरीज</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onDownloadIncorrect(effectiveBaseName)}
            disabled={!isCurrentCompleted || incorrectCount === 0}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold shadow-xs transition active:scale-[0.98] ${
              incorrectCount === 0
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>
              {incorrectCount === 0
                ? '0 त्रुटी (सर्व डाटा बरोबर आहे)'
                : 'Download Incorrect File'}
            </span>
          </button>
        </div>

        {/* 3. Download Both Files (Directly without ZIP!) */}
        <div className="p-4 rounded-xl border border-blue-300 bg-gradient-to-b from-blue-50/50 to-white flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                दोन्ही फाईल्स
              </span>
              <span className="text-xs font-mono font-semibold text-slate-500">
                Zip नको (Direct Download)
              </span>
            </div>
            <h3 className="text-xs font-bold text-slate-800 mt-2">
              दोन्ही फाईल्स स्वतंत्र डाऊनलोड
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              _correct आणि _incorrect फाईल्स स्वतंत्रपणे एकापाठोपाठ थेट डाऊनलोड होतील
            </p>

            <div className="mt-2.5 p-2 bg-blue-50 rounded-lg border border-blue-200 text-[11px] space-y-1 text-blue-950 font-medium">
              <div className="flex items-center gap-1 text-emerald-800 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>१. {effectiveBaseName}_correct.{exportFormat}</span>
              </div>
              <div className="flex items-center gap-1 text-rose-800 font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>२. {effectiveBaseName}_incorrect.{exportFormat}</span>
              </div>
              <div className="text-[10px] text-slate-600 pt-0.5 border-t border-blue-200/60">
                दोन्ही फाईल्समध्ये शेवटी क्षेत्र व रकमेची बेरीज आपोआप समाविष्ट असेल.
              </div>
            </div>
          </div>

          <button
            onClick={() => onDownloadBoth(effectiveBaseName)}
            disabled={!isCurrentCompleted}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Download Both (स्वतंत्र फाईल्स)</span>
          </button>
        </div>
      </div>

      {/* Batch Export & Folder Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          {completedFiles.length > 1 && (
            <button
              onClick={onDownloadAllCompleted}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>
                सर्व पूर्ण झालेल्या फाईल्स डाऊनलोड करा ({completedFiles.length} फाईल्स - Direct Download)
              </span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {outputDirectoryName ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 font-medium">कायमस्वरूपी सेव्ह फोल्डर:</span>
                <span className="font-mono text-emerald-900 font-bold">{outputDirectoryName}</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-semibold">
                  (वारंवार निवडण्याची गरज नाही ✓)
                </span>
              </div>
              <button
                onClick={onSelectOutputFolder}
                className="px-2 py-0.5 rounded-md bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition ml-1"
                title="दुसरे फोल्डर निवडा"
              >
                बदला
              </button>
              {onClearOutputFolder && (
                <button
                  onClick={onClearOutputFolder}
                  className="px-2 py-0.5 rounded-md bg-white border border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-bold transition"
                  title="सेव्ह केलेले फोल्डर काढून टाका"
                >
                  काढा
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onSelectOutputFolder}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs transition shadow-xs"
              title="वारंवार फोल्डर न निवडण्यासाठी कायमस्वरूपी आउटपुट फोल्डर सेट करा"
            >
              <FolderOpen className="w-4 h-4 text-blue-600" />
              <span>कायमस्वरूपी आउटपुट फोल्डर सेट करा (Set Default Folder)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
