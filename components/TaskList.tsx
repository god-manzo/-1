

import React from 'react';
import { Task, Priority } from '../types';
import { STAT_CONFIG } from '../constants';
import { Check, Trash2, Calendar, Repeat, Hexagon } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  completedToday: Record<string, boolean>;
  onComplete: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TaskList({ tasks, completedToday, onComplete, onDelete }: TaskListProps) {
  
  const getPriorityColor = (p: Priority) => {
    switch(p) {
        case Priority.S_RANK: return 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]';
        case Priority.A_RANK: return 'border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.1)]';
        case Priority.B_RANK: return 'border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.1)]';
        default: return 'border-slate-800 hover:border-slate-600'; // E-Rank
    }
  };

  const getRankBadgeColor = (p: Priority) => {
    switch(p) {
        case Priority.S_RANK: return 'text-red-500 bg-red-500/10 border-red-500/20';
        case Priority.A_RANK: return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        case Priority.B_RANK: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        default: return 'text-slate-500 bg-slate-800 border-slate-700';
    }
  };

  if (tasks.length === 0) return null;

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => {
        const isCompleted = completedToday[task.id];
        const config = STAT_CONFIG[task.stat];
        const Icon = config.icon;

        return (
          <div 
            key={task.id}
            className={`
              group relative flex items-center gap-3 p-3 rounded-sm border transition-all duration-300 animate-slide-in
              ${isCompleted 
                ? 'bg-slate-900/20 border-slate-800 opacity-60 blur-[0.5px]' 
                : `bg-[#0f1623] hover:bg-[#141c2f] hover:shadow-lg hover:translate-x-1 ${getPriorityColor(task.priority)}`
              }
            `}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Decoration Bar */}
            {!isCompleted && (
                <div className={`absolute left-0 top-0 bottom-0 w-[2px] rounded-l-sm transition-colors ${
                    task.priority === Priority.S_RANK ? 'bg-red-500' :
                    task.priority === Priority.A_RANK ? 'bg-amber-500' :
                    task.priority === Priority.B_RANK ? 'bg-blue-500' : 'bg-slate-700'
                }`}></div>
            )}

            {/* Custom Checkbox (Hexagon Style) */}
            <button
              onClick={() => onComplete(task.id)}
              disabled={isCompleted && !task.isHabit}
              className={`
                relative flex items-center justify-center w-8 h-8 flex-shrink-0 transition-all active:scale-90
                ${isCompleted ? 'text-secondary' : 'text-slate-600 group-hover:text-blue-400'}
              `}
            >
               <Hexagon 
                 size={24} 
                 strokeWidth={1.5} 
                 className={`transition-all ${isCompleted ? 'fill-secondary/10 stroke-secondary' : 'fill-transparent stroke-current'}`} 
               />
               {isCompleted && <Check size={14} className="absolute inset-0 m-auto text-secondary animate-scale-up" strokeWidth={3} />}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                  <span className={`font-medium text-sm truncate transition-all ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-200 group-hover:text-white'}`}>
                    {task.title}
                  </span>
                  {task.isHabit && (
                    <span className="bg-cyan-500/10 text-cyan-500 p-0.5 rounded animate-pulse">
                        <Repeat size={10} />
                    </span>
                  )}
              </div>

              <div className="flex items-center gap-3 mt-1.5">
                 {/* Priority Badge */}
                 {task.priority !== Priority.E_RANK && (
                     <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${getRankBadgeColor(task.priority)}`}>
                        РАНГ-{task.priority}
                     </span>
                 )}

                 {/* Date Badge */}
                 {task.dueDate && (
                    <span className={`flex items-center gap-1 text-[10px] font-mono ${task.dueDate < new Date().toISOString().slice(0,10) ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                        <Calendar size={10} />
                        {new Date(task.dueDate).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })}
                    </span>
                 )}

                 {/* Stat Badge */}
                 <span className="flex items-center gap-1 text-[10px] font-mono opacity-80" style={{ color: config.color }}>
                    <Icon size={10} /> {config.label.toUpperCase()}
                 </span>
              </div>
            </div>

            {/* XP Reward (Visible on Hover) */}
            <div className={`
                flex flex-col items-end gap-1 px-2 transition-all duration-300
                ${isCompleted ? 'opacity-0' : 'opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0'}
            `}>
                <div className="text-xs font-mono font-bold text-blue-400 text-shadow-glow">+{task.xpValue} XP</div>
                {onDelete && !task.isHabit && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                        className="p-1 text-slate-600 hover:text-red-500 transition-colors"
                        title="Удалить"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
