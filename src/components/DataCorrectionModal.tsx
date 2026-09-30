import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertCircle,
  X,
  CheckCircle2,
  Save,
  Wand2,
  ArrowRight,
  ShieldCheck,
  Building,
  Edit3,
  Layers,
  ChevronRight,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { BankMapping, ColumnRuleMap, FileItem } from '../types/dataCleaner';
import { cleanCellValue } from '../utils/cleaningEngine';

interface DataCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFile: FileItem | null;
  selectedCell: {
    rowIndex: number; // 0-based index
    colIndex: number;
    column: string;
    value: any;
    reason?: string;
    originalValue?: any;
    cleanedValue?: any;
  } | null;
  bankMappings: BankMapping;
  columnRules: ColumnRuleMap;
  onSaveCell: (rowIndex: number, colIndex: number, newValue: any) => void;
  onSaveRow: (rowIndex: number, newRowValues: any[]) => void;
  onNavigateNextError?: (currentRowIndex: number, currentColIndex: number) => void;
}

export const DataCorrectionModal: React.FC<DataCorrectionModalProps> = ({
  isOpen,
  onClose,
  activeFile,
  selectedCell,
  bankMappings,
  columnRules,
  onSaveCell,
  onSaveRow,
  onNavigateNextError,
}) => {
  const [activeTab, setActiveTab] = useState<'cell' | 'row'>('cell');
  const [editedValue, setEditedValue] = useState<string>('');
  const [rowDraft, setRowDraft] = useState<any[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Synchronize when selectedCell or activeFile changes
  useEffect(() => {
    if (selectedCell && activeFile) {
      const currentVal = selectedCell.value !== null && selectedCell.value !== undefined
        ? String(selectedCell.value)
        : '';
      setEditedValue(currentVal);

      const rowData = (activeFile.cleanedData && activeFile.cleanedData[selectedCell.rowIndex]) ||
        (activeFile.originalData && activeFile.originalData[selectedCell.rowIndex]) || [];
      setRowDraft([...rowData]);
      setSaveSuccessMsg(null);
    }
  }, [selectedCell, activeFile]);

  // Real-time validation for single cell editing
  const liveValidation = useMemo(() => {
    if (!selectedCell || !activeFile) return null;
    const rules = columnRules[selectedCell.column] || [];
    return cleanCellValue(editedValue, rules, bankMappings, selectedCell.column);
  }, [selectedCell, activeFile, editedValue, columnRules, bankMappings]);

  if (!isOpen || !selectedCell || !activeFile) return null;

  const rowIndex = selectedCell.rowIndex;
  const colIndex = selectedCell.colIndex;
  const headers = activeFile.headers;
  const colRules = columnRules[selectedCell.column] || [];

  // Farmer / Record identifier for context
  const farmerNameCol = headers.findIndex((h) =>
    /name|farmer|नाव|शेतकरी/i.test(h)
  );
  const farmerName = farmerNameCol !== -1 ? rowDraft[farmerNameCol] : null;

  // Handle single cell save
  const handleSaveCell = (andNext = false) => {
    const finalVal = liveValidation ? liveValidation.cleanedValue : editedValue;
    onSaveCell(rowIndex, colIndex, finalVal);
    setSaveSuccessMsg('माहिती दुरुस्त केली! (Saved successfully)');

    if (andNext && onNavigateNextError) {
      setTimeout(() => {
        setSaveSuccessMsg(null);
        onNavigateNextError(rowIndex, colIndex);
      }, 350);
    } else {
      setTimeout(() => {
        setSaveSuccessMsg(null);
        onClose();
      }, 500);
    }
  };

  // Handle full row save
  const handleSaveRow = () => {
    onSaveRow(rowIndex, rowDraft);
    setSaveSuccessMsg('संपूर्ण नोंद दुरुस्त केली! (Row saved)');
    setTimeout(() => {
      setSaveSuccessMsg(null);
      onClose();
    }, 500);
  };

  // Quick auto-fix actions
  const applyQuickFix = (type: string) => {
    let current = editedValue.trim();
    if (type === 'mobile_strip') {
      // Keep only numeric, remove leading 91 or 0
      const digitsOnly = current.replace(/\D/g, '');
      if (digitsOnly.length > 10) {
        setEditedValue(digitsOnly.slice(-10));
      } else {
        setEditedValue(digitsOnly);
      }
    } else if (type === 'ifsc_upper') {
      setEditedValue(current.toUpperCase().replace(/\s+/g, ''));
    } else if (type === 'aadhaar_strip') {
      const digits = current.replace(/\D/g, '');
      setEditedValue(digits);
    } else if (type === 'proper_case') {
      const proper = current
        .toLowerCase()
        .replace(/(?:^|\s|[-/])\w/g, (m) => m.toUpperCase());
      setEditedValue(proper);
    } else if (type === 'trim') {
      setEditedValue(current.replace(/\s+/g, ' ').trim());
    } else if (type.startsWith('bank:')) {
      const bank = type.replace('bank:', '');
      setEditedValue(bank);
    }
  };

  // Common Indian Banks for quick selector
  const commonBanks = [
    'STATE BANK OF INDIA',
    'BANK OF MAHARASHTRA',
    'BANK OF BARODA',
    'HDFC BANK',
    'ICICI BANK',
    'AXIS BANK',
    'PUNJAB NATIONAL BANK',
    'UNION BANK OF INDIA',
    'DCC BANK',
    'MAHARASHTRA GRAMIN BANK',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-300 shadow-2xl flex flex-col text-slate-900 overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  डाटा दुरुस्ती केंद्र (Data Correction Center)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 font-mono">
                  Row #{rowIndex + 1}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {farmerName ? `शेतकरी / खातेदार: ${farmerName}` : activeFile.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle: Cell vs Row */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setActiveTab('cell')}
                className={`px-2.5 py-1 rounded-md font-bold transition ${
                  activeTab === 'cell'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                सेल दुरुस्ती (Cell)
              </button>
              <button
                onClick={() => setActiveTab('row')}
                className={`px-2.5 py-1 rounded-md font-bold transition ${
                  activeTab === 'row'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                संपूर्ण पंक्ती (Full Row)
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="बंद करा (Close)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success toast */}
        {saveSuccessMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center gap-2 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === 'cell' ? (
            /* Single Cell Correction View */
            <div className="space-y-4">
              {/* Context Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    स्तंभ (Column Name)
                  </span>
                  <div className="mt-1 font-mono text-sm font-bold text-slate-900">
                    {selectedCell.column}
                  </div>
                  {colRules.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {colRules.map((r, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    सध्याचे मूल्य (Current Value)
                  </span>
                  <div className="mt-1 font-mono text-sm font-bold text-slate-800 break-all">
                    {selectedCell.value === '' || selectedCell.value === null || selectedCell.value === undefined ? (
                      <span className="text-slate-400 italic">&lt;रिक्त / रिकामी जागा&gt;</span>
                    ) : (
                      String(selectedCell.value)
                    )}
                  </div>
                </div>
              </div>

              {/* Error Reason Notice */}
              {selectedCell.reason && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs">आढळलेली त्रुटी (Detected Issue):</div>
                    <p className="mt-0.5 text-xs text-rose-800 font-medium">
                      {selectedCell.reason}
                    </p>
                  </div>
                </div>
              )}

              {/* Editable Field & Realtime Validator */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>दुरुस्त केलेले मूल्य प्रविष्ट करा (Enter Corrected Value):</span>
                  {liveValidation && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        liveValidation.isValid
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {liveValidation.isValid ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>✓ आता बरोबर आहे (Valid)</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          <span>⚠️ {liveValidation.reason || 'अवैध फॉरमॅट'}</span>
                        </>
                      )}
                    </span>
                  )}
                </label>

                <input
                  type="text"
                  autoFocus
                  value={editedValue}
                  onChange={(e) => setEditedValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveCell(true);
                    }
                  }}
                  placeholder={`योग्य ${selectedCell.column} टाईप करा...`}
                  className={`w-full p-3 rounded-xl font-mono text-sm border focus:outline-none transition ${
                    liveValidation?.isValid
                      ? 'bg-emerald-50/40 border-emerald-400 focus:border-emerald-600 text-slate-900'
                      : 'bg-white border-slate-300 focus:border-blue-500 text-slate-900'
                  }`}
                />
              </div>

              {/* Smart 1-Click Fix Helpers */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  त्वरित उपाय / सुधारणा (Smart Quick-Fixes):
                </span>
                <div className="flex flex-wrap gap-2">
                  {colRules.includes('Mobile(10)') && (
                    <button
                      type="button"
                      onClick={() => applyQuickFix('mobile_strip')}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1"
                    >
                      <Wand2 className="w-3 h-3 text-blue-600" />
                      फक्त 10 अंक ठेवा (Remove +91/0)
                    </button>
                  )}

                  {colRules.includes('IFSC(11)') && (
                    <>
                      <button
                        type="button"
                        onClick={() => applyQuickFix('ifsc_upper')}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1"
                      >
                        <Wand2 className="w-3 h-3 text-blue-600" />
                        मोठी अक्षरे करा (UPPERCASE)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          let current = editedValue.trim().toUpperCase().replace(/[\s\-]/g, '');
                          if (current.length >= 5 && current[4] === 'O') {
                            current = current.substring(0, 4) + '0' + current.substring(5);
                          }
                          setEditedValue(current);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1"
                        title="IFSC मधील ५वे अक्षर नेहमी ० (शून्य) असते, 'O' अक्षर असल्यास शून्य करा"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        ५वे अक्षर '0' करा (Fix 'O' Typo)
                      </button>
                    </>
                  )}

                  {colRules.includes('Aadhaar(12)') && (
                    <button
                      type="button"
                      onClick={() => applyQuickFix('aadhaar_strip')}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1"
                    >
                      <Wand2 className="w-3 h-3 text-blue-600" />
                      फक्त 12 अंक ठेवा (Strip Non-Digits)
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => applyQuickFix('trim')}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
                  >
                    अतिरिक्त जागा काढा (Trim Spaces)
                  </button>

                  <button
                    type="button"
                    onClick={() => applyQuickFix('proper_case')}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
                  >
                    Proper Case (पहिले अक्षर मोठे)
                  </button>
                </div>

                {/* If Bank Name column, offer standard banks quick-pick */}
                {colRules.includes('Bank Standardize') && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">
                      प्रमाणित बँक निवडा (Pick Standardized Bank):
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-200">
                      {commonBanks.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => applyQuickFix(`bank:${b}`)}
                          className="px-2 py-0.5 rounded text-[11px] bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-800 font-medium transition"
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Full Row Edit Form */
            <div className="space-y-3">
              <p className="text-xs text-slate-600 font-medium">
                या पंक्तीतील सर्व स्तंभांचे मूल्य येथे थेट दुरुस्त करू शकता:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                {headers.map((colName, cIdx) => {
                  const rules = columnRules[colName] || [];
                  const val = rowDraft[cIdx] ?? '';
                  const check = cleanCellValue(val, rules, bankMappings, colName);

                  return (
                    <div key={cIdx} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span className="truncate max-w-[180px]">{colName}</span>
                        {!check.isValid ? (
                          <span className="text-rose-600 font-bold flex items-center gap-0.5 text-[10px]">
                            <AlertCircle className="w-3 h-3" /> अवैध
                          </span>
                        ) : (
                          <span className="text-emerald-700 text-[10px]">✓ वैध</span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => {
                          const updated = [...rowDraft];
                          updated[cIdx] = e.target.value;
                          setRowDraft(updated);
                        }}
                        className={`w-full p-1.5 rounded-lg font-mono text-xs border bg-white focus:outline-none ${
                          !check.isValid
                            ? 'border-rose-300 text-rose-900'
                            : 'border-slate-300 text-slate-900 focus:border-blue-500'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition"
          >
            रद्द करा (Cancel)
          </button>

          <div className="flex items-center gap-2">
            {activeTab === 'cell' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSaveCell(false)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition active:scale-[0.98]"
                >
                  <Save className="w-4 h-4" />
                  <span>दुरुस्ती सेव्ह करा (Save)</span>
                </button>

                {onNavigateNextError && (
                  <button
                    type="button"
                    onClick={() => handleSaveCell(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-[0.98]"
                    title="ही दुरुस्ती सेव्ह करून पुढील त्रुटी असलेल्या सेलवर जा"
                  >
                    <span>सेव्ह आणि पुढील त्रुटीवर जा</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={handleSaveRow}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition active:scale-[0.98]"
              >
                <Save className="w-4 h-4" />
                <span>संपूर्ण नोंद सेव्ह करा (Save Row)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
