import React from 'react';
import { ListTodo, Plus, Target, CheckCircle2 } from 'lucide-react';
import { Task } from '../../types';
import { TaskList } from '../TaskList';

interface QuestsViewProps {
  tasks: Task[];
  completedToday: Record<string, boolean>;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: () => void;
}

export function QuestsView({ tasks, completedToday, onComplete, onDelete, onOpenAddModal }: QuestsViewProps) {
  const activeTasks = tasks.filter(t => !completedToday[t.id]);
  const completedTasks = tasks.filter(t => completedToday[t.id]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center bg-[#0a0f1c] p-4 border-b-2 border-blue-900 sticky top-0 z-30 shadow-md">
        <h2 className="text-lg font-bold text-blue-500 flex items-center gap-2 font-mono tracking-widest uppercase">
          <ListTodo className="text-blue-500" /> Mission Log
        </h2>
        <button 
          onClick={onOpenAddModal}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-sm flex items-center gap-2 text-xs font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] font-mono uppercase tracking-wider"
        >
          <Plus size={14} /> New Quest
        </button>
      </div>
      
      {/* ACTIVE MISSIONS SECTION */}
      <div className="space-y-4">
         <div className="flex items-center gap-2 px-2">
            <Target className="text-red-500 animate-pulse" size={18} />
            <h3 className="text-slate-100 font-mono font-bold tracking-wider text-sm uppercase">Active Missions</h3>
            <div className="h-[1px] bg-red-900/50 flex-1 ml-4"></div>
            <span className="text-xs font-mono text-red-400">{activeTasks.length} PENDING</span>
         </div>

         {activeTasks.length === 0 ? (
             <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-sm p-8 text-center">
                <div className="text-slate-600 font-mono text-sm uppercase tracking-widest">No active directives</div>
                <div className="text-slate-700 text-xs mt-2">System is waiting for input...</div>
             </div>
         ) : (
             <TaskList 
               tasks={activeTasks} 
               completedToday={completedToday}
               onComplete={onComplete}
               onDelete={onDelete}
               filter="all"
             />
         )}
      </div>

      {/* COMPLETED MISSIONS SECTION */}
      {completedTasks.length > 0 && (
        <div className="space-y-4 pt-4 opacity-80 hover:opacity-100 transition-opacity">
           <div className="flex items-center gap-2 px-2">
              <CheckCircle2 className="text-green-500" size={18} />
              <h3 className="text-slate-400 font-mono font-bold tracking-wider text-sm uppercase">Completed Logs</h3>
              <div className="h-[1px] bg-slate-800 flex-1 ml-4"></div>
              <span className="text-xs font-mono text-green-500/70">{completedTasks.length} FINISHED</span>
           </div>

           <TaskList 
             tasks={completedTasks} 
             completedToday={completedToday}
             onComplete={onComplete}
             onDelete={onDelete}
             filter="all"
           />
        </div>
      )}
    </div>
  );
}