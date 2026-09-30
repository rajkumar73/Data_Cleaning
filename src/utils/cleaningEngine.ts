import {
  BankMapping,
  CellValidationDetail,
  ChangedCellRecord,
  CleaningRule,
  ColumnBlankStat,
  ColumnRuleMap,
  DataQualityReport,
  ProcessingLogItem,
} from '../types/dataCleaner';

// Indian Mobile Regex: starts with 6-9, followed by 9 digits
export const MOBILE_REGEX = /^[6-9][0-9]{9}$/;

// Indian IFSC Regex: 4 alphabetic, 0, 6 alphanumeric
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

// Indian Aadhaar Regex: exactly 12 numeric digits
export const AADHAAR_REGEX = /^[0-9]{12}$/;

/**
 * Meaningful missing/blank error messages based on field type
 * Requirement: "असा कोणताही डाटा blank असलेला data incorrect file मध्ये टाका"
 */
export function getMissingFieldReason(columnName?: string): string {
  if (!columnName) return 'माहिती रिकामी आहे (Field is blank / missing)';
  const col = columnName.toLowerCase().trim();

  if (/aadhaar|आधार/i.test(col)) {
    return 'आधार क्रमांक रिकामा आहे (Aadhaar number is blank / missing)';
  }
  if (/acc|a_c|a\/c|saving|खाते/i.test(col)) {
    return 'बँक खाते क्रमांक रिकामा आहे (Bank account number is blank / missing)';
  }
  if (/mobile|फोन|मोबाईल/i.test(col)) {
    return 'मोबाईल क्रमांक रिकामा आहे (Mobile number is blank / missing)';
  }
  if (/ifsc/i.test(col)) {
    return 'IFSC कोड रिकामा आहे (IFSC code is blank / missing)';
  }
  if (/name|नाव|farmer/i.test(col)) {
    return 'शेतकऱ्याचे नाव रिकामे आहे (Farmer name is blank / missing)';
  }
  if (/bank|बँक/i.test(col)) {
    return 'बँकेचे नाव रिकामे आहे (Bank name is blank / missing)';
  }
  if (/gat|गट/i.test(col)) {
    return 'गट क्रमांक रिकामा आहे (Gat number is blank / missing)';
  }
  if (/area|क्षेत्र/i.test(col)) {
    return 'बाधित क्षेत्र रिकामे आहे (Area is blank / missing)';
  }
  if (/amount|रक्कम/i.test(col)) {
    return 'अनुदान रक्कम रिकामी आहे (Amount is blank / missing)';
  }
  if (/village|गाव/i.test(col)) {
    return 'गावाचे नाव रिकामे आहे (Village name is blank / missing)';
  }
  if (/taluka|तालुका/i.test(col)) {
    return 'तालुक्याचे नाव रिकामे आहे (Taluka name is blank / missing)';
  }
  if (/district|जिल्हा/i.test(col)) {
    return 'जिल्ह्याचे नाव रिकामे आहे (District name is blank / missing)';
  }

  return `${columnName} रिकामा आहे (Field is blank / missing)`;
}

/**
 * Standardize bank string for matching
 */
export function normalizeBankNameForMatching(raw: string): string {
  if (!raw) return '';
  return raw
    .toUpperCase()
    .replace(/[\.\,\_\-\/\(\)]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Proper Title Case conversion
 */
export function toProperCase(val: string): string {
  if (!val) return '';
  return val
    .toLowerCase()
    .replace(/(?:^|\s|[-/])\w/g, (match) => match.toUpperCase());
}

/**
 * Clean control and unprintable characters + repeated spaces
 */
export function cleanText(val: string): string {
  if (!val) return '';
  return val
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Convert value to safe text, preserving leading zeroes
 */
export function toSafeText(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val);
}

/**
 * Standardize Amount string into clean numeric string / float
 */
export function cleanAmount(val: any): { cleaned: string | number; isValid: boolean; reason?: string } {
  if (val === null || val === undefined || String(val).trim() === '') {
    return { cleaned: '', isValid: false, reason: 'रक्कम रिकामी आहे (Amount is blank)' };
  }

  const str = String(val).trim();
  const sanitized = str
    .replace(/₹/g, '')
    .replace(/\b(?:rs|inr)\.?\b/gi, '')
    .replace(/,/g, '')
    .replace(/\s+/g, '')
    .trim();

  if (!sanitized) {
    return { cleaned: '', isValid: false, reason: 'रक्कम रिकामी आहे (Amount is blank)' };
  }

  const numRegex = /^-?\d+(\.\d+)?$/;
  if (!numRegex.test(sanitized)) {
    return {
      cleaned: str,
      isValid: false,
      reason: 'रक्कम वैध आकड्यामध्ये नाही (Amount cannot be converted to number)',
    };
  }

  const parsed = parseFloat(sanitized);
  if (isNaN(parsed)) {
    return {
      cleaned: str,
      isValid: false,
      reason: 'रक्कम अवैध आहे (Invalid amount format)',
    };
  }

  return { cleaned: parsed, isValid: true };
}

/**
 * Standardize and validate date into DD/MM/YYYY
 */
export function cleanDate(val: any): { cleaned: string; isValid: boolean; reason?: string } {
  if (val === null || val === undefined || String(val).trim() === '') {
    return { cleaned: '', isValid: false, reason: 'तारीख रिकामी आहे (Date is blank)' };
  }

  if (val instanceof Date && !isNaN(val.getTime())) {
    const day = String(val.getDate()).padStart(2, '0');
    const month = String(val.getMonth() + 1).padStart(2, '0');
    const year = val.getFullYear();
    return { cleaned: `${day}/${month}/${year}`, isValid: true };
  }

  const str = String(val).trim();

  const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const year = parseInt(dmyMatch[3], 10);

    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
      const d = String(day).padStart(2, '0');
      const m = String(month).padStart(2, '0');
      return { cleaned: `${d}/${m}/${year}`, isValid: true };
    } else {
      return { cleaned: str, isValid: false, reason: 'अवैध दिवस, महिना किंवा वर्ष (Invalid date values)' };
    }
  }

  const ymdMatch = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10);
    const day = parseInt(ymdMatch[3], 10);

    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
      const d = String(day).padStart(2, '0');
      const m = String(month).padStart(2, '0');
      return { cleaned: `${d}/${m}/${year}`, isValid: true };
    } else {
      return { cleaned: str, isValid: false, reason: 'अवैध तारीख (Invalid date values)' };
    }
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1920 && parsed.getFullYear() < 2100) {
    const d = String(parsed.getDate()).padStart(2, '0');
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const y = parsed.getFullYear();
    return { cleaned: `${d}/${m}/${y}`, isValid: true };
  }

  return {
    cleaned: str,
    isValid: false,
    reason: 'तारीख अवैध आहे. dd/mm/yyyy फॉरमॅट अपेक्षित आहे.',
  };
}

/**
 * Standardize Bank Name using local mappings
 */
export function standardizeBankName(
  val: string,
  bankMappings: BankMapping
): { cleaned: string; wasStandardized: boolean } {
  if (!val) return { cleaned: '', wasStandardized: false };

  const trimmed = val.trim();
  const normalized = normalizeBankNameForMatching(trimmed);

  for (const [key, standardized] of Object.entries(bankMappings)) {
    if (normalizeBankNameForMatching(key) === normalized) {
      const changed = standardized !== trimmed;
      return { cleaned: standardized, wasStandardized: changed };
    }
  }

  for (const [key, standardized] of Object.entries(bankMappings)) {
    const normKey = normalizeBankNameForMatching(key);
    if (normKey.length >= 4 && normalized.includes(normKey)) {
      const changed = standardized !== trimmed;
      return { cleaned: standardized, wasStandardized: changed };
    }
  }

  return { cleaned: trimmed, wasStandardized: false };
}

/**
 * Clean and validate a single cell value given its rules
 * Enforces: Any BLANK / EMPTY value is INVALID per user requirement!
 */
export function cleanCellValue(
  value: any,
  rules: CleaningRule[],
  bankMappings: BankMapping,
  columnName?: string
): CellValidationDetail {
  const originalValue = value;

  // Strict check for blank/empty data
  if (value === null || value === undefined || String(value).trim() === '') {
    return {
      isValid: false,
      reason: getMissingFieldReason(columnName),
      originalValue: value,
      cleanedValue: '',
      isModified: false,
    };
  }

  let current: any = value;
  let isValid = true;
  let reason: string | undefined;

  const hasTextRule = rules.includes('Text');
  if (hasTextRule) {
    current = toSafeText(current);
  }

  for (const rule of rules) {
    switch (rule) {
      case 'Trim':
        if (typeof current === 'string') {
          current = current.trim();
        }
        break;

      case 'Clean':
        if (typeof current === 'string') {
          current = cleanText(current).trim();
        }
        break;

      case 'Proper':
        if (typeof current === 'string') {
          current = toProperCase(current);
        }
        break;

      case 'UPPER':
        if (typeof current === 'string') {
          current = current.toUpperCase();
        }
        break;

      case 'lower':
        if (typeof current === 'string') {
          current = current.toLowerCase();
        }
        break;

      case 'Text':
        current = toSafeText(current);
        break;

      case 'Number':
        if (typeof current === 'string' && current.trim() !== '') {
          const num = Number(current.replace(/,/g, '').trim());
          if (!isNaN(num)) {
            current = num;
          } else {
            isValid = false;
            reason = 'अवैध संख्या (Invalid number format)';
          }
        }
        break;

      case 'Bank Standardize':
        if (typeof current === 'string' && current.trim() !== '') {
          const res = standardizeBankName(current, bankMappings);
          current = res.cleaned;
        }
        break;

      case 'Mobile(10)': {
        let strVal = String(current).trim().replace(/[\s\-\(\)]/g, '');
        if (strVal.startsWith('+91')) {
          strVal = strVal.slice(3);
        } else if (strVal.startsWith('91') && strVal.length === 12) {
          strVal = strVal.slice(2);
        } else if (strVal.startsWith('0') && strVal.length === 11) {
          strVal = strVal.slice(1);
        }

        if (MOBILE_REGEX.test(strVal)) {
          current = strVal;
        } else {
          isValid = false;
          reason = 'मोबाईल नंबर बरोबर 10 अंकी असावा व 6-9 ने सुरू व्हावा (Must be 10 digits)';
        }
        break;
      }

      case 'IFSC(11)': {
        const strVal = String(current).trim().toUpperCase();
        current = strVal;
        if (!IFSC_REGEX.test(strVal)) {
          isValid = false;
          reason = 'IFSC कोड 11 अक्षरी असावा (4 अक्षरे, 0, नंतर 6 अंक/अक्षरे)';
        }
        break;
      }

      case 'Aadhaar(12)': {
        const strVal = String(current).trim().replace(/[\s\-]/g, '');
        if (AADHAAR_REGEX.test(strVal)) {
          current = strVal;
        } else {
          isValid = false;
          reason = 'आधार क्रमांक बरोबर 12 अंकी असावा (Must be 12 numeric digits)';
        }
        break;
      }

      case 'Amount': {
        const res = cleanAmount(current);
        if (!res.isValid) {
          isValid = false;
          reason = res.reason;
        } else {
          current = res.cleaned;
        }
        break;
      }

      case 'Date(dd/mm/yyyy)': {
        const res = cleanDate(current);
        if (!res.isValid) {
          isValid = false;
          reason = res.reason;
        } else {
          current = res.cleaned;
        }
        break;
      }
    }
  }

  // Double check if after trimming it became blank
  if (String(current).trim() === '') {
    isValid = false;
    reason = getMissingFieldReason(columnName);
  }

  const isModified = String(originalValue).trim() !== String(current).trim();

  return {
    isValid,
    reason,
    originalValue,
    cleanedValue: current,
    isModified,
  };
}

/**
 * Main Dataset Processing Engine
 */
export function processDataset(
  headers: string[],
  rows: any[][],
  columnRules: ColumnRuleMap,
  bankMappings: BankMapping,
  options: {
    removeDuplicates: boolean;
    removeBlankRows: boolean;
    removeBlankCols: boolean;
  }
): {
  cleanedHeaders: string[];
  cleanedRows: any[][];
  validationGrid: (CellValidationDetail | null)[][];
  correctRows: any[][];
  incorrectRows: any[][];
  correctValidationGrid: (CellValidationDetail | null)[][];
  incorrectValidationGrid: (CellValidationDetail | null)[][];
  qualityReport: DataQualityReport;
  processingLogs: ProcessingLogItem[];
  changedRecords: ChangedCellRecord[];
} {
  // Step 1: Detect / Remove completely blank rows
  let workingRows = rows;
  if (options.removeBlankRows) {
    workingRows = workingRows.filter((r) =>
      r.some((c) => c !== null && c !== undefined && String(c).trim() !== '')
    );
  }

  // Step 2: Blank column statistics
  const columnBlankStats: ColumnBlankStat[] = headers.map((header, colIdx) => {
    let blankCount = 0;
    for (let r = 0; r < workingRows.length; r++) {
      const val = workingRows[r]?.[colIdx];
      if (val === null || val === undefined || String(val).trim() === '') {
        blankCount++;
      }
    }
    const blankPercent = workingRows.length > 0 ? (blankCount / workingRows.length) * 100 : 0;
    return {
      column: header,
      blankCount,
      blankPercent: Math.round(blankPercent * 10) / 10,
    };
  });

  // Step 3: Optional completely blank columns removal
  let activeHeaders = [...headers];
  let activeColIndices = headers.map((_, i) => i);
  if (options.removeBlankCols) {
    const nonBlankIndices: number[] = [];
    activeHeaders = activeHeaders.filter((_, idx) => {
      const isCompletelyBlank = columnBlankStats[idx]?.blankCount === workingRows.length;
      if (!isCompletelyBlank) {
        nonBlankIndices.push(idx);
        return true;
      }
      return false;
    });
    activeColIndices = nonBlankIndices;
  }

  // Step 4: Duplicate row detection & optional removal
  const seenRowSignatures = new Set<string>();
  let duplicateCount = 0;
  const filteredRows: any[][] = [];

  for (const row of workingRows) {
    const projectedRow = activeColIndices.map((ci) => row[ci]);
    const sig = JSON.stringify(projectedRow.map((v) => (v === null || v === undefined ? '' : String(v).trim())));
    if (seenRowSignatures.has(sig)) {
      duplicateCount++;
      if (!options.removeDuplicates) {
        filteredRows.push(projectedRow);
      }
    } else {
      seenRowSignatures.add(sig);
      filteredRows.push(projectedRow);
    }
  }

  // Step 5: Cell Cleaning & Strict Validation
  const cleanedRows: any[][] = [];
  const validationGrid: (CellValidationDetail | null)[][] = [];
  const changedRecords: ChangedCellRecord[] = [];

  let invalidMobileCount = 0;
  let invalidIFSCCount = 0;
  let invalidAadhaarCount = 0;
  let invalidDatesCount = 0;
  let invalidAmountsCount = 0;
  let banksStandardizedCount = 0;
  let blankCellsCount = 0;
  let cellsProcessed = 0;

  const logTracker: { [col: string]: { [rule: string]: { changed: number; invalid: number } } } = {};

  for (const h of activeHeaders) {
    logTracker[h] = {};
    const rules = columnRules[h] || [];
    for (const r of rules) {
      logTracker[h][r] = { changed: 0, invalid: 0 };
    }
  }

  for (let rIdx = 0; rIdx < filteredRows.length; rIdx++) {
    const srcRow = filteredRows[rIdx];
    const cleanedRow: any[] = [];
    const valRow: (CellValidationDetail | null)[] = [];

    for (let cIdx = 0; cIdx < activeHeaders.length; cIdx++) {
      cellsProcessed++;
      const header = activeHeaders[cIdx];
      const rawVal = srcRow[cIdx];
      const rules = columnRules[header] || [];

      // Check if cell is blank / empty
      const isBlank = rawVal === null || rawVal === undefined || String(rawVal).trim() === '';

      if (isBlank) {
        blankCellsCount++;
        // Strict requirement: Any blank cell in data row is INVALID!
        const missingReason = getMissingFieldReason(header);
        const blankDetail: CellValidationDetail = {
          isValid: false,
          reason: missingReason,
          originalValue: rawVal,
          cleanedValue: '',
          isModified: false,
        };

        cleanedRow.push('');
        valRow.push(blankDetail);

        if (rules.includes('Mobile(10)')) invalidMobileCount++;
        if (rules.includes('IFSC(11)')) invalidIFSCCount++;
        if (rules.includes('Aadhaar(12)')) invalidAadhaarCount++;
        if (rules.includes('Date(dd/mm/yyyy)')) invalidDatesCount++;
        if (rules.includes('Amount')) invalidAmountsCount++;

        continue;
      }

      if (rules.length === 0) {
        cleanedRow.push(rawVal);
        valRow.push({
          isValid: true,
          originalValue: rawVal,
          cleanedValue: rawVal,
          isModified: false,
        });
        continue;
      }

      const result = cleanCellValue(rawVal, rules, bankMappings, header);

      if (!result.isValid) {
        if (rules.includes('Mobile(10)')) invalidMobileCount++;
        if (rules.includes('IFSC(11)')) invalidIFSCCount++;
        if (rules.includes('Aadhaar(12)')) invalidAadhaarCount++;
        if (rules.includes('Date(dd/mm/yyyy)')) invalidDatesCount++;
        if (rules.includes('Amount')) invalidAmountsCount++;
      }

      if (result.isModified) {
        changedRecords.push({
          rowIndex: rIdx + 1,
          colIndex: cIdx,
          columnName: header,
          originalValue: result.originalValue,
          cleanedValue: result.cleanedValue,
          reason: result.reason,
        });

        if (rules.includes('Bank Standardize') && result.isValid) {
          banksStandardizedCount++;
        }
      }

      for (const rule of rules) {
        if (!logTracker[header][rule]) {
          logTracker[header][rule] = { changed: 0, invalid: 0 };
        }
        if (result.isModified) {
          logTracker[header][rule].changed++;
        }
        if (!result.isValid) {
          logTracker[header][rule].invalid++;
        }
      }

      cleanedRow.push(result.cleanedValue);
      valRow.push(result);
    }

    cleanedRows.push(cleanedRow);
    validationGrid.push(valRow);
  }

  // Separate rows into 1. Correct (100% Valid, zero blanks, zero errors) and 2. Incorrect
  const correctRows: any[][] = [];
  const incorrectRows: any[][] = [];
  const correctValidationGrid: (CellValidationDetail | null)[][] = [];
  const incorrectValidationGrid: (CellValidationDetail | null)[][] = [];

  for (let r = 0; r < cleanedRows.length; r++) {
    const row = cleanedRows[r];
    const vRow = validationGrid[r];
    const isRowIncorrect = vRow.some((cell) => cell && !cell.isValid);

    if (isRowIncorrect) {
      incorrectRows.push(row);
      incorrectValidationGrid.push(vRow);
    } else {
      correctRows.push(row);
      correctValidationGrid.push(vRow);
    }
  }

  const processingLogs: ProcessingLogItem[] = [];
  for (const col of activeHeaders) {
    const rules = columnRules[col] || [];
    for (const rule of rules) {
      const stats = logTracker[col]?.[rule] || { changed: 0, invalid: 0 };
      processingLogs.push({
        column: col,
        rule,
        changedCells: stats.changed,
        invalidCells: stats.invalid,
      });
    }
  }

  const qualityReport: DataQualityReport = {
    totalRows: cleanedRows.length,
    totalColumns: activeHeaders.length,
    cellsProcessed,
    blankCells: blankCellsCount,
    duplicateRows: duplicateCount,
    invalidMobile: invalidMobileCount,
    invalidIFSC: invalidIFSCCount,
    invalidAadhaar: invalidAadhaarCount,
    invalidDates: invalidDatesCount,
    invalidAmounts: invalidAmountsCount,
    banksStandardized: banksStandardizedCount,
    changedCellsCount: changedRecords.length,
    columnBlankStats,
  };

  return {
    cleanedHeaders: activeHeaders,
    cleanedRows,
    validationGrid,
    correctRows,
    incorrectRows,
    correctValidationGrid,
    incorrectValidationGrid,
    qualityReport,
    processingLogs,
    changedRecords,
  };
}

/**
 * Re-validates a single cell edit and updates dataset immediately
 */
export function updateCellInDataset(
  headers: string[],
  rows: any[][],
  validationGrid: (CellValidationDetail | null)[][],
  rowIndex: number,
  colIndex: number,
  newValue: any,
  columnRules: ColumnRuleMap,
  bankMappings: BankMapping
): {
  updatedRows: any[][];
  updatedValidationGrid: (CellValidationDetail | null)[][];
  correctRows: any[][];
  incorrectRows: any[][];
  correctValidationGrid: (CellValidationDetail | null)[][];
  incorrectValidationGrid: (CellValidationDetail | null)[][];
  updatedDetail: CellValidationDetail;
} {
  const updatedRows = rows.map((r) => [...r]);
  const updatedValidationGrid = validationGrid.map((vr) => [...vr]);

  const header = headers[colIndex];
  const rules = columnRules[header] || [];
  const validationRes = cleanCellValue(newValue, rules, bankMappings, header);

  updatedRows[rowIndex][colIndex] = validationRes.cleanedValue;
  updatedValidationGrid[rowIndex][colIndex] = validationRes;

  const correctRows: any[][] = [];
  const incorrectRows: any[][] = [];
  const correctValidationGrid: (CellValidationDetail | null)[][] = [];
  const incorrectValidationGrid: (CellValidationDetail | null)[][] = [];

  for (let r = 0; r < updatedRows.length; r++) {
    const row = updatedRows[r];
    const vRow = updatedValidationGrid[r];
    const isRowIncorrect = vRow.some((cell) => cell && !cell.isValid);

    if (isRowIncorrect) {
      incorrectRows.push(row);
      incorrectValidationGrid.push(vRow);
    } else {
      correctRows.push(row);
      correctValidationGrid.push(vRow);
    }
  }

  return {
    updatedRows,
    updatedValidationGrid,
    correctRows,
    incorrectRows,
    correctValidationGrid,
    incorrectValidationGrid,
    updatedDetail: validationRes,
  };
}
