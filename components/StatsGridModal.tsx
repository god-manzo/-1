
import React from 'react';
import { Profile, StatKey } from '../types';
import { STAT_CONFIG } from '../constants';
import { X, Activity } from 'lucide-react';

interface StatsGridModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStat: (stat: StatKey) => void;
  profile: Profile;
}

const getRank = (value: number) => {
    if (value >= 100) return { rank: 'S', color: 'text-amber-400', shadow: 'shadow-amber-500/50' };
    if (value >= 75) return { rank: 'A', color: 'text-red-500', shadow: 'shadow-red-500/50' };
    if (value >= 50) return { rank: 'B', color: 'text-blue-400', shadow: 'shadow-blue-500/50' };
    if (value >= 30) return { rank: 'C', color: 'text-green-400', shadow: 'shadow-green-500/50' };
    if (value >= 15) return { rank: 'D', color: 'text-slate-300', shadow: 'shadow-slate-500/50' };
    return { rank: 'E', color: 'text-slate-500', shadow: 'shadow-slate-500/20' };
};


export function StatsGridModal({ isOpen, onClose, onSelectStat, profile }: StatsGridModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
               className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm transition-opacity" 
               onClick={onClose}
            />
            
            <div className="relative w-full max-w-xl animate-scale-up">
               <div className="absolute -inset-1 bg-blue-600/20 blur-md rounded-sm"></div>
               
               <div className="relative bg-[#0b101b] border-2 border-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.2)] rounded-sm overflow-hidden flex flex-col max-h-[80vh]">
                   
                   <div className="bg-slate-900 border-b border-blue-800 p-3 flex justify-between items-center shadow-md">
                       <div className="flex items-center gap-2">
                           <Activity className="text-blue-500" size={18} />
                           <h3 className="text-lg font-bold text-white font-mono tracking-[0.2em] drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]">
                               ПАРАМЕТРЫ
                           </h3>
                       </div>
                       <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                           <X size={20} />
                       </button>
                   </div>

                   <div className="p-1 overflow-y-auto custom-scrollbar bg-[linear-gradient(rgba(30,41,59,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.1)_1px,transparent_1px)] bg-[size:20px_20px]">
                       <div className="flex flex-col gap-1 p-2">
                           <div className="flex justify-between items-center p-3 mb-2 bg-blue-900/10 border border-blue-900/30 rounded-sm">
                               <span className="text-xs text-blue-400 font-mono tracking-widest uppercase">Очки улучшения</span>
                               <span className="text-xl font-mono text-slate-500 font-bold">0</span>
                           </div>

                           {Object.entries(profile.stats).map(([key, value]) => {
                               const k = key as StatKey;
                               const config = STAT_CONFIG[k];
                               const rankInfo = getRank(value);
                               
                               return (
                                   <button 
                                       key={key} 
                                       onClick={() => onSelectStat(k)}
                                       className="group relative flex items-center justify-between p-3 border border-slate-800 bg-[#0f1525] hover:bg-blue-900/10 hover:border-blue-500/50 transition-all duration-200"
                                   >
                                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-blue-500 transition-colors"></div>

                                       <div className="flex items-center gap-4">
                                           <div className="w-10 h-10 flex items-center justify-center bg-slate-900 border border-slate-700 rounded-sm text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors">
                                               <config.icon size={18} />
                                           </div>

                                           <div className="text-left">
                                               <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold group-hover:text-blue-300 transition-colors">
                                                   {config.label}
                                               </div>
                                               <div className="flex items-center gap-2 mt-1">
                                                    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                        <div 
                                                           className="h-full bg-slate-500 group-hover:bg-blue-500 transition-colors"
                                                           style={{ width: `${Math.min(value, 100)}%` }}
                                                        ></div>
                                                    </div>
                                               </div>
                                           </div>
                                       </div>

                                       <div className="flex items-center gap-4">
                                           <div className="text-right">
                                               <div className="text-2xl text-white font-bold font-mono leading-none group-hover:text-shadow-glow">
                                                   {value.toFixed(0)}
                                               </div>
                                           </div>
                                           
                                           <div className={`w-10 h-10 flex items-center justify-center border border-slate-800 bg-slate-900 rounded-sm font-mono font-bold text-lg ${rankInfo.color} ${rankInfo.shadow} drop-shadow-md`}>
                                               {rankInfo.rank}
                                           </div>
                                       </div>
                                   </button>
                               );
                           })}
                       </div>
                   </div>
                   
                   <div className="bg-slate-900 border-t border-slate-800 p-2 text-center">
                       <span className="text-[9px] text-slate-600 font-mono tracking-[0.3em] uppercase">
                           Выберите параметр для просмотра истории
                       </span>
                   </div>
               </div>
            </div>
       </div>
    );
}
