
import React from 'react';
import { VictoryLog } from '../types';
import { STAT_CONFIG } from '../constants';
import { Award } from 'lucide-react';

interface RecentAchievementsCardProps {
    history: VictoryLog[];
}

export function RecentAchievementsCard({ history }: RecentAchievementsCardProps) {
    const recentHistory = history.slice(0, 5);

    return (
        <div className="bg-[#0a0f1c] border border-slate-800 rounded-sm shadow-lg flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50">
              <h3 className="text-slate-400 text-xs tracking-[0.2em] flex items-center gap-2 font-bold uppercase">
                <Award size={16} /> Недавние Достижения
              </h3>
            </div>
            <div className="divide-y divide-slate-800/50 overflow-y-auto custom-scrollbar bg-[#0b0f1a]">
              {recentHistory.length === 0 ? (
                <div className="text-center py-10 text-slate-600 text-sm font-mono">НЕТ ДАННЫХ.</div>
              ) : (
                recentHistory.map((log) => {
                  const config = STAT_CONFIG[log.stat];
                  return (
                    <div key={log.id} className="p-3 hover:bg-slate-900/40 transition-colors flex gap-3 items-center group">
                      <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-sm bg-slate-900 border border-slate-800">
                        <config.icon size={16} style={{ color: config.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                         <span className="font-bold text-slate-300 text-sm truncate pr-2 group-hover:text-blue-300">{log.title}</span>
                         <div className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleString('ru-RU', { day: 'numeric', month: 'short' })}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-secondary">+{log.xpGained} XP</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
        </div>
    );
}
