import React from 'react';
import { Files, Layers, AlertTriangle, CheckCircle2, History, Sparkles } from 'lucide-react';
import { FileItem } from '../types/dataCleaner';

interface StatsProps {
  files: FileItem[];
  activeFile: FileItem | null;
}

export const DashboardStatsCards: React.FC<StatsProps> = ({ files, activeFile }) => {
  const totalFiles = files.length;
  const totalRows = files.reduce((acc, f) => acc + f.rowsCount, 0);

  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalChanged = 0;
  let completedCount = 0;

  files.forEach((f) => {
    if (f.status === 'Completed' || (f.cleanedData && f.cleanedData.length > 0)) {
      completedCount++;
      totalCorrect += f.correctCount ?? (f.cleanedData?.length || f.rowsCount);
      totalIncorrect += f.incorrectCount ?? 0;
    }
    if (f.qualityReport) {
      totalChanged += f.qualityReport.changedCellsCount;
    }
  });

  const cards = [
    {
      title: 'एकूण फाईल्स (Files)',
      value: totalFiles.toLocaleString(),
      sub: `${completedCount} फाईल्स तपासल्या`,
      icon: Files,
      color: 'text-blue-600',
      bg: 'bg-white border-slate-200 hover:border-blue-400',
      badgeBg: 'bg-blue-50 text-blue-800',
    },
    {
      title: 'एकूण नोंदी (Total Rows)',
      value: totalRows.toLocaleString(),
      sub: activeFile ? `${activeFile.rowsCount.toLocaleString()} निवडलेल्या फाईलमध्ये` : 'एकूण रांगेत',
      icon: Layers,
      color: 'text-indigo-600',
      bg: 'bg-white border-slate-200 hover:border-indigo-400',
      badgeBg: 'bg-indigo-50 text-indigo-800',
    },
    {
      title: '1. बरोबर नोंदी (Correct)',
      value: totalCorrect.toLocaleString(),
      sub: '100% वैध (_correct)',
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-400',
      badgeBg: 'bg-emerald-100 text-emerald-800',
    },
    {
      title: '2. त्रुटी नोंदी (Incorrect)',
      value: totalIncorrect.toLocaleString(),
      sub: totalIncorrect > 0 ? 'दुरुस्ती आवश्यक (_incorrect)' : '0 त्रुटी! सर्व बरोबर',
      icon: AlertTriangle,
      color: totalIncorrect > 0 ? 'text-rose-700' : 'text-slate-400',
      bg: totalIncorrect > 0 ? 'bg-rose-50/70 border-rose-300 hover:border-rose-400' : 'bg-white border-slate-200',
      badgeBg: totalIncorrect > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600',
    },
    {
      title: 'बदललेले सेल्स (Changed)',
      value: totalChanged.toLocaleString(),
      sub: 'स्वच्छ केलेले मूल्य',
      icon: History,
      color: 'text-cyan-700',
      bg: 'bg-white border-slate-200 hover:border-cyan-400',
      badgeBg: 'bg-cyan-50 text-cyan-800',
    },
    {
      title: 'पूर्ण स्थिती (Completed)',
      value: `${completedCount} / ${totalFiles}`,
      sub: totalFiles > 0 ? `${Math.round((completedCount / totalFiles) * 100)}% प्रगती` : 'यादी रिकामी',
      icon: Sparkles,
      color: 'text-amber-600',
      bg: 'bg-white border-slate-200 hover:border-amber-400',
      badgeBg: 'bg-amber-50 text-amber-800',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border shadow-xs transition-all hover:translate-y-[-1px] ${card.bg}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 truncate max-w-[120px]">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg ${card.badgeBg}`}>
                <Icon className={`w-3.5 h-3.5 ${card.color}`} />
              </div>
            </div>
            <div className={`text-xl font-bold font-mono tracking-tight mt-1 ${card.color}`}>
              {card.value}
            </div>
            <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
              {card.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
};
