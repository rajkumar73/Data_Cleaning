import { CleaningRule, ColumnRuleMap } from '../types/dataCleaner';

// Mandatory columns that must never be converted to Number
export const MANDATORY_TEXT_COLUMNS = new Set([
  'gat_number',
  'gat no',
  'gat number',
  'survey no',
  'survey number',
  'farmers_aadhaar_no',
  'aadhaar',
  'aadhaar no',
  'aadhaar number',
  'aadhar',
  'saving_a_c_no',
  'account no',
  'account number',
  'saving account no',
  'savings account number',
  'branch_ifsc_code',
  'ifsc',
  'ifsc code',
  'mobile_no',
  'mobile',
  'mobile no',
  'mobile number',
  'phone',
  'contact number',
]);

interface ColumnPattern {
  canonicalName: string;
  aliases: string[];
  rules: CleaningRule[];
}

const COLUMN_PATTERNS: ColumnPattern[] = [
  {
    canonicalName: 'Sr.No',
    aliases: ['sr.no', 'sr no', 'sr_no', 's.no', 's no', 's_no', 'serial no', 'serial number', 'srnum'],
    rules: ['Number'],
  },
  {
    canonicalName: 'Farmers_District',
    aliases: ['farmers_district', 'farmers district', 'farmer district', 'district', 'district name'],
    rules: ['Trim', 'Proper'],
  },
  {
    canonicalName: 'Farmers_Taluka',
    aliases: ['farmers_taluka', 'farmers taluka', 'farmer taluka', 'taluka', 'tehsil', 'tahsil', 'taluk'],
    rules: ['Trim', 'Proper'],
  },
  {
    canonicalName: 'Farmers_Village',
    aliases: ['farmers_village', 'farmers village', 'farmer village', 'village', 'village name', 'gram', 'gaon'],
    rules: ['Trim', 'Proper'],
  },
  {
    canonicalName: 'Gat_Number',
    aliases: ['gat_number', 'gat no', 'gat number', 'gat_no', 'survey no', 'survey number', 'khasra no', 'gut no'],
    rules: ['Trim', 'Text'],
  },
  {
    canonicalName: 'Type_of_Loss',
    aliases: ['type_of_loss', 'type of loss', 'loss type', 'loss', 'nature of loss', 'crop loss'],
    rules: ['Trim', 'Proper'],
  },
  {
    canonicalName: 'Affected_Area_Hectares',
    aliases: ['affected_area_hectares', 'affected area', 'affected area hectares', 'area hectares', 'affected_area', 'area (ha)', 'area in hectare'],
    rules: ['Trim', 'Number'],
  },
  {
    canonicalName: 'Amount_Disbursed',
    aliases: ['amount_disbursed', 'amount disbursed', 'disbursed amount', 'payment', 'amount_paid', 'amount paid', 'amount', 'balance', 'total', 'subsidy amount', 'grant amount'],
    rules: ['Trim', 'Amount'],
  },
  {
    canonicalName: 'Name_of_the_Farmer',
    aliases: ['name_of_the_farmer', 'farmer name', 'name', 'name of farmer', 'farmers name', 'applicant name', 'beneficiary name', 'full name', 'customer name'],
    rules: ['Trim', 'Proper'],
  },
  {
    canonicalName: 'Farmers_Aadhaar_No',
    aliases: ['farmers_aadhaar_no', 'farmers aadhaar no', 'aadhaar', 'aadhaar no', 'aadhaar number', 'aadhar', 'aadhar no', 'aadhar number', 'uid', 'aadhaar_no', 'aadhar_no'],
    rules: ['Trim', 'Text', 'Aadhaar(12)'],
  },
  {
    canonicalName: 'Bank_Name',
    aliases: ['bank_name', 'bank', 'bank name', 'farmer bank', 'dbt bank', 'financial institution'],
    rules: ['Trim', 'Bank Standardize'],
  },
  {
    canonicalName: 'Saving_A_C_No',
    aliases: ['saving_a_c_no', 'account no', 'account number', 'a/c no', 'a/c number', 'saving account no', 'savings account number', 'bank account no', 'acc no', 'bank a/c no'],
    rules: ['Trim', 'Text'],
  },
  {
    canonicalName: 'Branch_IFSC_Code',
    aliases: ['branch_ifsc_code', 'ifsc', 'ifsc code', 'branch ifsc', 'branch ifsc code', 'ifsc_code', 'bank ifsc'],
    rules: ['Trim', 'UPPER', 'Text', 'IFSC(11)'],
  },
  {
    canonicalName: 'Mobile_No',
    aliases: ['mobile_no', 'mobile', 'mobile no', 'mobile number', 'phone', 'phone number', 'contact', 'contact number', 'cell'],
    rules: ['Trim', 'Text', 'Mobile(10)'],
  },
  {
    canonicalName: 'Date',
    aliases: ['date', 'date of birth', 'dob', 'payment date', 'transaction date', 'start date', 'end date', 'disbursal date', 'created date'],
    rules: ['Date(dd/mm/yyyy)'],
  },
];

function normalizeColName(name: string): string {
  return name.trim().toLowerCase().replace(/[_\s\-\.\/]+/g, ' ');
}

export function detectRulesForColumn(columnName: string): CleaningRule[] {
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
  if (normalized.includes('mobile') || normalized.includes('phone') || normalized.includes('contact')) {
    return ['Trim', 'Text', 'Mobile(10)'];
  }
  if (normalized.includes('aadhaar') || normalized.includes('aadhar') || normalized.includes('uid')) {
    return ['Trim', 'Text', 'Aadhaar(12)'];
  }
  if (normalized.includes('ifsc')) {
    return ['Trim', 'UPPER', 'Text', 'IFSC(11)'];
  }
  if (normalized.includes('bank') && !normalized.includes('account')) {
    return ['Trim', 'Bank Standardize'];
  }
  if (normalized.includes('account') || normalized.includes('a/c') || normalized.includes('acct')) {
    return ['Trim', 'Text'];
  }
  if (normalized.includes('amount') || normalized.includes('balance') || normalized.includes('payment') || normalized.includes('price') || normalized.includes('fee')) {
    return ['Trim', 'Amount'];
  }
  if (normalized.includes('date') || normalized.includes('dob')) {
    return ['Date(dd/mm/yyyy)'];
  }
  if (normalized.includes('name')) {
    return ['Trim', 'Proper'];
  }

  // Default safe text rule
  return ['Trim'];
}

export function autoDetectAllColumns(headers: string[]): ColumnRuleMap {
  const result: ColumnRuleMap = {};
  for (const header of headers) {
    result[header] = detectRulesForColumn(header);
  }
  return result;
}

export function isColumnLockedAsText(columnName: string): boolean {
  const norm = normalizeColName(columnName);
  return MANDATORY_TEXT_COLUMNS.has(norm) ||
    norm.includes('aadhaar') ||
    norm.includes('aadhar') ||
    norm.includes('account') ||
    norm.includes('ifsc') ||
    norm.includes('mobile') ||
    norm.includes('gat');
}
