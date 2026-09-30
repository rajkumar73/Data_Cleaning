import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { FileItem } from '../types/dataCleaner';

/**
 * Parse an Excel file (.xlsx, .xls) into 2D array
 */
export async function parseExcelFile(file: File): Promise<{ headers: string[]; rows: any[][] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        // Parse with raw = true or string formatting so leading zeros are preserved
        const workbook = XLSX.read(buffer, {
          type: 'array',
          cellDates: true,
          raw: false, // Reads formatted string representation to preserve leading zeros in codes
        });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('Excel workbook contains no sheets.');
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        if (!worksheet) {
          throw new Error(`Sheet "${firstSheetName}" is empty.`);
        }

        // Convert sheet to array of arrays
        const rawJson: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          blankrows: false,
          raw: false,
        });

        if (rawJson.length === 0) {
          throw new Error('Spreadsheet has no data.');
        }

        // Header row
        const headers = rawJson[0].map((h, i) => (h ? String(h).trim() : `Column_${i + 1}`));
        // Data rows
        const rows = rawJson.slice(1).filter((r) => r.some((c) => c !== '' && c !== null && c !== undefined));

        resolve({ headers, rows });
      } catch (err: any) {
        if (err.message && err.message.toLowerCase().includes('password')) {
          reject(new Error('This Excel file is password-protected. Please remove the password and retry.'));
        } else {
          reject(new Error(`Failed to parse Excel file: ${err.message || 'Corrupted file'}`));
        }
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file from disk.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse a CSV file into 2D array using PapaParse
 */
export async function parseCsvFile(file: File): Promise<{ headers: string[]; rows: any[][] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      skipEmptyLines: 'greedy',
      dynamicTyping: false, // Keep as strings to preserve leading zeroes!
      complete: (results) => {
        if (results.errors && results.errors.length > 0 && results.data.length === 0) {
          reject(new Error(`CSV parse error: ${results.errors[0].message}`));
          return;
        }

        const rawData = results.data as string[][];
        if (rawData.length === 0) {
          reject(new Error('CSV file is empty.'));
          return;
        }

        const headers = rawData[0].map((h, i) => (h ? String(h).trim() : `Column_${i + 1}`));
        const rows = rawData.slice(1).filter((r) => r.some((c) => c !== '' && c !== null && c !== undefined));

        resolve({ headers, rows });
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}

/**
 * Parse any supported File object
 */
export async function parseDataFile(file: File, relativePath?: string): Promise<FileItem> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const fileType: 'XLSX' | 'XLS' | 'CSV' =
    extension === 'csv' ? 'CSV' : extension === 'xls' ? 'XLS' : 'XLSX';

  let parsed: { headers: string[]; rows: any[][] };

  if (fileType === 'CSV') {
    parsed = await parseCsvFile(file);
  } else {
    parsed = await parseExcelFile(file);
  }

  const id = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  return {
    id,
    name: file.name,
    size: file.size,
    type: fileType,
    relativePath: relativePath || file.webkitRelativePath || file.name,
    rowsCount: parsed.rows.length,
    colsCount: parsed.headers.length,
    headers: parsed.headers,
    originalData: parsed.rows,
    status: 'Ready',
    progress: 0,
  };
}

/**
 * Create a realistic Maharashtra Farmer DBT sample dataset
 */
export function createSampleFarmerFile(): FileItem {
  const headers = [
    'Sr.No',
    'Farmers_District',
    'Farmers_Taluka',
    'Farmers_Village',
    'Gat_Number',
    'Type_of_Loss',
    'Affected_Area_Hectares',
    'Amount_Disbursed',
    'Name_of_the_Farmer',
    'Farmers_Aadhaar_No',
    'Bank_Name',
    'Saving_A_C_No',
    'Branch_IFSC_Code',
    'Mobile_No',
  ];

  const rows = [
    [
      1,
      'Solapur',
      'Mangalwedha',
      'RAHATEWADI',
      '0056', // Test leading zeroes preservation
      'crop of loss',
      0.8,
      '₹ 18,000.00',
      'PRABHAVATI VILAS PAWAR',
      '591808785834',
      'D.C.C BRAMHAPURI',
      '00210602840004209', // Test leading zeros
      'GSCBOCHND06', // Test IFSC typo: 5th char 'O' instead of '0' (will be auto-corrected!)
      '9716319696',
    ],
    [
      2,
      'Nanded',
      'LOHA',
      'SONKHED',
      '0124',
      'excess rainfall',
      1.5,
      'Rs. 25,000',
      'RAMESHWAR SHIVAJI JADHAV',
      '489102938475',
      'S.B.I.',
      '003920194857211',
      'SBINO000344', // Test IFSC typo: 5th char 'O' instead of '0' (will be auto-corrected to Bramhapuri SBI!)
      '9822345678',
    ],
    [
      3,
      'beed',
      'ashti',
      'dhamangaon',
      '45',
      'drought',
      2.0,
      '30000.50',
      'ANITA BALASAHEB SHINDE',
      '781920394812',
      'HDFC BANK LTD',
      '50100239485712',
      'HDFC0000123',
      '9421567890',
    ],
    [
      4,
      'Parbhani',
      'Jintur',
      'Bori',
      '0089',
      'flood',
      1.2,
      '₹ 22,500',
      'SANJAY DNYANOBA KALE',
      '12345', // Test INVALID Aadhaar (too short)
      'STATE BANK OF INDIA',
      '00112233445566',
      'SBIN0005678',
      '97163', // Test INVALID Mobile (too short)
    ],
    [
      5,
      'Osmanabad',
      'Tuljapur',
      'Kati',
      '0003',
      'pest attack',
      0.5,
      'Rs 8,500',
      'SUNITA VISHNU MORE',
      '998877665544',
      'MAHARASHTRA GRAMIN BANK',
      '0060123456789',
      'MAHG0001122',
      '8888765432',
    ],
    [
      6,
      'Jalna',
      'Ambad',
      'Shahagad',
      '102',
      'hailstorm',
      1.8,
      '₹ 27,000',
      'TUKARAM KASHINATH GAIKWAD',
      '334455667788',
      'ICICI BANK',
      '000105001234',
      'ICIC0000001',
      '7777123456',
    ],
    [
      7,
      'Latur',
      'Ausa',
      'Matola',
      '0077',
      'crop of loss',
      0.9,
      'INVALID_AMT', // Test INVALID Amount
      'VILAS BHAGWAN CHAVAN',
      '665544332211',
      'AXIS BANK LTD',
      '912010023456789',
      'INVALID_IFSC', // Test INVALID IFSC
      '1234567890', // Test INVALID Mobile (starts with 1)
    ],
    [
      8,
      'Satara',
      'Koregaon',
      'Rahimatpur',
      '0045',
      'heavy rain',
      1.1,
      '₹ 16,500',
      'SHIVAJI ANANDRAO PATIL',
      '', // Test EMPTY/BLANK Aadhaar - Must go to incorrect file!
      'BANK OF MAHARASHTRA',
      '60123456789',
      'MAHB0000123',
      '9822112233',
    ],
    [
      9,
      'Kolhapur',
      'Shirol',
      'Kurundwad',
      '0112',
      'flood loss',
      2.4,
      '₹ 36,000',
      'BABURAO GANPATI MANE',
      '889900112233',
      'STATE BANK OF INDIA',
      '', // Test EMPTY/BLANK Bank Account - Must go to incorrect file!
      'SBIN0000456',
      '9977889900',
    ],
    [
      10,
      'Solapur',
      'Mangalwedha',
      'RAHATEWADI',
      '0056',
      'crop of loss',
      0.8,
      '₹ 18,000.00',
      'PRABHAVATI VILAS PAWAR',
      '591808785834',
      'D.C.C BRAMHAPURI',
      '00210602840004209',
      'YESB0DSC001',
      '9716319696',
    ], // Duplicate row to test duplicate detection!
  ];

  return {
    id: `sample_${Date.now()}`,
    name: 'Maharashtra_Farmers_CropLoss_Data.xlsx',
    size: 24580,
    type: 'XLSX',
    relativePath: 'Maharashtra_Farmers_CropLoss_Data.xlsx',
    rowsCount: rows.length,
    colsCount: headers.length,
    headers,
    originalData: rows,
    status: 'Ready',
    progress: 0,
  };
}
