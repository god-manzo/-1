import React from 'react';
import { Trophy, ScrollText, Activity } from 'lucide-react';
import { GameState } from '../../types';
import { STAT_CONFIG } from '../../constants';

interface DashboardViewProps {
  gameState: GameState;
  onCompleteTask: (id: string) => void;
  onOpenVictoryModal: () => void;
}

export function DashboardView({ gameState, onOpenVictoryModal }: DashboardViewProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Quick Actions / Status Header */}
      <div className="bg-surface border border-slate-800 rounded-sm p-8 shadow-lg flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent pointer-events-none"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-slate-500"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-slate-500"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-slate-500"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-slate-500"></div>

        <h2 className="text-2xl font-bold text-white z-10 font-mono tracking-widest uppercase">
           Victory Log
        </h2>
        <p className="text-slate-400 text-sm max-w-md z-10 font-mono">
          "Every victory, no matter how small, makes you stronger. Record your achievements to restore HP and gain XP."
        </p>
        
        <button 
          onClick={onOpenVictoryModal}
          className="mt-4 bg-secondary hover:bg-secondary/90 text-white font-bold py-4 px-10 rounded-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center gap-3 transform hover:-translate-y-1 active:translate-y-0 z-10 font-mono tracking-wide border border-secondary/50"
        >
          <Trophy size={20} /> RECORD NEW VICTORY
        </button>
      </div>

      {/* Recent History Feed - Full Width */}
      <div className="bg-surface border border-slate-800 rounded-sm p-0 shadow-lg flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50">
          <h3 className="text-blue-500 font-mono text-sm tracking-[0.2em] flex items-center gap-2 font-bold">
            <ScrollText size={16} /> SYSTEM LOGS
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
             <Activity size={12} className="animate-pulse text-secondary" />
             <span>TOTAL RECORDS: {gameState.victoryHistory.length}</span>
          </div>
        </div>
        
        <div className="divide-y divide-slate-800/50 max-h-[600px] overflow-y-auto custom-scrollbar bg-[#0b0f1a]">
          {gameState.victoryHistory.length === 0 && (
            <div className="text-center py-20 text-slate-600 font-mono text-sm">
              <div className="opacity-50 text-4xl mb-2">⚠</div>
              NO DATA FOUND. START YOUR JOURNEY.
            </div>
          )}
          
          {gameState.victoryHistory.map((log) => {
            const config = STAT_CONFIG[log.stat];
            const Icon = config.icon;
            return (
              <div key={log.id} className="p-4 hover:bg-slate-900/40 transition-colors flex gap-4 items-start group">
                <div className="mt-1 p-2 rounded-sm bg-slate-900 border border-slate-800 text-slate-400 shrink-0 group-hover:border-blue-500/30 transition-colors">
                  <Icon size={18} style={{ color: config.color }} />
                </div>
                
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-200 text-sm font-mono truncate pr-2 group-hover:text-blue-300 transition-colors">{log.title}</span>
                      <span className="text-[10px] text-slate-600 font-mono whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                   </div>
                   
                   {log.description && (
                     <div className="text-xs text-slate-500 mt-1 font-sans leading-relaxed">{log.description}</div>
                   )}
                   
                   <div className="flex gap-3 mt-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: config.color }}>
                        [{config.label}]
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-secondary">
                        +{log.xpGained} XP
                      </span>
                   </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}