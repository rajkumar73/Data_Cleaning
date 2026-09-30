import React from 'react';
import { Settings as SettingsIcon, X, Save, FolderOpen, CheckCircle2, Trash2 } from 'lucide-react';
import { AppSettings } from '../types/dataCleaner';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  outputDirectoryName?: string;
  onSelectOutputFolder?: () => void;
  onClearOutputFolder?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  outputDirectoryName,
  onSelectOutputFolder,
  onClearOutputFolder,
}) => {
  const [local, setLocal] = React.useState<AppSettings>(settings);

  React.useEffect(() => {
    setLocal(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(local);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl max-h-[85vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col text-slate-900 dark:text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/20 flex items-center justify-center">
              <SettingsIcon className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Application Settings</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure defaults, output format preferences, and export structure.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {/* Permanent Output Folder Location */}
          <div className="space-y-1.5 p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-slate-900">
            <label className="font-bold text-blue-950 flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-blue-600" />
              <span>कायमस्वरूपी आउटपुट फोल्डर (Default Output Folder):</span>
            </label>
            <p className="text-[11px] text-slate-600">
              येथे फोल्डर सेट केल्यास वारंवार फोल्डर निवडावे लागणार नाही. सर्व फाईल्स थेट याच फोल्डरमध्ये सेव्ह होतील.
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              {outputDirectoryName ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 font-mono font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    {outputDirectoryName}
                  </span>
                  {onClearOutputFolder && (
                    <button
                      type="button"
                      onClick={onClearOutputFolder}
                      className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-100 rounded transition"
                      title="काढून टाका"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-[11px] text-slate-500 italic">
                  कोणतेही कायमस्वरूपी फोल्डर सेट केलेले नाही (ब्राउझर डाऊनलोड्स वापरले जाईल).
                </span>
              )}

              {onSelectOutputFolder && (
                <button
                  type="button"
                  onClick={onSelectOutputFolder}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs"
                >
                  {outputDirectoryName ? 'फोल्डर बदला (Change)' : 'फोल्डर सेट करा (Set Folder)'}
                </button>
              )}
            </div>
          </div>
          {/* Default Output Format */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-slate-200 block">Default Output Format</label>
            <select
              value={local.defaultOutputFormat}
              onChange={(e) =>
                setLocal({ ...local, defaultOutputFormat: e.target.value as any })
              }
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-200 font-medium"
            >
              <option value="preserve">Preserve Original File Format (XLSX → XLSX, CSV → CSV)</option>
              <option value="xlsx">Always Output XLSX (.xlsx)</option>
              <option value="csv">Always Output CSV (.csv)</option>
            </select>
          </div>

          {/* Conflict Handling */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-slate-200 block">File Conflict Handling</label>
            <select
              value={local.conflictHandling}
              onChange={(e) =>
                setLocal({ ...local, conflictHandling: e.target.value as any })
              }
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-200 font-medium"
            >
              <option value="create_new">Create New Filename (e.g. File_Cleaned_1.xlsx) [Recommended]</option>
              <option value="overwrite">Overwrite Destination File</option>
              <option value="skip">Skip Processing if File Exists</option>
            </select>
          </div>

          {/* Date Format */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-slate-200 block">Standard Date Output Format</label>
            <select
              value={local.defaultDateFormat}
              onChange={(e) => setLocal({ ...local, defaultDateFormat: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-200 font-medium"
            >
              <option value="dd/mm/yyyy">dd/mm/yyyy (Indian Standard)</option>
              <option value="yyyy-mm-dd">yyyy-mm-dd (ISO Standard)</option>
            </select>
          </div>

          {/* Excel Extra Sheets */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">Excel (.xlsx) Output Worksheets</span>
            <div className="space-y-1.5 pl-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={local.includeQualitySheet}
                  onChange={(e) =>
                    setLocal({ ...local, includeQualitySheet: e.target.checked })
                  }
                  className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-0"
                />
                <span>Include "DataQuality" worksheet with validation statistics</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={local.includeLogSheet}
                  onChange={(e) =>
                    setLocal({ ...local, includeLogSheet: e.target.checked })
                  }
                  className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-0"
                />
                <span>Include "ProcessingLog" worksheet with column transformation logs</span>
              </label>
            </div>
          </div>

          {/* Preview Row Limit */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="font-bold text-slate-800 dark:text-slate-200 block">
              Maximum Preview Table Rows
            </label>
            <select
              value={local.maxPreviewRows}
              onChange={(e) =>
                setLocal({ ...local, maxPreviewRows: parseInt(e.target.value, 10) })
              }
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-200 font-medium"
            >
              <option value={100}>100 Rows</option>
              <option value={250}>250 Rows</option>
              <option value={500}>500 Rows (Recommended)</option>
              <option value={1000}>1000 Rows</option>
            </select>
          </div>

          {/* Visual Highlight */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={local.highlightInvalidCells}
                onChange={(e) =>
                  setLocal({ ...local, highlightInvalidCells: e.target.checked })
                }
                className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-rose-600 focus:ring-0"
              />
              <span>Highlight invalid cells with light red fill in preview and Excel</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-bold transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-md shadow-cyan-600/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
