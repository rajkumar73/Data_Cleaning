import React, { useState, useMemo } from 'react';
import {
  Printer,
  X,
  FileSpreadsheet,
  Download,
  Filter,
  CheckCircle2,
  Calendar,
  Building,
} from 'lucide-react';
import { FileItem } from '../types/dataCleaner';
import { detectVillageOrBaseName, findAreaColIndices, findAmountColIndices } from '../utils/excelExporter';

interface PrintVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFile: FileItem | null;
}

export const PrintVerificationModal: React.FC<PrintVerificationModalProps> = ({
  isOpen,
  onClose,
  activeFile,
}) => {
  const [selectedVillage, setSelectedVillage] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [panchnamaDate, setPanchnamaDate] = useState<string>(() => {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, '0');
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const y = today.getFullYear();
    return `${d}/${m}/${y}`;
  });
  const [officerDesignation, setOfficerDesignation] = useState<string>('तलाठी / कृषी सहाय्यक');

  const headers = activeFile?.headers || [];
  const sourceRows = activeFile?.cleanedData || activeFile?.originalData || [];
  const validationGrid = activeFile?.validationGrid;

  // Identify column indices
  const nameColIdx = headers.findIndex((h) => /(name|शेतकरी|खातेदार|लाभार्थी|अर्जदार)/i.test(h));
  const villageColIdx = headers.findIndex((h) => /(गाव|village|ग्रामपंचायत)/i.test(h));
  const talukaColIdx = headers.findIndex((h) => /(taluka|तालुका|तहसील)/i.test(h));
  const districtColIdx = headers.findIndex((h) => /(district|जिल्हा)/i.test(h));
  const gatColIdx = headers.findIndex((h) => /(gat|survey|गट|सर्व्हे|खसरा)/i.test(h));
  const lossColIdx = headers.findIndex((h) => /(loss|crop|नुकसान|पीक)/i.test(h));
  const bankColIdx = headers.findIndex((h) => /(bank|बँक)/i.test(h) && !/(खाते|account)/i.test(h));
  const branchColIdx = headers.findIndex((h) => /(branch|शाखा)/i.test(h));
  const accountColIdx = headers.findIndex((h) => /(account|खाते)/i.test(h));
  const areaIndices = findAreaColIndices(headers);
  const amountIndices = findAmountColIndices(headers);

  // Extract distinct villages
  const villagesList = useMemo(() => {
    if (villageColIdx === -1) return [];
    const set = new Set<string>();
    sourceRows.forEach((row) => {
      const v = String(row[villageColIdx] || '').trim();
      if (v) set.add(v);
    });
    return Array.from(set).sort();
  }, [sourceRows, villageColIdx]);

  // Filtered rows for print
  const printableRows = useMemo(() => {
    return sourceRows.filter((row, rIdx) => {
      if (selectedVillage !== 'all' && villageColIdx !== -1) {
        if (String(row[villageColIdx] || '').trim() !== selectedVillage) return false;
      }
      if (statusFilter !== 'all' && validationGrid && validationGrid[rIdx]) {
        const isIncorrect = validationGrid[rIdx].some((c) => c && !c.isValid);
        if (statusFilter === 'correct' && isIncorrect) return false;
        if (statusFilter === 'incorrect' && !isIncorrect) return false;
      }
      return true;
    });
  }, [sourceRows, validationGrid, selectedVillage, statusFilter, villageColIdx]);

  // Compute live summary statistics
  const { totalArea, totalAmount } = useMemo(() => {
    let tArea = 0;
    let tAmt = 0;
    printableRows.forEach((row) => {
      for (const aIdx of areaIndices) {
        const val = parseFloat(String(row[aIdx] || '0').replace(/,/g, ''));
        if (!isNaN(val)) tArea += val;
      }
      for (const mIdx of amountIndices) {
        const val = parseFloat(String(row[mIdx] || '0').replace(/[₹\$\,\s]/g, ''));
        if (!isNaN(val)) tAmt += val;
      }
    });
    return {
      totalArea: Math.round(tArea * 100) / 100,
      totalAmount: Math.round(tAmt),
    };
  }, [printableRows, areaIndices, amountIndices]);

  if (!isOpen || !activeFile) return null;

  const currentVillageDisplay =
    selectedVillage !== 'all'
      ? selectedVillage
      : villagesList.length === 1
      ? villagesList[0]
      : detectVillageOrBaseName(activeFile);

  const currentTalukaDisplay =
    talukaColIdx !== -1 && sourceRows[0]
      ? String(sourceRows[0][talukaColIdx] || 'तालुका कार्यालय')
      : 'तालुका कार्यालय';

  const currentDistrictDisplay =
    districtColIdx !== -1 && sourceRows[0]
      ? String(sourceRows[0][districtColIdx] || 'जिल्हा कार्यालय')
      : 'जिल्हा कार्यालय';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Modal Header & Filter Controls (Hidden in Print) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                क्षेत्रीय पडताळणी व पंचनामा यादी (Print Verification Sheet)
              </h3>
              <p className="text-xs text-slate-500">
                तलाठी, कृषी सहाय्यक व शेतकऱ्यांच्या स्वाक्षरीसाठी A4 Landscape प्रिंट-रेडी चेकलिस्ट
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {villagesList.length > 1 && (
              <div className="flex items-center gap-1.5 text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-600 font-medium">गाव:</span>
                <select
                  value={selectedVillage}
                  onChange={(e) => setSelectedVillage(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none"
                >
                  <option value="all">सर्व गावे ({printableRows.length})</option>
                  {villagesList.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-600 font-medium">तारीख:</span>
              <input
                type="text"
                value={panchnamaDate}
                onChange={(e) => setPanchnamaDate(e.target.value)}
                className="w-24 bg-transparent font-bold text-slate-800 focus:outline-none text-center"
              />
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट करा / PDF जतन करा</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-white font-sans text-slate-900 print:overflow-visible print:p-0">
          <div className="max-w-5xl mx-auto space-y-4">
            {/* Official Government Header */}
            <div className="text-center border-b-2 border-slate-900 pb-3">
              <h2 className="text-base sm:text-lg font-bold tracking-wide uppercase">
                महाराष्ट्र शासन — महसूल व कृषी विभाग
              </h2>
              <h1 className="text-lg sm:text-xl font-black mt-0.5 tracking-tight">
                नुकसान भरपाई / DBT योजना: क्षेत्रीय प्रत्यक्ष पाहणी व पंचनामा यादी
              </h1>
              <p className="text-xs text-slate-600 mt-1 italic">
                (सदर यादीतील लाभार्थ्यांची प्रत्यक्ष पाहणी करून शेरा व स्वाक्षरी नोंदवावी)
              </p>
            </div>

            {/* Official Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border border-slate-300 p-2.5 rounded-lg bg-slate-50 font-medium">
              <div>
                <span className="text-slate-500">जिल्हा: </span>
                <strong className="text-slate-900">{currentDistrictDisplay}</strong>
              </div>
              <div>
                <span className="text-slate-500">तालुका: </span>
                <strong className="text-slate-900">{currentTalukaDisplay}</strong>
              </div>
              <div>
                <span className="text-slate-500">गाव / साझा: </span>
                <strong className="text-slate-900">{currentVillageDisplay}</strong>
              </div>
              <div>
                <span className="text-slate-500">पडताळणी तारीख: </span>
                <strong className="text-slate-900">{panchnamaDate}</strong>
              </div>
              <div>
                <span className="text-slate-500">एकूण शेतकरी: </span>
                <strong className="text-slate-900">{printableRows.length}</strong>
              </div>
              <div>
                <span className="text-slate-500">एकूण बाधित क्षेत्र: </span>
                <strong className="text-slate-900">{totalArea.toFixed(2)} हेक्टर</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">एकूण मंजूर रक्कम: </span>
                <strong className="text-blue-900">₹ {totalAmount.toLocaleString()} /-</strong>
              </div>
            </div>

            {/* Main Table for Verification and Signatures */}
            <div className="overflow-x-auto border border-slate-300 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-900">
                  <tr>
                    <th className="py-2 px-2 text-center w-10 border-r border-slate-300">#</th>
                    <th className="py-2 px-2.5 border-r border-slate-300 min-w-[160px]">
                      खातेदार / शेतकऱ्याचे नाव
                    </th>
                    <th className="py-2 px-2 border-r border-slate-300 text-center w-16">
                      गट क्र.
                    </th>
                    <th className="py-2 px-2 border-r border-slate-300 text-right w-20">
                      बाधित क्षेत्र (हे.)
                    </th>
                    <th className="py-2 px-2 border-r border-slate-300 min-w-[100px]">
                      पीक / नुकसान
                    </th>
                    <th className="py-2 px-2.5 border-r border-slate-300 min-w-[140px]">
                      बँक व खाते क्र.
                    </th>
                    <th className="py-2 px-2 border-r border-slate-300 text-right w-24">
                      अनुदान रक्कम (₹)
                    </th>
                    <th className="py-2 px-2 border-r border-slate-300 text-center w-24">
                      पाहणी शेरा (पात्र/अपात्र)
                    </th>
                    <th className="py-2 px-3 text-center min-w-[130px]">
                      शेतकऱ्याची स्वाक्षरी / अंगठा
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 font-medium">
                  {printableRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-slate-500">
                        कोणतीही नोंद उपलब्ध नाही.
                      </td>
                    </tr>
                  ) : (
                    printableRows.map((row, idx) => {
                      const farmerName = nameColIdx !== -1 ? String(row[nameColIdx] || '') : `नोंद #${idx + 1}`;
                      const gat = gatColIdx !== -1 ? String(row[gatColIdx] || '') : '-';
                      const loss = lossColIdx !== -1 ? String(row[lossColIdx] || '') : 'पीक नुकसान';
                      const bankName = bankColIdx !== -1 ? String(row[bankColIdx] || '') : '';
                      const accountNo = accountColIdx !== -1 ? String(row[accountColIdx] || '') : '';
                      const bankAccDisplay = [bankName, accountNo].filter(Boolean).join(' • ') || '-';

                      // Area
                      let rowArea = 0;
                      for (const aIdx of areaIndices) {
                        const val = parseFloat(String(row[aIdx] || '0').replace(/,/g, ''));
                        if (!isNaN(val)) rowArea += val;
                      }

                      // Amount
                      let rowAmt = 0;
                      for (const mIdx of amountIndices) {
                        const val = parseFloat(String(row[mIdx] || '0').replace(/[₹\$\,\s]/g, ''));
                        if (!isNaN(val)) rowAmt += val;
                      }

                      return (
                        <tr key={idx} className="hover:bg-slate-50 print:hover:bg-transparent">
                          <td className="py-2 px-2 text-center text-slate-600 font-mono text-[11px] border-r border-slate-300">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-2.5 border-r border-slate-300 font-bold text-slate-900">
                            {farmerName}
                          </td>
                          <td className="py-2 px-2 text-center border-r border-slate-300 font-mono text-[11px]">
                            {gat}
                          </td>
                          <td className="py-2 px-2 text-right border-r border-slate-300 font-mono text-[11px]">
                            {rowArea > 0 ? rowArea.toFixed(2) : '-'}
                          </td>
                          <td className="py-2 px-2 border-r border-slate-300 text-[11px] truncate max-w-[120px]">
                            {loss}
                          </td>
                          <td className="py-2 px-2.5 border-r border-slate-300 text-[11px] font-mono truncate max-w-[160px]">
                            {bankAccDisplay}
                          </td>
                          <td className="py-2 px-2 text-right border-r border-slate-300 font-mono font-bold text-slate-900">
                            {rowAmt > 0 ? `₹ ${rowAmt.toLocaleString()}` : '-'}
                          </td>
                          <td className="py-2 px-2 text-center border-r border-slate-300 text-[11px] text-slate-400">
                            [ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ]
                          </td>
                          <td className="py-2 px-3 text-center border-slate-300 text-[11px] text-slate-400">
                            &nbsp;
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {/* Total Row */}
                {printableRows.length > 0 && (
                  <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-400">
                    <tr>
                      <td colSpan={3} className="py-2 px-3 text-right uppercase text-slate-700">
                        एकूण बेरीज (Total):
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-slate-900">
                        {totalArea.toFixed(2)}
                      </td>
                      <td colSpan={2} className="py-2 px-2 text-slate-500 text-right">
                        एकूण वाटप:
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-blue-900">
                        ₹ {totalAmount.toLocaleString()}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Official Panchnama & Certification Note */}
            <div className="border border-slate-300 p-2.5 rounded-lg bg-slate-50 text-[11px] text-slate-700 leading-relaxed">
              <strong>प्रमाणपत्र:</strong> प्रमाणित करण्यात येते की, वरील यादीतील सर्व खातेदारांच्या पिकांची व बाधित क्षेत्राची आम्ही प्रत्यक्ष स्थळपाहणी व पंचनामा केला असून, सदर क्षेत्र व बँक खात्यांची माहिती नियमानुसार बरोबर असल्याचे आढळले आहे.
            </div>

            {/* Bottom 4-Officer Signature Block */}
            <div className="pt-8 pb-4 grid grid-cols-4 gap-4 text-center text-xs font-bold border-t-2 border-slate-800">
              <div className="space-y-1">
                <div className="h-10"></div>
                <div className="border-t border-slate-400 pt-1">
                  <div>तलाठी</div>
                  <div className="text-[10px] text-slate-500 font-normal">सझा: {currentVillageDisplay}</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="h-10"></div>
                <div className="border-t border-slate-400 pt-1">
                  <div>कृषी सहाय्यक</div>
                  <div className="text-[10px] text-slate-500 font-normal">कृषी विभाग</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="h-10"></div>
                <div className="border-t border-slate-400 pt-1">
                  <div>ग्रामसेवक / ग्रा.वि.अ.</div>
                  <div className="text-[10px] text-slate-500 font-normal">ग्रामपंचायत {currentVillageDisplay}</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="h-10"></div>
                <div className="border-t border-slate-400 pt-1">
                  <div>सरपंच / उपसरपंच</div>
                  <div className="text-[10px] text-slate-500 font-normal">ग्रामपंचायत {currentVillageDisplay}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
