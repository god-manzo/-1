
import React from 'react';
import { LogMessage } from '../types';
import { Terminal, Award, Zap, BrainCircuit, BarChart3 } from 'lucide-react';

interface SystemLogProps {
  logs: LogMessage[];
}

const getLogStyle = (type: LogMessage['type']) => {
    switch(type) {
        case 'level-up': return { border: 'border-amber-500 shadow-amber-500/20', text: 'text-amber-500', icon: <Terminal size={14} /> };
        case 'success': return { border: 'border-secondary/50', text: 'text-secondary', icon: <Terminal size={14} /> };
        case 'warning': return { border: 'border-red-500/50', text: 'text-red-500', icon: <Terminal size={14} /> };
        case 'info': return { border: 'border-hud/50', text: 'text-slate-400', icon: <Terminal size={14} /> };
        case 'achievement': return { border: 'border-yellow-400/50', text: 'text-yellow-400', icon: <Award size={14} /> };
        case 'stat_up': return { border: 'border-sky-500/50', text: 'text-sky-400', icon: <Zap size={14} /> };
        case 'advisor': return { border: 'border-purple-500/50', text: 'text-purple-400', icon: <BrainCircuit size={14} /> };
        case 'analysis': return { border: 'border-slate-600', text: 'text-slate-300', icon: <BarChart3 size={14} /> };
        default: return { border: 'border-hud/50', text: 'text-slate-400', icon: <Terminal size={14} /> };
    }
}

const getLogPrefix = (type: LogMessage['type']): string => {
    switch(type) {
        case 'level-up': return 'Системное уведомление';
        case 'achievement': return 'Достижение';
        case 'stat_up': return 'Параметр улучшен';
        case 'advisor': return 'Советник "Когнитус"';
        case 'warning': return 'Предупреждение';
        case 'analysis': return 'Анализ Системы';
        default: return 'Системный журнал';
    }
}

export function SystemLog({ logs }: SystemLogProps) {
  if (logs.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[201] flex flex-col gap-2 w-72 pointer-events-none">
      {logs.map((log) => {
        const style = getLogStyle(log.type);
        const prefix = getLogPrefix(log.type);

        return (
          <div 
            key={log.id}
            className={`
              bg-surface/90 backdrop-blur-md border rounded p-3 shadow-xl transform transition-all duration-300 animate-slide-in-right
              ${style.border}
            `}
          >
            <div className="flex items-start gap-2">
               <div className={`mt-1 flex-shrink-0 ${style.text}`}>
                 {style.icon}
               </div>
               <div>
                  <div className={`text-xs font-mono uppercase font-bold mb-0.5 ${style.text}`}>
                    {prefix}
                  </div>
                  <div className="text-sm text-slate-200 leading-tight">
                    {log.text}
                  </div>
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
