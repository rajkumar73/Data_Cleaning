import React from 'react';
import {
  BarChart3,
  Copy,
  AlertOctagon,
  PhoneCall,
  CreditCard,
  Fingerprint,
  Calendar,
  IndianRupee,
  Building,
  CheckCircle,
  FileMinus,
  Users,
  Calculator,
  Scale,
  AlertTriangle,
} from 'lucide-react';
import { AppSettings, FileItem } from '../types/dataCleaner';

interface DataQualityProps {
  activeFile: FileItem | null;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onTriggerReClean?: () => void;
}

export const DataQuality: React.FC<DataQualityProps> = ({
  activeFile,
  settings,
  onUpdateSettings,
  onTriggerReClean,
}) => {
  if (!activeFile) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-xs">
        <BarChart3 className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Data Quality Metrics</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Quality reports and invalid cell summaries will appear here after batch processing.
        </p>
      </div>
    );
  }

  const qr = activeFile.qualityReport;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              6. Data Quality & Duplicate Governance
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
              {activeFile.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Validation error breakdown, blank column analysis, and duplicate handling.
          </p>
        </div>

        {onTriggerReClean && (
          <button
            onClick={onTriggerReClean}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
          >
            Apply Changes & Re-analyze
          </button>
        )}
      </div>

      {/* Governed Duplicate & Blank Clean Options */}
      <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Duplicate options */}
        <div className="space-y-1">
          <span className="font-bold text-slate-800 dark:text-slate-300 block">Duplicate Rows Governance:</span>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white">
              <input
                type="radio"
                name="duplicateMode"
                checked={settings.duplicateHandling === 'detect'}
                onChange={() => onUpdateSettings({ duplicateHandling: 'detect' })}
                className="text-cyan-600 focus:ring-0"
              />
              <span>Detect Only (Preserve All Rows)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-amber-800 dark:text-amber-300 font-semibold hover:text-amber-900">
              <input
                type="radio"
                name="duplicateMode"
                checked={settings.duplicateHandling === 'remove'}
                onChange={() => onUpdateSettings({ duplicateHandling: 'remove' })}
                className="text-amber-600 focus:ring-0"
              />
              <span>Remove Duplicate Rows</span>
            </label>
          </div>
        </div>

        {/* Blank rows / cols removal */}
        <div className="space-y-1">
          <span className="font-bold text-slate-800 dark:text-slate-300 block">Blank Handling:</span>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white">
              <input
                type="checkbox"
                checked={settings.removeBlankRows}
                onChange={(e) => onUpdateSettings({ removeBlankRows: e.target.checked })}
                className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-0"
              />
              <span>Remove Completely Blank Rows</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white">
              <input
                type="checkbox"
                checked={settings.removeBlankCols}
                onChange={(e) => onUpdateSettings({ removeBlankCols: e.target.checked })}
                className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-0"
              />
              <span>Remove Completely Blank Columns</span>
            </label>
          </div>
        </div>
      </div>

      {/* Requirement 'ब': हेक्टरनिहाय अनुदानाचा ताळमेळ (Rate vs Area Cross-Verification) */}
      <div className="bg-blue-50/70 dark:bg-slate-950/70 border border-blue-200 dark:border-blue-900/50 rounded-xl p-3.5 space-y-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-slate-900 dark:text-white">
              हेक्टरनिहाय अनुदान ताळमेळ तपासणी (Rate vs Area Cross-Verification):
            </span>
            <span className="text-[11px] text-blue-800 dark:text-blue-300 font-medium">
              (क्षेत्र × शासन दर = अपेक्षित रक्कम तपासा)
            </span>
          </div>

          <label className="flex items-center gap-2 font-bold cursor-pointer text-blue-900 dark:text-blue-300">
            <input
              type="checkbox"
              checked={!!settings.rateVerificationEnabled}
              onChange={(e) => {
                onUpdateSettings({ rateVerificationEnabled: e.target.checked });
                if (onTriggerReClean) setTimeout(onTriggerReClean, 50);
              }}
              className="rounded bg-white dark:bg-slate-800 border-blue-300 text-blue-600 focus:ring-0"
            />
            <span>ताळमेळ नियम सक्रिय करा</span>
          </label>
        </div>

        {settings.rateVerificationEnabled && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-blue-200/80">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-medium">शासन अनुदान दर:</span>
              <select
                value={settings.reliefRatePerHectare || 13600}
                onChange={(e) => {
                  onUpdateSettings({ reliefRatePerHectare: Number(e.target.value) });
                  if (onTriggerReClean) setTimeout(onTriggerReClean, 50);
                }}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-bold text-slate-800"
              >
                <option value={13600}>₹ १३,६०० / हेक्टर (जिरायत पिके - SDRF सुधारित)</option>
                <option value={8500}>₹ ८,५०० / हेक्टर (जिरायत पिके - NDRF)</option>
                <option value={17000}>₹ १७,००० / हेक्टर (बागायत पिके)</option>
                <option value={22500}>₹ २२,५०० / हेक्टर (बहुवार्षिक / फळपिके)</option>
                <option value={27000}>₹ २७,००० / हेक्टर (फळबागा सुधारित)</option>
                <option value={36000}>₹ ३६,००० / हेक्टर (विशेष पॅकेज)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-medium">कमाल क्षेत्र मर्यादा:</span>
              <select
                value={settings.maxHectaresCeiling !== undefined ? settings.maxHectaresCeiling : 2}
                onChange={(e) => {
                  onUpdateSettings({ maxHectaresCeiling: Number(e.target.value) });
                  if (onTriggerReClean) setTimeout(onTriggerReClean, 50);
                }}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-bold text-slate-800"
              >
                <option value={2}>२.०० हेक्टर मर्यादा (Max 2 Ha)</option>
                <option value={3}>३.०० हेक्टर मर्यादा (Max 3 Ha)</option>
                <option value={0}>मर्यादा नाही (Full Area)</option>
              </select>
            </div>

            {onTriggerReClean && (
              <button
                onClick={onTriggerReClean}
                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs"
              >
                ताळमेळ पुन्हा तपासा
              </button>
            )}

            {qr && qr.rateMismatchCount !== undefined && qr.rateMismatchCount > 0 && (
              <span className="text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded-md">
                ⚠️ {qr.rateMismatchCount} खात्यांमध्ये अनुदान रकमेत तफावत आढळली!
              </span>
            )}
          </div>
        )}
      </div>

      {/* Metrics Summary Grid */}
      {qr ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-semibold">
              <span>Total Rows</span>
              <CheckCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="mt-1 text-lg font-bold font-mono text-slate-900 dark:text-white">
              {qr.totalRows.toLocaleString()}
            </div>
          </div>

          {/* Requirement 'अ': Duplicate Aadhaar */}
          <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-slate-950 border border-amber-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-400 text-xs font-semibold">
              <span>दुबार आधार (Dup Aadhaar)</span>
              <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="mt-1 text-lg font-bold font-mono text-amber-800 dark:text-amber-400">
              {qr.duplicateAadhaarCount ? qr.duplicateAadhaarCount.toLocaleString() : '0'}
            </div>
          </div>

          {/* Requirement 'अ': Duplicate Bank Accounts */}
          <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-slate-950 border border-amber-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-400 text-xs font-semibold">
              <span>दुबार बँक खाती (Dup A/c)</span>
              <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="mt-1 text-lg font-bold font-mono text-amber-800 dark:text-amber-400">
              {qr.duplicateAccountCount ? qr.duplicateAccountCount.toLocaleString() : '0'}
            </div>
          </div>

          {/* Requirement 'ब': Rate Mismatch */}
          {settings.rateVerificationEnabled && (
            <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-slate-950 border border-rose-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-400 text-xs font-semibold">
                <span>अनुदान तफावत (Rate Diff)</span>
                <Scale className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="mt-1 text-lg font-bold font-mono text-rose-800 dark:text-rose-400">
                {qr.rateMismatchCount ? qr.rateMismatchCount.toLocaleString() : '0'}
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-semibold">
              <span>Duplicate Rows</span>
              <Copy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="mt-1 text-lg font-bold font-mono text-amber-700 dark:text-amber-400">
              {qr.duplicateRows.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-slate-950 border border-rose-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-semibold">
              <span>Invalid Mobile</span>
              <PhoneCall className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="mt-1 text-lg font-bold font-mono text-rose-700 dark:text-rose-400">
              {qr.invalidMobile.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-slate-950 border border-rose-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-semibold">
              <span>Invalid IFSC</span>
              <CreditCard className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="mt-1 text-lg font-bold font-mono text-rose-700 dark:text-rose-400">
              {qr.invalidIFSC.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-slate-950 border border-rose-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-semibold">
              <span>Invalid Aadhaar</span>
              <Fingerprint className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="mt-1 text-lg font-bold font-mono text-rose-700 dark:text-rose-400">
              {qr.invalidAadhaar.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-slate-950 border border-rose-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-semibold">
              <span>Invalid Dates</span>
              <Calendar className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="mt-1 text-lg font-bold font-mono text-rose-700 dark:text-rose-400">
              {qr.invalidDates.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-slate-950 border border-rose-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-semibold">
              <span>Invalid Amounts</span>
              <IndianRupee className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="mt-1 text-lg font-bold font-mono text-rose-700 dark:text-rose-400">
              {qr.invalidAmounts.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-slate-950 border border-emerald-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-semibold">
              <span>Bank Standardized</span>
              <Building className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="mt-1 text-lg font-bold font-mono text-emerald-800 dark:text-emerald-400">
              {qr.banksStandardized.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-semibold">
              <span>Blank Cells</span>
              <FileMinus className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="mt-1 text-lg font-bold font-mono text-slate-800 dark:text-slate-300">
              {qr.blankCells.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-semibold">
              <span>Cells Processed</span>
              <AlertOctagon className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="mt-1 text-lg font-bold font-mono text-cyan-700 dark:text-cyan-400">
              {qr.cellsProcessed.toLocaleString()}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 text-center font-medium">
          Run "Start Batch Cleaning" to calculate comprehensive data quality report for this file.
        </div>
      )}

      {/* Blank Data Analysis Table */}
      {qr && qr.columnBlankStats.length > 0 && (
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
            Blank Values by Column
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2 px-3">Column</th>
                  <th className="py-2 px-3">Blank Count</th>
                  <th className="py-2 px-3">Blank %</th>
                  <th className="py-2 px-3 min-w-[150px]">Density Visualization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono">
                {qr.columnBlankStats.map((stat, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-sans font-semibold text-slate-900 dark:text-slate-200">
                      {stat.column}
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">
                      {stat.blankCount.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-slate-900 dark:text-slate-300 font-bold">
                      {stat.blankPercent}%
                    </td>
                    <td className="py-2 px-3">
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${
                            stat.blankPercent > 50
                              ? 'bg-rose-500'
                              : stat.blankPercent > 20
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${stat.blankPercent}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
