import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import {
  BankAutoCorrectDetail,
  BankAutoCorrectSummary,
  BankMapping,
  BankMasterEntry,
} from '../types/dataCleaner';
import { normalizeBankNameForMatching, standardizeBankName } from './cleaningEngine';

export const BANK_MASTER_STORAGE_KEY = 'ai_data_cleaner_bank_master_directory';

/**
 * Default Master Bank & IFSC Directory covering Maharashtra & Indian banks
 * Preloaded so user has immediate working auto-correction without having to build from scratch
 */
export const DEFAULT_BANK_MASTER_DIRECTORY: BankMasterEntry[] = [
  // District Central Co-operative (DCC) Banks
  {
    id: 'dcc-bramhapuri',
    bankName: 'DCC BANK',
    branchName: 'BRAMHAPURI',
    ifscCode: 'GSCB0CHND06',
    district: 'Chandrapur',
    aliases: ['D.C.C BRAMHAPURI', 'DCC BRAMHAPURI', 'CHANDRAPUR DCC BRAMHAPURI', 'DCC BRHAMAPURI'],
  },
  {
    id: 'dcc-chandrapur-main',
    bankName: 'DCC BANK',
    branchName: 'CHANDRAPUR MAIN',
    ifscCode: 'GSCB0CHND01',
    district: 'Chandrapur',
    aliases: ['DCC CHANDRAPUR', 'CHANDRAPUR DCC', 'D.C.C CHANDRAPUR'],
  },
  {
    id: 'dcc-warora',
    bankName: 'DCC BANK',
    branchName: 'WARORA',
    ifscCode: 'GSCB0CHND02',
    district: 'Chandrapur',
    aliases: ['DCC WARORA', 'WARORA DCC'],
  },
  {
    id: 'dcc-nagpur-main',
    bankName: 'DCC BANK',
    branchName: 'NAGPUR MAIN',
    ifscCode: 'GSCB0NAGP01',
    district: 'Nagpur',
    aliases: ['NDCC', 'NAGPUR DCC', 'DCC NAGPUR'],
  },
  {
    id: 'dcc-pune-main',
    bankName: 'DCC BANK',
    branchName: 'PUNE MAIN',
    ifscCode: 'PDCC0000001',
    district: 'Pune',
    aliases: ['PDCC', 'PUNE DCC', 'PDCC BANK', 'PUNE DISTRICT CENTRAL COOP BANK'],
  },
  {
    id: 'dcc-satara-main',
    bankName: 'DCC BANK',
    branchName: 'SATARA MAIN',
    ifscCode: 'SDCC0000001',
    district: 'Satara',
    aliases: ['SDCC', 'SATARA DCC', 'SATARA DISTRICT CENTRAL COOP BANK'],
  },
  {
    id: 'dcc-gadchiroli',
    bankName: 'DCC BANK',
    branchName: 'GADCHIROLI',
    ifscCode: 'GSCB0GDCH01',
    district: 'Gadchiroli',
    aliases: ['GDCC', 'GADCHIROLI DCC'],
  },

  // Maharashtra Gramin Bank (MGB)
  {
    id: 'mgb-nanded',
    bankName: 'MAHARASHTRA GRAMIN BANK',
    branchName: 'NANDED HEAD OFFICE',
    ifscCode: 'MAHG0000001',
    district: 'Nanded',
    aliases: ['MGB', 'M.G.B.', 'MAHA GRAMIN BANK'],
  },
  {
    id: 'mgb-aurangabad',
    bankName: 'MAHARASHTRA GRAMIN BANK',
    branchName: 'CHHATRAPATI SAMBHAJINAGAR',
    ifscCode: 'MAHG0004101',
    district: 'Chhatrapati Sambhajinagar',
    aliases: ['MGB AURANGABAD', 'MGB SAMBHAJINAGAR'],
  },
  {
    id: 'mgb-chandrapur',
    bankName: 'MAHARASHTRA GRAMIN BANK',
    branchName: 'CHANDRAPUR',
    ifscCode: 'MAHG0005201',
    district: 'Chandrapur',
    aliases: ['MGB CHANDRAPUR'],
  },
  {
    id: 'mgb-bramhapuri',
    bankName: 'MAHARASHTRA GRAMIN BANK',
    branchName: 'BRAMHAPURI',
    ifscCode: 'MAHG0005214',
    district: 'Chandrapur',
    aliases: ['MGB BRAMHAPURI'],
  },

  // Bank of Maharashtra (MAHB)
  {
    id: 'mahb-pune-shivajinagar',
    bankName: 'BANK OF MAHARASHTRA',
    branchName: 'SHIVAJINAGAR PUNE',
    ifscCode: 'MAHB0000001',
    district: 'Pune',
    aliases: ['BOM', 'B.O.M.', 'MAHA BANK', 'MAHARASHTRA BANK'],
  },
  {
    id: 'mahb-nagpur-sitabuldi',
    bankName: 'BANK OF MAHARASHTRA',
    branchName: 'SITABULDI NAGPUR',
    ifscCode: 'MAHB0000005',
    district: 'Nagpur',
    aliases: ['BOM NAGPUR', 'MAHB NAGPUR'],
  },
  {
    id: 'mahb-chandrapur',
    bankName: 'BANK OF MAHARASHTRA',
    branchName: 'CHANDRAPUR MAIN',
    ifscCode: 'MAHB0000156',
    district: 'Chandrapur',
    aliases: ['BOM CHANDRAPUR', 'MAHB CHANDRAPUR'],
  },
  {
    id: 'mahb-bramhapuri',
    bankName: 'BANK OF MAHARASHTRA',
    branchName: 'BRAMHAPURI',
    ifscCode: 'MAHB0000304',
    district: 'Chandrapur',
    aliases: ['BOM BRAMHAPURI', 'MAHB BRAMHAPURI'],
  },
  {
    id: 'mahb-warora',
    bankName: 'BANK OF MAHARASHTRA',
    branchName: 'WARORA',
    ifscCode: 'MAHB0000329',
    district: 'Chandrapur',
    aliases: ['BOM WARORA'],
  },

  // State Bank of India (SBIN)
  {
    id: 'sbi-bramhapuri',
    bankName: 'STATE BANK OF INDIA',
    branchName: 'BRAMHAPURI',
    ifscCode: 'SBIN0000344',
    district: 'Chandrapur',
    aliases: ['SBI', 'S.B.I.', 'STATE BANK', 'SBI BRAMHAPURI'],
  },
  {
    id: 'sbi-chandrapur-main',
    bankName: 'STATE BANK OF INDIA',
    branchName: 'CHANDRAPUR MAIN',
    ifscCode: 'SBIN0000343',
    district: 'Chandrapur',
    aliases: ['SBI CHANDRAPUR'],
  },
  {
    id: 'sbi-nagpur-main',
    bankName: 'STATE BANK OF INDIA',
    branchName: 'NAGPUR MAIN',
    ifscCode: 'SBIN0000432',
    district: 'Nagpur',
    aliases: ['SBI NAGPUR'],
  },
  {
    id: 'sbi-pune-main',
    bankName: 'STATE BANK OF INDIA',
    branchName: 'PUNE MAIN',
    ifscCode: 'SBIN0000454',
    district: 'Pune',
    aliases: ['SBI PUNE'],
  },
  {
    id: 'sbi-mumbai-fort',
    bankName: 'STATE BANK OF INDIA',
    branchName: 'MUMBAI MAIN',
    ifscCode: 'SBIN0000300',
    district: 'Mumbai',
    aliases: ['SBI MUMBAI'],
  },

  // Bank of India (BKID)
  {
    id: 'boi-bramhapuri',
    bankName: 'BANK OF INDIA',
    branchName: 'BRAMHAPURI',
    ifscCode: 'BKID0009605',
    district: 'Chandrapur',
    aliases: ['BOI', 'B.O.I.', 'BOI BRAMHAPURI'],
  },
  {
    id: 'boi-chandrapur',
    bankName: 'BANK OF INDIA',
    branchName: 'CHANDRAPUR',
    ifscCode: 'BKID0009600',
    district: 'Chandrapur',
    aliases: ['BOI CHANDRAPUR'],
  },
  {
    id: 'boi-nagpur',
    bankName: 'BANK OF INDIA',
    branchName: 'NAGPUR MAIN',
    ifscCode: 'BKID0008700',
    district: 'Nagpur',
    aliases: ['BOI NAGPUR'],
  },

  // Bank of Baroda (BARB)
  {
    id: 'bob-chandrapur',
    bankName: 'BANK OF BARODA',
    branchName: 'CHANDRAPUR',
    ifscCode: 'BARB0CHANDR',
    district: 'Chandrapur',
    aliases: ['BOB', 'B.O.B.', 'BOB CHANDRAPUR'],
  },
  {
    id: 'bob-nagpur',
    bankName: 'BANK OF BARODA',
    branchName: 'DHARAMPETH NAGPUR',
    ifscCode: 'BARB0DHARAM',
    district: 'Nagpur',
    aliases: ['BOB NAGPUR'],
  },

  // Punjab National Bank (PUNB)
  {
    id: 'pnb-nagpur',
    bankName: 'PUNJAB NATIONAL BANK',
    branchName: 'KINGS WAY NAGPUR',
    ifscCode: 'PUNB0034600',
    district: 'Nagpur',
    aliases: ['PNB', 'P.N.B.'],
  },
  {
    id: 'pnb-chandrapur',
    bankName: 'PUNJAB NATIONAL BANK',
    branchName: 'CHANDRAPUR',
    ifscCode: 'PUNB0182400',
    district: 'Chandrapur',
    aliases: ['PNB CHANDRAPUR'],
  },

  // Canara Bank (CNRB)
  {
    id: 'canara-chandrapur',
    bankName: 'CANARA BANK',
    branchName: 'CHANDRAPUR',
    ifscCode: 'CNRB0002575',
    district: 'Chandrapur',
    aliases: ['CANARA'],
  },
  {
    id: 'canara-nagpur',
    bankName: 'CANARA BANK',
    branchName: 'NAGPUR MAIN',
    ifscCode: 'CNRB0000282',
    district: 'Nagpur',
    aliases: ['CANARA NAGPUR'],
  },

  // Union Bank of India (UBIN)
  {
    id: 'union-chandrapur',
    bankName: 'UNION BANK OF INDIA',
    branchName: 'CHANDRAPUR',
    ifscCode: 'UBIN0539121',
    district: 'Chandrapur',
    aliases: ['UNION', 'UBI', 'UNION BANK'],
  },
  {
    id: 'union-nagpur',
    bankName: 'UNION BANK OF INDIA',
    branchName: 'NAGPUR MAIN',
    ifscCode: 'UBIN0532291',
    district: 'Nagpur',
    aliases: ['UNION NAGPUR'],
  },

  // Central Bank of India (CBIN)
  {
    id: 'cbi-chandrapur',
    bankName: 'CENTRAL BANK OF INDIA',
    branchName: 'CHANDRAPUR',
    ifscCode: 'CBIN0280687',
    district: 'Chandrapur',
    aliases: ['CBI', 'CENTRAL BANK'],
  },

  // HDFC Bank (HDFC)
  {
    id: 'hdfc-chandrapur',
    bankName: 'HDFC BANK',
    branchName: 'CHANDRAPUR',
    ifscCode: 'HDFC0000885',
    district: 'Chandrapur',
    aliases: ['HDFC'],
  },

  // ICICI Bank (ICIC)
  {
    id: 'icici-chandrapur',
    bankName: 'ICICI BANK',
    branchName: 'CHANDRAPUR',
    ifscCode: 'ICIC0000806',
    district: 'Chandrapur',
    aliases: ['ICICI'],
  },

  // Axis Bank (UTIB)
  {
    id: 'axis-chandrapur',
    bankName: 'AXIS BANK',
    branchName: 'CHANDRAPUR',
    ifscCode: 'UTIB0000676',
    district: 'Chandrapur',
    aliases: ['AXIS'],
  },
];

/**
 * Load Bank Master Directory from LocalStorage
 */
export function loadBankMasterDirectory(): BankMasterEntry[] {
  try {
    const raw = localStorage.getItem(BANK_MASTER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load bank master directory:', e);
  }
  return DEFAULT_BANK_MASTER_DIRECTORY;
}

/**
 * Save Bank Master Directory to LocalStorage
 */
export function saveBankMasterDirectory(entries: BankMasterEntry[]): void {
  try {
    localStorage.setItem(BANK_MASTER_STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save bank master directory:', e);
  }
}

/**
 * Fix common IFSC Code typos:
 * 1. Convert to uppercase and strip whitespace/dashes
 * 2. If 5th character is 'O' or 'o', auto-correct to digit '0' (Rule: RBI mandates 5th char of IFSC is always 0)
 * 3. Replace any lowercase characters with uppercase
 */
export function fixIfscTypos(rawIfsc: any): { fixed: string; wasFixed: boolean; reason?: string } {
  if (rawIfsc === null || rawIfsc === undefined) {
    return { fixed: '', wasFixed: false };
  }

  const str = String(rawIfsc).trim().replace(/[\s\-\.\,\_\/]/g, '').toUpperCase();
  if (!str) {
    return { fixed: '', wasFixed: false };
  }

  let fixed = str;
  let wasFixed = false;
  const reasons: string[] = [];

  // Check 5th character typo: English letter 'O' instead of digit '0'
  if (fixed.length >= 5 && fixed.charAt(4) === 'O') {
    fixed = fixed.substring(0, 4) + '0' + fixed.substring(5);
    wasFixed = true;
    reasons.push("५वे अक्षर 'O' ऐवजी '0' केले (5th char fixed to '0')");
  }

  if (String(rawIfsc) !== fixed) {
    wasFixed = true;
  }

  return {
    fixed,
    wasFixed,
    reason: reasons.join(', ') || undefined,
  };
}

/**
 * Parse uploaded Excel file containing Master Bank Directory
 * Handles various column names in Marathi and English
 */
export async function parseBankMasterExcel(file: File): Promise<BankMasterEntry[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: 'array', raw: false });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('एक्सेल फाईलमध्ये कोणतीही शीट आढळली नाही.');
        }

        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: '',
          blankrows: false,
          raw: false,
        });

        if (rawRows.length < 2) {
          throw new Error('एक्सेल फाईलमध्ये किमान एक हेडर ओळ आणि एक डेटा ओळ असणे आवश्यक आहे.');
        }

        const headers = rawRows[0].map((h) => String(h || '').trim().toLowerCase());

        // Find relevant column indices
        const bankIdx = headers.findIndex((h) =>
          /bank|बँक|bank_name|बँकेचे\s*नाव/i.test(h)
        );
        const branchIdx = headers.findIndex((h) =>
          /branch|शाखा|branch_name|गाव|village/i.test(h)
        );
        const ifscIdx = headers.findIndex((h) =>
          /ifsc|आयएफएससी|ifsc_code|ifsc\s*code/i.test(h)
        );
        const districtIdx = headers.findIndex((h) =>
          /district|जिल्हा|city|शहर/i.test(h)
        );

        if (bankIdx === -1 && ifscIdx === -1) {
          throw new Error(
            'एक्सेल फाईलमध्ये "बँकेचे नाव (Bank Name)" किंवा "IFSC कोड (IFSC Code)" चा रकाना सापडला नाही.'
          );
        }

        const entries: BankMasterEntry[] = [];
        const seenKeys = new Set<string>();

        for (let r = 1; r < rawRows.length; r++) {
          const row = rawRows[r];
          if (!row || !row.some((c) => String(c).trim() !== '')) continue;

          const rawBank = bankIdx !== -1 ? String(row[bankIdx] || '').trim() : '';
          const rawBranch = branchIdx !== -1 ? String(row[branchIdx] || '').trim() : '';
          const rawIfsc = ifscIdx !== -1 ? String(row[ifscIdx] || '').trim() : '';
          const rawDistrict = districtIdx !== -1 ? String(row[districtIdx] || '').trim() : '';

          const ifscFixed = fixIfscTypos(rawIfsc).fixed;
          const cleanBank = rawBank.toUpperCase();
          const cleanBranch = rawBranch.toUpperCase();

          if (!ifscFixed && !cleanBank) continue;

          // Unique identifier based on IFSC or Bank+Branch
          const uniqueKey = ifscFixed ? `IFSC_${ifscFixed}` : `BANK_${cleanBank}_${cleanBranch}`;
          if (seenKeys.has(uniqueKey)) continue;
          seenKeys.add(uniqueKey);

          entries.push({
            id: `imported-${r}-${Date.now().toString(36)}`,
            bankName: cleanBank || (ifscFixed ? getBankNameFromIfscPrefix(ifscFixed) : 'UNKNOWN BANK'),
            branchName: cleanBranch || 'MAIN',
            ifscCode: ifscFixed,
            district: rawDistrict || undefined,
            aliases: cleanBank ? [rawBank] : undefined,
          });
        }

        if (entries.length === 0) {
          throw new Error('एक्सेल फाईलमधून एकही वैध बँक नोंद वाचता आली नाही.');
        }

        resolve(entries);
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error('फाईल वाचताना त्रुटी उद्भवली.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Heuristic bank name from standard Indian 4-letter IFSC prefix
 */
export function getBankNameFromIfscPrefix(ifsc: string): string {
  if (!ifsc || ifsc.length < 4) return 'BANK';
  const prefix = ifsc.substring(0, 4).toUpperCase();
  switch (prefix) {
    case 'SBIN': return 'STATE BANK OF INDIA';
    case 'MAHB': return 'BANK OF MAHARASHTRA';
    case 'MAHG': return 'MAHARASHTRA GRAMIN BANK';
    case 'BKID': return 'BANK OF INDIA';
    case 'BARB': return 'BANK OF BARODA';
    case 'PUNB': return 'PUNJAB NATIONAL BANK';
    case 'CNRB': return 'CANARA BANK';
    case 'UBIN': return 'UNION BANK OF INDIA';
    case 'CBIN': return 'CENTRAL BANK OF INDIA';
    case 'HDFC': return 'HDFC BANK';
    case 'ICIC': return 'ICICI BANK';
    case 'UTIB': return 'AXIS BANK';
    case 'KKBK': return 'KOTAK MAHINDRA BANK';
    case 'IDIB': return 'INDIAN BANK';
    case 'IBKL': return 'IDBI BANK';
    case 'YESB': return 'YES BANK';
    case 'GSCB': return 'DCC BANK';
    case 'PDCC': return 'DCC BANK';
    case 'SDCC': return 'DCC BANK';
    default: return 'BANK';
  }
}

/**
 * Generate official Sample Bank Master Directory Excel file (.xlsx)
 * Users can download, fill with their local bank details, and upload!
 */
export function generateBankMasterTemplateExcel(): Blob {
  const wb = XLSX.utils.book_new();

  const sampleData = [
    ['बँकेचे नाव (Bank Name)', 'शाखा (Branch Name)', 'IFSC कोड (IFSC Code)', 'जिल्हा (District)'],
    ['DCC BANK', 'BRAMHAPURI', 'GSCB0CHND06', 'Chandrapur'],
    ['DCC BANK', 'CHANDRAPUR MAIN', 'GSCB0CHND01', 'Chandrapur'],
    ['DCC BANK', 'WARORA', 'GSCB0CHND02', 'Chandrapur'],
    ['DCC BANK', 'NAGPUR MAIN', 'GSCB0NAGP01', 'Nagpur'],
    ['MAHARASHTRA GRAMIN BANK', 'BRAMHAPURI', 'MAHG0005214', 'Chandrapur'],
    ['MAHARASHTRA GRAMIN BANK', 'CHANDRAPUR', 'MAHG0005201', 'Chandrapur'],
    ['BANK OF MAHARASHTRA', 'BRAMHAPURI', 'MAHB0000304', 'Chandrapur'],
    ['BANK OF MAHARASHTRA', 'CHANDRAPUR MAIN', 'MAHB0000156', 'Chandrapur'],
    ['BANK OF MAHARASHTRA', 'WARORA', 'MAHB0000329', 'Chandrapur'],
    ['STATE BANK OF INDIA', 'BRAMHAPURI', 'SBIN0000344', 'Chandrapur'],
    ['STATE BANK OF INDIA', 'CHANDRAPUR MAIN', 'SBIN0000343', 'Chandrapur'],
    ['BANK OF INDIA', 'BRAMHAPURI', 'BKID0009605', 'Chandrapur'],
    ['BANK OF INDIA', 'CHANDRAPUR', 'BKID0009600', 'Chandrapur'],
    ['BANK OF BARODA', 'CHANDRAPUR', 'BARB0CHANDR', 'Chandrapur'],
    ['PUNJAB NATIONAL BANK', 'CHANDRAPUR', 'PUNB0182400', 'Chandrapur'],
    ['CANARA BANK', 'CHANDRAPUR', 'CNRB0002575', 'Chandrapur'],
    ['UNION BANK OF INDIA', 'CHANDRAPUR', 'UBIN0539121', 'Chandrapur'],
    ['CENTRAL BANK OF INDIA', 'CHANDRAPUR', 'CBIN0280687', 'Chandrapur'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(sampleData);

  // Set column widths
  ws['!cols'] = [
    { wch: 30 }, // Bank Name
    { wch: 25 }, // Branch Name
    { wch: 18 }, // IFSC Code
    { wch: 18 }, // District
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'BankMasterDirectory');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * Intelligent Auto-Correct Engine for Bank Names, Branches & IFSC Codes
 * Requirement:
 * "बँकेचे नांव तसेच IFSC कोड auto correct करता येतील का याची चाचपणी करा.
 * (उदा. बॅकेचे नांव, शाखा, ifsc code ) आणि हा डाटा एकदाच application मध्ये excel file आधारे भरता येईल व सदरचा करेक्ट डा यादीमध्ये तात्काळ दुरुस्त करता येईल"
 */
export function autoCorrectBankAndIfscInDataset(
  headers: string[],
  rows: any[][],
  bankMasterList: BankMasterEntry[],
  bankMappings: BankMapping
): { updatedRows: any[][]; summary: BankAutoCorrectSummary } {
  // Step 1: Detect indices of Bank, Branch, IFSC, and Farmer Name columns
  let bankColIdx = -1;
  let branchColIdx = -1;
  let ifscColIdx = -1;
  let farmerNameColIdx = -1;

  for (let i = 0; i < headers.length; i++) {
    const h = headers[i].toLowerCase().trim();

    if (ifscColIdx === -1 && /ifsc|आयएफएससी|ifsc_code/i.test(h)) {
      ifscColIdx = i;
    } else if (branchColIdx === -1 && /branch|शाखा/i.test(h)) {
      branchColIdx = i;
    } else if (bankColIdx === -1 && /bank|बँक|bank_name/i.test(h)) {
      bankColIdx = i;
    } else if (farmerNameColIdx === -1 && /farmer|शेतकरी|name|नाव/i.test(h)) {
      farmerNameColIdx = i;
    }
  }

  // If no bank or ifsc column is found, return as is
  if (bankColIdx === -1 && ifscColIdx === -1) {
    return {
      updatedRows: rows,
      summary: {
        totalRowsExamined: rows.length,
        totalRowsChanged: 0,
        ifscCorrectedCount: 0,
        bankNameCorrectedCount: 0,
        branchUpdatedCount: 0,
        details: [],
      },
    };
  }

  // Pre-index master directory for high-speed lookups
  const ifscMap = new Map<string, BankMasterEntry>();
  const bankBranchMap = new Map<string, BankMasterEntry>();

  for (const entry of bankMasterList) {
    if (entry.ifscCode) {
      ifscMap.set(entry.ifscCode.toUpperCase().trim(), entry);
    }
    const bankNorm = normalizeBankNameForMatching(entry.bankName);
    const branchNorm = normalizeBankNameForMatching(entry.branchName);
    bankBranchMap.set(`${bankNorm}:::${branchNorm}`, entry);

    if (entry.aliases) {
      for (const alias of entry.aliases) {
        const aliasNorm = normalizeBankNameForMatching(alias);
        bankBranchMap.set(`${aliasNorm}:::${branchNorm}`, entry);
        bankBranchMap.set(`${aliasNorm}:::ALL`, entry);
      }
    }
  }

  const updatedRows: any[][] = [];
  const details: BankAutoCorrectDetail[] = [];
  let ifscCorrectedCount = 0;
  let bankNameCorrectedCount = 0;
  let branchUpdatedCount = 0;

  for (let rIdx = 0; rIdx < rows.length; rIdx++) {
    const row = rows[rIdx];
    const rowCopy = [...row];

    const origBank = bankColIdx !== -1 ? String(rowCopy[bankColIdx] ?? '') : '';
    const origBranch = branchColIdx !== -1 ? String(rowCopy[branchColIdx] ?? '') : '';
    const origIfsc = ifscColIdx !== -1 ? String(rowCopy[ifscColIdx] ?? '') : '';
    const farmerName = farmerNameColIdx !== -1 ? String(rowCopy[farmerNameColIdx] ?? '') : '';

    let curBank = origBank;
    let curBranch = origBranch;
    let curIfsc = origIfsc;

    let rowChanged = false;
    const reasons: string[] = [];

    // 1. Fix common IFSC typos (5th char 'O' -> '0', trailing spaces, lower case)
    if (curIfsc.trim() !== '') {
      const ifscFixResult = fixIfscTypos(curIfsc);
      if (ifscFixResult.wasFixed && ifscFixResult.fixed !== curIfsc) {
        curIfsc = ifscFixResult.fixed;
        rowChanged = true;
        ifscCorrectedCount++;
        reasons.push(ifscFixResult.reason || "IFSC कोडमधील टायपो सुधारला ('O' -> '0')");
      }
    }

    // 2. Lookup by IFSC code in Master Directory
    const cleanIfscKey = curIfsc.trim().toUpperCase();
    let matchedEntry: BankMasterEntry | undefined = ifscMap.get(cleanIfscKey);

    // If exact match found by IFSC
    if (matchedEntry) {
      // Standardize bank name from master
      if (curBank.trim() !== matchedEntry.bankName) {
        curBank = matchedEntry.bankName;
        rowChanged = true;
        bankNameCorrectedCount++;
        reasons.push(`IFSC वरून बँकेचे नाव प्रमाणित केले: ${matchedEntry.bankName}`);
      }

      // Fill branch if empty or update if branch column exists
      if (branchColIdx !== -1 && (!curBranch.trim() || curBranch.trim().toUpperCase() !== matchedEntry.branchName)) {
        if (!curBranch.trim()) {
          curBranch = matchedEntry.branchName;
          rowChanged = true;
          branchUpdatedCount++;
          reasons.push(`IFSC वरून शाखा भरली: ${matchedEntry.branchName}`);
        }
      }
    } else {
      // 3. Match by Bank Name + Branch from Master Directory
      const normBank = normalizeBankNameForMatching(curBank);
      const normBranch = normalizeBankNameForMatching(curBranch);

      let foundByBankBranch: BankMasterEntry | undefined;

      // Try exact Bank + Branch
      if (normBank && normBranch) {
        foundByBankBranch = bankBranchMap.get(`${normBank}:::${normBranch}`);
      }

      // Try fuzzy bank branch match in master
      if (!foundByBankBranch && normBank) {
        for (const entry of bankMasterList) {
          const entryBankNorm = normalizeBankNameForMatching(entry.bankName);
          const entryBranchNorm = normalizeBankNameForMatching(entry.branchName);

          const bankMatches =
            entryBankNorm === normBank ||
            (normBank.length >= 3 && entryBankNorm.includes(normBank)) ||
            (normBank.length >= 3 && normBank.includes(entryBankNorm)) ||
            (entry.aliases && entry.aliases.some((a) => normalizeBankNameForMatching(a) === normBank));

          const branchMatches =
            !normBranch ||
            entryBranchNorm === normBranch ||
            (normBranch.length >= 3 && entryBranchNorm.includes(normBranch)) ||
            (normBranch.length >= 3 && normBranch.includes(entryBranchNorm));

          if (bankMatches && branchMatches) {
            foundByBankBranch = entry;
            break;
          }
        }
      }

      if (foundByBankBranch) {
        // Correct Bank Name
        if (curBank.trim() !== foundByBankBranch.bankName) {
          curBank = foundByBankBranch.bankName;
          rowChanged = true;
          bankNameCorrectedCount++;
          reasons.push(`बँक नाव प्रमाणित केले: ${foundByBankBranch.bankName}`);
        }

        // Fill / Correct IFSC Code if missing or invalid
        if (
          foundByBankBranch.ifscCode &&
          (!curIfsc.trim() || curIfsc.trim().length !== 11 || curIfsc.trim().toUpperCase() !== foundByBankBranch.ifscCode)
        ) {
          const oldIfscDisplay = curIfsc || '(रिकामा/त्रुटी)';
          curIfsc = foundByBankBranch.ifscCode;
          rowChanged = true;
          ifscCorrectedCount++;
          reasons.push(`शाखेनुसार अचूक IFSC कोड भरला (${oldIfscDisplay} ➔ ${foundByBankBranch.ifscCode})`);
        }

        // Fill Branch if empty
        if (branchColIdx !== -1 && !curBranch.trim() && foundByBankBranch.branchName) {
          curBranch = foundByBankBranch.branchName;
          rowChanged = true;
          branchUpdatedCount++;
          reasons.push(`मास्टरनुसार शाखा भरली: ${foundByBankBranch.branchName}`);
        }
      } else {
        // 4. Fallback: Standardize Bank Name using local alias dictionary
        if (curBank.trim() !== '') {
          const stdResult = standardizeBankName(curBank, bankMappings);
          if (stdResult.wasStandardized && stdResult.cleaned !== curBank) {
            curBank = stdResult.cleaned;
            rowChanged = true;
            bankNameCorrectedCount++;
            reasons.push(`बँक नाव प्रमाणित केले: ${stdResult.cleaned}`);
          }
        }

        // 5. If IFSC matches known prefix, infer Bank Name if missing
        if (!curBank.trim() && curIfsc.trim().length >= 4) {
          const inferredBank = getBankNameFromIfscPrefix(curIfsc.trim());
          if (inferredBank !== 'BANK') {
            curBank = inferredBank;
            rowChanged = true;
            bankNameCorrectedCount++;
            reasons.push(`IFSC प्रीफिक्सवरून बँक निश्चित केली: ${inferredBank}`);
          }
        }
      }
    }

    if (rowChanged) {
      if (bankColIdx !== -1) rowCopy[bankColIdx] = curBank;
      if (branchColIdx !== -1) rowCopy[branchColIdx] = curBranch;
      if (ifscColIdx !== -1) rowCopy[ifscColIdx] = curIfsc;

      details.push({
        rowIndex: rIdx + 1,
        farmerName: farmerName || undefined,
        originalBank: origBank,
        correctedBank: curBank,
        originalBranch: origBranch || undefined,
        correctedBranch: curBranch || undefined,
        originalIfsc: origIfsc,
        correctedIfsc: curIfsc,
        reason: reasons.join('; '),
      });
    }

    updatedRows.push(rowCopy);
  }

  return {
    updatedRows,
    summary: {
      totalRowsExamined: rows.length,
      totalRowsChanged: details.length,
      ifscCorrectedCount,
      bankNameCorrectedCount,
      branchUpdatedCount,
      details,
    },
  };
}
