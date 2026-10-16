import React, { useMemo, useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  AlertTriangle,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { FileItem } from '../types/dataCleaner';
import {
  detectVillageOrBaseName,
  downloadBlob,
  generateGramPanchayatNoticeBlob,
} from '../utils/excelExporter';

interface NoticeBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFile: FileItem | null;
}

export const NoticeBoardModal: React.FC<NoticeBoardModalProps> = ({
  isOpen,
  onClose,
  activeFile,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'xlsx' | 'csv'>('xlsx');

  const noticeData = useMemo(() => {
    if (!activeFile) return null;
    return generateGramPanchayatNoticeBlob(activeFile, selectedFormat);
  }, [activeFile, selectedFormat]);

  if (!isOpen || !activeFile || !noticeData) return null;

  const villageName = detectVillageOrBaseName(activeFile);
  const totalDefects = noticeData.totalDefects;

  const handleDownload = () => {
    downloadBlob(noticeData.blob, noticeData.filename);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Header & Controls (Hidden in Print) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  ग्रामपंचायत सूचना फलक: त्रुटी पूर्तता जाहीर नोटीस
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 font-mono">
                  {totalDefects} शेतकरी
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                आधार, बँक खाते किंवा मोबाईल त्रुटी असणाऱ्या शेतकऱ्यांची ग्रामपंचायत फलकासाठी नोटीस
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट नोटीस (A4)</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>नोटीस एक्सेल डाऊनलोड (.xlsx)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Notice Sheet Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white font-sans text-slate-900 print:p-0 print:overflow-visible">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Notice Official Banner */}
            <div className="text-center border-2 border-slate-800 p-3 rounded-xl bg-amber-50/50 print:bg-white print:border-slate-800">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                महाराष्ट्र शासन — महसूल, कृषी व ग्रामविकास विभाग
              </h4>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                ग्रामपंचायत कार्यालय: {villageName}
              </h1>
              <h2 className="text-sm font-bold text-amber-900 underline mt-1">
                जाहीर नोटीस: नुकसान भरपाई / DBT बँक खाते व आधार त्रुटी पूर्तता
              </h2>
              <p className="text-xs text-slate-700 mt-2 text-justify sm:text-center leading-relaxed">
                सर्व शेतकरी बांधवांना कळविण्यात येते की, नुकसान भरपाई / DBT यादीमधील खालील खातेदारांच्या बँक खात्यामध्ये, आधार क्रमांकामध्ये किंवा मोबाईल क्रमांकामध्ये त्रुटी आढळल्या आहेत. अनुदान थेट खात्यात जमा होण्यासाठी खालील शेतकऱ्यांनी समोर दर्शविलेली आवश्यक कागदपत्रे तात्काळ ग्रामपंचायत कार्यालय किंवा तलाठी कार्यालयात जमा करावीत.
              </p>
            </div>

            {/* Defect Table */}
            {totalDefects === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800">
                  🎉 अभिनंदन! कोणतीही त्रुटी आढळली नाही.
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  या फाईलमधील सर्व शेतकऱ्यांचे आधार, बँक खाते व मोबाईल १००% वैध आहेत.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-300 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-900">
                    <tr>
                      <th className="py-2.5 px-2 text-center w-10 border-r border-slate-300">#</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 min-w-[160px]">
                        खातेदाराचे / शेतकऱ्याचे नाव
                      </th>
                      <th className="py-2.5 px-2.5 border-r border-slate-300 text-center w-20">
                        गट क्र.
                      </th>
                      <th className="py-2.5 px-3 border-r border-slate-300 min-w-[130px]">
                        नोंदवलेली बँक
                      </th>
                      <th className="py-2.5 px-3 border-r border-slate-300 min-w-[160px] text-red-900">
                        त्रुटीचे स्वरूप (Defect Reason)
                      </th>
                      <th className="py-2.5 px-3 border-r border-slate-300 min-w-[170px] text-indigo-900">
                        जमा करावयाचे आवश्यक कागदपत्र
                      </th>
                      <th className="py-2.5 px-3 text-center min-w-[100px]">
                        शेतकरी स्वाक्षरी
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 font-medium">
                    {noticeData.noticeRows.map((r, idx) => (
                      <tr key={idx} className="hover:bg-amber-50/30 print:hover:bg-transparent">
                        <td className="py-2 px-2 text-center font-mono text-[11px] text-slate-600 border-r border-slate-300">
                          {r[0]}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-300">
                          {r[1]}
                        </td>
                        <td className="py-2 px-2.5 text-center font-mono text-[11px] border-r border-slate-300">
                          {r[3]}
                        </td>
                        <td className="py-2 px-3 text-[11px] border-r border-slate-300 truncate max-w-[140px]">
                          {r[4]}
                        </td>
                        <td className="py-2 px-3 text-[11px] text-red-700 font-semibold border-r border-slate-300">
                          {r[5]}
                        </td>
                        <td className="py-2 px-3 text-[11px] font-bold text-indigo-800 border-r border-slate-300 bg-indigo-50/40 print:bg-transparent">
                          {r[6]}
                        </td>
                        <td className="py-2 px-3 text-center border-slate-300 text-slate-300 text-[11px]">
                          &nbsp;
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bottom Signatures for Notice */}
            <div className="pt-6 pb-2 grid grid-cols-3 gap-4 text-center text-xs font-bold border-t border-slate-400">
              <div>
                <div className="h-8"></div>
                <div className="border-t border-slate-400 pt-1">
                  तलाठी (सझा: {villageName})
                </div>
              </div>
              <div>
                <div className="h-8"></div>
                <div className="border-t border-slate-400 pt-1">
                  कृषी सहाय्यक
                </div>
              </div>
              <div>
                <div className="h-8"></div>
                <div className="border-t border-slate-400 pt-1">
                  ग्रामसेवक / सरपंच (ग्रा.पं. {villageName})
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
