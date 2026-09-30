# AI Data Cleaning Suite (PWA)

> **Clean • Validate • Standardize • Export**
> A production-grade Progressive Web App (PWA) for desktop and mobile browsers. Engineered for Indian financial, agricultural, and DBT datasets.

---

## Highlights & Features

- **100% Client-Side Privacy**: All processing runs locally within your browser sandbox. Aadhaar numbers, mobile numbers, bank accounts, and financial values are **never** uploaded to an external server or cloud AI model.
- **Progressive Web App (PWA)**: Installable directly on Windows 11/10 (via Edge/Chrome), macOS, Android, and iOS Safari. Works completely offline.
- **Large Dataset Engine**: Powered by SheetJS (`xlsx`) and PapaParse with streaming and chunked parsing.
- **Batch Processing**: Process single files, multi-file selections, or complete directory trees with independent per-file failure isolation.
- **File System Access API & ZIP Export**: Direct local folder output with graceful ZIP archive fallback.
- **Bank Standardization Dictionary**: Case-insensitive and punctuation-stripped matching for Indian banks (SBI, HDFC, ICICI, AXIS, Central Bank, DCC Banks, Maharashtra Gramin Bank, etc.) with custom JSON import/export.
- **Data Protection Policy**: Critical identifier columns (`Farmers_Aadhaar_No`, `Saving_A_C_No`, `Branch_IFSC_Code`, `Mobile_No`, `Gat_Number`) are strictly locked as `Text` to guarantee leading zeroes (e.g. `'0056'`, `'002106...'`) are never lost.
- **Interactive Validation Inspector**: Cells failing Indian mobile (`^[6-9][0-9]{9}$`), IFSC (`^[A-Z]{4}0[A-Z0-9]{6}$`), Aadhaar (`^[0-9]{12}$`), amount, or date checks are highlighted in light red without destructive deletion. Clicking a cell reveals the exact validation failure reason.
- **Changes Audit Trail**: Comprehensive "View Changes" viewer tracks all Before $\to$ After value alterations.

---

## Quick Start / Local Development

### 1. Installation

```bash
npm install
```

### 2. Run Local Development Server

```bash
npm run dev
```

Opens development server at `http://localhost:3000`.

### 3. Production Build

```bash
npm run build
```

Generates optimized production assets in `dist/` with precached service worker and web app manifest.

---

## Supported Cleaning Parameters

1. **Trim**: Removes leading and trailing whitespace.
2. **Clean**: Removes non-printable/control characters and collapses repeated spaces into single spaces.
3. **Proper**: Converts text to proper title casing (e.g., `PRABHAVATI VILAS PAWAR` $\to$ `Prabhavati Vilas Pawar`).
4. **UPPER**: Converts text to uppercase.
5. **lower**: Converts text to lowercase.
6. **Text**: Enforces string data type, safeguarding leading zeroes in account numbers and survey/gat numbers.
7. **Number**: Converts numeric text representations to numbers where mathematically valid.
8. **Bank Standardize**: Matches bank variations (e.g., `S.B.I.`, `D.C.C BRAMHAPURI`) against the local dictionary and replaces them with official entity titles.
9. **Mobile(10)**: Validates standard 10-digit Indian mobile numbers (`^[6-9][0-9]{9}$`).
10. **IFSC(11)**: Validates standard 11-character Indian financial codes (`^[A-Z]{4}0[A-Z0-9]{6}$`).
11. **Aadhaar(12)**: Validates exactly 12 numeric digits (`^[0-9]{12}$`).
12. **Amount**: Strips currency signs (`₹`, `Rs`, `Rs.`), commas, and whitespace while converting to clean numeric format and preserving decimals.
13. **Date(dd/mm/yyyy)**: Converts standard dates and Excel serial dates to standard Indian format (`dd/mm/yyyy`).

---

## Maharashtra Agriculture & DBT Schema Mapping

The suite automatically recognizes the following schema and suggests optimal rules:

| Column Name | Suggested Cleaning Rules | Data Type Policy |
| :--- | :--- | :--- |
| `Sr.No` | Number | Numeric |
| `Farmers_District` | Trim, Proper | Text |
| `Farmers_Taluka` | Trim, Proper | Text |
| `Farmers_Village` | Trim, Proper | Text |
| `Gat_Number` | Trim, Text | **Locked as Text** (preserves `'0056'`) |
| `Type_of_Loss` | Trim, Proper | Text |
| `Affected_Area_Hectares` | Trim, Number | Decimal Number |
| `Amount_Disbursed` | Trim, Amount | Currency Numeric |
| `Name_of_the_Farmer` | Trim, Proper | Proper Text |
| `Farmers_Aadhaar_No` | Trim, Text, Aadhaar(12) | **Locked as Text** (12 digits) |
| `Bank_Name` | Trim, Bank Standardize | Standardized Text |
| `Saving_A_C_No` | Trim, Text | **Locked as Text** (preserves `'00123...'`) |
| `Branch_IFSC_Code` | Trim, UPPER, Text, IFSC(11) | **Locked as Text** (11 chars) |
| `Mobile_No` | Trim, Text, Mobile(10) | **Locked as Text** (10 digits) |
