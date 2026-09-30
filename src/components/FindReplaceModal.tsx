import React, { useState, useMemo } from 'react';
import {
  Search,
  Replace,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
  Check,
  Sparkles,
  Layers,
} from 'lucide-react';
import { FileItem } from '../types/dataCleaner';

interface FindReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFile: FileItem | null;
  onExecuteReplace: (
    findText: string,
    replaceText: string,
    targetColumn: string, // 'ALL' or specific column name
    options: { matchCase: boolean; exactMatch: boolean }
  ) => { replacedCount: number; affectedRows: number };
}

export const FindReplaceModal: React.FC<FindReplaceModalProps> = ({
  isOpen,
  onClose,
  activeFile,
  onExecuteReplace,
}) => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [targetColumn, setTargetColumn] = useState<string>('ALL');
  const [matchCase, setMatchCase] = useState(false);
  const [exactMatch, setExactMatch] = useState(false);
  const [successResult, setSuccessResult] = useState<string | null>(null);

  const headers = activeFile ? activeFile.headers : [];
  const sourceRows = activeFile
    ? activeFile.cleanedData && activeFile.cleanedData.length > 0
      ? activeFile.cleanedData
      : activeFile.originalData
    : [];

  // Calculate live matching count and previews
  const { matchCount, matchPreviews } = useMemo(() => {
    if (!activeFile || !findText.trim() || sourceRows.length === 0) {
      return { matchCount: 0, matchPreviews: [] };
    }

    const targetIndices = targetColumn === 'ALL'
      ? headers.map((_, i) => i)
      : [headers.indexOf(targetColumn)].filter((i) => i !== -1);

    let count = 0;
    const previews: { rowIndex: number; colName: string; original: string; preview: string }[] = [];

    const query = matchCase ? findText : findText.toLowerCase();

    for (let rIdx = 0; rIdx < sourceRows.length; rIdx++) {
      const row = sourceRows[rIdx];
      for (const cIdx of targetIndices) {
        const cellVal = row[cIdx];
        if (cellVal === null || cellVal === undefined) continue;

        const strVal = String(cellVal);
        const compareVal = matchCase ? strVal : strVal.toLowerCase();

        let isMatch = false;
        let replacedPreview = '';

        if (exactMatch) {
          isMatch = compareVal === query;
          if (isMatch) {
            replacedPreview = replaceText;
          }
        } else {
          isMatch = compareVal.includes(query);
          if (isMatch) {
            if (matchCase) {
              replacedPreview = strVal.replaceAll(findText, replaceText);
            } else {
              const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
              replacedPreview = strVal.replace(regex, replaceText);
            }
          }
        }

        if (isMatch) {
          count++;
          if (previews.length < 5) {
            previews.push({
              rowIndex: rIdx + 1,
              colName: headers[cIdx],
              original: strVal,
              preview: replacedPreview,
            });
          }
        }
      }
    }

    return { matchCount: count, matchPreviews: previews };
  }, [activeFile, headers, sourceRows, findText, replaceText, targetColumn, matchCase, exactMatch]);

  if (!isOpen || !activeFile) return null;

  const handleApplyReplaceAll = () => {
    if (!findText.trim()) return;

    const result = onExecuteReplace(findText, replaceText, targetColumn, {
      matchCase,
      exactMatch,
    });

    setSuccessResult(
      `यशस्वी! एकूण ${result.replacedCount} सेल्स (${result.affectedRows} ओळी) मध्ये बदल करण्यात आला आणि सर्व नोंदींचे पुन्हा प्रमाणीकरण झाले!`
    );

    setTimeout(() => {
      setSuccessResult(null);
    }, 4000);
  };

  // Quick suggestion tags based on common columns (like IFSC, Banks, etc.)
  const commonSuggestions = [
    { label: 'IFSC कोड कॅपिटल करा', find: 'sbin', replace: 'SBIN', col: 'Branch_IFSC_Code' },
    { label: 'DCC बँक सुधारणा', find: 'D.C.C', replace: 'DCC BANK', col: 'Bank_Name' },
    { label: 'SBI बँक नाव', find: 'S.B.I.', replace: 'STATE BANK OF INDIA', col: 'Bank_Name' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-300 shadow-2xl flex flex-col text-slate-900 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Replace className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                शोधा आणि सर्वत्र बदला (Find & Replace)
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                उदा. चुकीचा IFSC कोड, बँकेचे नाव किंवा गावाचे नाव एकाच वेळी सर्व नोंदींमध्ये दुरुस्त करा
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="बंद करा"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successResult && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-center gap-2 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successResult}</span>
          </div>
        )}

        {/* Content Form */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {/* Column Target Selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>कोणत्या स्तंभात बदलायचे (Select Column Scope):</span>
            </label>
            <select
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-sans text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="ALL">सर्व स्तंभांमध्ये (All Columns in File)</option>
              {headers.map((col, idx) => (
                <option key={idx} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          {/* Find Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>काय शोधायचे (Find What):</span>
              {findText && (
                <span className="text-[11px] font-mono font-bold text-blue-700">
                  {matchCount > 0 ? `✓ ${matchCount} नोंदी सापडल्या` : '० नोंदी सापडल्या'}
                </span>
              )}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                autoFocus
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="उदा. YESB0DSC001 किंवा जुने नाव..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Replace Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              कशाने बदलायचे (Replace With):
            </label>
            <div className="relative">
              <Replace className="w-4 h-4 text-blue-600 absolute left-3 top-3" />
              <input
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="उदा. YESB0000001 किंवा नवीन बरोबर नाव..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Matching Checkbox Options */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 select-none font-medium">
              <input
                type="checkbox"
                checked={matchCase}
                onChange={(e) => setMatchCase(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-0"
              />
              <span>अक्षरांचा प्रकार जुळवा (Match Case - Aa)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 select-none font-medium">
              <input
                type="checkbox"
                checked={exactMatch}
                onChange={(e) => setExactMatch(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-0"
              />
              <span>अचूक संपूर्ण सेल जुळवा (Exact Cell Match)</span>
            </label>
          </div>

          {/* Live Preview List */}
          {matchPreviews.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                बदलांचा नमुना (Live Match Preview - First {matchPreviews.length} of {matchCount}):
              </span>
              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5 font-mono text-[11px]">
                {matchPreviews.map((p, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 py-1 px-2 rounded bg-white border border-slate-200">
                    <span className="text-slate-500 font-bold shrink-0">Row #{p.rowIndex} [{p.colName}]:</span>
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-rose-700 line-through truncate max-w-[140px]">{p.original}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="text-emerald-700 font-bold truncate max-w-[140px]">{p.preview || '<रिक्त>'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Helpful Common Shortcuts */}
          <div className="pt-1">
            <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
              द्रुत उदाहरणे (Quick Examples):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {commonSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setFindText(s.find);
                    setReplaceText(s.replace);
                    if (headers.includes(s.col)) {
                      setTargetColumn(s.col);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-700 text-[11px] font-medium transition"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition"
          >
            रद्द करा (Close)
          </button>

          <button
            type="button"
            onClick={handleApplyReplaceAll}
            disabled={!findText.trim() || matchCount === 0}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Replace className="w-4 h-4" />
            <span>
              {matchCount > 0
                ? `सर्व ${matchCount} नोंदी बदला (Replace All)`
                : 'सर्व बदला (Replace All)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
