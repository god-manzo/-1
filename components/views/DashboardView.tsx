
import React from 'react';
import { Activity, BarChart3, Clock, AlertTriangle } from 'lucide-react';
import { GameState, SystemAnalysis, SystemReport, SeasonalReport } from '../../types';
import { FocusTimer } from '../FocusTimer';
import { StatKey } from '../../types';

// New component to display AI analysis
const SystemAnalysisDisplay = ({ analysis }: { analysis: SystemAnalysis }) => {
    const { weeklyReport, monthlyReport, seasonalReport, dailyRecords } = analysis;
    const hasEnoughData = Object.keys(dailyRecords).length > 1;

    if (!hasEnoughData) {
        return (
            <div className="border-2 border-dashed border-slate-800 rounded-sm p-8 text-center font-mono">
                <AlertTriangle className="mx-auto text-amber-500 mb-4" size={32}/>
                <h4 className="text-amber-400 font-bold tracking-widest">НЕДОСТАТОЧНО ДАННЫХ</h4>
                <p className="text-slate-500 text-xs mt-2">
                    Системе требуется больше времени для сбора телеметрии. Продолжайте выполнять директивы.
                </p>
            </div>
        )
    }

    const ReportCard = ({ report, title }: { report?: SystemReport | SeasonalReport, title: string }) => {
        if (!report) return null;
        const isSeasonal = 'archetype' in report;
        
        return (
            <div className="bg-[#0f172a]/50 border border-slate-800 rounded-sm p-4">
                <h4 className="text-sm font-bold text-blue-300 tracking-[0.2em] uppercase mb-3">{title}</h4>
                <div className="font-mono text-xs space-y-2 text-slate-400">
                    <div className="flex items-start gap-2">
                        <span className="text-slate-600 w-20 shrink-0">Период:</span>
                        <span className="text-slate-200">{report.period}</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-slate-600 w-20 shrink-0">Факт:</span>
                        <span className="text-slate-200">{report.fact}</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-slate-600 w-20 shrink-0">Тренд:</span>
                        <span className="text-slate-200">{report.trend}</span>
                    </div>
                    {isSeasonal && (
                        <div className="flex items-start gap-2 pt-2 border-t border-slate-800 mt-2">
                            <span className="text-slate-600 w-20 shrink-0">Архетип:</span>
                            <span className="font-bold text-amber-400">{(report as SeasonalReport).archetype}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <ReportCard report={seasonalReport} title="Сезонный анализ"/>
            <ReportCard report={monthlyReport} title="Ежемесячный отчет"/>
            <ReportCard report={weeklyReport} title="Еженедельный отчет"/>
        </div>
    );
};


export function DashboardView({ gameState, systemAnalysis, onOpenVictoryModal, onRecordVictory }: {
  gameState: GameState;
  systemAnalysis: SystemAnalysis;
  onOpenVictoryModal: () => void;
  onRecordVictory: (title: string, desc: string, stat: StatKey) => void;
}) {
  
  const handleFocusComplete = (duration: number) => {
    onRecordVictory(
        "Сеанс глубокой концентрации",
        `Завершено ${duration} минут сфокусированной работы.`,
        StatKey.INTELLECT
    );
  };

  return (
    <div className="space-y-8 animate-fade-in font-mono">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3 tracking-widest uppercase animate-text-focus-in">
            <Activity className="text-blue-500" /> СВОДКА СИСТЕМЫ
        </h2>
        <p className="text-slate-500 text-sm mt-1">Прямая трансляция данных и метрик производительности.</p>
      </div>
      
      {/* FOCUS TIMER & ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FocusTimer onComplete={handleFocusComplete} />
        <div className="space-y-4">
            <div className="bg-[#0a0f1c] border-2 border-slate-800 rounded-sm p-6 text-center h-full flex flex-col justify-center">
                <BarChart3 size={32} className="mx-auto text-blue-500 mb-4" />
                <h3 className="text-blue-300 font-bold tracking-widest mb-2">АНАЛИТИЧЕСКИЙ КОНТУР</h3>
                <p className="text-slate-500 text-xs mb-4">Система наблюдает. Выводы будут представлены по мере накопления данных.</p>
                <button 
                  onClick={onOpenVictoryModal}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-blue-500 text-white font-bold py-3 px-4 rounded-sm transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
                >
                  Записать Достижение
                </button>
            </div>
        </div>
      </div>

      {/* SYSTEM ANALYSIS REPORTS */}
      <div>
          <SystemAnalysisDisplay analysis={systemAnalysis} />
      </div>
    </div>
  );
}
