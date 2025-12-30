
import React from 'react';
import { StatsRadar } from './StatsRadar';
import { StatKey } from '../types';
import { ScanLine, ChevronRight } from 'lucide-react';

interface BalanceAnalysisCardProps {
  stats: Record<StatKey, number>;
  onClick: () => void;
}

export function BalanceAnalysisCard({ stats, onClick }: BalanceAnalysisCardProps) {
  return (
    <div 
       className="w-full bg-[#0a0f1c] border border-slate-800 p-4 rounded-sm relative overflow-hidden group flex flex-col cursor-pointer hover:border-blue-500 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
       onClick={onClick}
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[20px] border-r-[20px] border-b-blue-500/20 border-r-transparent group-hover:border-b-blue-500 transition-colors"></div>
      
      <div className="flex justify-between items-center mb-2 z-10 shrink-0">
          <span className="text-xs text-blue-500 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <ScanLine size={16} className="animate-pulse" />
              Анализ баланса
          </span>
          <div className="flex items-center gap-1 text-slate-500 group-hover:text-blue-400 transition-colors text-[10px] uppercase tracking-widest">
              <span>Открыть</span>
              <ChevronRight size={14} />
          </div>
      </div>
      
      <div className="flex-1 relative w-full min-h-[200px] pointer-events-none">
           <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.2)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
           <div className="absolute inset-0 flex items-center justify-center">
               <StatsRadar stats={stats} />
           </div>
      </div>
    </div>
  );
}
