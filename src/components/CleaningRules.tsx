import React, { useState } from 'react';
import {
  Wand2,
  Copy,
  RotateCcw,
  ShieldAlert,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ALL_CLEANING_RULES,
  CleaningRule,
  ColumnRuleMap,
  FileItem,
} from '../types/dataCleaner';
import { isColumnLockedAsText } from '../utils/autoDetector';

interface CleaningRulesProps {
  activeFile: FileItem | null;
  columnRules: ColumnRuleMap;
  onChangeColumnRules: (rules: ColumnRuleMap) => void;
  onAutoDetectColumns: () => void;
  autoApply: boolean;
  onToggleAutoApply: (val: boolean) => void;
}

export const CleaningRules: React.FC<CleaningRulesProps> = ({
  activeFile,
  columnRules,
  onChangeColumnRules,
  onAutoDetectColumns,
  autoApply,
  onToggleAutoApply,
}) => {
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());
  const [bulkRuleToAdd, setBulkRuleToAdd] = useState<CleaningRule>('Trim');
  const [sourceColumnForCopy, setSourceColumnForCopy] = useState<string>('');

  if (!activeFile) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-xs">
        <Layers className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No File Selected for Rules</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Select or load a file above to configure column-wise cleaning and validation rules.
        </p>
      </div>
    );
  }

  const headers = activeFile.headers;

  const handleToggleRule = (col: string, rule: CleaningRule) => {
    const currentRules = columnRules[col] || [];
    const isLockedText = isColumnLockedAsText(col);

    if (rule === 'Number' && isLockedText) {
      alert(`Notice: "${col}" contains identifier or code data with potential leading zeroes. It is strongly recommended to keep it as Text.`);
    }

    let updated: CleaningRule[];
    if (currentRules.includes(rule)) {
      updated = currentRules.filter((r) => r !== rule);
    } else {
      let clean = currentRules.filter((r) => {
        if (rule === 'Number' && r === 'Text') return false;
        if (rule === 'Text' && r === 'Number') return false;
        if (rule === 'UPPER' && (r === 'lower' || r === 'Proper')) return false;
        if (rule === 'lower' && (r === 'UPPER' || r === 'Proper')) return false;
        if (rule === 'Proper' && (r === 'UPPER' || r === 'lower')) return false;
        return true;
      });
      updated = [...clean, rule];
    }

    onChangeColumnRules({
      ...columnRules,
      [col]: updated,
    });
  };

  const handleSelectAllCols = (checked: boolean) => {
    if (checked) {
      setSelectedColumns(new Set(headers));
    } else {
      setSelectedColumns(new Set());
    }
  };

  const handleToggleColSelect = (col: string) => {
    const next = new Set(selectedColumns);
    if (next.has(col)) {
      next.delete(col);
    } else {
      next.add(col);
    }
    setSelectedColumns(next);
  };

  const handleApplyRuleToSelected = () => {
    if (selectedColumns.size === 0) return;
    const nextRules = { ...columnRules };
    selectedColumns.forEach((col) => {
      const cur = nextRules[col] || [];
      if (!cur.includes(bulkRuleToAdd)) {
        nextRules[col] = [...cur, bulkRuleToAdd];
      }
    });
    onChangeColumnRules(nextRules);
  };

  const handleCopyRules = () => {
    if (!sourceColumnForCopy) return;
    const sourceRules = columnRules[sourceColumnForCopy] || [];
    const nextRules = { ...columnRules };
    selectedColumns.forEach((col) => {
      if (col !== sourceColumnForCopy) {
        nextRules[col] = [...sourceRules];
      }
    });
    onChangeColumnRules(nextRules);
  };

  const handleClearAllRules = () => {
    if (confirm('Are you sure you want to clear rules for all columns in this file?')) {
      const cleared: ColumnRuleMap = {};
      headers.forEach((h) => {
        cleared[h] = [];
      });
      onChangeColumnRules(cleared);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Header & Auto Detect */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              3. Cleaning & Validation Rules
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-300 font-mono">
              {headers.length} Columns (कमी किंवा जास्त रकाने समर्थित)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            फाईलमध्ये कितीही रकाने असले तरी हेडर व आतील डेटा नमुन्यावरून १००% स्थानिक पद्धतीने (No API Key) स्मार्ट नियम आपोआप ओळखले जातात.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-900 dark:hover:text-white">
            <input
              type="checkbox"
              checked={autoApply}
              onChange={(e) => onToggleAutoApply(e.target.checked)}
              className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-0"
            />
            <span>Auto Apply Detected Rules</span>
          </label>

          <button
            onClick={onAutoDetectColumns}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-xs transition active:scale-95"
            title="Automatically identify likely columns and map rules"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto Detect Columns</span>
          </button>
        </div>
      </div>

      {/* Bulk Rules Bar */}
      <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-700 dark:text-slate-400 font-bold">Bulk Action:</span>
          <select
            value={bulkRuleToAdd}
            onChange={(e) => setBulkRuleToAdd(e.target.value as CleaningRule)}
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 text-xs font-medium focus:ring-1 focus:ring-cyan-500"
          >
            {ALL_CLEANING_RULES.map((rule) => (
              <option key={rule} value={rule}>
                {rule}
              </option>
            ))}
          </select>

          <button
            onClick={handleApplyRuleToSelected}
            disabled={selectedColumns.size === 0}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Apply Rule to Selected ({selectedColumns.size})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-700 dark:text-slate-400 font-medium">Copy from:</span>
          <select
            value={sourceColumnForCopy}
            onChange={(e) => setSourceColumnForCopy(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-cyan-500 max-w-[140px] truncate"
          >
            <option value="">Select column...</option>
            {headers.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>

          <button
            onClick={handleCopyRules}
            disabled={!sourceColumnForCopy || selectedColumns.size === 0}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Copy className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            <span>Copy Rules to Selected</span>
          </button>

          <button
            onClick={handleClearAllRules}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-slate-700 bg-rose-50 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear Rules</span>
          </button>
        </div>
      </div>

      {/* Column Rules Matrix */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <th className="py-2.5 px-3 w-8 text-center">
                <input
                  type="checkbox"
                  checked={selectedColumns.size === headers.length && headers.length > 0}
                  onChange={(e) => handleSelectAllCols(e.target.checked)}
                  className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-0"
                />
              </th>
              <th className="py-2.5 px-3 min-w-[200px]">Column Name</th>
              <th className="py-2.5 px-3 min-w-[500px]">Active Cleaning & Validation Rules</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-sans">
            {headers.map((column) => {
              const rules = columnRules[column] || [];
              const isChecked = selectedColumns.has(column);
              const isLocked = isColumnLockedAsText(column);

              return (
                <tr
                  key={column}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleColSelect(column)}
                      className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-0"
                    />
                  </td>

                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-200">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white">{column}</span>
                      {isLocked && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                          <ShieldAlert className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          Text Protected (Zeroes Preserved)
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {ALL_CLEANING_RULES.map((rule) => {
                        const active = rules.includes(rule);
                        let badgeColor = active
                          ? 'bg-cyan-100 dark:bg-cyan-950/80 border-cyan-400 dark:border-cyan-500 text-cyan-900 dark:text-cyan-300 font-bold'
                          : 'bg-slate-100 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300';

                        if (active && (rule === 'Aadhaar(12)' || rule === 'Mobile(10)' || rule === 'IFSC(11)')) {
                          badgeColor = 'bg-indigo-100 dark:bg-indigo-950/90 border-indigo-400 dark:border-indigo-500 text-indigo-900 dark:text-indigo-300 font-bold';
                        } else if (active && rule === 'Bank Standardize') {
                          badgeColor = 'bg-emerald-100 dark:bg-emerald-950/90 border-emerald-400 dark:border-emerald-500 text-emerald-900 dark:text-emerald-300 font-bold';
                        } else if (active && rule === 'Amount') {
                          badgeColor = 'bg-amber-100 dark:bg-amber-950/90 border-amber-400 dark:border-amber-500 text-amber-900 dark:text-amber-300 font-bold';
                        }

                        return (
                          <button
                            key={rule}
                            type="button"
                            onClick={() => handleToggleRule(column, rule)}
                            className={`px-2 py-0.5 rounded-md border text-[11px] transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${badgeColor}`}
                          >
                            <span>{active ? '☑' : '☐'}</span>
                            <span>{rule}</span>
                          </button>
                        );
                      })}
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
