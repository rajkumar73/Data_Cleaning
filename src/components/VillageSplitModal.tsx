import React, { useMemo, useState } from 'react';
import {
  Building,
  Download,
  FolderDown,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  FolderCheck,
} from 'lucide-react';
import { FileItem, VillageSplitSummary } from '../types/dataCleaner';
import {
  downloadBlob,
  downloadFilesDirectlyWithoutZip,
  splitDatasetByVillage,
} from '../utils/excelExporter';
import { saveMultipleBlobsToDirectory } from '../utils/folderStorage';

interface VillageSplitModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFile: FileItem | null;
  exportFormat: 'xlsx' | 'csv';
  outputDirectoryHandle: any | null;
  outputDirectoryName: string | null;
}

export const VillageSplitModal: React.FC<VillageSplitModalProps> = ({
  isOpen,
  onClose,
  activeFile,
  exportFormat,
  outputDirectoryHandle,
  outputDirectoryName,
}) => {
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Compute village split summaries
  const villageSummaries: VillageSplitSummary[] = useMemo(() => {
    if (!activeFile) return [];
    return splitDatasetByVillage(activeFile, exportFormat);
  }, [activeFile, exportFormat]);

  if (!isOpen || !activeFile) return null;

  const totalVillages = villageSummaries.length;
  const totalBeneficiaries = villageSummaries.reduce((acc, v) => acc + v.rowCount, 0);
  const totalGrandAmount = villageSummaries.reduce((acc, v) => acc + v.totalAmount, 0);
  const totalGrandArea = villageSummaries.reduce((acc, v) => acc + v.totalArea, 0);

  const handleDownloadSingle = (village: VillageSplitSummary) => {
    if (village.blob) {
      downloadBlob(village.blob, village.filename);
    }
  };

  const handleDownloadAll = async () => {
    setIsSavingAll(true);
    setSaveSuccessMsg(null);
    try {
      if (outputDirectoryHandle) {
        // Save directly to user's selected disk folder
        const items = villageSummaries.map((v) => ({
          filename: v.filename,
          blob: v.blob!,
        }));
        await saveMultipleBlobsToDirectory(outputDirectoryHandle, items);
        setSaveSuccessMsg(`सर्व ${totalVillages} गावनिहाय फाईल्स यशस्वीरित्या "${outputDirectoryName}" फोल्डरमध्ये सेव्ह झाल्या!`);
      } else {
        // Direct browser downloads without zip
        const items = villageSummaries.map((v) => ({
          filename: v.filename,
          blob: v.blob!,
        }));
        await downloadFilesDirectlyWithoutZip(items);
        setSaveSuccessMsg(`सर्व ${totalVillages} गावनिहाय फाईल्स डाऊनलोड सुरू झाली!`);
      }
    } catch (e: any) {
      alert(`Error saving village files: ${e.message}`);
    } finally {
      setIsSavingAll(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  गावनिहाय / साझानिहाय स्वतंत्र फाईल्स विभाजन (Village Split)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 font-mono">
                  {totalVillages} गावे
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                एकाच फाईलमधील डेटा आपोआप गावांच्या नावांनुसार स्वतंत्र फाईल्समध्ये विभागला गेला आहे.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Metric Ribbon */}
        <div className="p-3 bg-indigo-50/70 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-indigo-600 font-medium">एकूण गावे: </span>
              <strong className="text-indigo-950 font-bold">{totalVillages}</strong>
            </div>
            <div>
              <span className="text-indigo-600 font-medium">एकूण शेतकरी: </span>
              <strong className="text-indigo-950 font-bold">{totalBeneficiaries.toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-indigo-600 font-medium">एकूण क्षेत्र: </span>
              <strong className="text-indigo-950 font-bold">{totalGrandArea.toFixed(2)} हे.</strong>
            </div>
            <div>
              <span className="text-indigo-600 font-medium">एकूण रक्कम: </span>
              <strong className="text-indigo-950 font-bold">₹ {totalGrandAmount.toLocaleString()}</strong>
            </div>
          </div>

          <button
            onClick={handleDownloadAll}
            disabled={isSavingAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50"
          >
            {outputDirectoryHandle ? (
              <>
                <FolderCheck className="w-3.5 h-3.5" />
                <span>सर्व फोल्डरमध्ये सेव्ह करा ({outputDirectoryName})</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>सर्व {totalVillages} गावे डाऊनलोड करा (No ZIP)</span>
              </>
            )}
          </button>
        </div>

        {/* Success Alert */}
        {saveSuccessMsg && (
          <div className="mx-4 mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
            <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Village Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-800">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12 border-r border-slate-200">#</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 min-w-[160px]">गावाचे नाव (Village Name)</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200 w-24">एकूण लाभार्थी</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200 w-24">पात्र (बरोबर)</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200 w-24">अपूर्ण (त्रुटी)</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200 w-28">एकूण क्षेत्र (हे.)</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200 w-32">एकूण रक्कम (₹)</th>
                  <th className="py-2.5 px-3 text-center w-28">डाऊनलोड</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {villageSummaries.map((v, idx) => (
                  <tr key={v.villageName} className="hover:bg-indigo-50/40 transition">
                    <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-500 border-r border-slate-200">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{v.villageName}</span>
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-800 border-r border-slate-200">
                      {v.rowCount}
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-emerald-700 font-bold border-r border-slate-200">
                      {v.correctCount}
                    </td>
                    <td className="py-2 px-3 text-center font-mono border-r border-slate-200">
                      {v.incorrectCount > 0 ? (
                        <span className="text-red-700 font-bold bg-red-100 px-1.5 py-0.5 rounded">
                          {v.incorrectCount}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-700 border-r border-slate-200">
                      {v.totalArea > 0 ? v.totalArea.toFixed(2) : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-blue-900 border-r border-slate-200">
                      {v.totalAmount > 0 ? `₹ ${v.totalAmount.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <button
                        onClick={() => handleDownloadSingle(v)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-[11px] transition shadow-xs"
                        title={`डाऊनलोड करा: ${v.filename}`}
                      >
                        <Download className="w-3 h-3 text-indigo-600" />
                        <span>{exportFormat.toUpperCase()}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            टीप: प्रत्येक गावाची स्वतंत्र फाईल डाऊनलोड होते. कोणतीही ZIP फाईल तयार केली जात नाही.
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold"
          >
            बंद करा
          </button>
        </div>
      </div>
    </div>
  );
};
