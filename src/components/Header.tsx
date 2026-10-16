import React from 'react';
import {
  Building2,
  Moon,
  Sun,
  ShieldCheck,
  Settings as SettingsIcon,
  Bookmark,
  Sparkles,
  HelpCircle,
  Replace,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenBankManager: () => void;
  onOpenProfiles: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenFindReplace?: () => void;
  bankMasterCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenBankManager,
  onOpenProfiles,
  onOpenSettings,
  onOpenHelp,
  onOpenFindReplace,
  bankMasterCount,
}) => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
        {/* Left: Brand Icon & Privacy Tag */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-blue-600 rounded-[10px] flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-slate-800/80 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400 text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>100% Local Browser Engine</span>
            </div>
          </div>

          {/* Mobile Actions Container (Compact) */}
          <div className="flex md:hidden items-center gap-1.5">
            <PWAInstallButton />
            <button
              onClick={onToggleDarkMode}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>
        </div>

        {/* Center: DATA CLEANING SUITE (Prominent and Centered) */}
        {/* Requirement: "DATA CLEANING SUITE हे नांव वर मध्यभागी घ्या" */}
        <div className="flex flex-col items-center justify-center text-center px-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-wider text-slate-900 dark:text-white uppercase font-mono">
              DATA CLEANING SUITE
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
              PWA
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
            स्वच्छ • तपासा • दुरुस्त करा • स्वतंत्र फाईल्स डाऊनलोड
          </p>
        </div>

        {/* Right: Action Controls */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 w-full md:w-auto">
          <div className="hidden md:block">
            <PWAInstallButton />
          </div>

          {onOpenFindReplace && (
            <button
              onClick={onOpenFindReplace}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-xs font-bold text-blue-800 transition shadow-xs"
              title="Find and Replace in active dataset"
            >
              <Replace className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">शोधा आणि बदला</span>
            </button>
          )}

          <button
            onClick={onOpenBankManager}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/90 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
            title="बँक व IFSC मास्टर डिरेक्टरी (Excel फाईल भरा / व्यवस्थापित करा)"
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">बँक मास्टर (Excel)</span>
            {bankMasterCount !== undefined && bankMasterCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300">
                {bankMasterCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenProfiles}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/90 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
            title="Save or Load Cleaning Profiles"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Profiles</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenHelp}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 transition"
            title="Guide & Indian Farmer Format Reference"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleDarkMode}
            className="hidden md:flex p-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            title={darkMode ? 'Switch to Clean Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
