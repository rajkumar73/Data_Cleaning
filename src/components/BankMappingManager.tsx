import React, { useRef, useState } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  RotateCcw,
  Search,
  X,
  Check,
  FileSpreadsheet,
  Sparkles,
  KeyRound,
  FileDown,
  Info,
} from 'lucide-react';
import { BankMapping, BankMasterEntry } from '../types/dataCleaner';
import { DEFAULT_BANK_MAPPINGS } from '../utils/storage';
import {
  DEFAULT_BANK_MASTER_DIRECTORY,
  generateBankMasterTemplateExcel,
  parseBankMasterExcel,
} from '../utils/bankMasterEngine';

interface BankMappingManagerProps {
  isOpen: boolean;
  onClose: () => void;
  bankMappings: BankMapping;
  onSaveMappings: (mappings: BankMapping) => void;
  bankMasterList: BankMasterEntry[];
  onSaveBankMaster: (entries: BankMasterEntry[]) => void;
  onAutoCorrectActiveFile?: () => void;
  hasActiveFile?: boolean;
}

export const BankMappingManager: React.FC<BankMappingManagerProps> = ({
  isOpen,
  onClose,
  bankMappings,
  onSaveMappings,
  bankMasterList,
  onSaveBankMaster,
  onAutoCorrectActiveFile,
  hasActiveFile = false,
}) => {
  const [activeTab, setActiveTab] = useState<'master' | 'aliases'>('master');
  const [searchTerm, setSearchTerm] = useState('');

  // Master Branch Add form state
  const [newBankName, setNewBankName] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [newIfscCode, setNewIfscCode] = useState('');
  const [newDistrict, setNewDistrict] = useState('');

  // Master Branch Edit state
  const [editingMasterId, setEditingMasterId] = useState<string | null>(null);
  const [editMasterBank, setEditMasterBank] = useState('');
  const [editMasterBranch, setEditMasterBranch] = useState('');
  const [editMasterIfsc, setEditMasterIfsc] = useState('');
  const [editMasterDistrict, setEditMasterDistrict] = useState('');

  // Aliases state
  const [newAlias, setNewAlias] = useState('');
  const [newStandardized, setNewStandardized] = useState('');
  const [editingAliasKey, setEditingAliasKey] = useState<string | null>(null);
  const [editAliasVal, setEditAliasVal] = useState('');
  const [editStdVal, setEditStdVal] = useState('');

  // Loading state for Excel upload
  const [isImporting, setIsImporting] = useState(false);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Master entries filtering
  const filteredMaster = bankMasterList.filter((entry) => {
    const term = searchTerm.toLowerCase();
    return (
      entry.bankName.toLowerCase().includes(term) ||
      entry.branchName.toLowerCase().includes(term) ||
      entry.ifscCode.toLowerCase().includes(term) ||
      (entry.district && entry.district.toLowerCase().includes(term))
    );
  });

  // Aliases filtering
  const aliasEntries = Object.entries(bankMappings);
  const filteredAliases = aliasEntries.filter(
    ([alias, std]) =>
      alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ==========================================
  // MASTER DIRECTORY ACTIONS
  // ==========================================
  const handleAddMasterEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName.trim() || !newIfscCode.trim()) {
      alert('कृपया बँकेचे नाव आणि IFSC कोड टाका.');
      return;
    }

    const cleanIfsc = newIfscCode.trim().toUpperCase();
    const entry: BankMasterEntry = {
      id: `custom-${Date.now()}`,
      bankName: newBankName.trim().toUpperCase(),
      branchName: newBranchName.trim().toUpperCase() || 'MAIN',
      ifscCode: cleanIfsc,
      district: newDistrict.trim() || undefined,
    };

    onSaveBankMaster([entry, ...bankMasterList]);
    setNewBankName('');
    setNewBranchName('');
    setNewIfscCode('');
    setNewDistrict('');
  };

  const handleDeleteMasterEntry = (id: string) => {
    onSaveBankMaster(bankMasterList.filter((e) => e.id !== id));
  };

  const handleStartEditMaster = (entry: BankMasterEntry) => {
    setEditingMasterId(entry.id);
    setEditMasterBank(entry.bankName);
    setEditMasterBranch(entry.branchName);
    setEditMasterIfsc(entry.ifscCode);
    setEditMasterDistrict(entry.district || '');
  };

  const handleSaveEditMaster = () => {
    if (!editingMasterId || !editMasterBank.trim() || !editMasterIfsc.trim()) return;

    const updated = bankMasterList.map((item) => {
      if (item.id === editingMasterId) {
        return {
          ...item,
          bankName: editMasterBank.trim().toUpperCase(),
          branchName: editMasterBranch.trim().toUpperCase() || 'MAIN',
          ifscCode: editMasterIfsc.trim().toUpperCase(),
          district: editMasterDistrict.trim() || undefined,
        };
      }
      return item;
    });

    onSaveBankMaster(updated);
    setEditingMasterId(null);
  };

  // Import Master from Excel
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const parsedEntries = await parseBankMasterExcel(file);

      // Merge with existing entries avoiding duplicates by IFSC
      const existingIfscSet = new Set(bankMasterList.map((b) => b.ifscCode.toUpperCase().trim()));
      const newItems: BankMasterEntry[] = [];
      let updatedCount = 0;

      for (const entry of parsedEntries) {
        const cleanIfsc = entry.ifscCode.toUpperCase().trim();
        if (cleanIfsc && existingIfscSet.has(cleanIfsc)) {
          updatedCount++;
        } else {
          newItems.push(entry);
          existingIfscSet.add(cleanIfsc);
        }
      }

      const merged = [...newItems, ...bankMasterList];
      onSaveBankMaster(merged);
      alert(
        `🎉 एक्सेल फाईल यशस्वीरित्या भरली गेली!\nएकूण ${parsedEntries.length} नोंदी वाचल्या: ${newItems.length} नवीन शाखा जोडल्या, ${updatedCount} आधीच अस्तित्त्वात होत्या.\nहा डेटा ॲपमध्ये कायमस्वरूपी सेव्ह झाला आहे.`
      );
    } catch (err: any) {
      alert(`एक्सेल फाईल वाचताना त्रुटी: ${err.message}`);
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const blob = generateBankMasterTemplateExcel();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'बँक_IFSC_मास्टर_नमुना_Template.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetMasterDefaults = () => {
    if (confirm('सर्व बँक मास्टर नोंदी डीफॉल्ट महाराष्ट्र बँक यादीवर रीसेट करायच्या आहेत का?')) {
      onSaveBankMaster(DEFAULT_BANK_MASTER_DIRECTORY);
    }
  };

  // ==========================================
  // ALIASES ACTIONS
  // ==========================================
  const handleAddAlias = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlias.trim() || !newStandardized.trim()) return;

    const updated = {
      ...bankMappings,
      [newAlias.trim()]: newStandardized.trim(),
    };
    onSaveMappings(updated);
    setNewAlias('');
    setNewStandardized('');
  };

  const handleDeleteAlias = (alias: string) => {
    const updated = { ...bankMappings };
    delete updated[alias];
    onSaveMappings(updated);
  };

  const handleStartEditAlias = (alias: string, std: string) => {
    setEditingAliasKey(alias);
    setEditAliasVal(alias);
    setEditStdVal(std);
  };

  const handleSaveEditAlias = () => {
    if (!editingAliasKey || !editAliasVal.trim() || !editStdVal.trim()) return;

    const updated = { ...bankMappings };
    if (editingAliasKey !== editAliasVal.trim()) {
      delete updated[editingAliasKey];
    }
    updated[editAliasVal.trim()] = editStdVal.trim();
    onSaveMappings(updated);
    setEditingAliasKey(null);
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(bankMappings, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bank_standardization_mappings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (typeof parsed === 'object' && parsed !== null) {
          onSaveMappings({ ...bankMappings, ...parsed });
          alert('Bank aliases imported successfully!');
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-4xl max-h-[88vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col text-slate-900 dark:text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  बँक व IFSC मास्टर डिरेक्टरी (Bank & IFSC Master Directory)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                  {bankMasterList.length} शाखा नोंदणीकृत
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                एक्सेल फाईलद्वारे बँक, शाखा व IFSC मास्टर डेटा एकदाच भरा व चालू फाईलवर एका क्लिकवर दुरुस्ती करा.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 pt-2 bg-slate-50 dark:bg-slate-950 text-xs font-bold gap-2">
          <button
            onClick={() => setActiveTab('master')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'master'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>1. बँक व IFSC मास्टर यादी (Excel आधारे)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
              {bankMasterList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('aliases')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'aliases'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>2. बँक नाव प्रमाणिकरण (Aliases - SBI ➔ State Bank)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {aliasEntries.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Master Directory */}
        {activeTab === 'master' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Action Toolbar */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="बँकेचे नाव, शाखा, IFSC कोड किंवा जिल्हा शोधा..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Auto-Correct Active File Button */}
                {hasActiveFile && onAutoCorrectActiveFile && (
                  <button
                    onClick={() => {
                      onAutoCorrectActiveFile();
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs transition"
                    title="चालू फाईलमधील बँक व IFSC कोड या मास्टर यादीनुसार तात्काळ दुरुस्त करा"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>⚡ चालू फाईलवर लागू करा</span>
                  </button>
                )}

                {/* Import Master Excel */}
                <button
                  onClick={() => excelInputRef.current?.click()}
                  disabled={isImporting}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:border-blue-800 text-blue-800 dark:text-blue-300 font-bold transition shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isImporting ? 'वाचत आहे...' : '📥 एक्सेल फाईल भरा'}</span>
                </button>
                <input
                  type="file"
                  ref={excelInputRef}
                  onChange={handleImportExcel}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                />

                {/* Download Sample Template */}
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition shadow-xs"
                  title="नमुना बँक मास्टर एक्सेल फाईल डाऊनलोड करा"
                >
                  <FileDown className="w-3.5 h-3.5 text-indigo-600" />
                  <span>नमुना एक्सेल</span>
                </button>

                {/* Reset to Defaults */}
                <button
                  onClick={handleResetMasterDefaults}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                  title="डीफॉल्ट महाराष्ट्र बँक यादीवर रीसेट करा"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>रीसेट</span>
                </button>
              </div>
            </div>

            {/* Quick Add Form */}
            <form
              onSubmit={handleAddMasterEntry}
              className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs"
            >
              <div className="w-full sm:w-auto text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>नवीन शाखा जोडा:</span>
              </div>

              <div className="flex-1 min-w-[140px]">
                <input
                  type="text"
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  placeholder="बँकेचे नाव (उदा. DCC BANK)"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 text-xs focus:border-blue-500"
                />
              </div>

              <div className="flex-1 min-w-[120px]">
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="शाखा (उदा. BRAMHAPURI)"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 text-xs focus:border-blue-500"
                />
              </div>

              <div className="w-36">
                <input
                  type="text"
                  value={newIfscCode}
                  onChange={(e) => setNewIfscCode(e.target.value)}
                  placeholder="IFSC (उदा. GSCB0CHND06)"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 dark:text-slate-200 placeholder:text-slate-400 text-xs focus:border-blue-500"
                />
              </div>

              <div className="w-28">
                <input
                  type="text"
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  placeholder="जिल्हा (पर्यायी)"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 text-xs focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>नोंद जोडा</span>
              </button>
            </form>

            {/* Master Table */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <th className="py-2.5 px-3">बँकेचे नाव (Bank Name)</th>
                      <th className="py-2.5 px-3">शाखा (Branch)</th>
                      <th className="py-2.5 px-3">IFSC कोड</th>
                      <th className="py-2.5 px-3">जिल्हा</th>
                      <th className="py-2.5 px-3 text-right">कृती</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-sans">
                    {filteredMaster.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                          कोणत्याही नोंदी आढळल्या नाहीत. '📥 एक्सेल फाईल भरा' बटनावर क्लिक करून फाईल अपलोड करा.
                        </td>
                      </tr>
                    ) : (
                      filteredMaster.map((entry) => {
                        const isEditing = editingMasterId === entry.id;

                        if (isEditing) {
                          return (
                            <tr key={entry.id} className="bg-blue-50/50 dark:bg-blue-950/20">
                              <td className="py-1.5 px-3">
                                <input
                                  type="text"
                                  value={editMasterBank}
                                  onChange={(e) => setEditMasterBank(e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-blue-500 rounded px-2 py-1 text-xs"
                                />
                              </td>
                              <td className="py-1.5 px-3">
                                <input
                                  type="text"
                                  value={editMasterBranch}
                                  onChange={(e) => setEditMasterBranch(e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-blue-500 rounded px-2 py-1 text-xs"
                                />
                              </td>
                              <td className="py-1.5 px-3">
                                <input
                                  type="text"
                                  value={editMasterIfsc}
                                  onChange={(e) => setEditMasterIfsc(e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-blue-500 rounded px-2 py-1 font-mono text-xs"
                                />
                              </td>
                              <td className="py-1.5 px-3">
                                <input
                                  type="text"
                                  value={editMasterDistrict}
                                  onChange={(e) => setEditMasterDistrict(e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-blue-500 rounded px-2 py-1 text-xs"
                                />
                              </td>
                              <td className="py-1.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={handleSaveEditMaster}
                                    className="p-1 text-emerald-600 hover:text-emerald-500"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingMasterId(null)}
                                    className="p-1 text-slate-400 hover:text-slate-600"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">
                              {entry.bankName}
                            </td>
                            <td className="py-2 px-3 text-slate-700 dark:text-slate-300">
                              {entry.branchName}
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-blue-700 dark:text-blue-400">
                              {entry.ifscCode}
                            </td>
                            <td className="py-2 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                              {entry.district || '-'}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleStartEditMaster(entry)}
                                  className="p-1 text-slate-400 hover:text-blue-600"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMasterEntry(entry.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Aliases */}
        {activeTab === 'aliases' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Toolbar */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Raw alias किंवा प्रमाणित बँक नाव शोधा..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportJson}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-bold"
                >
                  <Download className="w-3 h-3 text-cyan-600" />
                  <span>Export JSON</span>
                </button>

                <button
                  onClick={() => jsonInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-bold"
                >
                  <Upload className="w-3 h-3 text-indigo-600" />
                  <span>Import JSON</span>
                </button>
                <input
                  type="file"
                  ref={jsonInputRef}
                  onChange={handleImportJson}
                  accept=".json"
                  className="hidden"
                />

                <button
                  onClick={() => {
                    if (confirm('Reset aliases to defaults?')) {
                      onSaveMappings(DEFAULT_BANK_MAPPINGS);
                    }
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Add Alias Form */}
            <form
              onSubmit={handleAddAlias}
              className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs"
            >
              <div className="flex-1 min-w-[150px]">
                <input
                  type="text"
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  placeholder="Raw Alias (उदा. S.B.I., DCC BRAMHAPURI)"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 text-xs focus:border-emerald-500"
                />
              </div>

              <span className="text-slate-400 font-bold">→</span>

              <div className="flex-1 min-w-[180px]">
                <input
                  type="text"
                  value={newStandardized}
                  onChange={(e) => setNewStandardized(e.target.value)}
                  placeholder="Standardized Name (उदा. STATE BANK OF INDIA)"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 text-xs focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>मॅपिंग जोडा</span>
              </button>
            </form>

            {/* Aliases Table */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <th className="py-2 px-3">Input Pattern / Raw Alias</th>
                      <th className="py-2 px-3">Standardized Bank Name</th>
                      <th className="py-2 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-sans">
                    {filteredAliases.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-slate-500 dark:text-slate-400">
                          No matching aliases found.
                        </td>
                      </tr>
                    ) : (
                      filteredAliases.map(([alias, std]) => {
                        const isEditing = editingAliasKey === alias;

                        if (isEditing) {
                          return (
                            <tr key={alias} className="bg-emerald-50/40 dark:bg-emerald-950/20">
                              <td className="py-1.5 px-3">
                                <input
                                  type="text"
                                  value={editAliasVal}
                                  onChange={(e) => setEditAliasVal(e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-emerald-500 rounded px-2 py-1 text-xs"
                                />
                              </td>
                              <td className="py-1.5 px-3">
                                <input
                                  type="text"
                                  value={editStdVal}
                                  onChange={(e) => setEditStdVal(e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-emerald-500 rounded px-2 py-1 text-xs"
                                />
                              </td>
                              <td className="py-1.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={handleSaveEditAlias}
                                    className="p-1 text-emerald-600 hover:text-emerald-500"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingAliasKey(null)}
                                    className="p-1 text-slate-400 hover:text-slate-600"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={alias} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-2 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                              {alias}
                            </td>
                            <td className="py-2 px-3 font-bold text-emerald-700 dark:text-emerald-400">
                              {std}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleStartEditAlias(alias, std)}
                                  className="p-1 text-slate-400 hover:text-emerald-600"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAlias(alias)}
                                  className="p-1 text-slate-400 hover:text-rose-600"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <span>हा डेटा ॲपमध्ये सुरक्षित ठेवला जातो व इंटरनेटशिवाय ऑफलाइनही काम करतो.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-xs"
          >
            पूर्ण झाले (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
