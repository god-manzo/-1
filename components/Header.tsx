import React from 'react';
import { TabView } from '../types';

interface HeaderProps {
  level: number;
  currentXp: number;
  xpToNext: number;
  hp: number;
  maxHp: number;
  avatar: string;
}

export function Header({ level, currentXp, xpToNext, hp, maxHp, avatar }: HeaderProps) {
  const xpPercent = Math.min((currentXp / xpToNext) * 100, 100);
  const hpPercent = Math.min((hp / maxHp) * 100, 100);

  return (
    <header className="bg-surface/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-800 shadow-lg transition-all duration-300">
      <div className="max-w-4xl mx-auto px-4 py-3">
        
        {/* Top Row: Avatar & Title & Level */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
             {/* Character Avatar */}
             <div className="w-12 h-12 flex items-center justify-center text-4xl filter drop-shadow-md bg-slate-800/50 rounded-lg border border-slate-700">
               {avatar}
             </div>

             <div>
               <h1 className="font-bold text-white tracking-tight leading-none text-lg">Дневник Побед</h1>
               <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-1">
                 <span>HP {Math.floor(hp)} / {maxHp}</span>
               </div>
             </div>
          </div>

          {/* Level Badge (Restored to previous style) */}
          <div className="flex flex-col items-end">
             <span className="text-3xl font-bold font-mono text-white leading-none">{level}</span>
             <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">УРОВЕНЬ</span>
          </div>
        </div>

        {/* Status Bars */}
        <div className="space-y-1.5 mb-1">
           {/* HP Bar */}
           <div className="relative h-3 bg-slate-900 rounded-md overflow-hidden w-full border border-slate-800/50">
             <div 
               className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500 ease-out"
               style={{ width: `${hpPercent}%` }}
             />
             {/* Optional Text inside bar for clarity */}
             <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white/50 z-10">
                ЗДОРОВЬЕ
             </div>
           </div>

           {/* XP Bar */}
           <div className="relative h-1.5 bg-slate-900 rounded-full overflow-hidden w-full">
             <div 
               className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out"
               style={{ width: `${xpPercent}%` }}
             />
           </div>
           
           <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>{Math.floor(currentXp)} XP</span>
              <span>{xpToNext} XP NEXT</span>
           </div>
        </div>
      </div>
    </header>
  );
}