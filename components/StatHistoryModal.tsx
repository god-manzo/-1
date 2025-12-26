import React from 'react';
import { StatKey, VictoryLog } from '../types';
import { STAT_CONFIG } from '../constants';
import { X } from 'lucide-react';

interface StatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stat: StatKey | null;
  history: VictoryLog[];
}

export function StatHistoryModal({ isOpen, onClose, stat, history }: StatHistoryModalProps) {
  if (!isOpen || !stat) return null;

  const config = STAT_CONFIG[stat];
  const Icon = config.icon;

  // Filter history for this stat
  const statLogs = history.filter(log => log.stat === stat);

  // Group by title to count occurrences
  const groupedLogs = statLogs.reduce((acc, log) => {
    const key = log.title;
    if (!acc[key]) {
      acc[key] = {
        title: key,
        count: 0,
        totalXp: 0,
        lastTimestamp: log.timestamp
      };
    }
    acc[key].count += 1;
    acc[key].totalXp += log.xpGained;
    if (log.timestamp > acc[key].lastTimestamp) {
        acc[key].lastTimestamp = log.timestamp;
    }
    return acc;
  }, {} as Record<string, { title: string, count: number, totalXp: number, lastTimestamp: number }>);

  // Convert to array and sort by recency
  const sortedGroupedLogs = Object.values(groupedLogs).sort((a, b) => b.lastTimestamp - a.lastTimestamp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-[#0a0f1c] border-2 border-blue-900 w-full max-w-md rounded-sm shadow-[0_0_50px_rgba(37,99,235,0.2)] overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-slate-900/80 p-4 border-b border-blue-900/50 flex justify-between items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>
          <h3 className="font-bold text-white flex items-center gap-3 relative z-10 font-mono text-lg tracking-wider">
            <span style={{ color: config.color }}><Icon size={24} /></span>
            {config.label.toUpperCase()} HISTORY
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors relative z-10">
            <X size={24} />
          </button>
        </div>

        <div className="p-0 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {sortedGroupedLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-600 font-mono">
                NO DATA FOUND
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
                {sortedGroupedLogs.map((item) => (
                    <div key={item.title} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors group">
                        <div className="flex-1 pr-4">
                            <div className="text-slate-200 font-bold font-mono text-sm mb-1 group-hover:text-blue-200 transition-colors">
                                {item.title}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                                Total XP Gained: <span className="text-blue-400">{item.totalXp}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {item.count > 1 && (
                                <div className="bg-blue-900/30 border border-blue-500/30 text-blue-400 px-2 py-1 rounded text-xs font-mono font-bold">
                                    x{item.count}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-900/80 border-t border-slate-800 text-center">
            <div className="text-[10px] text-slate-600 font-mono tracking-[0.3em]">RECORDS OF ACHIEVEMENT</div>
        </div>
      </div>
    </div>
  );
}