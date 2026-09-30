import React from 'react';
import { HelpCircle, X, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-3xl max-h-[85vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col text-slate-900 dark:text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/20 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                User Guide & Indian Data Standards
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI Data Cleaning Suite • Complete Workflow & Validation Specifications
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {/* 10-Step Workflow */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              1-Minute Batch Cleaning Workflow
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1.5 leading-relaxed">
              <p><strong>1. Select Files:</strong> Choose a single file, multiple files, or an entire folder of Excel/CSV data.</p>
              <p><strong>2. Select Output Folder:</strong> Choose a local folder via the browser File System Access API, or use automatic ZIP fallback.</p>
              <p><strong>3. Auto Detect Columns:</strong> The system automatically recognizes your column names and suggests suitable cleaning parameters.</p>
              <p><strong>4. Start Batch Cleaning:</strong> Click Start Cleaning to execute all transformations and validations locally.</p>
              <p><strong>5. Review & Export:</strong> View the data preview, inspect invalid cells, and save cleaned files directly or download as a complete ZIP archive.</p>
            </div>
          </div>

          {/* Maharashtra Farmer DBT Column Standard */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Supported Indian Agriculture & DBT Structure
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2 px-3">Column Name</th>
                    <th className="py-2 px-3">Default Rules</th>
                    <th className="py-2 px-3">Data Type Policy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-sans">
                  <tr>
                    <td className="py-1.5 px-3 font-bold text-slate-900 dark:text-white font-mono">Sr.No</td>
                    <td className="py-1.5 px-3 text-cyan-700 dark:text-cyan-300 font-semibold">Number</td>
                    <td className="py-1.5 px-3 text-slate-600 dark:text-slate-400">Numeric</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-bold text-slate-900 dark:text-white font-mono">Farmers_District</td>
                    <td className="py-1.5 px-3 text-cyan-700 dark:text-cyan-300 font-semibold">Trim + Proper</td>
                    <td className="py-1.5 px-3 text-slate-600 dark:text-slate-400">Proper Case Text</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-bold text-slate-900 dark:text-white font-mono">Farmers_Taluka</td>
                    <td className="py-1.5 px-3 text-cyan-700 dark:text-cyan-300 font-semibold">Trim + Proper</td>
                    <td className="py-1.5 px-3 text-slate-600 dark:text-slate-400">Proper Case Text</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-bold text-slate-900 dark:text-white font-mono">Farmers_Village</td>
                    <td className="py-1.5 px-3 text-cyan-700 dark:text-cyan-300 font-semibold">Trim + Proper</td>
                    <td className="py-1.5 px-3 text-slate-600 dark:text-slate-400">Proper Case Text</td>
                  </tr>
                  <tr className="bg-amber-50 dark:bg-amber-950/20">
                    <td className="py-1.5 px-3 font-bold text-amber-900 dark:text-amber-300 font-mono">Gat_Number</td>
                    <td className="py-1.5 px-3 text-cyan-700 dark:text-cyan-300 font-semibold">Trim + Text</td>
                    <td className="py-1.5 px-3 text-amber-800 dark:text-amber-400 font-bold">🔒 LOCKED AS TEXT (Preserves '0056')</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-bold text-slate-900 dark:text-white font-mono">Type_of_Loss</td>
                    <td className="py-1.5 px-3 text-cyan-700 dark:text-cyan-300 font-semibold">Trim + Proper</td>
                    <td className="py-1.5 px-3 text-slate-600 dark:text-slate-400">Proper Case Text</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-bold text-slate-900 dark:text-white font-mono">Affected_Area_Hectares</td>
                    <td className="py-1.5 px-3 text-cyan-700 dark:text-cyan-300 font-semibold">Trim + Number</td>
                    <td className="py-1.5 px-3 text-slate-600 dark:text-slate-400">Numeric Decimal</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-bold text-slate-900 dark:text-white font-mono">Amount_Disbursed</td>
                    <td className="py-1.5 px-3 text-cyan-700 dark:text-cyan-300 font-semibold">Trim + Amount</td>
                    <td className="py-1.5 px-3 text-slate-600 dark:text-slate-400">Strips ₹, Rs, commas</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-bold text-slate-900 dark:text-white font-mono">Name_of_the_Farmer</td>
                    <td className="py-1.5 px-3 text-cyan-700 dark:text-cyan-300 font-semibold">Trim + Proper</td>
                    <td className="py-1.5 px-3 text-slate-600 dark:text-slate-400">Proper Case Text</td>
                  </tr>
                  <tr className="bg-amber-50 dark:bg-amber-950/20">
                    <td className="py-1.5 px-3 font-bold text-amber-900 dark:text-amber-300 font-mono">Farmers_Aadhaar_No</td>
                    <td className="py-1.5 px-3 text-cyan-700 dark:text-cyan-300 font-semibold">Trim + Text + Aadhaar(12)</td>
                    <td className="py-1.5 px-3 text-amber-800 dark:text-amber-400 font-bold">🔒 LOCKED AS TEXT (12 Digits)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-bold text-slate-900 dark:text-white font-mono">Bank_Name</td>
                    <td className="py-1.5 px-3 text-cyan-700 dark:text-cyan-300 font-semibold">Trim + Bank Standardize</td>
                    <td className="py-1.5 px-3 text-emerald-700 dark:text-emerald-400 font-bold">Mapped to Official Bank Name</td>
                  </tr>
                  <tr className="bg-amber-50 dark:bg-amber-950/20">
                    <td className="py-1.5 px-3 font-bold text-amber-900 dark:text-amber-300 font-mono">Saving_A_C_No</td>
                    <td className="py-1.5 px-3 text-cyan-700 dark:text-cyan-300 font-semibold">Trim + Text</td>
                    <td className="py-1.5 px-3 text-amber-800 dark:text-amber-400 font-bold">🔒 LOCKED AS TEXT (Preserves '00123')</td>
                  </tr>
                  <tr className="bg-amber-50 dark:bg-amber-950/20">
                    <td className="py-1.5 px-3 font-bold text-amber-900 dark:text-amber-300 font-mono">Branch_IFSC_Code</td>
                    <td className="py-1.5 px-3 text-cyan-700 dark:text-cyan-300 font-semibold">Trim + UPPER + Text + IFSC(11)</td>
                    <td className="py-1.5 px-3 text-amber-800 dark:text-amber-400 font-bold">🔒 LOCKED AS TEXT (11 Chars)</td>
                  </tr>
                  <tr className="bg-amber-50 dark:bg-amber-950/20">
                    <td className="py-1.5 px-3 font-bold text-amber-900 dark:text-amber-300 font-mono">Mobile_No</td>
                    <td className="py-1.5 px-3 text-cyan-700 dark:text-cyan-300 font-semibold">Trim + Text + Mobile(10)</td>
                    <td className="py-1.5 px-3 text-amber-800 dark:text-amber-400 font-bold">🔒 LOCKED AS TEXT (^[6-9][0-9]&#123;9&#125;$)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Privacy & Offline */}
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
            <h5 className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              100% Offline Client Privacy Guarantee
            </h5>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
              This application was engineered specifically for sensitive Indian financial and government beneficiary records.
              All file parsing, regex validation, bank dictionary mapping, and Excel generation run entirely within your local browser's JavaScript sandbox.
              <strong> Zero files or personal records are sent to external servers or cloud AI APIs.</strong>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
