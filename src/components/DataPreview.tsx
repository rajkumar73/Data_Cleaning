import React, { useMemo, useState } from 'react';
import {
  Table as TableIcon,
  Search,
  ArrowUpDown,
  AlertTriangle,
  History,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Edit3,
  Sparkles,
  Replace,
  Building2,
} from 'lucide-react';
import {
  BankMapping,
  CellValidationDetail,
  ColumnRuleMap,
  FileItem,
} from '../types/dataCleaner';
import { cleanCellValue } from '../utils/cleaningEngine';
import { computeDatasetTotals, findSrNoColIndex } from '../utils/excelExporter';

interface DataPreviewProps {
  activeFile: FileItem | null;
  columnRules?: ColumnRuleMap;
  bankMappings?: BankMapping;
  onOpenChangesModal: () => void;
  onOpenFindReplace?: () => void;
  onAutoCorrectBankAndIfsc?: () => void;
  onOpenBankMasterManager?: () => void;
  onOpenCorrectionModal: (detail: {
    column: string;
    rowIndex: number;
    colIndex: number;
    value: any;
    reason?: string;
    originalValue?: any;
    cleanedValue?: any;
  }) => void;
}

export const DataPreview: React.FC<DataPreviewProps> = ({
  activeFile,
  columnRules,
  bankMappings,
  onOpenChangesModal,
  onOpenFindReplace,
  onAutoCorrectBankAndIfsc,
  onOpenBankMasterManager,
  onOpenCorrectionModal,
}) => {
  const [viewMode, setViewMode] = useState<'cleaned' | 'original'>('cleaned');
  const [filterCategory, setFilterCategory] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColIndex, setSortColIndex] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  const headers = activeFile ? activeFile.headers : [];
  const isCleanedAvailable = !!activeFile?.cleanedData && activeFile.cleanedData.length > 0;
  const currentData = activeFile
    ? viewMode === 'cleaned' && isCleanedAvailable
      ? activeFile.cleanedData!
      : activeFile.originalData
    : [];

  // Guarantee validationGrid is ALWAYS available for currently selected file
  const validationGrid = useMemo(() => {
    if (activeFile?.validationGrid && activeFile.validationGrid.length > 0) {
      return activeFile.validationGrid;
    }
    if (!activeFile) return null;

    // Fallback: evaluate live if validationGrid is not yet in activeFile
    return activeFile.originalData.map((row) =>
      row.map((val, cIdx) => {
        const header = activeFile.headers[cIdx];
        const rules = columnRules?.[header] || [];
        return cleanCellValue(val, rules, bankMappings || {}, header);
      })
    );
  }, [activeFile, columnRules, bankMappings]);

  // Compute counts for tabs
  const { correctRowCount, incorrectRowCount } = useMemo(() => {
    if (!activeFile || !validationGrid) {
      return { correctRowCount: currentData.length, incorrectRowCount: 0 };
    }
    let incorrect = 0;
    for (let r = 0; r < validationGrid.length; r++) {
      const vRow = validationGrid[r];
      if (vRow && vRow.some((c) => c && !c.isValid)) {
        incorrect++;
      }
    }
    return {
      correctRowCount: Math.max(0, currentData.length - incorrect),
      incorrectRowCount: incorrect,
    };
  }, [activeFile, validationGrid, currentData]);

  // Find Serial Number column
  const srColIdx = useMemo(() => findSrNoColIndex(headers), [headers]);

  // Filter and search
  const filteredRows = useMemo(() => {
    if (!activeFile || currentData.length === 0) return [];

    let result = currentData.map((row, originalIndex) => {
      const vRow = validationGrid ? validationGrid[originalIndex] : null;
      const isRowInvalid = vRow ? vRow.some((cell) => cell && !cell.isValid) : false;
      return {
        row,
        originalIndex,
        valRow: vRow,
        isRowInvalid,
      };
    });

    if (filterCategory === 'correct') {
      result = result.filter(({ isRowInvalid }) => !isRowInvalid);
    } else if (filterCategory === 'incorrect') {
      result = result.filter(({ isRowInvalid }) => isRowInvalid);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(({ row }) =>
        row.some((val) => val !== null && val !== undefined && String(val).toLowerCase().includes(term))
      );
    }

    if (sortColIndex !== null) {
      result.sort((a, b) => {
        const valA = a.row[sortColIndex] ?? '';
        const valB = b.row[sortColIndex] ?? '';
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        return sortDirection === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return result;
  }, [activeFile, currentData, validationGrid, filterCategory, searchTerm, sortColIndex, sortDirection]);

  // Compute live Area and Amount totals across filtered rows
  const { totalArea, totalAmount, areaColIndices, amountColIndices } = useMemo(() => {
    if (filteredRows.length === 0) {
      return {
        totalArea: 0,
        totalAmount: 0,
        areaColIndices: [] as number[],
        amountColIndices: [] as number[],
      };
    }
    return computeDatasetTotals(headers, filteredRows.map((r) => r.row));
  }, [headers, filteredRows]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const paginatedRows = useMemo(() => {
    if (!activeFile) return [];
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [activeFile, filteredRows, currentPage, rowsPerPage]);

  if (!activeFile) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs">
        <TableIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-800">डेटा प्रिव्ह्यू उपलब्ध नाही (No Data Preview)</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          डेटा पाहण्यासाठी, नियम तपासण्यासाठी आणि दुरुस्ती करण्यासाठी वरील यादीतून फाईल निवडा किंवा नमुना फाईल लोड करा.
        </p>
      </div>
    );
  }

  const handleSort = (colIdx: number) => {
    if (sortColIndex === colIdx) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColIndex(null);
        setSortDirection('asc');
      }
    } else {
      setSortColIndex(colIdx);
      setSortDirection('asc');
    }
  };

  const changedCellsCount = activeFile.qualityReport?.changedCellsCount ?? 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Header & Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              5. Interactive Data Preview & Edit
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 font-mono">
              {activeFile.name}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            व्हॅलिडेशन ग्रिडनुसार अवैध (Invalid) ठरलेले सर्व सेल्स खाली हलक्या लाल रंगात (Light Red) हायलाईट केले आहेत.
          </p>
        </div>

        {/* View Toggle & Changes Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('original')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                viewMode === 'original'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Original (मूळ)
            </button>
            <button
              onClick={() => setViewMode('cleaned')}
              disabled={!isCleanedAvailable}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                viewMode === 'cleaned' && isCleanedAvailable
                  ? 'bg-blue-600 text-white shadow-xs'
                  : !isCleanedAvailable
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cleaned (स्वच्छ) {isCleanedAvailable && '✓'}
            </button>
          </div>

          {onAutoCorrectBankAndIfsc && (
            <button
              onClick={onAutoCorrectBankAndIfsc}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold shadow-xs transition"
              title="मास्टर डिरेक्टरीनुसार बँकेचे नाव, शाखा व IFSC कोड एकाच क्लिकवर auto correct करा"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>⚡ बँक व IFSC ऑटो-करेक्ट</span>
            </button>
          )}

          {onOpenBankMasterManager && (
            <button
              onClick={onOpenBankMasterManager}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition"
              title="बँक मास्टर डिरेक्टरी (Excel फाईल भरा / शाखा यादी)"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">बँक मास्टर (Excel)</span>
            </button>
          )}

          {onOpenFindReplace && (
            <button
              onClick={onOpenFindReplace}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold shadow-xs transition"
              title="एकाच प्रकारचा डेटा (उदा. IFSC कोड, बँकेचे नाव) सर्वत्र बदला"
            >
              <Replace className="w-3.5 h-3.5 text-blue-600" />
              <span>शोधा आणि बदला (Find & Replace)</span>
            </button>
          )}

          {changedCellsCount > 0 && (
            <button
              onClick={onOpenChangesModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold shadow-xs transition"
            >
              <History className="w-3.5 h-3.5 text-blue-600" />
              <span>बदल पहा ({changedCellsCount.toLocaleString()})</span>
            </button>
          )}
        </div>
      </div>

      {/* Dataset Filter Tabs: All / Correct / Incorrect */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              setFilterCategory('all');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              filterCategory === 'all'
                ? 'bg-white text-slate-900 border border-slate-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>सर्व नोंदी (All)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
              {currentData.length.toLocaleString()}
            </span>
          </button>

          <button
            onClick={() => {
              setFilterCategory('correct');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              filterCategory === 'correct'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>1. बरोबर नोंदी (Correct)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              filterCategory === 'correct' ? 'bg-emerald-700 text-white' : 'bg-emerald-200 text-emerald-900'
            }`}>
              {correctRowCount.toLocaleString()}
            </span>
          </button>

          <button
            onClick={() => {
              setFilterCategory('incorrect');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              filterCategory === 'incorrect'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>2. त्रुटी / रिक्त नोंदी (Incorrect)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              filterCategory === 'incorrect' ? 'bg-rose-700 text-white' : 'bg-rose-200 text-rose-900'
            }`}>
              {incorrectRowCount.toLocaleString()}
            </span>
          </button>
        </div>

        {/* Totals Summary Banner */}
        <div className="flex items-center gap-3 font-mono text-xs">
          {totalArea > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold border border-amber-300">
              क्षेत्र बेरीज: {totalArea.toFixed(2)} हेक्टर
            </span>
          )}
          {totalAmount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
              रक्कम बेरीज: ₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
      </div>

      {/* Visual Color Legend Bar */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
        <span className="font-bold text-slate-700 flex items-center gap-1 text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> रंग संकेत (Highlight Legend):
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-100 text-red-950 border border-red-300 font-bold text-[11px] shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0"></span>
          अवैध / त्रुटी असलेला सेल (Light Red = Flagged Invalid in validationGrid)
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-950 border border-cyan-200 font-medium text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 shrink-0"></span>
          बदललेला / स्वच्छ सेल (Cleaned)
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white text-slate-800 border border-slate-200 font-medium text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
          वैध सेल (Valid)
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="डेटा शोधा (Search by farmer, mobile, village)..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <span className="text-slate-600 font-mono text-[11px] font-semibold">
          दाखवत आहे: {filteredRows.length.toLocaleString()} / {currentData.length.toLocaleString()} नोंदी
        </span>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-[500px] relative bg-white shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          {/* Freeze Header */}
          <thead className="sticky top-0 z-20 bg-slate-100 text-slate-800 font-bold border-b border-slate-300 shadow-xs">
            <tr>
              <th className="py-2.5 px-3 w-14 text-center text-slate-600 font-mono bg-slate-100 border-r border-slate-200 sticky left-0 z-30">
                #
              </th>
              <th className="py-2.5 px-2 w-16 text-center text-slate-700 bg-slate-100 border-r border-slate-200">
                कृती
              </th>
              {headers.map((col, idx) => (
                <th
                  key={idx}
                  onClick={() => handleSort(idx)}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/80 select-none whitespace-nowrap transition-colors border-r border-slate-200"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-sans">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={headers.length + 2} className="py-8 text-center text-slate-500 font-medium">
                  {filterCategory === 'incorrect'
                    ? '🎉 अभिनंदन! या फाईलमध्ये कोणतीही त्रुटी किंवा रिकामा सेल नाही. सर्व डाटा 100% बरोबर आहे!'
                    : 'कोणतीही नोंद सापडली नाही (No matching rows found).'}
                </td>
              </tr>
            ) : (
              paginatedRows.map(({ row, originalIndex, valRow, isRowInvalid }, rowOrderIdx) => {
                const sequentialIndex = (currentPage - 1) * rowsPerPage + rowOrderIdx + 1;

                return (
                  <tr
                    key={originalIndex}
                    className={`transition-colors ${
                      isRowInvalid
                        ? 'bg-red-50/30 hover:bg-red-50/70 border-l-4 border-l-red-500'
                        : 'bg-white hover:bg-blue-50/40'
                    }`}
                  >
                    {/* Row Order Index */}
                    <td className="py-2 px-3 text-center text-slate-600 font-mono text-[11px] bg-slate-50 border-r border-slate-200 sticky left-0 z-10 font-bold">
                      {filterCategory !== 'all' ? sequentialIndex : originalIndex + 1}
                    </td>

                    {/* Edit Action Button */}
                    <td className="py-1 px-2 text-center border-r border-slate-200">
                      <button
                        onClick={() => {
                          let targetColIdx = 0;
                          if (valRow) {
                            const badIdx = valRow.findIndex((c) => c && !c.isValid);
                            if (badIdx !== -1) targetColIdx = badIdx;
                          }
                          const colName = headers[targetColIdx];
                          const cellVal = row[targetColIdx];
                          const vDetail = valRow ? valRow[targetColIdx] : null;

                          onOpenCorrectionModal({
                            rowIndex: originalIndex,
                            colIndex: targetColIdx,
                            column: colName,
                            value: cellVal,
                            reason: vDetail?.reason,
                            originalValue: vDetail?.originalValue,
                            cleanedValue: vDetail?.cleanedValue,
                          });
                        }}
                        className={`inline-flex items-center justify-center p-1 rounded-md border transition ${
                          isRowInvalid
                            ? 'bg-red-100 hover:bg-red-200 text-red-700 border-red-300'
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                        }`}
                        title="ही नोंद दुरुस्त करा (Edit & Correct)"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>

                    {/* Data Cells */}
                    {headers.map((col, colIdx) => {
                      let cellVal = row[colIdx];
                      if (colIdx === srColIdx && filterCategory !== 'all') {
                        cellVal = sequentialIndex;
                      }

                      const valDetail: CellValidationDetail | null = valRow ? valRow[colIdx] : null;
                      const isInvalid = valDetail ? !valDetail.isValid : false;
                      const isModified = valDetail ? valDetail.isModified : false;
                      const isBlank = cellVal === null || cellVal === undefined || String(cellVal).trim() === '';

                      // Light red background visual highlight for invalid cells flagged in validationGrid
                      let cellStyle = 'py-2.5 px-3 whitespace-nowrap transition-colors border-r border-slate-200 cursor-pointer ';
                      if (isInvalid) {
                        cellStyle += 'bg-red-100 hover:bg-red-200 text-red-950 border-red-300 font-bold ring-1 ring-inset ring-red-400/50 shadow-xs';
                      } else if (isModified && viewMode === 'cleaned') {
                        cellStyle += 'bg-cyan-50 hover:bg-cyan-100 text-cyan-950 font-medium';
                      } else {
                        cellStyle += 'text-slate-900 hover:bg-slate-100';
                      }

                      return (
                        <td
                          key={colIdx}
                          className={cellStyle}
                          onClick={() => {
                            onOpenCorrectionModal({
                              column: col,
                              rowIndex: originalIndex,
                              colIndex: colIdx,
                              value: row[colIdx],
                              reason: valDetail?.reason,
                              originalValue: valDetail?.originalValue,
                              cleanedValue: valDetail?.cleanedValue,
                            });
                          }}
                          title={
                            isInvalid
                              ? `⚠️ अवैध: ${valDetail?.reason} (क्लिक करून दुरुस्त करा)`
                              : isModified
                              ? `बदललेले: "${valDetail?.originalValue}" → "${valDetail?.cleanedValue}"`
                              : 'क्लिक करून दुरुस्त करा'
                          }
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            {isBlank ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-red-700 font-bold italic bg-red-200/60 px-1.5 py-0.5 rounded">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                [रिक्त / रिकामा]
                              </span>
                            ) : (
                              <span className="font-mono text-xs truncate max-w-[240px]">
                                {String(cellVal)}
                              </span>
                            )}
                            {isInvalid && !isBlank && (
                              <span className="inline-flex items-center text-red-600 shrink-0 font-bold ml-1" title={valDetail?.reason}>
                                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Bottom TOTAL Row */}
          {filteredRows.length > 0 && (
            <tfoot className="sticky bottom-0 z-20 bg-amber-50 text-slate-900 font-bold border-t-2 border-slate-400 shadow-md">
              <tr>
                <td className="py-2.5 px-3 text-center font-bold bg-amber-100 border-r border-slate-300 sticky left-0 z-30 text-amber-900">
                  ∑
                </td>
                <td className="py-2.5 px-2 text-center text-[11px] text-amber-900 font-bold border-r border-slate-300">
                  एकूण
                </td>
                {headers.map((col, idx) => {
                  const isArea = areaColIndices.includes(idx);
                  const isAmount = amountColIndices.includes(idx);

                  if (isArea) {
                    return (
                      <td
                        key={idx}
                        className="py-2.5 px-3 whitespace-nowrap text-right font-mono font-bold text-amber-950 border-r border-slate-300 bg-amber-100/80"
                      >
                        {totalArea.toFixed(2)} हे.
                      </td>
                    );
                  }

                  if (isAmount) {
                    return (
                      <td
                        key={idx}
                        className="py-2.5 px-3 whitespace-nowrap text-right font-mono font-bold text-emerald-950 border-r border-slate-300 bg-emerald-100/80"
                      >
                        ₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    );
                  }

                  if (idx === 1 || /name|नाव|farmer/i.test(col)) {
                    return (
                      <td
                        key={idx}
                        className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-300"
                      >
                        एकूण बेरीज (TOTAL)
                      </td>
                    );
                  }

                  return <td key={idx} className="border-r border-slate-300"></td>;
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-200">
        <span className="text-slate-600 font-mono font-medium">
          पृष्ठ {currentPage} / {totalPages} (एकूण {filteredRows.length.toLocaleString()} नोंदी)
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-300 font-mono text-blue-700 font-bold">
            {currentPage}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
