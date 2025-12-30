
import React, { useState, useMemo } from 'react';
import { Task, Priority, StatKey } from '../../types';
import { TaskList } from '../TaskList';
import { QuickAddTask } from '../QuickAddTask';
import { YearlyCalendar } from '../YearlyCalendar';
import { Sun, Calendar, Globe, CalendarCheck2, BrainCircuit } from 'lucide-react';
import { AIAssistantModal } from '../AIAssistantModal';

interface PlanningViewProps {
  tasks: Task[];
  completedToday: Record<string, boolean>;
  dayNames: Record<string, string>;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (title: string, stat: StatKey, xp: number, priority: Priority, dueDate: string | null) => void;
  onSetDayName: (date: string, name: string) => void;
}

type SubView = 'today' | 'week' | 'year';

// Component for the 7-day forecast (previously CalendarView)
const WeekView = ({ tasks, completedToday, onComplete, onDelete, onAdd }: PlanningViewProps) => {
  const getDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  };
  
  const dates = getDates();

  return (
    <div className="animate-fade-in">
      <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar-horizontal md:grid md:grid-cols-7 md:gap-4 md:space-x-0">
        {dates.map((dateStr, index) => {
            const dateObj = new Date(dateStr);
            const isToday = index === 0;
            const dayName = isToday ? 'Сегодня' : dateObj.toLocaleDateString('ru-RU', { weekday: 'long' });
            const dayAbbr = dateObj.toLocaleDateString('ru-RU', { weekday: 'short' }).toUpperCase();
            const dateDisplay = dateObj.getDate();
            
            const dayTasks = tasks.filter(t => t.dueDate === dateStr && !completedToday[t.id]);

            return (
                <div 
                    key={dateStr} 
                    className={`
                        flex-shrink-0 w-72 md:w-full h-[65vh] flex flex-col rounded-lg border-2 
                        ${isToday ? 'border-blue-700 bg-[#0f172a]/80' : 'border-slate-800 bg-[#0c1322]/50 hover:border-slate-700'}
                        transition-colors duration-300
                    `}
                >
                    {/* Card Header */}
                    <div className={`p-3 border-b-2 ${isToday ? 'border-blue-700' : 'border-slate-800'}`}>
                        <div className="flex justify-between items-center">
                            <span className={`font-bold font-mono text-lg capitalize ${isToday ? 'text-blue-300' : 'text-slate-200'}`}>
                                {dayName}
                            </span>
                            <span className={`w-8 h-8 flex items-center justify-center text-sm rounded-full font-bold font-mono ${isToday ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                {dateDisplay}
                            </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 font-mono">
                            {dayTasks.length > 0 ? `${dayTasks.length} активных директив` : 'Свободный слот'}
                        </div>
                    </div>

                    {/* Task List Body */}
                    <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3">
                        {dayTasks.length > 0 ? (
                            <TaskList 
                                tasks={dayTasks} 
                                completedToday={completedToday}
                                onComplete={onComplete}
                                onDelete={onDelete}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-700 opacity-50">
                                <CalendarCheck2 size={40} />
                                <p className="mt-3 text-sm font-mono tracking-wider">План чист</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Add Task Footer */}
                    <div className="p-2 border-t-2 ${isToday ? 'border-blue-700/50' : 'border-slate-800'} bg-black/20">
                        <QuickAddTask onAdd={onAdd} defaultDate={dateStr} />
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

// Component for Today's tasks (previously part of QuestsView)
const TodayView = ({ tasks, completedToday, onComplete, onDelete, onAdd }: PlanningViewProps) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayTasks = tasks.filter(t => (t.isHabit || (t.dueDate && t.dueDate <= todayStr)));

    const activeTasks = todayTasks.filter(t => !completedToday[t.id]);
    const completedTasks = todayTasks.filter(t => completedToday[t.id]);
    
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="sticky top-0 z-30 pt-2 pb-4 bg-[#0b0f1a]/95 backdrop-blur-sm">
               <QuickAddTask onAdd={onAdd} defaultDate={todayStr} />
            </div>
            {activeTasks.length > 0 ? (
                <TaskList tasks={activeTasks} completedToday={completedToday} onComplete={onComplete} onDelete={onDelete} />
            ) : (
                <div className="text-center py-16 text-slate-600">Нет активных директив на сегодня.</div>
            )}
            {completedTasks.length > 0 && (
                 <div className="pt-8">
                   <div className="flex items-center gap-2 mb-4">
                      <div className="h-[1px] bg-slate-800 flex-1"></div>
                      <span className="text-xs font-mono text-slate-600 uppercase tracking-widest">Выполненные</span>
                      <div className="h-[1px] bg-slate-800 flex-1"></div>
                   </div>
                   <div className="opacity-60 hover:opacity-100 transition-opacity">
                       <TaskList tasks={completedTasks} completedToday={completedToday} onComplete={onComplete} onDelete={onDelete}/>
                   </div>
                </div>
            )}
        </div>
    );
};

export function PlanningView(props: PlanningViewProps) {
  const [subView, setSubView] = useState<SubView>('today');
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    props.tasks.forEach(task => {
        if (task.dueDate) {
            const list = map.get(task.dueDate) || [];
            list.push(task);
            map.set(task.dueDate, list);
        }
    });
    return map;
  }, [props.tasks]);

  const subViewConfig = {
      today: { icon: Sun, label: 'Сегодня', component: <TodayView {...props} /> },
      week: { icon: Calendar, label: 'Неделя', component: <WeekView {...props} /> },
      year: { icon: Globe, label: 'Год', component: <YearlyCalendar {...props} tasksByDate={tasksByDate} /> }
  };
  
  const handleAIAddTask = (title: string, stat: StatKey) => {
    // Add task for today if in 'today' or 'week' view, otherwise no date
    const dueDate = subView !== 'year' ? new Date().toISOString().slice(0, 10) : null;
    props.onAdd(title, stat, 50, Priority.A_RANK, dueDate);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Sub-navigation */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 font-mono tracking-wide uppercase">
              <Sun className="text-amber-400" />
              ПЛАНИРОВАНИЕ
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-mono">Тактические и стратегические директивы.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 border border-slate-800 p-1 rounded-md flex items-center gap-1">
              {Object.entries(subViewConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSubView(key as SubView)}
                  className={`px-3 py-1 text-xs font-mono font-bold rounded transition-colors ${
                    subView === key
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
            <button 
                onClick={() => setIsAIAssistantOpen(true)}
                title="ИИ-Ассистент"
                className="bg-slate-800/50 border border-slate-700 rounded-md p-2 text-slate-400 hover:text-blue-300 hover:border-blue-500 transition-all shadow-sm hover:shadow-lg hover:shadow-blue-500/10"
             >
                <BrainCircuit size={18} />
             </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div>
        {subViewConfig[subView].component}
      </div>

      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onAddTask={handleAIAddTask}
      />
    </div>
  );
}