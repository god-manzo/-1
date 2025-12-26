import React from 'react';
import { Task } from '../types';
import { STAT_CONFIG } from '../constants';
import { CheckCircle2, Circle, Trash2, Heart } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  completedToday: Record<string, boolean>;
  onComplete: (id: string) => void;
  onDelete?: (id: string) => void;
  filter: 'today' | 'all';
}

export function TaskList({ tasks, completedToday, onComplete, onDelete, filter }: TaskListProps) {
  // Sort: Incomplete first, then by stat type
  const sortedTasks = [...tasks].sort((a, b) => {
    const aDone = completedToday[a.id] ? 1 : 0;
    const bDone = completedToday[b.id] ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    return a.stat.localeCompare(b.stat);
  });

  return (
    <div className="space-y-3">
      {sortedTasks.map((task) => {
        const isCompleted = completedToday[task.id];
        const config = STAT_CONFIG[task.stat];
        const Icon = config.icon;

        // In Dashboard, show incomplete first
        if (filter === 'today' && isCompleted) return null; 

        return (
          <div 
            key={task.id}
            className={`group relative flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${
              isCompleted 
                ? 'bg-slate-900/50 border-slate-800 opacity-60' 
                : 'bg-surface border-slate-700 hover:border-primary/50 hover:shadow-[0_0_10px_rgba(139,92,246,0.1)]'
            }`}
          >
            {/* Stat Indicator Strip */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg" 
              style={{ backgroundColor: config.color }} 
            />

            <div className="flex items-center gap-4 pl-3 w-full">
              <button
                onClick={() => onComplete(task.id)}
                disabled={isCompleted}
                className={`transition-transform active:scale-95 flex-shrink-0 ${
                  isCompleted ? 'text-secondary cursor-default' : 'text-slate-500 hover:text-primary'
                }`}
              >
                {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>

              <div className="flex-1 min-w-0">
                <h4 className={`font-medium truncate ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                  {task.title}
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1" style={{ color: config.color }}>
                    <Icon size={12} /> {config.label.toUpperCase()}
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-hud flex items-center gap-1">
                    +{task.xpValue} XP
                  </span>
                  {task.hpReward > 0 && (
                    <>
                      <span className="text-slate-600">|</span>
                      <span className="text-red-500 flex items-center gap-1 font-bold">
                        <Heart size={10} fill="currentColor" /> +{task.hpReward} HP
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {onDelete && !task.id.startsWith('daily-') && (
              <button 
                onClick={() => onDelete(task.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-500 transition-opacity flex-shrink-0"
                aria-label="Delete task"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
