import { AppSettings, BankMapping, CleaningProfile } from '../types/dataCleaner';

export const DEFAULT_BANK_MAPPINGS: BankMapping = {
  "SBI": "STATE BANK OF INDIA",
  "STATE BANK OF INDIA": "STATE BANK OF INDIA",
  "STATE BANK": "STATE BANK OF INDIA",
  "S.B.I.": "STATE BANK OF INDIA",
  "S.B.I": "STATE BANK OF INDIA",
  "SBI BANK": "STATE BANK OF INDIA",
  "HDFC": "HDFC BANK",
  "HDFC BANK": "HDFC BANK",
  "HDFC BANK LTD": "HDFC BANK",
  "ICICI": "ICICI BANK",
  "ICICI BANK": "ICICI BANK",
  "ICICI BANK LTD": "ICICI BANK",
  "AXIS": "AXIS BANK",
  "AXIS BANK": "AXIS BANK",
  "AXIS BANK LTD": "AXIS BANK",
  "BOB": "BANK OF BARODA",
  "BANK OF BARODA": "BANK OF BARODA",
  "B.O.B.": "BANK OF BARODA",
  "PNB": "PUNJAB NATIONAL BANK",
  "PUNJAB NATIONAL BANK": "PUNJAB NATIONAL BANK",
  "P.N.B.": "PUNJAB NATIONAL BANK",
  "BOI": "BANK OF INDIA",
  "BANK OF INDIA": "BANK OF INDIA",
  "B.O.I.": "BANK OF INDIA",
  "CANARA": "CANARA BANK",
  "CANARA BANK": "CANARA BANK",
  "UNION": "UNION BANK OF INDIA",
  "UNION BANK": "UNION BANK OF INDIA",
  "UNION BANK OF INDIA": "UNION BANK OF INDIA",
  "UBI": "UNION BANK OF INDIA",
  "YES": "YES BANK",
  "YES BANK": "YES BANK",
  "YES BANK LTD": "YES BANK",
  "BOM": "BANK OF MAHARASHTRA",
  "BANK OF MAHARASHTRA": "BANK OF MAHARASHTRA",
  "B.O.M.": "BANK OF MAHARASHTRA",
  "KOTAK": "KOTAK MAHINDRA BANK",
  "KOTAK MAHINDRA": "KOTAK MAHINDRA BANK",
  "KOTAK MAHINDRA BANK": "KOTAK MAHINDRA BANK",
  "IDBI": "IDBI BANK",
  "IDBI BANK": "IDBI BANK",
  "CENTRAL BANK": "CENTRAL BANK OF INDIA",
  "CENTRAL BANK OF INDIA": "CENTRAL BANK OF INDIA",
  "CBI": "CENTRAL BANK OF INDIA",
  "INDIAN BANK": "INDIAN BANK",
  "DCC": "DCC BANK",
  "D.C.C": "DCC BANK",
  "DCC BANK": "DCC BANK",
  "D.C.C BRAMHAPURI": "DCC BANK",
  "DCC BRAMHAPURI": "DCC BANK",
  "DISTRICT CENTRAL CO-OPERATIVE BANK": "DCC BANK",
  "DISTRICT CENTRAL CO-OP BANK": "DCC BANK",
  "MAHARASHTRA GRAMIN BANK": "MAHARASHTRA GRAMIN BANK",
  "MGB": "MAHARASHTRA GRAMIN BANK"
};

export const DEFAULT_SETTINGS: AppSettings = {
  defaultOutputFormat: 'preserve',
  defaultDateFormat: 'dd/mm/yyyy',
  autoDetectColumns: true,
  autoApplyDetectedRules: true,
  duplicateHandling: 'detect',
  removeBlankRows: false,
  removeBlankCols: false,
  highlightInvalidCells: true,
  darkMode: false,
  maxPreviewRows: 500,
  conflictHandling: 'create_new',
  includeQualitySheet: true,
  includeLogSheet: true,
};

export const DEFAULT_PROFILES: CleaningProfile[] = [
  {
    id: 'maharashtra_farmers_dbt',
    name: 'Maharashtra Farmer DBT / Crop Loss',
    description: 'Specialized profile for Indian agricultural subsidy, Gat No, Aadhaar, DBT Bank & IFSC data.',
    isDefault: true,
    rules: {
      'Sr.No': ['Number'],
      'Farmers_District': ['Trim', 'Proper'],
      'Farmers_Taluka': ['Trim', 'Proper'],
      'Farmers_Village': ['Trim', 'Proper'],
      'Gat_Number': ['Trim', 'Text'],
      'Type_of_Loss': ['Trim', 'Proper'],
      'Affected_Area_Hectares': ['Trim', 'Number'],
      'Amount_Disbursed': ['Trim', 'Amount'],
      'Name_of_the_Farmer': ['Trim', 'Proper'],
      'Farmers_Aadhaar_No': ['Trim', 'Text', 'Aadhaar(12)'],
      'Bank_Name': ['Trim', 'Bank Standardize'],
      'Saving_A_C_No': ['Trim', 'Text'],
      'Branch_IFSC_Code': ['Trim', 'UPPER', 'Text', 'IFSC(11)'],
      'Mobile_No': ['Trim', 'Text', 'Mobile(10)'],
    },
  },
  {
    id: 'general_banking_kyc',
    name: 'Banking KYC & Financial',
    description: 'For bank statements, customer accounts, phone, Aadhaar & amount validations.',
    isDefault: false,
    rules: {
      'Name': ['Trim', 'Proper'],
      'Mobile': ['Trim', 'Text', 'Mobile(10)'],
      'Bank Name': ['Trim', 'Bank Standardize'],
      'IFSC': ['Trim', 'UPPER', 'Text', 'IFSC(11)'],
      'Aadhaar': ['Trim', 'Text', 'Aadhaar(12)'],
      'Account Number': ['Trim', 'Text'],
      'Amount': ['Trim', 'Amount'],
      'Date': ['Date(dd/mm/yyyy)'],
    },
  },
];

const STORAGE_KEYS = {
  SETTINGS: 'ai_data_cleaner_settings',
  BANK_MAPPINGS: 'ai_data_cleaner_bank_mappings',
  PROFILES: 'ai_data_cleaner_profiles',
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function loadBankMappings(): BankMapping {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BANK_MAPPINGS);
    if (raw) {
      return { ...DEFAULT_BANK_MAPPINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load bank mappings:', e);
  }
  return DEFAULT_BANK_MAPPINGS;
}

export function saveBankMappings(mappings: BankMapping): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BANK_MAPPINGS, JSON.stringify(mappings));
  } catch (e) {
    console.error('Failed to save bank mappings:', e);
  }
}

export function loadProfiles(): CleaningProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load profiles:', e);
  }
  return DEFAULT_PROFILES;
}

export function saveProfiles(profiles: CleaningProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save profiles:', e);
  }
}
