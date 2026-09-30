import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { CellValidationDetail, FileItem } from '../types/dataCleaner';

/**
 * Detect Village Name from Dataset or Original File Name
 */
export function detectVillageOrBaseName(file: FileItem): string {
  const villageColKeywords = [
    'farmers_village',
    'farmers village',
    'village',
    'गाव',
    'गावाचे नाव',
    'गावाचे_नाव',
    'village_name',
    'grampanchayat',
    'taluka',
  ];

  const colIndex = file.headers.findIndex((h) => {
    const cleanHeader = h.toLowerCase().trim().replace(/[\s\.\-_]+/g, '');
    return villageColKeywords.some(
      (kw) => cleanHeader === kw.replace(/[\s\.\-_]+/g, '')
    );
  });

  const sourceData = (file.cleanedData && file.cleanedData.length > 0)
    ? file.cleanedData
    : file.originalData;

  if (colIndex !== -1 && sourceData && sourceData.length > 0) {
    const counts: { [val: string]: number } = {};
    for (const row of sourceData) {
      const val = row[colIndex];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        const clean = String(val).trim();
        counts[clean] = (counts[clean] || 0) + 1;
      }
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0 && sorted[0][0]) {
      return sorted[0][0].replace(/[/\\?%*:|"<>]/g, '_').trim();
    }
  }

  const lastDot = file.name.lastIndexOf('.');
  const base = lastDot !== -1 ? file.name.substring(0, lastDot) : file.name;
  return base.replace(/[/\\?%*:|"<>]/g, '_').trim() || 'Data';
}

/**
 * Get Split Output Filename: e.g. RAHATEWADI_correct.xlsx or RAHATEWADI_incorrect.xlsx
 */
export function getSplitFileName(
  file: FileItem,
  kind: 'correct' | 'incorrect',
  targetFormat: 'preserve' | 'xlsx' | 'csv' = 'preserve',
  customBaseName?: string
): string {
  const baseName = (customBaseName && customBaseName.trim())
    ? customBaseName.trim().replace(/[/\\?%*:|"<>]/g, '_')
    : detectVillageOrBaseName(file);

  const lastDot = file.name.lastIndexOf('.');
  const origExt = lastDot !== -1 ? file.name.substring(lastDot + 1).toLowerCase() : 'xlsx';

  let finalExt = origExt;
  if (targetFormat === 'xlsx') finalExt = 'xlsx';
  if (targetFormat === 'csv') finalExt = 'csv';

  return `${baseName}_${kind}.${finalExt}`;
}

/**
 * Detect Serial Number Column Index (Sr.No / अ.क्र. / Serial No)
 * Requirement: "file ना serial क्रमांक चढत्याक्रमाने नव्याने दया"
 */
export function findSrNoColIndex(headers: string[]): number {
  return headers.findIndex((h) =>
    /^(sr\.?\s*no\.?|s\.?\s*no\.?|अ\.?\s*क्र\.?|अनुक्रमांक|क्रमांक|serial\s*no\.?|id|sr_no)$/i.test(
      h.trim().replace(/[\s\.\-_]+/g, '')
    )
  );
}

/**
 * Detect Area (क्षेत्र) Column Indices
 */
export function findAreaColIndices(headers: string[]): number[] {
  const indices: number[] = [];
  headers.forEach((h, idx) => {
    if (/(area|क्षेत्र|हेक्टर|hectare|affected_area|बाधित)/i.test(h)) {
      indices.push(idx);
    }
  });
  return indices;
}

/**
 * Detect Amount (रक्कम) Column Indices
 */
export function findAmountColIndices(headers: string[]): number[] {
  const indices: number[] = [];
  headers.forEach((h, idx) => {
    if (/(amount|रक्कम|अनुदान|disbursed|sanctioned|aid|subsidy|देय)/i.test(h)) {
      indices.push(idx);
    }
  });
  return indices;
}

/**
 * Compute Total Area and Total Amount sums across dataset
 * Requirement: "क्षेत्राची तसेच रकमेची बेरीज सर्वात शेवटी खाली आली पाहिजे"
 */
export function computeDatasetTotals(headers: string[], rows: any[][]): {
  totalRow: any[];
  totalArea: number;
  totalAmount: number;
  areaColIndices: number[];
  amountColIndices: number[];
} {
  const areaIndices = findAreaColIndices(headers);
  const amountIndices = findAmountColIndices(headers);

  let totalArea = 0;
  let totalAmount = 0;

  for (const row of rows) {
    for (const aIdx of areaIndices) {
      const val = row[aIdx];
      if (val !== null && val !== undefined && val !== '') {
        const num = parseFloat(String(val).replace(/,/g, '').trim());
        if (!isNaN(num)) {
          totalArea += num;
        }
      }
    }

    for (const mIdx of amountIndices) {
      const val = row[mIdx];
      if (val !== null && val !== undefined && val !== '') {
        const cleanStr = String(val)
          .replace(/[₹\s,]/g, '')
          .replace(/\b(?:rs|inr)\.?\b/gi, '')
          .trim();
        const num = parseFloat(cleanStr);
        if (!isNaN(num)) {
          totalAmount += num;
        }
      }
    }
  }

  // Construct Total Row
  const totalRow: any[] = new Array(headers.length).fill('');

  // Position label in name column or first available text column
  const nameColIdx = headers.findIndex((h) =>
    /(name|farmer|नाव|शेतकरी|गाव|village)/i.test(h)
  );
  const labelColIdx = nameColIdx !== -1 && nameColIdx > 0 ? nameColIdx : 0;
  totalRow[labelColIdx] = 'एकूण बेरीज (TOTAL)';

  // Populate Area Sums
  for (const aIdx of areaIndices) {
    totalRow[aIdx] = Math.round(totalArea * 100) / 100;
  }

  // Populate Amount Sums
  for (const mIdx of amountIndices) {
    totalRow[mIdx] = Math.round(totalAmount * 100) / 100;
  }

  return {
    totalRow,
    totalArea: Math.round(totalArea * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    areaColIndices: areaIndices,
    amountColIndices: amountIndices,
  };
}

/**
 * Calculate column width based on content length
 */
function getColWidths(headers: string[], rows: any[][]): XLSX.ColInfo[] {
  return headers.map((header, colIdx) => {
    let maxLen = header.length;
    for (let r = 0; r < Math.min(rows.length, 200); r++) {
      const val = rows[r]?.[colIdx];
      if (val !== undefined && val !== null) {
        const len = String(val).length;
        if (len > maxLen) {
          maxLen = len;
        }
      }
    }
    const width = Math.min(Math.max(maxLen + 3, 12), 50);
    return { wch: width };
  });
}

/**
 * Generate formatted XLSX workbook Blob for a specific dataset (Correct or Incorrect)
 * Enforces:
 * 1. Fresh sequential serial numbers in ascending order (1, 2, 3...)
 * 2. Bottom Total Row for Area (क्षेत्र) and Amount (रक्कम)
 */
export function generateDatasetExcelBlob(
  headers: string[],
  rows: any[][],
  validationGrid: (CellValidationDetail | null)[][] | undefined,
  sheetName: string,
  isIncorrect = false
): Blob {
  const wb = XLSX.utils.book_new();

  // Find Serial Number Column to re-index in ascending order
  const srColIdx = findSrNoColIndex(headers);

  // If this is the Incorrect file, add an "Errors_Detected" column at the end
  let outputHeaders = [...headers];
  if (isIncorrect) {
    outputHeaders.push('Errors_Detected / त्रुटी');
  }

  // Re-index serial number in fresh ascending order: 1, 2, 3... N
  const outputRows = rows.map((row, rIdx) => {
    const rowCopy = [...row];
    if (srColIdx !== -1) {
      rowCopy[srColIdx] = rIdx + 1; // Fresh sequential serial number 1, 2, 3...
    }

    if (isIncorrect && validationGrid) {
      const vRow = validationGrid[rIdx];
      const errors = vRow
        ?.map((cell, cIdx) => (!cell?.isValid ? `${headers[cIdx]}: ${cell?.reason || 'Invalid format'}` : null))
        .filter(Boolean);
      rowCopy.push(errors && errors.length > 0 ? errors.join(' | ') : 'त्रुटी (Error)');
    }
    return rowCopy;
  });

  // Calculate and Append Total Row at the bottom
  const { totalRow } = computeDatasetTotals(headers, outputRows);
  if (outputRows.length > 0) {
    const formattedTotalRow = [...totalRow];
    if (isIncorrect) {
      formattedTotalRow.push(''); // Empty in error column
    }
    outputRows.push(formattedTotalRow);
  }

  const sheetData: any[][] = [outputHeaders, ...outputRows];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Column widths
  ws['!cols'] = getColWidths(outputHeaders, outputRows);

  // AutoFilter (exclude total row from filter)
  if (outputHeaders.length > 0 && outputRows.length > 1) {
    const lastColLetter = XLSX.utils.encode_col(outputHeaders.length - 1);
    const lastDataRowIndex = outputRows.length; // 1 before total row + header
    ws['!autofilter'] = {
      ref: `A1:${lastColLetter}${lastDataRowIndex}`,
    };
  }

  // Freeze top row
  ws['!freeze'] = {
    xSplit: 0,
    ySplit: 1,
    topLeftCell: 'A2',
    activePane: 'bottomLeft',
    state: 'frozen',
  };

  // Header styles
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const headerAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    const cell = ws[headerAddress];
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: isIncorrect ? '991B1B' : '065F46' } },
        fill: { fgColor: { rgb: isIncorrect ? 'FEE2E2' : 'D1FAE5' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: 'CBD5E1' } },
          bottom: { style: 'medium', color: { rgb: '94A3B8' } },
          left: { style: 'thin', color: { rgb: 'CBD5E1' } },
          right: { style: 'thin', color: { rgb: 'CBD5E1' } },
        },
      };
    }
  }

  // Highlight specific invalid cells in soft red
  if (isIncorrect && validationGrid) {
    for (let R = 0; R < rows.length; ++R) {
      for (let C = 0; C < headers.length; ++C) {
        const valDetail = validationGrid[R]?.[C];
        if (valDetail && !valDetail.isValid) {
          const cellAddress = XLSX.utils.encode_cell({ r: R + 1, c: C });
          const cell = ws[cellAddress];
          if (cell) {
            cell.s = {
              fill: { fgColor: { rgb: 'FEE2E2' } },
              font: { color: { rgb: '991B1B' }, bold: true },
              border: {
                top: { style: 'thin', color: { rgb: 'F87171' } },
                bottom: { style: 'thin', color: { rgb: 'F87171' } },
                left: { style: 'thin', color: { rgb: 'F87171' } },
                right: { style: 'thin', color: { rgb: 'F87171' } },
              },
            };
          }
        }
      }
    }
  }

  // Style the Total Row at the very bottom
  if (outputRows.length > 1) {
    const totalRowIndex = outputRows.length; // row in sheet
    for (let C = 0; C < outputHeaders.length; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: totalRowIndex, c: C });
      const cell = ws[cellAddress];
      if (cell) {
        cell.s = {
          font: { bold: true, color: { rgb: '0F172A' }, sz: 11 },
          fill: { fgColor: { rgb: 'FEF3C7' } }, // Soft Amber total fill
          alignment: {
            horizontal: typeof cell.v === 'number' ? 'right' : 'center',
            vertical: 'center',
          },
          border: {
            top: { style: 'thin', color: { rgb: '94A3B8' } },
            bottom: { style: 'double', color: { rgb: '0F172A' } }, // Double line accounting border
            left: { style: 'thin', color: { rgb: 'CBD5E1' } },
            right: { style: 'thin', color: { rgb: 'CBD5E1' } },
          },
        };
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const wbout = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'array',
    bookSST: false,
  });

  return new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * Generate CSV Blob for a dataset with Re-indexing and Total Row
 */
export function generateDatasetCsvBlob(
  headers: string[],
  rows: any[][],
  validationGrid?: (CellValidationDetail | null)[][],
  isIncorrect = false
): Blob {
  const srColIdx = findSrNoColIndex(headers);

  let outputHeaders = [...headers];
  if (isIncorrect) {
    outputHeaders.push('Errors_Detected / त्रुटी');
  }

  // Re-index serial number in ascending order
  const outputRows = rows.map((row, rIdx) => {
    const rowCopy = [...row];
    if (srColIdx !== -1) {
      rowCopy[srColIdx] = rIdx + 1;
    }
    if (isIncorrect && validationGrid) {
      const vRow = validationGrid[rIdx];
      const errors = vRow
        ?.map((cell, cIdx) => (!cell?.isValid ? `${headers[cIdx]}: ${cell?.reason || 'Invalid format'}` : null))
        .filter(Boolean);
      rowCopy.push(errors && errors.length > 0 ? errors.join(' | ') : 'त्रुटी (Error)');
    }
    return rowCopy;
  });

  // Calculate and Append Total Row
  if (outputRows.length > 0) {
    const { totalRow } = computeDatasetTotals(headers, outputRows);
    const formattedTotalRow = [...totalRow];
    if (isIncorrect) formattedTotalRow.push('');
    outputRows.push(formattedTotalRow);
  }

  const data = [outputHeaders, ...outputRows];
  const csvString = Papa.unparse(data);
  return new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Trigger single browser file download
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads multiple files sequentially directly WITHOUT ZIP
 */
export async function downloadFilesDirectlyWithoutZip(
  files: { blob: Blob; filename: string }[]
): Promise<void> {
  for (let i = 0; i < files.length; i++) {
    const item = files[i];
    downloadBlob(item.blob, item.filename);
    if (i < files.length - 1) {
      await new Promise((res) => setTimeout(res, 250));
    }
  }
}
