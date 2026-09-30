export type CleaningRule =
  | 'Trim'
  | 'Clean'
  | 'Proper'
  | 'UPPER'
  | 'lower'
  | 'Text'
  | 'Number'
  | 'Bank Standardize'
  | 'Mobile(10)'
  | 'IFSC(11)'
  | 'Aadhaar(12)'
  | 'Amount'
  | 'Date(dd/mm/yyyy)';

export const ALL_CLEANING_RULES: CleaningRule[] = [
  'Trim',
  'Clean',
  'Proper',
  'UPPER',
  'lower',
  'Text',
  'Number',
  'Bank Standardize',
  'Mobile(10)',
  'IFSC(11)',
  'Aadhaar(12)',
  'Amount',
  'Date(dd/mm/yyyy)',
];

export type ColumnRuleMap = {
  [columnName: string]: CleaningRule[];
};

export interface CellValidationDetail {
  isValid: boolean;
  reason?: string;
  originalValue: any;
  cleanedValue: any;
  isModified: boolean;
}

export interface ColumnBlankStat {
  column: string;
  blankCount: number;
  blankPercent: number;
}

export interface DataQualityReport {
  totalRows: number;
  totalColumns: number;
  cellsProcessed: number;
  blankCells: number;
  duplicateRows: number;
  invalidMobile: number;
  invalidIFSC: number;
  invalidAadhaar: number;
  invalidDates: number;
  invalidAmounts: number;
  banksStandardized: number;
  changedCellsCount: number;
  columnBlankStats: ColumnBlankStat[];
}

export interface ProcessingLogItem {
  column: string;
  rule: string;
  changedCells: number;
  invalidCells: number;
}

export type FileStatus = 'Ready' | 'Processing' | 'Completed' | 'Failed' | 'Paused';

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: 'XLSX' | 'XLS' | 'CSV';
  relativePath?: string;
  rowsCount: number;
  colsCount: number;
  headers: string[];
  originalData: any[][];
  cleanedData?: any[][];
  validationGrid?: (CellValidationDetail | null)[][];
  correctRows?: any[][];
  incorrectRows?: any[][];
  correctValidationGrid?: (CellValidationDetail | null)[][];
  incorrectValidationGrid?: (CellValidationDetail | null)[][]
  correctBlob?: Blob;
  incorrectBlob?: Blob;
  correctFileName?: string;
  incorrectFileName?: string;
  correctCount?: number;
  incorrectCount?: number;
  status: FileStatus;
  progress: number;
  errorMessage?: string;
  qualityReport?: DataQualityReport;
  processingLogs?: ProcessingLogItem[];
  cleanedBlob?: Blob;
  outputFileName?: string;
}

export interface AppSettings {
  defaultOutputFormat: 'preserve' | 'xlsx' | 'csv';
  defaultDateFormat: string;
  autoDetectColumns: boolean;
  autoApplyDetectedRules: boolean;
  duplicateHandling: 'detect' | 'remove';
  removeBlankRows: boolean;
  removeBlankCols: boolean;
  highlightInvalidCells: boolean;
  darkMode: boolean;
  maxPreviewRows: number;
  conflictHandling: 'create_new' | 'overwrite' | 'skip';
  includeQualitySheet: boolean;
  includeLogSheet: boolean;
}

export type BankMapping = {
  [alias: string]: string;
};

export interface CleaningProfile {
  id: string;
  name: string;
  description: string;
  rules: ColumnRuleMap;
  isDefault?: boolean;
}

export interface ChangedCellRecord {
  rowIndex: number;
  colIndex: number;
  columnName: string;
  originalValue: any;
  cleanedValue: any;
  reason?: string;
}

export interface BankMasterEntry {
  id: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
  district?: string;
  city?: string;
  aliases?: string[];
}

export interface BankAutoCorrectDetail {
  rowIndex: number;
  farmerName?: string;
  originalBank: string;
  correctedBank: string;
  originalBranch?: string;
  correctedBranch?: string;
  originalIfsc: string;
  correctedIfsc: string;
  reason: string;
}

export interface BankAutoCorrectSummary {
  totalRowsExamined: number;
  totalRowsChanged: number;
  ifscCorrectedCount: number;
  bankNameCorrectedCount: number;
  branchUpdatedCount: number;
  details: BankAutoCorrectDetail[];
}
