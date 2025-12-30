

import React from 'react';
import { ScrollText, Activity } from 'lucide-react';
import { GameState, StatKey } from '../../types';
import { STAT_CONFIG } from '../../constants';
import { FocusTimer } from '../FocusTimer';

export function DashboardView({ gameState, onOpenVictoryModal, onRecordVictory }: {
  gameState: GameState;
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
      
      {/* FOCUS & ACTIONS */}
      <div className="space-y-4">
        <FocusTimer onComplete={handleFocusComplete} />
        <button 
          onClick={onOpenVictoryModal}
          className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-blue-500 text-white font-bold py-3 px-4 rounded-sm transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
        >
          Записать Достижение
        </button>
      </div>

      {/* RECENT LOGS */}
      <div className="bg-surface border border-slate-800 rounded-sm shadow-lg flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50">
          <h3 className="text-slate-400 text-sm tracking-[0.2em] flex items-center gap-2 font-bold">
            <ScrollText size={16} /> ЖУРНАЛ АКТИВНОСТИ
          </h3>
        </div>
        <div className="divide-y divide-slate-800/50 max-h-[300px] overflow-y-auto custom-scrollbar bg-[#0b0f1a]">
          {gameState.victoryHistory.length === 0 ? (
            <div className="text-center py-10 text-slate-600 text-sm">НЕТ ДАННЫХ.</div>
          ) : (
            gameState.victoryHistory.slice(0, 10).map((log) => {
              const config = STAT_CONFIG[log.stat];
              return (
                <div key={log.id} className="p-3 hover:bg-slate-900/40 transition-colors flex gap-4 items-center group">
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-sm bg-slate-900 border border-slate-800">
                    <config.icon size={16} style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                     <span className="font-bold text-slate-300 text-sm truncate pr-2 group-hover:text-blue-300">{log.title}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-secondary">+{log.xpGained} XP</div>
                    <div className="text-[10px] text-slate-600">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}