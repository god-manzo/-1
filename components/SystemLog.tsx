import React from 'react';
import { LogMessage } from '../types';
import { Terminal } from 'lucide-react';

interface SystemLogProps {
  logs: LogMessage[];
}

export function SystemLog({ logs }: SystemLogProps) {
  if (logs.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-72 pointer-events-none">
      {logs.map((log) => (
        <div 
          key={log.id}
          className={`
            bg-surface/90 backdrop-blur-md border rounded p-3 shadow-xl transform transition-all duration-300 animate-slide-in-right
            ${log.type === 'level-up' ? 'border-amber-500 shadow-amber-500/20' : ''}
            ${log.type === 'success' ? 'border-secondary/50' : ''}
            ${log.type === 'warning' ? 'border-red-500/50' : ''}
            ${log.type === 'info' ? 'border-hud/50' : ''}
          `}
        >
          <div className="flex items-start gap-2">
             <Terminal size={14} className={`mt-1 flex-shrink-0 ${
               log.type === 'level-up' ? 'text-amber-500' : 
               log.type === 'success' ? 'text-secondary' : 'text-slate-400'
             }`} />
             <div>
                <div className={`text-xs font-mono uppercase font-bold mb-0.5 ${
                  log.type === 'level-up' ? 'text-amber-500' : 'text-slate-500'
                }`}>
                  {log.type.replace('-', ' ')}
                </div>
                <div className="text-sm text-slate-200 leading-tight">
                  {log.text}
                </div>
             </div>
          </div>
        </div>
      ))}
    </div>
  );
}
