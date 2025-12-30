
import React, { useState } from 'react';
import { Target, Inbox as InboxIcon, BrainCircuit } from 'lucide-react';
import { Task, StatKey, Priority, TabView } from '../../types';
import { TaskList } from '../TaskList';
import { QuickAddTask } from '../QuickAddTask';
import { AIAssistantModal } from '../AIAssistantModal';

interface QuestsViewProps {
  mode: TabView.INBOX | TabView.HABITS;
  tasks: Task[];
  completedToday: Record<string, boolean>;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (title: string, stat: StatKey, xp: number, priority: Priority, dueDate: string | null) => void;
}

export function QuestsView({ mode, tasks, completedToday, onComplete, onDelete, onAdd }: QuestsViewProps) {
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  // Filter Logic
  let filteredTasks = tasks;
  let title = "Журнал Директив";
  let icon = <InboxIcon className="text-blue-500" size={24} />;
  let subtitle = "";

  if (mode === TabView.INBOX) {
      filteredTasks = tasks.filter(t => !t.isHabit && !t.dueDate);
      title = "Входящие";
      icon = <InboxIcon className="text-blue-400" size={24} />;
      subtitle = "Нераспределенные директивы, ожидающие классификации.";
  } else if (mode === TabView.HABITS) {
      filteredTasks = tasks.filter(t => t.isHabit);
      title = "Ежедневные протоколы";
      icon = <Target className="text-cyan-400" size={24} />;
      subtitle = "Повторяющиеся процедуры для поддержания параметров.";
  }

  // Separate Active/Completed
  const activeTasks = filteredTasks.filter(t => !completedToday[t.id]);
  const completedTasks = filteredTasks.filter(t => completedToday[t.id]);

  // Sort by Priority (S -> E)
  const priorityOrder = { [Priority.S_RANK]: 0, [Priority.A_RANK]: 1, [Priority.B_RANK]: 2, [Priority.E_RANK]: 3 };
  activeTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const handleAIAddTask = (title: string, stat: StatKey) => {
    // Using medium priority and XP for AI tasks
    onAdd(title, stat, 50, Priority.A_RANK, null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
         <div className="flex justify-between items-start">
             <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3 font-mono tracking-wide uppercase">
                    {icon} {title}
                </h2>
                <div className="text-slate-500 text-sm mt-1 font-mono">{subtitle}</div>
             </div>
             <button 
                onClick={() => setIsAIAssistantOpen(true)}
                title="ИИ-Ассистент"
                className="bg-slate-800/50 border border-slate-700 rounded-md p-2 text-slate-400 hover:text-blue-300 hover:border-blue-500 transition-all shadow-sm hover:shadow-lg hover:shadow-blue-500/10"
             >
                <BrainCircuit size={20} />
             </button>
         </div>
      </div>

      {/* Quick Add Sticky */}
      <div className="sticky top-0 z-30 pt-2 pb-4 bg-[#0b0f1a]/95 backdrop-blur-sm">
         <QuickAddTask onAdd={onAdd} defaultDate={null} />
      </div>

      {/* MAIN TASKS */}
      <div className="space-y-4">
         {activeTasks.length > 0 ? (
             <TaskList 
               tasks={activeTasks} 
               completedToday={completedToday}
               onComplete={onComplete}
               onDelete={onDelete}
             />
         ) : (
             <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-800 rounded-sm">
                <div className="bg-slate-800/50 p-4 rounded-full mb-4">
                    <InboxIcon size={32} className="text-slate-600" />
                </div>
                <div className="text-slate-500 font-mono text-sm uppercase tracking-widest">Нет Активных Директив</div>
                <div className="text-slate-700 text-xs mt-2">Система ожидает ввода...</div>
             </div>
         )}
      </div>

      {/* COMPLETED SECTION */}
      {completedTasks.length > 0 && (
        <div className="pt-8">
           <div className="flex items-center gap-2 mb-4">
              <div className="h-[1px] bg-slate-800 flex-1"></div>
              <span className="text-xs font-mono text-slate-600 uppercase tracking-widest">Выполненные</span>
              <div className="h-[1px] bg-slate-800 flex-1"></div>
           </div>

           <div className="opacity-60 hover:opacity-100 transition-opacity">
               <TaskList 
                 tasks={completedTasks} 
                 completedToday={completedToday}
                 onComplete={onComplete}
                 onDelete={onDelete}
               />
           </div>
        </div>
      )}
      
      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onAddTask={handleAIAddTask}
      />
    </div>
  );
}