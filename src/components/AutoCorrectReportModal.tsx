import React, { useState } from 'react';
import {
  CheckCircle2,
  Sparkles,
  Search,
  X,
  Building2,
  KeyRound,
  ArrowRight,
  Download,
  Info,
} from 'lucide-react';
import { BankAutoCorrectSummary } from '../types/dataCleaner';

interface AutoCorrectReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: BankAutoCorrectSummary | null;
  fileName?: string;
}

export const AutoCorrectReportModal: React.FC<AutoCorrectReportModalProps> = ({
  isOpen,
  onClose,
  summary,
  fileName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen || !summary) return null;

  const filteredDetails = summary.details.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.rowIndex.toString().includes(term) ||
      (item.farmerName && item.farmerName.toLowerCase().includes(term)) ||
      item.originalBank.toLowerCase().includes(term) ||
      item.correctedBank.toLowerCase().includes(term) ||
      item.originalIfsc.toLowerCase().includes(term) ||
      item.correctedIfsc.toLowerCase().includes(term) ||
      item.reason.toLowerCase().includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-4xl max-h-[88vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col text-slate-900 dark:text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-white to-blue-50 dark:from-emerald-950/20 dark:via-slate-900 dark:to-blue-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  बँक व IFSC ऑटो-करेक्ट अहवाल (Auto-Correct Complete)
                </h3>
                {fileName && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-mono">
                    {fileName}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                मास्टर डिरेक्टरीनुसार सर्व नोंदी तात्काळ दुरुस्त करून डेटासेटचे पुन्हा स्वयंचलित प्रमाणीकरण केले आहे.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">दुरुस्त केलेल्या ओळी</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {summary.totalRowsChanged.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              एकूण {summary.totalRowsExamined.toLocaleString()} पैकी
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">IFSC कोड सुधारणा</span>
              <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
              {summary.ifscCorrectedCount.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">टायपो व शाखा मॅपिंग</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">बँक नावे प्रमाणित</span>
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {summary.bankNameCorrectedCount.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">अधिकृत मानक स्वरूप</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">शाखा अद्यतन</span>
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {summary.branchUpdatedCount.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">मास्टरनुसार भरले</p>
          </div>
        </div>

        {/* Toolbar & Search */}
        <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ओळ क्र., शेतकरी, बँक, IFSC किंवा कारण शोधा..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <span className="text-slate-500 dark:text-slate-400 font-medium text-xs">
            दाखवत आहे: <strong className="text-slate-800 dark:text-white">{filteredDetails.length}</strong> / {summary.details.length} बदल
          </span>
        </div>

        {/* Detailed Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2.5 px-3 w-16">ओळ क्र.</th>
                  <th className="py-2.5 px-3">शेतकरी / लाभार्थी</th>
                  <th className="py-2.5 px-3">मूळ डेटा (Original)</th>
                  <th className="py-2.5 px-3">
                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                      <span>दुरुस्त केलेला डेटा (Corrected)</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  </th>
                  <th className="py-2.5 px-3">बदलाचे कारण / कृती (Reason)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-sans">
                {filteredDetails.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                      शोध परिणामांशी जुळणारे कोणतेही बदल आढळले नाहीत.
                    </td>
                  </tr>
                ) : (
                  filteredDetails.map((item, idx) => (
                    <tr
                      key={`${item.rowIndex}-${idx}`}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-2 px-3 font-mono font-bold text-slate-500 dark:text-slate-400">
                        #{item.rowIndex}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">
                        {item.farmerName || '-'}
                      </td>
                      <td className="py-2 px-3">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-rose-700 dark:text-rose-400 line-through">
                            {item.originalBank || '(बँक रिकामा)'}
                          </div>
                          {item.originalBranch && (
                            <div className="text-[11px] text-slate-500">शाखा: {item.originalBranch}</div>
                          )}
                          <div className="font-mono text-xs text-rose-600 dark:text-rose-400">
                            IFSC: {item.originalIfsc || '(रिकामा)'}
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 bg-emerald-50/50 dark:bg-emerald-950/20">
                        <div className="space-y-0.5">
                          <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                            <span>{item.correctedBank}</span>
                          </div>
                          {item.correctedBranch && (
                            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                              शाखा: {item.correctedBranch}
                            </div>
                          )}
                          <div className="font-mono font-bold text-xs text-emerald-900 dark:text-emerald-200">
                            IFSC: {item.correctedIfsc}
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-300 text-[11px]">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300">
                          {item.reason}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              दुरुस्त झालेल्या सर्व नोंदी तात्काळ <strong>"1. बरोबर नोंदी (Correct Data)"</strong> मध्ये समाविष्ट झाल्या आहेत!
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm"
          >
            ठीक आहे (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
