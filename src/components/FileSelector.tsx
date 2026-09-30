import React, { useRef, useState } from 'react';
import {
  FileUp,
  FolderUp,
  FolderCheck,
  FolderSync,
  UploadCloud,
  FileSpreadsheet,
  Check,
  AlertCircle,
} from 'lucide-react';
import { AppSettings } from '../types/dataCleaner';

interface FileSelectorProps {
  onFilesSelected: (files: File[]) => void;
  outputDirectoryHandle: any;
  outputDirectoryName: string;
  onSelectOutputFolder: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onLoadSample: () => void;
}

export const FileSelector: React.FC<FileSelectorProps> = ({
  onFilesSelected,
  outputDirectoryHandle,
  outputDirectoryName,
  onSelectOutputFolder,
  settings,
  onUpdateSettings,
  onLoadSample,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const singleInputRef = useRef<HTMLInputElement>(null);
  const multiInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return ext === 'xlsx' || ext === 'xls' || ext === 'csv';
      });

      if (droppedFiles.length > 0) {
        onFilesSelected(droppedFiles);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={singleInputRef}
        onChange={handleFileInputChange}
        accept=".xlsx,.xls,.csv"
        className="hidden"
      />
      <input
        type="file"
        ref={multiInputRef}
        onChange={handleFileInputChange}
        accept=".xlsx,.xls,.csv"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFileInputChange}
        // @ts-ignore
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
      />

      {/* Header & Sample Data Shortcut */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            1. File & Output Selection
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select single/multiple Excel or CSV files or full directory trees.
          </p>
        </div>

        <button
          onClick={onLoadSample}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-300 dark:border-cyan-800/80 bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300 text-xs font-bold transition shadow-xs"
          title="Load official Maharashtra DBT Farmer Crop Loss dataset to test immediately"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>Load Maharashtra Farmer Sample</span>
        </button>
      </div>

      {/* Buttons Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => singleInputRef.current?.click()}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-xs transition active:scale-[0.98]"
        >
          <FileUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Select File</span>
        </button>

        <button
          onClick={() => multiInputRef.current?.click()}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-xs transition active:scale-[0.98]"
        >
          <FolderSync className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Select Multiple Files</span>
        </button>

        <button
          onClick={() => folderInputRef.current?.click()}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-xs transition active:scale-[0.98]"
        >
          <FolderUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Select Folder</span>
        </button>

        <button
          onClick={onSelectOutputFolder}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold shadow-xs transition active:scale-[0.98] ${
            outputDirectoryHandle
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-600/80 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100'
              : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
          }`}
          title="Select local destination folder to automatically write cleaned files"
        >
          <FolderCheck className={`w-4 h-4 ${outputDirectoryHandle ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
          <span>{outputDirectoryHandle ? 'Change Output Folder' : 'Select Output Folder'}</span>
        </button>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => multiInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-500/10 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-800 hover:border-cyan-400 bg-slate-50/80 dark:bg-slate-950/50 hover:bg-slate-100/80'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-slate-200/80 dark:bg-slate-800/80 flex items-center justify-center text-slate-600 dark:text-slate-400">
            <UploadCloud className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Drop Excel (.xlsx, .xls) or CSV files here
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            Drag individual files, multiple files, or complete folder trees. All processing happens 100% locally.
          </p>
        </div>
      </div>

      {/* Output Destination & Options Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
        {/* Output Directory Display */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-600 dark:text-slate-400">Output Folder:</span>
          {outputDirectoryName ? (
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-mono text-[11px] font-semibold flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              {outputDirectoryName}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px] flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-500" />
              Default (Browser Downloads - Direct Files)
            </span>
          )}
        </div>

        {/* Output Format Settings */}
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white">
            <input
              type="checkbox"
              checked={settings.defaultOutputFormat === 'preserve'}
              onChange={(e) =>
                onUpdateSettings({
                  defaultOutputFormat: e.target.checked ? 'preserve' : 'xlsx',
                })
              }
              className="rounded bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-0"
            />
            <span>Preserve original format</span>
          </label>

          {settings.defaultOutputFormat !== 'preserve' && (
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold">Format:</span>
              <label className="flex items-center gap-1 cursor-pointer font-medium text-slate-800 dark:text-slate-200">
                <input
                  type="radio"
                  name="outputFormat"
                  value="xlsx"
                  checked={settings.defaultOutputFormat === 'xlsx'}
                  onChange={() => onUpdateSettings({ defaultOutputFormat: 'xlsx' })}
                  className="text-cyan-600 focus:ring-0"
                />
                <span className="text-[11px]">XLSX</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer font-medium text-slate-800 dark:text-slate-200">
                <input
                  type="radio"
                  name="outputFormat"
                  value="csv"
                  checked={settings.defaultOutputFormat === 'csv'}
                  onChange={() => onUpdateSettings({ defaultOutputFormat: 'csv' })}
                  className="text-cyan-600 focus:ring-0"
                />
                <span className="text-[11px]">CSV</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
