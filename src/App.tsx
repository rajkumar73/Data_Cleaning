import React, { useEffect, useRef, useState } from 'react';
import {
  AppSettings,
  BankAutoCorrectSummary,
  BankMapping,
  BankMasterEntry,
  ChangedCellRecord,
  CleaningProfile,
  ColumnRuleMap,
  FileItem,
} from './types/dataCleaner';
import {
  autoDetectAllColumns,
} from './utils/autoDetector';
import { processDataset, updateCellInDataset, cleanCellValue } from './utils/cleaningEngine';
import {
  createSampleFarmerFile,
  parseDataFile,
} from './utils/fileParser';
import {
  detectVillageOrBaseName,
  downloadBlob,
  downloadFilesDirectlyWithoutZip,
  generateDatasetCsvBlob,
  generateDatasetExcelBlob,
  getSplitFileName,
} from './utils/excelExporter';
import {
  loadBankMappings,
  loadProfiles,
  loadSettings,
  saveBankMappings,
  saveProfiles,
  saveSettings,
} from './utils/storage';
import {
  loadBankMasterDirectory,
  saveBankMasterDirectory,
  autoCorrectBankAndIfscInDataset,
} from './utils/bankMasterEngine';
import {
  clearStoredDirectoryHandle,
  getStoredDirectoryHandle,
  saveBlobToDirectory,
  saveMultipleBlobsToDirectory,
  saveStoredDirectoryHandle,
} from './utils/folderStorage';

// Components
import { Header } from './components/Header';
import { DashboardStatsCards } from './components/DashboardStatsCards';
import { FileSelector } from './components/FileSelector';
import { FileQueue } from './components/FileQueue';
import { CleaningRules } from './components/CleaningRules';
import { BatchProcessor } from './components/BatchProcessor';
import { DataPreview } from './components/DataPreview';
import { DataQuality } from './components/DataQuality';
import { ProcessingLog } from './components/ProcessingLog';
import { OutputActions } from './components/OutputActions';
import { BankMappingManager } from './components/BankMappingManager';
import { CleaningProfiles } from './components/CleaningProfiles';
import { SettingsModal } from './components/SettingsModal';
import { HelpGuideModal } from './components/HelpGuideModal';
import { DataCorrectionModal } from './components/DataCorrectionModal';
import { FindReplaceModal } from './components/FindReplaceModal';
import { ChangesModal } from './components/ChangesModal';
import { AutoCorrectReportModal } from './components/AutoCorrectReportModal';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  // Application Settings & Data
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [bankMappings, setBankMappings] = useState<BankMapping>(loadBankMappings);
  const [bankMasterList, setBankMasterList] = useState<BankMasterEntry[]>(loadBankMasterDirectory);
  const [profiles, setProfiles] = useState<CleaningProfile[]>(loadProfiles);
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');

  const [files, setFiles] = useState<FileItem[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());

  // Column rules mapped by fileId
  const [fileColumnRules, setFileColumnRules] = useState<{ [fileId: string]: ColumnRuleMap }>({});

  // Output folder handle (File System Access API)
  const [outputDirectoryHandle, setOutputDirectoryHandle] = useState<any>(null);
  const [outputDirectoryName, setOutputDirectoryName] = useState<string>('');

  // Batch Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState(0);
  const cancelProcessingRef = useRef(false);
  const pauseProcessingRef = useRef(false);

  // Modals
  const [isBankManagerOpen, setIsBankManagerOpen] = useState(false);
  const [isProfilesOpen, setIsProfilesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isChangesModalOpen, setIsChangesModalOpen] = useState(false);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [isAutoCorrectReportOpen, setIsAutoCorrectReportOpen] = useState(false);
  const [autoCorrectSummary, setAutoCorrectSummary] = useState<BankAutoCorrectSummary | null>(null);

  // In-App Data Correction Modal State
  const [selectedCellToCorrect, setSelectedCellToCorrect] = useState<{
    rowIndex: number;
    colIndex: number;
    column: string;
    value: any;
    reason?: string;
    originalValue?: any;
    cleanedValue?: any;
  } | null>(null);

  // Active file & rules
  const activeFile = files.find((f) => f.id === activeFileId) || files[0] || null;
  const currentActiveRules = (activeFile ? fileColumnRules[activeFile.id] : {}) || {};

  // Store changes list for current active file
  const [activeFileChanges, setActiveFileChanges] = useState<ChangedCellRecord[]>([]);

  // Dark mode effect - Defaulting to clean, bright light mode per user request
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Load saved output folder location from IndexedDB on startup (so user doesn't have to select it repeatedly)
  useEffect(() => {
    getStoredDirectoryHandle().then((saved) => {
      if (saved && saved.handle) {
        setOutputDirectoryHandle(saved.handle);
        setOutputDirectoryName(saved.name);
      }
    });
  }, []);

  // Keep pause ref synced
  useEffect(() => {
    pauseProcessingRef.current = isPaused;
  }, [isPaused]);

  // Handle files selected (single, multiple, or folder)
  const handleFilesSelected = async (selectedFiles: File[]) => {
    const newFileItems: FileItem[] = [];
    const newRulesMap = { ...fileColumnRules };

    for (const file of selectedFiles) {
      try {
        const item = await parseDataFile(file);

        // Auto detect rules for new file
        let detected: ColumnRuleMap = {};
        if (settings.autoDetectColumns) {
          detected = autoDetectAllColumns(item.headers);
        } else {
          item.headers.forEach((h) => {
            detected[h] = ['Trim'];
          });
        }
        newRulesMap[item.id] = detected;

        // Immediately compute validationGrid so invalid cells are highlighted right away!
        const result = processDataset(
          item.headers,
          item.originalData,
          detected,
          bankMappings,
          {
            removeDuplicates: settings.duplicateHandling === 'remove',
            removeBlankRows: settings.removeBlankRows,
            removeBlankCols: settings.removeBlankCols,
          }
        );

        newFileItems.push({
          ...item,
          cleanedData: result.cleanedRows,
          validationGrid: result.validationGrid,
          correctRows: result.correctRows,
          incorrectRows: result.incorrectRows,
          correctValidationGrid: result.correctValidationGrid,
          incorrectValidationGrid: result.incorrectValidationGrid,
          correctCount: result.correctRows.length,
          incorrectCount: result.incorrectRows.length,
          qualityReport: result.qualityReport,
          processingLogs: result.processingLogs,
        });
      } catch (err: any) {
        alert(`Error opening "${file.name}": ${err.message}`);
      }
    }

    if (newFileItems.length > 0) {
      setFiles((prev) => [...prev, ...newFileItems]);
      setFileColumnRules(newRulesMap);
      if (!activeFileId) {
        setActiveFileId(newFileItems[0].id);
      }
    }
  };

  // Load sample dataset with immediate validationGrid
  const handleLoadSample = () => {
    const sample = createSampleFarmerFile();
    const detected = autoDetectAllColumns(sample.headers);

    const result = processDataset(
      sample.headers,
      sample.originalData,
      detected,
      bankMappings,
      {
        removeDuplicates: settings.duplicateHandling === 'remove',
        removeBlankRows: settings.removeBlankRows,
        removeBlankCols: settings.removeBlankCols,
      }
    );

    const populatedSample: FileItem = {
      ...sample,
      cleanedData: result.cleanedRows,
      validationGrid: result.validationGrid,
      correctRows: result.correctRows,
      incorrectRows: result.incorrectRows,
      correctValidationGrid: result.correctValidationGrid,
      incorrectValidationGrid: result.incorrectValidationGrid,
      correctCount: result.correctRows.length,
      incorrectCount: result.incorrectRows.length,
      qualityReport: result.qualityReport,
      processingLogs: result.processingLogs,
    };

    setFiles((prev) => [populatedSample, ...prev]);
    setFileColumnRules((prev) => ({
      ...prev,
      [sample.id]: detected,
    }));
    setActiveFileId(sample.id);
  };

  // Select output folder permanently using File System Access API
  const handleSelectOutputFolder = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        // @ts-ignore
        const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
        const name = handle.name || 'Output Folder';
        setOutputDirectoryHandle(handle);
        setOutputDirectoryName(name);
        // Persist permanently in IndexedDB so it's remembered across reloads
        await saveStoredDirectoryHandle(handle, name);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Directory Picker Error:', err);
        }
      }
    } else {
      alert(
        'File System Access API is not directly supported in this browser mode. Files will be downloaded directly to your Downloads folder.'
      );
    }
  };

  // Clear permanently saved output folder
  const handleClearOutputFolder = async () => {
    await clearStoredDirectoryHandle();
    setOutputDirectoryHandle(null);
    setOutputDirectoryName('');
  };

  // Queue actions
  const handleToggleSelectFile = (fileId: string) => {
    const next = new Set(selectedFileIds);
    if (next.has(fileId)) {
      next.delete(fileId);
    } else {
      next.add(fileId);
    }
    setSelectedFileIds(next);
  };

  const handleSelectAllFiles = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedFileIds(new Set(files.map((f) => f.id)));
    } else {
      setSelectedFileIds(new Set());
    }
  };

  const handleRemoveSelected = () => {
    const remaining = files.filter((f) => !selectedFileIds.has(f.id));
    setFiles(remaining);
    setSelectedFileIds(new Set());
    if (activeFileId && selectedFileIds.has(activeFileId)) {
      setActiveFileId(remaining[0]?.id || null);
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear all files from queue?')) {
      setFiles([]);
      setSelectedFileIds(new Set());
      setActiveFileId(null);
      setFileColumnRules({});
      setActiveFileChanges([]);
    }
  };

  const handleRemoveSingle = (fileId: string) => {
    const remaining = files.filter((f) => f.id !== fileId);
    setFiles(remaining);
    const nextSelected = new Set(selectedFileIds);
    nextSelected.delete(fileId);
    setSelectedFileIds(nextSelected);

    if (activeFileId === fileId) {
      setActiveFileId(remaining[0]?.id || null);
    }
  };

  // Rules actions
  const handleChangeColumnRules = (newRules: ColumnRuleMap) => {
    if (!activeFile) return;
    setFileColumnRules((prev) => ({
      ...prev,
      [activeFile.id]: newRules,
    }));
  };

  const handleAutoDetectColumns = () => {
    if (!activeFile) return;
    const detected = autoDetectAllColumns(activeFile.headers);
    handleChangeColumnRules(detected);
  };

  // Settings & Bank Mappings
  const handleUpdateSettings = (partial: Partial<AppSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleSaveBankMappings = (updated: BankMapping) => {
    setBankMappings(updated);
    saveBankMappings(updated);
  };

  const handleSaveBankMasterList = (updated: BankMasterEntry[]) => {
    setBankMasterList(updated);
    saveBankMasterDirectory(updated);
  };

  const handleSaveProfiles = (updated: CleaningProfile[]) => {
    setProfiles(updated);
    saveProfiles(updated);
  };

  const handleApplyProfile = (profile: CleaningProfile) => {
    if (!activeFile) return;
    const newRules: ColumnRuleMap = {};
    for (const h of activeFile.headers) {
      if (profile.rules[h]) {
        newRules[h] = [...profile.rules[h]];
      } else {
        newRules[h] = autoDetectAllColumns([h])[h] || ['Trim'];
      }
    }
    handleChangeColumnRules(newRules);
  };

  // Execute processing for a single file item (Partitions into Correct and Incorrect!)
  const processSingleFile = async (
    fileItem: FileItem,
    rules: ColumnRuleMap
  ): Promise<FileItem> => {
    const result = processDataset(
      fileItem.headers,
      fileItem.originalData,
      rules,
      bankMappings,
      {
        removeDuplicates: settings.duplicateHandling === 'remove',
        removeBlankRows: settings.removeBlankRows,
        removeBlankCols: settings.removeBlankCols,
      }
    );

    // Detect village or base name for filename formatting
    const village = detectVillageOrBaseName({
      ...fileItem,
      cleanedData: result.cleanedRows,
    });

    const format = exportFormat;
    const correctFileName = `${village}_correct.${format}`;
    const incorrectFileName = `${village}_incorrect.${format}`;

    // Generate output blobs
    let correctBlob: Blob;
    let incorrectBlob: Blob;

    if (format === 'csv') {
      correctBlob = generateDatasetCsvBlob(
        result.cleanedHeaders,
        result.correctRows,
        result.correctValidationGrid,
        false
      );
      incorrectBlob = generateDatasetCsvBlob(
        result.cleanedHeaders,
        result.incorrectRows,
        result.incorrectValidationGrid,
        true
      );
    } else {
      correctBlob = generateDatasetExcelBlob(
        result.cleanedHeaders,
        result.correctRows,
        result.correctValidationGrid,
        'CorrectData',
        false
      );
      incorrectBlob = generateDatasetExcelBlob(
        result.cleanedHeaders,
        result.incorrectRows,
        result.incorrectValidationGrid,
        'IncorrectData',
        true
      );
    }

    // Direct save to outputDirectoryHandle if configured
    if (outputDirectoryHandle) {
      try {
        if (result.correctRows.length > 0) {
          const cHandle = await outputDirectoryHandle.getFileHandle(correctFileName, { create: true });
          const writableC = await cHandle.createWritable();
          await writableC.write(correctBlob);
          await writableC.close();
        }
        if (result.incorrectRows.length > 0) {
          const iHandle = await outputDirectoryHandle.getFileHandle(incorrectFileName, { create: true });
          const writableI = await iHandle.createWritable();
          await writableI.write(incorrectBlob);
          await writableI.close();
        }
      } catch (e) {
        console.warn('Failed to write directly to outputDirectoryHandle:', e);
      }
    }

    return {
      ...fileItem,
      status: 'Completed',
      progress: 100,
      headers: result.cleanedHeaders,
      cleanedData: result.cleanedRows,
      validationGrid: result.validationGrid,
      correctRows: result.correctRows,
      incorrectRows: result.incorrectRows,
      correctValidationGrid: result.correctValidationGrid,
      incorrectValidationGrid: result.incorrectValidationGrid,
      correctBlob,
      incorrectBlob,
      correctFileName,
      incorrectFileName,
      correctCount: result.correctRows.length,
      incorrectCount: result.incorrectRows.length,
      qualityReport: result.qualityReport,
      processingLogs: result.processingLogs,
    };
  };

  // Start Batch Processing
  const handleStartProcessing = async () => {
    if (files.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setIsPaused(false);
    cancelProcessingRef.current = false;

    for (let i = 0; i < files.length; i++) {
      if (cancelProcessingRef.current) break;

      while (pauseProcessingRef.current && !cancelProcessingRef.current) {
        await new Promise((r) => setTimeout(r, 200));
      }
      if (cancelProcessingRef.current) break;

      setCurrentProcessingIndex(i);
      const currentFile = files[i];

      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: 'Processing', progress: 30 } : f
        )
      );

      await new Promise((r) => setTimeout(r, 100));

      try {
        const rules = fileColumnRules[currentFile.id] || autoDetectAllColumns(currentFile.headers);
        const updatedFile = await processSingleFile(currentFile, rules);

        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? updatedFile : f))
        );

        if (currentFile.id === activeFileId) {
          // Sync changes
        }
      } catch (err: any) {
        console.error('Batch error on file:', currentFile.name, err);
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? {
                  ...f,
                  status: 'Failed',
                  progress: 0,
                  errorMessage: err.message || 'Processing failed',
                }
              : f
          )
        );
      }
    }

    setIsProcessing(false);
    setIsPaused(false);
  };

  // Single file reclean trigger
  const handleTriggerReCleanActive = async () => {
    if (!activeFile) return;
    try {
      const rules = currentActiveRules;
      const updated = await processSingleFile(activeFile, rules);
      setFiles((prev) =>
        prev.map((f) => (f.id === activeFile.id ? updated : f))
      );
    } catch (err: any) {
      alert(`Error processing file: ${err.message}`);
    }
  };

  const handlePauseProcessing = () => setIsPaused(true);
  const handleResumeProcessing = () => setIsPaused(false);
  const handleCancelProcessing = () => {
    cancelProcessingRef.current = true;
    setIsProcessing(false);
    setIsPaused(false);
  };

  // ==========================================
  // IN-APP DATA CORRECTION HANDLERS
  // ==========================================
  const handleSaveCellCorrection = (rowIndex: number, colIndex: number, newValue: any) => {
    if (!activeFile) return;

    const sourceRows = activeFile.cleanedData || activeFile.originalData;
    const vGrid = activeFile.validationGrid || [];

    const updated = updateCellInDataset(
      activeFile.headers,
      sourceRows,
      vGrid,
      rowIndex,
      colIndex,
      newValue,
      currentActiveRules,
      bankMappings
    );

    // Recompute quality report counts
    let invalidMobile = 0;
    let invalidIFSC = 0;
    let invalidAadhaar = 0;
    let invalidDates = 0;
    let invalidAmounts = 0;

    for (let r = 0; r < updated.updatedValidationGrid.length; r++) {
      const vRow = updated.updatedValidationGrid[r];
      for (let c = 0; c < activeFile.headers.length; c++) {
        const detail = vRow[c];
        const h = activeFile.headers[c];
        const rules = currentActiveRules[h] || [];
        if (detail && !detail.isValid) {
          if (rules.includes('Mobile(10)')) invalidMobile++;
          if (rules.includes('IFSC(11)')) invalidIFSC++;
          if (rules.includes('Aadhaar(12)')) invalidAadhaar++;
          if (rules.includes('Date(dd/mm/yyyy)')) invalidDates++;
          if (rules.includes('Amount')) invalidAmounts++;
        }
      }
    }

    const updatedQuality = activeFile.qualityReport
      ? {
          ...activeFile.qualityReport,
          invalidMobile,
          invalidIFSC,
          invalidAadhaar,
          invalidDates,
          invalidAmounts,
        }
      : undefined;

    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeFile.id
          ? {
              ...f,
              cleanedData: updated.updatedRows,
              validationGrid: updated.updatedValidationGrid,
              correctRows: updated.correctRows,
              incorrectRows: updated.incorrectRows,
              correctValidationGrid: updated.correctValidationGrid,
              incorrectValidationGrid: updated.incorrectValidationGrid,
              correctCount: updated.correctRows.length,
              incorrectCount: updated.incorrectRows.length,
              qualityReport: updatedQuality,
            }
          : f
      )
    );
  };

  const handleSaveRowCorrection = (rowIndex: number, newRowValues: any[]) => {
    if (!activeFile) return;
    const currentRows = activeFile.cleanedData || activeFile.originalData;
    const vGrid = activeFile.validationGrid || [];

    const updatedRows = currentRows.map((r) => [...r]);
    const updatedVGrid = vGrid.map((vr) => [...vr]);

    updatedRows[rowIndex] = [...newRowValues];

    // Validate all cells of that row
    for (let c = 0; c < activeFile.headers.length; c++) {
      const header = activeFile.headers[c];
      const rules = currentActiveRules[header] || [];
      const res = cleanCellValue(newRowValues[c], rules, bankMappings, header);
      updatedRows[rowIndex][c] = res.cleanedValue;
      if (!updatedVGrid[rowIndex]) updatedVGrid[rowIndex] = [];
      updatedVGrid[rowIndex][c] = res;
    }

    // Partition
    const correctRows: any[][] = [];
    const incorrectRows: any[][] = [];
    const correctValidationGrid: any[][] = [];
    const incorrectValidationGrid: any[][] = [];

    for (let r = 0; r < updatedRows.length; r++) {
      const row = updatedRows[r];
      const vr = updatedVGrid[r];
      const isBad = vr.some((cell) => cell && !cell.isValid);
      if (isBad) {
        incorrectRows.push(row);
        incorrectValidationGrid.push(vr);
      } else {
        correctRows.push(row);
        correctValidationGrid.push(vr);
      }
    }

    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeFile.id
          ? {
              ...f,
              cleanedData: updatedRows,
              validationGrid: updatedVGrid,
              correctRows,
              incorrectRows,
              correctValidationGrid,
              incorrectValidationGrid,
              correctCount: correctRows.length,
              incorrectCount: incorrectRows.length,
            }
          : f
      )
    );
  };

  // Save & Next Error Navigation
  const handleNavigateNextError = (currentRowIndex: number, currentColIndex: number) => {
    if (!activeFile || !activeFile.validationGrid) return;
    const vGrid = activeFile.validationGrid;
    const headers = activeFile.headers;
    const data = activeFile.cleanedData || activeFile.originalData;

    // First scan rest of current row
    for (let c = currentColIndex + 1; c < headers.length; c++) {
      const cell = vGrid[currentRowIndex]?.[c];
      if (cell && !cell.isValid) {
        setSelectedCellToCorrect({
          rowIndex: currentRowIndex,
          colIndex: c,
          column: headers[c],
          value: data[currentRowIndex]?.[c],
          reason: cell.reason,
          originalValue: cell.originalValue,
          cleanedValue: cell.cleanedValue,
        });
        return;
      }
    }

    // Next scan subsequent rows
    for (let r = currentRowIndex + 1; r < vGrid.length; r++) {
      const row = vGrid[r];
      if (row) {
        for (let c = 0; c < headers.length; c++) {
          const cell = row[c];
          if (cell && !cell.isValid) {
            setSelectedCellToCorrect({
              rowIndex: r,
              colIndex: c,
              column: headers[c],
              value: data[r]?.[c],
              reason: cell.reason,
              originalValue: cell.originalValue,
              cleanedValue: cell.cleanedValue,
            });
            return;
          }
        }
      }
    }

    // No further error found
    alert('🎉 अभिनंदन! या फाईलमधील सर्व त्रुटी दुरुस्त झाल्या आहेत. आता सर्व डाटा 100% बरोबर आहे!');
    setSelectedCellToCorrect(null);
  };

  // ==========================================
  // BULK FIND & REPLACE HANDLER
  // Requirement: "एकाच प्रकारचा डाटा चुकला असेल तर find and replace सुविधा दया उदा. एखादया बँकेचा ifsc कोड चुकला असेल तर तो सगळीकडे एकाचवेळी बदलता येईल"
  // ==========================================
  const handleExecuteFindReplace = (
    findText: string,
    replaceText: string,
    targetColumn: string,
    options: { matchCase: boolean; exactMatch: boolean }
  ) => {
    if (!activeFile) return { replacedCount: 0, affectedRows: 0 };

    const headers = activeFile.headers;
    const currentRows = (activeFile.cleanedData && activeFile.cleanedData.length > 0)
      ? activeFile.cleanedData
      : activeFile.originalData;

    const targetColIndices =
      targetColumn === 'ALL'
        ? headers.map((_, i) => i)
        : [headers.indexOf(targetColumn)].filter((i) => i !== -1);

    if (targetColIndices.length === 0) return { replacedCount: 0, affectedRows: 0 };

    let replacedCount = 0;
    let affectedRowsCount = 0;
    const query = options.matchCase ? findText : findText.toLowerCase();

    const updatedRows = currentRows.map((row) => {
      const rowCopy = [...row];
      let rowModified = false;

      for (const colIdx of targetColIndices) {
        const val = rowCopy[colIdx];
        if (val === null || val === undefined) continue;

        const strVal = String(val);
        const compareVal = options.matchCase ? strVal : strVal.toLowerCase();

        let isMatch = false;
        let newVal = strVal;

        if (options.exactMatch) {
          if (compareVal === query) {
            isMatch = true;
            newVal = replaceText;
          }
        } else {
          if (compareVal.includes(query)) {
            isMatch = true;
            if (options.matchCase) {
              newVal = strVal.replaceAll(findText, replaceText);
            } else {
              const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
              newVal = strVal.replace(regex, replaceText);
            }
          }
        }

        if (isMatch && newVal !== strVal) {
          rowCopy[colIdx] = newVal;
          replacedCount++;
          rowModified = true;
        }
      }

      if (rowModified) {
        affectedRowsCount++;
      }
      return rowCopy;
    });

    if (replacedCount === 0) {
      return { replacedCount: 0, affectedRows: 0 };
    }

    // Immediately re-process updated rows with active cleaning & validation rules
    const result = processDataset(
      headers,
      updatedRows,
      currentActiveRules,
      bankMappings,
      {
        removeDuplicates: settings.duplicateHandling === 'remove',
        removeBlankRows: settings.removeBlankRows,
        removeBlankCols: settings.removeBlankCols,
      }
    );

    const cName = getSplitFileName(activeFile, 'correct', exportFormat);
    const iName = getSplitFileName(activeFile, 'incorrect', exportFormat);
    const cBlob =
      exportFormat === 'csv'
        ? generateDatasetCsvBlob(headers, result.correctRows, result.correctValidationGrid, false)
        : generateDatasetExcelBlob(headers, result.correctRows, result.correctValidationGrid, 'CorrectData', false);
    const iBlob =
      exportFormat === 'csv'
        ? generateDatasetCsvBlob(headers, result.incorrectRows, result.incorrectValidationGrid, true)
        : generateDatasetExcelBlob(headers, result.incorrectRows, result.incorrectValidationGrid, 'IncorrectData', true);

    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeFile.id
          ? {
              ...f,
              cleanedData: result.cleanedRows,
              validationGrid: result.validationGrid,
              correctRows: result.correctRows,
              incorrectRows: result.incorrectRows,
              correctValidationGrid: result.correctValidationGrid,
              incorrectValidationGrid: result.incorrectValidationGrid,
              correctCount: result.correctRows.length,
              incorrectCount: result.incorrectRows.length,
              qualityReport: result.qualityReport,
              processingLogs: result.processingLogs,
              correctBlob: cBlob,
              incorrectBlob: iBlob,
              correctFileName: cName,
              incorrectFileName: iName,
            }
          : f
      )
    );

    return { replacedCount, affectedRows: affectedRowsCount };
  };

  // ==========================================
  // BANK & IFSC AUTO-CORRECT HANDLER
  // Requirement: "बँकेचे नांव तसेच IFSC कोड auto correct करता येतील का याची चाचपणी करा.
  // (उदा. बॅकेचे नांव, शाखा, ifsc code ) आणि हा डाटा एकदाच application मध्ये excel file आधारे भरता येईल व सदरचा करेक्ट डा यादीमध्ये तात्काळ दुरुस्त करता येईल"
  // ==========================================
  const handleAutoCorrectBankAndIfsc = () => {
    if (!activeFile) return;

    const currentRows =
      activeFile.cleanedData && activeFile.cleanedData.length > 0
        ? activeFile.cleanedData
        : activeFile.originalData;

    const { updatedRows, summary } = autoCorrectBankAndIfscInDataset(
      activeFile.headers,
      currentRows,
      bankMasterList,
      bankMappings
    );

    if (summary.totalRowsChanged === 0) {
      alert(
        'माहिती: चालू यादीतील सर्व बँक नावे व IFSC कोड मास्टर डिरेक्टरीनुसार आधीच बरोबर आहेत किंवा कोणताही बदल आवश्यक नाही.'
      );
      return;
    }

    // Immediately re-process updated rows with active cleaning & validation rules
    const result = processDataset(
      activeFile.headers,
      updatedRows,
      currentActiveRules,
      bankMappings,
      {
        removeDuplicates: settings.duplicateHandling === 'remove',
        removeBlankRows: settings.removeBlankRows,
        removeBlankCols: settings.removeBlankCols,
      }
    );

    const cName = getSplitFileName(activeFile, 'correct', exportFormat);
    const iName = getSplitFileName(activeFile, 'incorrect', exportFormat);
    const cBlob =
      exportFormat === 'csv'
        ? generateDatasetCsvBlob(activeFile.headers, result.correctRows, result.correctValidationGrid, false)
        : generateDatasetExcelBlob(activeFile.headers, result.correctRows, result.correctValidationGrid, 'CorrectData', false);
    const iBlob =
      exportFormat === 'csv'
        ? generateDatasetCsvBlob(activeFile.headers, result.incorrectRows, result.incorrectValidationGrid, true)
        : generateDatasetExcelBlob(activeFile.headers, result.incorrectRows, result.incorrectValidationGrid, 'IncorrectData', true);

    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeFile.id
          ? {
              ...f,
              cleanedData: result.cleanedRows,
              validationGrid: result.validationGrid,
              correctRows: result.correctRows,
              incorrectRows: result.incorrectRows,
              correctValidationGrid: result.correctValidationGrid,
              incorrectValidationGrid: result.incorrectValidationGrid,
              correctCount: result.correctRows.length,
              incorrectCount: result.incorrectRows.length,
              qualityReport: result.qualityReport,
              processingLogs: result.processingLogs,
              correctBlob: cBlob,
              incorrectBlob: iBlob,
              correctFileName: cName,
              incorrectFileName: iName,
            }
          : f
      )
    );

    setAutoCorrectSummary(summary);
    setIsAutoCorrectReportOpen(true);
  };

  // ==========================================
  // OUTPUT EXPORT HANDLERS (DIRECT DOWNLOADS, NO ZIP!)
  // Requirement: "output folder loction set करण्याची सुविधा दया म्हणजे वारंवार ते निवडावे लागणार नाही"
  // ==========================================
  const handleDownloadCorrect = async (customBaseName?: string) => {
    if (!activeFile) return;
    const filename = getSplitFileName(activeFile, 'correct', exportFormat, customBaseName);
    const headers = activeFile.headers;
    const rows = activeFile.correctRows || activeFile.cleanedData || activeFile.originalData;
    const vGrid = activeFile.correctValidationGrid;

    let blob: Blob;
    if (exportFormat === 'csv') {
      blob = generateDatasetCsvBlob(headers, rows, vGrid, false);
    } else {
      blob = generateDatasetExcelBlob(headers, rows, vGrid, 'CorrectData', false);
    }

    if (outputDirectoryHandle) {
      const saved = await saveBlobToDirectory(outputDirectoryHandle, blob, filename);
      if (saved) {
        alert(`✅ फाईल यशस्वीरित्या निवडलेल्या फोल्डरमध्ये सेव्ह झाली:\n${outputDirectoryName}/${filename}`);
        return;
      }
    }

    downloadBlob(blob, filename);
  };

  const handleDownloadIncorrect = async (customBaseName?: string) => {
    if (!activeFile) return;
    const filename = getSplitFileName(activeFile, 'incorrect', exportFormat, customBaseName);
    const headers = activeFile.headers;
    const rows = activeFile.incorrectRows || [];
    const vGrid = activeFile.incorrectValidationGrid;

    let blob: Blob;
    if (exportFormat === 'csv') {
      blob = generateDatasetCsvBlob(headers, rows, vGrid, true);
    } else {
      blob = generateDatasetExcelBlob(headers, rows, vGrid, 'IncorrectData', true);
    }

    if (outputDirectoryHandle) {
      const saved = await saveBlobToDirectory(outputDirectoryHandle, blob, filename);
      if (saved) {
        alert(`✅ फाईल यशस्वीरित्या निवडलेल्या फोल्डरमध्ये सेव्ह झाली:\n${outputDirectoryName}/${filename}`);
        return;
      }
    }

    downloadBlob(blob, filename);
  };

  const handleDownloadBoth = async (customBaseName?: string) => {
    if (!activeFile) return;
    const cName = getSplitFileName(activeFile, 'correct', exportFormat, customBaseName);
    const iName = getSplitFileName(activeFile, 'incorrect', exportFormat, customBaseName);

    const headers = activeFile.headers;
    const cRows = activeFile.correctRows || activeFile.cleanedData || activeFile.originalData;
    const iRows = activeFile.incorrectRows || [];

    let cBlob: Blob;
    let iBlob: Blob;

    if (exportFormat === 'csv') {
      cBlob = generateDatasetCsvBlob(headers, cRows, activeFile.correctValidationGrid, false);
      iBlob = generateDatasetCsvBlob(headers, iRows, activeFile.incorrectValidationGrid, true);
    } else {
      cBlob = generateDatasetExcelBlob(headers, cRows, activeFile.correctValidationGrid, 'CorrectData', false);
      iBlob = generateDatasetExcelBlob(headers, iRows, activeFile.incorrectValidationGrid, 'IncorrectData', true);
    }

    const itemsToDownload = [
      { blob: cBlob, filename: cName },
    ];
    if (iRows.length > 0) {
      itemsToDownload.push({ blob: iBlob, filename: iName });
    }

    if (outputDirectoryHandle) {
      const { success, writtenCount } = await saveMultipleBlobsToDirectory(outputDirectoryHandle, itemsToDownload);
      if (success) {
        alert(`✅ दोन्ही फाईल्स (${writtenCount} फाईल्स) थेट '${outputDirectoryName}' फोल्डरमध्ये सेव्ह झाल्या!\n1. ${cName}\n2. ${iRows.length > 0 ? iName : ''}`);
        return;
      }
    }

    await downloadFilesDirectlyWithoutZip(itemsToDownload);
  };

  const handleDownloadAllCompleted = async () => {
    const completed = files.filter(
      (f) => f.status === 'Completed' || (f.cleanedData && f.cleanedData.length > 0)
    );
    if (completed.length === 0) return;

    const downloadList: { blob: Blob; filename: string }[] = [];

    for (const f of completed) {
      const cName = getSplitFileName(f, 'correct', exportFormat);
      const headers = f.headers;
      const cRows = f.correctRows || f.cleanedData || f.originalData;
      let cBlob: Blob;

      if (exportFormat === 'csv') {
        cBlob = generateDatasetCsvBlob(headers, cRows, f.correctValidationGrid, false);
      } else {
        cBlob = generateDatasetExcelBlob(headers, cRows, f.correctValidationGrid, 'CorrectData', false);
      }
      downloadList.push({ blob: cBlob, filename: cName });

      if (f.incorrectRows && f.incorrectRows.length > 0) {
        const iName = getSplitFileName(f, 'incorrect', exportFormat);
        let iBlob: Blob;
        if (exportFormat === 'csv') {
          iBlob = generateDatasetCsvBlob(headers, f.incorrectRows, f.incorrectValidationGrid, true);
        } else {
          iBlob = generateDatasetExcelBlob(headers, f.incorrectRows, f.incorrectValidationGrid, 'IncorrectData', true);
        }
        downloadList.push({ blob: iBlob, filename: iName });
      }
    }

    if (outputDirectoryHandle) {
      const { success, writtenCount } = await saveMultipleBlobsToDirectory(outputDirectoryHandle, downloadList);
      if (success) {
        alert(`✅ सर्व ${writtenCount} फाईल्स थेट '${outputDirectoryName}' फोल्डरमध्ये सेव्ह झाल्या!`);
        return;
      }
    }

    await downloadFilesDirectlyWithoutZip(downloadList);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans transition-colors duration-200">
      {/* Offline Toast */}
      <OfflineIndicator />

      {/* Global Header */}
      <Header
        darkMode={settings.darkMode}
        onToggleDarkMode={() =>
          handleUpdateSettings({ darkMode: !settings.darkMode })
        }
        onOpenBankManager={() => setIsBankManagerOpen(true)}
        onOpenProfiles={() => setIsProfilesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenFindReplace={() => setIsFindReplaceOpen(true)}
        bankMasterCount={bankMasterList.length}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Metric Dashboard Cards */}
        <DashboardStatsCards files={files} activeFile={activeFile} />

        {/* 1. File Selection Section */}
        <FileSelector
          onFilesSelected={handleFilesSelected}
          outputDirectoryHandle={outputDirectoryHandle}
          outputDirectoryName={outputDirectoryName}
          onSelectOutputFolder={handleSelectOutputFolder}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onLoadSample={handleLoadSample}
        />

        {/* 2. File Queue Section */}
        <FileQueue
          files={files}
          activeFileId={activeFileId}
          onSelectActiveFile={(id) => {
            setActiveFileId(id);
          }}
          selectedFileIds={selectedFileIds}
          onToggleSelectFile={handleToggleSelectFile}
          onSelectAllFiles={handleSelectAllFiles}
          onRemoveSelected={handleRemoveSelected}
          onClearAll={handleClearAll}
          onRemoveSingle={handleRemoveSingle}
        />

        {/* 3. Cleaning & Validation Rules */}
        <CleaningRules
          activeFile={activeFile}
          columnRules={currentActiveRules}
          onChangeColumnRules={handleChangeColumnRules}
          onAutoDetectColumns={handleAutoDetectColumns}
          autoApply={settings.autoApplyDetectedRules}
          onToggleAutoApply={(val) =>
            handleUpdateSettings({ autoApplyDetectedRules: val })
          }
        />

        {/* 4. Batch Processing Engine Controls */}
        <BatchProcessor
          files={files}
          isProcessing={isProcessing}
          isPaused={isPaused}
          currentProcessingIndex={currentProcessingIndex}
          onStartProcessing={handleStartProcessing}
          onPauseProcessing={handlePauseProcessing}
          onResumeProcessing={handleResumeProcessing}
          onCancelProcessing={handleCancelProcessing}
        />

        {/* 5. Interactive Data Preview & In-App Correction */}
        <DataPreview
          activeFile={activeFile}
          columnRules={currentActiveRules}
          bankMappings={bankMappings}
          onOpenChangesModal={() => setIsChangesModalOpen(true)}
          onOpenFindReplace={() => setIsFindReplaceOpen(true)}
          onAutoCorrectBankAndIfsc={handleAutoCorrectBankAndIfsc}
          onOpenBankMasterManager={() => setIsBankManagerOpen(true)}
          onOpenCorrectionModal={(detail) => setSelectedCellToCorrect(detail)}
        />

        {/* 6. Data Quality & Duplicate Governance */}
        <DataQuality
          activeFile={activeFile}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onTriggerReClean={handleTriggerReCleanActive}
        />

        {/* 7. Processing Audit Log */}
        <ProcessingLog activeFile={activeFile} />

        {/* 8. Output & Export Actions (Correct / Incorrect files, No ZIP) */}
        <OutputActions
          files={files}
          activeFile={activeFile}
          onDownloadCorrect={handleDownloadCorrect}
          onDownloadIncorrect={handleDownloadIncorrect}
          onDownloadBoth={handleDownloadBoth}
          onDownloadAllCompleted={handleDownloadAllCompleted}
          outputDirectoryName={outputDirectoryName}
          onSelectOutputFolder={handleSelectOutputFolder}
          onClearOutputFolder={handleClearOutputFolder}
          exportFormat={exportFormat}
          onToggleExportFormat={setExportFormat}
        />
      </main>

      {/* In-App Data Correction Modal */}
      <DataCorrectionModal
        isOpen={!!selectedCellToCorrect}
        onClose={() => setSelectedCellToCorrect(null)}
        activeFile={activeFile}
        selectedCell={selectedCellToCorrect}
        bankMappings={bankMappings}
        columnRules={currentActiveRules}
        onSaveCell={handleSaveCellCorrection}
        onSaveRow={handleSaveRowCorrection}
        onNavigateNextError={handleNavigateNextError}
      />

      {/* Bulk Find & Replace Modal */}
      <FindReplaceModal
        isOpen={isFindReplaceOpen}
        onClose={() => setIsFindReplaceOpen(false)}
        activeFile={activeFile}
        onExecuteReplace={handleExecuteFindReplace}
      />

      {/* Bank Mapping & Master Directory Manager Modal */}
      <BankMappingManager
        isOpen={isBankManagerOpen}
        onClose={() => setIsBankManagerOpen(false)}
        bankMappings={bankMappings}
        onSaveMappings={handleSaveBankMappings}
        bankMasterList={bankMasterList}
        onSaveBankMaster={handleSaveBankMasterList}
        onAutoCorrectActiveFile={handleAutoCorrectBankAndIfsc}
        hasActiveFile={!!activeFile}
      />

      {/* Auto-Correct Report Modal */}
      <AutoCorrectReportModal
        isOpen={isAutoCorrectReportOpen}
        onClose={() => setIsAutoCorrectReportOpen(false)}
        summary={autoCorrectSummary}
        fileName={activeFile?.name}
      />

      {/* Cleaning Profiles Modal */}
      <CleaningProfiles
        isOpen={isProfilesOpen}
        onClose={() => setIsProfilesOpen(false)}
        profiles={profiles}
        onSaveProfiles={handleSaveProfiles}
        currentRules={currentActiveRules}
        onApplyProfile={handleApplyProfile}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        outputDirectoryName={outputDirectoryName}
        onSelectOutputFolder={handleSelectOutputFolder}
        onClearOutputFolder={handleClearOutputFolder}
        onSaveSettings={(s) => {
          setSettings(s);
          saveSettings(s);
        }}
      />

      {/* Help Guide Reference */}
      <HelpGuideModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Cell Changes Inspector Modal */}
      <ChangesModal
        isOpen={isChangesModalOpen}
        onClose={() => setIsChangesModalOpen(false)}
        changes={activeFileChanges}
        fileName={activeFile?.name || 'Dataset'}
      />

      {/* Clean Light Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">
          AI Data Cleaning Suite • 100% Client-Side Progressive Web Application
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          सपोर्ट: महाराष्ट्र शेतकरी DBT, पीक नुकसान, महसूल व बँकिंग डेटा • थेट स्वतंत्र फाईल्स डाऊनलोड (_correct & _incorrect)
        </p>
      </footer>
    </div>
  );
}
