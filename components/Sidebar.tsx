
import React from 'react';
import { TabView } from '../types';
import { 
  Inbox, 
  Repeat, 
  User, 
  Sun,
  Terminal,
  Activity
} from 'lucide-react';

interface SidebarProps {
  activeTab: TabView;
  onTabChange: (tab: TabView) => void;
  tasksCount: {
    inbox: number;
    today: number;
  }
}

export function Sidebar({ activeTab, onTabChange, tasksCount }: SidebarProps) {
  
  const NavItem = ({ tab, icon: Icon, label, count, colorClass = "text-slate-400" }: any) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => onTabChange(tab)}
        className={`
          relative w-full flex items-center justify-between px-3 py-2.5 rounded-sm transition-all duration-200 group overflow-hidden
          ${isActive 
            ? 'bg-blue-600/10 border-l-2 border-l-blue-500 text-blue-100' 
            : 'border-l-2 border-l-transparent text-slate-400 hover:bg-slate-800/30 hover:text-slate-200 hover:border-l-slate-600'
          }
        `}
      >
        {/* Hover Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>

        <div className="flex items-center gap-3 relative z-10">
          <Icon size={18} className={`${isActive ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : colorClass} transition-transform group-hover:scale-110`} />
          <span className={`text-sm tracking-wide ${isActive ? 'font-bold font-mono' : 'font-medium'}`}>{label}</span>
        </div>
        {count > 0 && (
          <span className={`
            relative z-10 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm 
            ${isActive ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]' : 'text-slate-500 bg-slate-900 border border-slate-800'}
          `}>
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="w-64 bg-[#050914]/95 border-r border-slate-800/80 flex flex-col h-full backdrop-blur-xl relative">
      {/* Brand */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-800/50 bg-slate-900/20">
        <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20">
             <Terminal className="text-blue-500 animate-pulse" size={20} />
        </div>
        <div>
            <div className="font-bold font-mono tracking-[0.2em] text-sm text-white text-shadow-glow">
                SYSTEM<span className="text-blue-500">.OS</span>
            </div>
            <div className="text-[9px] text-slate-500 font-mono">V 2.5.0 // ONLINE</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8 custom-scrollbar">
        
        {/* Main Modules */}
        <div className="space-y-1">
           <div className="px-3 text-[9px] font-mono uppercase text-slate-600 font-bold mb-3 tracking-[0.2em] flex items-center gap-2">
              <div className="w-1 h-1 bg-slate-600 rounded-full"></div> МОДУЛИ
           </div>
           <NavItem tab={TabView.INBOX} icon={Inbox} label="Входящие" count={tasksCount.inbox} colorClass="text-blue-400" />
           <NavItem tab={TabView.TODAY} icon={Sun} label="План" count={tasksCount.today} colorClass="text-amber-400" />
        </div>

        {/* Strategy */}
        <div className="space-y-1">
           <div className="px-3 text-[9px] font-mono uppercase text-slate-600 font-bold mb-3 tracking-[0.2em] flex items-center gap-2">
              <div className="w-1 h-1 bg-slate-600 rounded-full"></div> СТРАТЕГИЯ
           </div>
           <NavItem tab={TabView.HABITS} icon={Repeat} label="Протоколы" colorClass="text-cyan-400" />
        </div>

        {/* Player */}
        <div className="space-y-1">
           <div className="px-3 text-[9px] font-mono uppercase text-slate-600 font-bold mb-3 tracking-[0.2em] flex items-center gap-2">
              <div className="w-1 h-1 bg-slate-600 rounded-full"></div> ОПЕРАТИВНИК
           </div>
           <NavItem tab={TabView.PROFILE} icon={User} label="Профиль" />
           <NavItem tab={TabView.DASHBOARD} icon={Activity} label="Сводка" />
        </div>
      </div>

      {/* Footer / System Status */}
      <div className="p-4 border-t border-slate-800 bg-[#03050a]">
        <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono">
            <div className="flex items-center gap-2">
                <Activity size={12} className="text-green-500 animate-pulse" />
                СИНХР: 99%
            </div>
            <div className="opacity-50">UID: 001</div>
        </div>
      </div>
    </div>
  );
}
