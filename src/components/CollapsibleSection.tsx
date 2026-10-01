import React from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';

interface CollapsibleSectionProps {
  id: string;
  sectionNumber: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'blue' | 'emerald' | 'amber' | 'slate' | 'purple' | 'rose';
  isCollapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  summaryWhenCollapsed?: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  id,
  sectionNumber,
  title,
  subtitle,
  badge,
  badgeColor = 'slate',
  isCollapsed,
  onToggle,
  children,
  icon,
  summaryWhenCollapsed,
}) => {
  const getBadgeStyle = () => {
    switch (badgeColor) {
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800';
      case 'emerald':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'amber':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800';
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800';
      case 'rose':
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div
      id={`section-container-${id}`}
      className={`transition-all duration-200 rounded-2xl ${
        isCollapsed
          ? 'bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-300'
          : ''
      }`}
    >
      {/* Collapsed Bar State */}
      {isCollapsed ? (
        <div className="p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 cursor-pointer select-none flex-1 min-w-[240px]" onClick={onToggle}>
            {icon && (
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                {icon}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                  {sectionNumber}
                </span>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {title}
                </h3>
                {badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBadgeStyle()}`}>
                    {badge}
                  </span>
                )}
                <span className="text-[11px] font-medium text-slate-400 italic">
                  (लपवला आहे / Minimized)
                </span>
              </div>
              {summaryWhenCollapsed ? (
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {summaryWhenCollapsed}
                </div>
              ) : subtitle ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={onToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-xs transition"
            title="हा विभाग उघडा (Expand Section)"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>उघडा (Expand)</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Expanded State: Wrapper with a compact header minimize control */
        <div className="relative group">
          <div className="absolute top-3 right-3 z-10 sm:flex items-center gap-1">
            <button
              type="button"
              onClick={onToggle}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 hover:bg-slate-100 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-[11px] font-medium shadow-xs transition backdrop-blur-xs"
              title="हा विभाग लपवा (Minimise Section)"
            >
              <EyeOff className="w-3 h-3 text-slate-400" />
              <span className="hidden sm:inline">लपवा (Minimise)</span>
              <ChevronUp className="w-3 h-3" />
            </button>
          </div>
          {children}
        </div>
      )}
    </div>
  );
};
