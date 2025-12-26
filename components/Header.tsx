import React from 'react';
import { TabView } from '../types';
import { LayoutDashboard, ListTodo, User } from 'lucide-react';

interface HeaderProps {
  level: number;
  currentXp: number;
  xpToNext: number;
  hp: number;
  maxHp: number;
  avatar: string;
  activeTab: TabView;
  setActiveTab: (tab: TabView) => void;
}

export function Header({ level, currentXp, xpToNext, hp, maxHp, avatar, activeTab, setActiveTab }: HeaderProps) {
  const xpPercent = Math.min((currentXp / xpToNext) * 100, 100);
  const hpPercent = Math.min((hp / maxHp) * 100, 100);

  return (
    <header className="bg-surface/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-800 shadow-lg transition-all duration-300">
      <div className="max-w-4xl mx-auto px-4 py-3">
        
        {/* Top Row: Avatar & Title */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
             {/* Character Avatar with Level Badge */}
             <div className="relative">
               <div className="w-10 h-10 flex items-center justify-center text-3xl filter drop-shadow-md bg-slate-800/50 rounded-full border border-slate-700">
                 {avatar}
               </div>
               <div className="absolute -bottom-1 -right-2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-slate-600 shadow-sm flex items-center gap-0.5">
                  <span className="text-amber-400 text-[8px]">LVL</span>{level}
               </div>
             </div>

             <div>
               <h1 className="font-bold text-white tracking-tight leading-none text-lg">Дневник Побед</h1>
               <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                 <span>HP {Math.floor(hp)}/{maxHp}</span>
               </div>
             </div>
          </div>

          {/* XP Text Indicator (Desktop Only) */}
          <div className="hidden sm:block text-right">
             <div className="text-[10px] text-slate-500 uppercase font-bold">Опыт</div>
             <div className="text-xs font-mono text-primary">{Math.floor(currentXp)} / {xpToNext}</div>
          </div>
        </div>

        {/* Compact Status Bars */}
        <div className="space-y-1 mb-1">
           {/* HP Bar */}
           <div className="relative h-2.5 bg-slate-900 rounded-full overflow-hidden w-full border border-slate-800/50">
             <div 
               className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500 ease-out"
               style={{ width: `${hpPercent}%` }}
             />
           </div>

           {/* XP Bar */}
           <div className="relative h-1.5 bg-slate-900 rounded-full overflow-hidden w-full">
             <div 
               className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out"
               style={{ width: `${xpPercent}%` }}
             />
           </div>
        </div>

        {/* Desktop Navigation (Hidden on Mobile) */}
        <div className="hidden md:flex justify-center gap-1 bg-slate-900/50 p-1 rounded-lg mt-2">
           <NavTab active={activeTab === TabView.DASHBOARD} onClick={() => setActiveTab(TabView.DASHBOARD)} label="Главная" icon={LayoutDashboard} />
           <NavTab active={activeTab === TabView.QUESTS} onClick={() => setActiveTab(TabView.QUESTS)} label="Задания" icon={ListTodo} />
           <NavTab active={activeTab === TabView.PROFILE} onClick={() => setActiveTab(TabView.PROFILE)} label="Герой" icon={User} />
        </div>
      </div>
    </header>
  );
}

function NavTab({ active, onClick, label, icon: Icon }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
        active 
          ? 'bg-surface text-white shadow-sm border border-slate-700' 
          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
      }`}
    >
      <Icon size={16} /> <span>{label}</span>
    </button>
  );
}
