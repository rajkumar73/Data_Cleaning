import { CleaningRule, ColumnRuleMap } from '../types/dataCleaner';

// Mandatory columns that must never be converted to Number (to preserve leading zeroes and exact formats)
export const MANDATORY_TEXT_COLUMNS = new Set([
  'gat_number',
  'gat no',
  'gat number',
  'gat_no',
  'survey no',
  'survey number',
  'khasra no',
  'gut no',
  'farmers_aadhaar_no',
  'aadhaar',
  'aadhaar no',
  'aadhaar number',
  'aadhar',
  'aadhar no',
  'aadhar number',
  'uid',
  'saving_a_c_no',
  'account no',
  'account number',
  'saving account no',
  'savings account number',
  'bank account no',
  'a/c no',
  'branch_ifsc_code',
  'ifsc',
  'ifsc code',
  'mobile_no',
  'mobile',
  'mobile no',
  'mobile number',
  'phone',
  'contact number',
  'आधार',
  'मोबाईल',
  'खाते',
  'आयएफएससी',
  'गट',
]);

interface ColumnPattern {
  canonicalName: string;
  aliases: string[];
  rules: CleaningRule[];
}

/**
 * Multilingual aliases covering English, Marathi, and Hindi column naming conventions
 * across Government, Revenue, DBT, Agriculture, and Banking Excel formats.
 * Works for any number of columns (3, 5, 10, 25, 50+ columns).
 * 100% Offline, Zero API Key required.
 */
const COLUMN_PATTERNS: ColumnPattern[] = [
  {
    canonicalName: 'Sr.No',
    aliases: [
      'sr.no', 'sr no', 'sr_no', 's.no', 's no', 's_no', 'serial no', 'serial number', 'srnum', 'sr', 'id',
      'अ.क्र', 'अ.क्र.', 'अनुक्रमांक', 'अनु क्र', 'क्र', 'क्रमांक', 'नंबर', 'sr_num'
    ],
    rules: ['Number'],
  },
  {
    canonicalName: 'Farmers_District',
    aliases: [
      'farmers_district', 'farmers district', 'farmer district', 'district', 'district name', 'dist',
      'जिल्हा', 'जिल्ह्याचे नाव', 'जिल्हा नाव'
    ],
    rules: ['Trim', 'Proper'],
  },
  {
    canonicalName: 'Farmers_Taluka',
    aliases: [
      'farmers_taluka', 'farmers taluka', 'farmer taluka', 'taluka', 'tehsil', 'tahsil', 'taluk',
      'तालुका', 'तहसील'
    ],
    rules: ['Trim', 'Proper'],
  },
  {
    canonicalName: 'Farmers_Village',
    aliases: [
      'farmers_village', 'farmers village', 'farmer village', 'village', 'village name', 'gram', 'gaon',
      'गाव', 'गावाचे नाव', 'ग्राम'
    ],
    rules: ['Trim', 'Proper'],
  },
  {
    canonicalName: 'Gat_Number',
    aliases: [
      'gat_number', 'gat no', 'gat number', 'gat_no', 'survey no', 'survey number', 'khasra no', 'gut no', 'survey_no', 'gat',
      'गट नंबर', 'गट क्र', 'गट क्रमांक', 'सर्व्हे नंबर', 'सर्व्हे क्र', 'खसरा क्र'
    ],
    rules: ['Trim', 'Text'],
  },
  {
    canonicalName: 'Type_of_Loss',
    aliases: [
      'type_of_loss', 'type of loss', 'loss type', 'loss', 'nature of loss', 'crop loss', 'reason', 'calamity',
      'नुकसानीचे स्वरूप', 'नुकसानीचा प्रकार', 'आपत्ती प्रकार'
    ],
    rules: ['Trim', 'Proper'],
  },
  {
    canonicalName: 'Affected_Area_Hectares',
    aliases: [
      'affected_area_hectares', 'affected area', 'affected area hectares', 'area hectares', 'affected_area',
      'area (ha)', 'area in hectare', 'area', 'hectares', 'ha', 'guntha', 'acre',
      'बाधित क्षेत्र', 'क्षेत्र', 'हेक्टर', 'आर', 'क्षेत्र हेक्टर', 'एकूण क्षेत्र'
    ],
    rules: ['Trim', 'Number'],
  },
  {
    canonicalName: 'Amount_Disbursed',
    aliases: [
      'amount_disbursed', 'amount disbursed', 'disbursed amount', 'payment', 'amount_paid', 'amount paid',
      'amount', 'balance', 'total', 'subsidy amount', 'grant amount', 'compensation', 'sanctioned amount',
      'रक्कम', 'अनुदान', 'अनुदान रक्कम', 'मंजूर रक्कम', 'देय रक्कम', 'नुकसान भरपाई', 'हप्ता', 'एकूण रक्कम'
    ],
    rules: ['Trim', 'Amount'],
  },
  {
    canonicalName: 'Name_of_the_Farmer',
    aliases: [
      'name_of_the_farmer', 'farmer name', 'name', 'name of farmer', 'farmers name', 'applicant name',
      'beneficiary name', 'full name', 'customer name', 'account holder name',
      'शेतकऱ्याचे नाव', 'खातेदाराचे नाव', 'लाभार्थ्याचे नाव', 'अर्जदाराचे नाव', 'पूर्ण नाव', 'नाव'
    ],
    rules: ['Trim', 'Proper'],
  },
  {
    canonicalName: 'Farmers_Aadhaar_No',
    aliases: [
      'farmers_aadhaar_no', 'farmers aadhaar no', 'aadhaar', 'aadhaar no', 'aadhaar number', 'aadhar',
      'aadhar no', 'aadhar number', 'uid', 'aadhaar_no', 'aadhar_no', 'uidai',
      'आधार नंबर', 'आधार क्रमांक', 'आधार क्र', 'आधार कार्ड', 'आधार'
    ],
    rules: ['Trim', 'Text', 'Aadhaar(12)'],
  },
  {
    canonicalName: 'Bank_Name',
    aliases: [
      'bank_name', 'bank', 'bank name', 'farmer bank', 'dbt bank', 'financial institution',
      'बँक', 'बँकेचे नाव', 'बँक नाव'
    ],
    rules: ['Trim', 'Bank Standardize'],
  },
  {
    canonicalName: 'Branch_Name',
    aliases: [
      'branch_name', 'branch', 'bank branch', 'branch name',
      'शाखा', 'बँक शाखा', 'शाखेचे नाव'
    ],
    rules: ['Trim', 'Proper'],
  },
  {
    canonicalName: 'Saving_A_C_No',
    aliases: [
      'saving_a_c_no', 'account no', 'account number', 'a/c no', 'a/c number', 'saving account no',
      'savings account number', 'bank account no', 'acc no', 'bank a/c no', 'account_no', 'ac_no',
      'बँक खाते क्रमांक', 'खाते क्रमांक', 'खाते क्र', 'बँक खाते नंबर', 'खाते'
    ],
    rules: ['Trim', 'Text'],
  },
  {
    canonicalName: 'Branch_IFSC_Code',
    aliases: [
      'branch_ifsc_code', 'ifsc', 'ifsc code', 'branch ifsc', 'branch ifsc code', 'ifsc_code', 'bank ifsc',
      'आयएफएससी', 'आय.एफ.एस.सी.', 'आयएफएससी कोड', 'ifsc_code'
    ],
    rules: ['Trim', 'UPPER', 'Text', 'IFSC(11)'],
  },
  {
    canonicalName: 'Mobile_No',
    aliases: [
      'mobile_no', 'mobile', 'mobile no', 'mobile number', 'phone', 'phone number', 'contact', 'contact number', 'cell',
      'मोबाईल', 'मोबाईल नंबर', 'भ्रमणध्वनी', 'फोन', 'फोन नंबर', 'संपर्क क्रमांक'
    ],
    rules: ['Trim', 'Text', 'Mobile(10)'],
  },
  {
    canonicalName: 'Date',
    aliases: [
      'date', 'date of birth', 'dob', 'payment date', 'transaction date', 'start date', 'end date', 'disbursal date', 'created date',
      'तारीख', 'दिनांक', 'जन्म दिनांक', 'पेमेंट तारीख'
    ],
    rules: ['Date(dd/mm/yyyy)'],
  },
];

function normalizeColName(name: string): string {
  return name.trim().toLowerCase().replace(/[_\s\-\.\/]+/g, ' ');
}

/**
 * Fast local regex and keyword heuristics for header names
 */
export function detectRulesFromHeaderOnly(columnName: string): CleaningRule[] | null {
  const normalized = normalizeColName(columnName);

  for (const pattern of COLUMN_PATTERNS) {
    if (normalizeColName(pattern.canonicalName) === normalized) {
      return [...pattern.rules];
    }
    for (const alias of pattern.aliases) {
      if (normalizeColName(alias) === normalized) {
        return [...pattern.rules];
      }
    }
  }

  // Fallback heuristic keyword matches
  if (/mobile|phone|contact|cell|मोबाईल|भ्रमणध्वनी|फोन/i.test(normalized)) {
    return ['Trim', 'Text', 'Mobile(10)'];
  }
  if (/aadhaar|aadhar|uid|आधार/i.test(normalized)) {
    return ['Trim', 'Text', 'Aadhaar(12)'];
  }
  if (/ifsc|आयएफएससी/i.test(normalized)) {
    return ['Trim', 'UPPER', 'Text', 'IFSC(11)'];
  }
  if (/branch|शाखा/i.test(normalized)) {
    return ['Trim', 'Proper'];
  }
  if (/bank|बँक/i.test(normalized) && !/account|खाते|a\/c|acc/i.test(normalized)) {
    return ['Trim', 'Bank Standardize'];
  }
  if (/account|खाते|acc|a\/c/i.test(normalized)) {
    return ['Trim', 'Text'];
  }
  if (/gat|survey|khasra|गट|सर्व्हे/i.test(normalized)) {
    return ['Trim', 'Text'];
  }
  if (/amount|balance|payment|price|fee|subsidy|grant|रक्कम|अनुदान|हप्ता|भरपाई/i.test(normalized)) {
    return ['Trim', 'Amount'];
  }
  if (/area|hectare|हेक्टर|क्षेत्र|आर/i.test(normalized)) {
    return ['Trim', 'Number'];
  }
  if (/date|dob|तारीख|दिनांक/i.test(normalized)) {
    return ['Date(dd/mm/yyyy)'];
  }
  if (/name|farmer|नाव|शेतकरी|लाभार्थी/i.test(normalized)) {
    return ['Trim', 'Proper'];
  }
  if (/sr|serial|अनुक्रमांक|अ\.क्र|क्रमांक/i.test(normalized)) {
    return ['Number'];
  }

  return null;
}

/**
 * Deep Data Content Inspection Engine (100% Client-Side, Zero API Key)
 * Inspects actual row values in this column to detect semantic type:
 * Mobile, Aadhaar, IFSC, Bank, Date, Currency/Amount, Account/ID, Number, or Text.
 */
export function detectRulesFromDataValues(sampleValues: any[]): CleaningRule[] | null {
  const nonNulls = sampleValues
    .map((v) => (v !== null && v !== undefined ? String(v).trim() : ''))
    .filter((v) => v.length > 0);

  if (nonNulls.length === 0) return null;

  let mobileCount = 0;
  let aadhaarCount = 0;
  let ifscCount = 0;
  let dateCount = 0;
  let amountCount = 0;
  let bankKeywordCount = 0;
  let leadingZeroCount = 0;
  let pureNumberCount = 0;

  const total = nonNulls.length;

  for (const val of nonNulls) {
    const raw = val.replace(/\s+/g, '');
    const cleanNum = val.replace(/[₹\$\,\s]/g, '').replace(/\b(?:rs|inr)\.?\b/gi, '').trim();

    // 1. Mobile Check (10 digits starting with 6-9, or 12 digits starting with 91, or 11 with 0)
    if (/^[6-9]\d{9}$/.test(raw) || /^91[6-9]\d{9}$/.test(raw) || /^0[6-9]\d{9}$/.test(raw)) {
      mobileCount++;
    }

    // 2. Aadhaar Check (12 digits, or 4-4-4 format)
    const digitsOnly = val.replace(/\D/g, '');
    if (digitsOnly.length === 12 && (/^\d{12}$/.test(raw) || /^\d{4}\s\d{4}\s\d{4}$/.test(val))) {
      aadhaarCount++;
    }

    // 3. IFSC Check (4 letters, 0 or O, 6 alphanumeric)
    if (/^[A-Z]{4}[0O][A-Z0-9]{6}$/i.test(raw)) {
      ifscCount++;
    }

    // 4. Date Check (DD/MM/YYYY or YYYY-MM-DD)
    if (/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}$/.test(val) || /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/.test(val)) {
      dateCount++;
    }

    // 5. Amount / Currency Check (contains ₹, Rs., or decimal numbers with 2 places)
    if (/[₹\$]|\b(?:rs|inr)\b/i.test(val) || (/^\d+(\.\d{1,2})$/.test(cleanNum) && parseFloat(cleanNum) > 100)) {
      amountCount++;
    }

    // 6. Bank Name keywords
    if (/\b(?:sbi|bom|bob|pnb|hdfc|icici|axis|dcc|gramin|bank|बँक)\b/i.test(val)) {
      bankKeywordCount++;
    }

    // 7. String with leading zeroes (account numbers or gat numbers like '0056', '012')
    if (/^0\d+$/.test(raw)) {
      leadingZeroCount++;
    }

    // 8. Pure numbers (e.g. area 1.5, serial 1, 2)
    if (/^-?\d+(\.\d+)?$/.test(cleanNum)) {
      pureNumberCount++;
    }
  }

  // Evaluate detection thresholds (>40% of non-empty sample values match)
  if (mobileCount / total >= 0.4) {
    return ['Trim', 'Text', 'Mobile(10)'];
  }
  if (aadhaarCount / total >= 0.4) {
    return ['Trim', 'Text', 'Aadhaar(12)'];
  }
  if (ifscCount / total >= 0.4) {
    return ['Trim', 'UPPER', 'Text', 'IFSC(11)'];
  }
  if (bankKeywordCount / total >= 0.4) {
    return ['Trim', 'Bank Standardize'];
  }
  if (dateCount / total >= 0.4) {
    return ['Date(dd/mm/yyyy)'];
  }
  if (amountCount / total >= 0.4) {
    return ['Trim', 'Amount'];
  }
  // Leading zeros or long numeric strings (Accounts / Gat numbers) -> Must remain Text to prevent Excel data loss!
  if (leadingZeroCount / total >= 0.25) {
    return ['Trim', 'Text'];
  }
  if (pureNumberCount / total >= 0.75) {
    return ['Trim', 'Number'];
  }

  // Default text formatting
  return ['Trim', 'Proper'];
}

/**
 * Smart Hybrid Column Rule Detector:
 * Combines header name heuristics + deep data value pattern inspection.
 * Works adaptively whether the file has 3 columns, 10 columns, 20 columns, or 50 columns.
 * Zero API keys, 100% offline.
 */
export function detectRulesForColumn(columnName: string, sampleValues?: any[]): CleaningRule[] {
  // First check header name
  const headerRules = detectRulesFromHeaderOnly(columnName);

  // If header provided strong domain rule (like IFSC, Mobile, Aadhaar, Bank), return it
  if (headerRules) {
    return headerRules;
  }

  // If data values are provided, inspect them
  if (sampleValues && sampleValues.length > 0) {
    const dataRules = detectRulesFromDataValues(sampleValues);
    if (dataRules) {
      return dataRules;
    }
  }

  // Safe fallback
  return ['Trim'];
}

/**
 * Auto-detects cleaning rules for all columns dynamically.
 * Accepts any number of columns (less or more than 10).
 * Inspects sample rows up to first 100 rows for high accuracy.
 */
export function autoDetectAllColumns(
  headers: string[],
  sampleRows?: any[][]
): ColumnRuleMap {
  const result: ColumnRuleMap = {};

  for (let colIdx = 0; colIdx < headers.length; colIdx++) {
    const header = headers[colIdx];

    // Extract sample values for this specific column
    let colSampleValues: any[] = [];
    if (sampleRows && sampleRows.length > 0) {
      const limit = Math.min(sampleRows.length, 100);
      for (let r = 0; r < limit; r++) {
        if (sampleRows[r] && colIdx < sampleRows[r].length) {
          colSampleValues.push(sampleRows[r][colIdx]);
        }
      }
    }

    result[header] = detectRulesForColumn(header, colSampleValues);
  }

  return result;
}

export function isColumnLockedAsText(columnName: string): boolean {
  const norm = normalizeColName(columnName);
  return (
    MANDATORY_TEXT_COLUMNS.has(norm) ||
    norm.includes('aadhaar') ||
    norm.includes('aadhar') ||
    norm.includes('account') ||
    norm.includes('ifsc') ||
    norm.includes('mobile') ||
    norm.includes('gat') ||
    norm.includes('आधार') ||
    norm.includes('मोबाईल') ||
    norm.includes('खाते')
  );
}
