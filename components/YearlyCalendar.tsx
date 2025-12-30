
import React, { useState } from 'react';
import { Task, StatKey, Priority } from '../types';
import { TaskList } from './TaskList';
import { QuickAddTask } from './QuickAddTask';
import { X, Calendar, Inbox } from 'lucide-react';

interface YearlyCalendarProps {
  tasksByDate: Map<string, Task[]>;
  completedToday: Record<string, boolean>;
  dayNames: Record<string, string>;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (title: string, stat: StatKey, xp: number, priority: Priority, dueDate: string | null) => void;
  onSetDayName: (date: string, name: string) => void;
}

const MonthGrid = ({ year, month, tasksByDate, dayNames, onDayClick }: any) => {
  const monthName = new Date(year, month).toLocaleString('ru-RU', { month: 'long' });
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon...
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const isNextYear = year !== new Date().getFullYear();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const getDotColor = (p: Priority) => {
    switch(p) {
        case Priority.S_RANK: return 'bg-red-500';
        case Priority.A_RANK: return 'bg-amber-500';
        case Priority.B_RANK: return 'bg-blue-500';
        default: return 'bg-slate-600';
    }
  };

  return (
    <div className="bg-[#0f172a]/50 border border-slate-800 rounded-lg overflow-hidden shadow-lg hover:shadow-blue-500/10 hover:border-slate-700 transition-all duration-300">
      <div className="p-2 border-b border-slate-800 bg-slate-900/50 text-center">
          <h3 className="font-mono text-blue-300 font-bold text-sm capitalize tracking-widest">
              {monthName} {isNextYear && <span className="text-slate-500 font-normal">{year}</span>}
          </h3>
      </div>
      
      <div className="grid grid-cols-7 gap-1 px-2 pt-2 pb-1 border-b border-slate-800/50">
          {weekDays.map(wd => (
              <div key={wd} className="text-[10px] font-mono text-center text-slate-500 font-bold">
                  {wd}
              </div>
          ))}
      </div>

      <div className="grid grid-cols-7 gap-1 p-2">
        {days.map((day) => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const tasks = tasksByDate.get(dateStr) || [];
          const priorityOrder = { [Priority.S_RANK]: 0, [Priority.A_RANK]: 1, [Priority.B_RANK]: 2, [Priority.E_RANK]: 3 };
          const sortedTasks = [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
          
          const dayName = dayNames[dateStr];
          const bgClass = tasks.length > 0
            ? 'bg-slate-900/60 hover:bg-slate-800/80'
            : 'bg-slate-900/20 hover:bg-slate-800/40';
          const isToday = new Date().toISOString().slice(0, 10) === dateStr;

          // CSS Grid starts columns at 1. Our week starts on Monday.
          // getDay(): Sun=0, Mon=1, ..., Sat=6
          // So, for Monday (1), it's column 1. For Sunday (0), it's column 7.
          const startColumn = day === 1 ? (firstDayOfWeek === 0 ? 7 : firstDayOfWeek) : undefined;

          return (
            <button
              key={day}
              onClick={() => onDayClick(dateStr)}
              style={{ gridColumnStart: startColumn }}
              className={`
                h-12 w-full flex flex-col p-1 rounded-md transition-colors duration-200
                text-left overflow-hidden relative font-mono cursor-pointer
                ${bgClass}
                ${isToday ? 'outline outline-1 outline-offset-[-1px] outline-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : ''}
              `}
            >
              <span className={`text-[10px] font-bold ${isToday ? 'text-blue-300' : 'text-slate-500'}`}>{day}</span>

              {dayName && <div className="text-[8px] font-bold text-blue-300 truncate mt-0.5 leading-tight">{dayName}</div>}

              {tasks.length > 0 && (
                  <div className="absolute bottom-1 left-1 right-1 flex items-center gap-0.5">
                      {sortedTasks.slice(0, 5).map(task => (
                          <div key={task.id} className={`w-1.5 h-1.5 rounded-full ${getDotColor(task.priority)}`}></div>
                      ))}
                      {tasks.length > 5 && (
                          <span className="text-[9px] font-bold text-slate-500 leading-none">+</span>
                      )}
                  </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export function YearlyCalendar({ tasksByDate, completedToday, dayNames, onComplete, onAdd, onDelete, onSetDayName }: YearlyCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11

  // Create an array of month indices starting from the current month
  const monthOrder = Array.from({ length: 12 }, (_, i) => (currentMonth + i) % 12);

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
  };

  const closeModal = () => setSelectedDate(null);

  const tasksForSelectedDate = selectedDate ? (tasksByDate.get(selectedDate) || []) : [];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {monthOrder.map((monthIndex) => {
          // If the month index is less than the current month's index, it's for the next year.
          const year = monthIndex < currentMonth ? currentYear + 1 : currentYear;
          return (
            <MonthGrid
              key={`${year}-${monthIndex}`}
              year={year}
              month={monthIndex}
              tasksByDate={tasksByDate}
              dayNames={dayNames}
              onDayClick={handleDayClick}
            />
          );
        })}
      </div>

      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" 
                onClick={closeModal}
            />
            <div className="relative bg-surface border-2 border-blue-800 rounded-lg shadow-2xl w-full max-w-lg animate-scale-up max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900">
                    <h3 className="font-mono text-lg text-blue-300 flex items-center gap-2">
                        <Calendar size={18} />
                        Директивы на {new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={closeModal} className="text-slate-500 hover:text-white">
                        <X />
                    </button>
                </div>
                
                <div className="p-3 border-b border-slate-800 bg-slate-900/30">
                  <input
                    key={selectedDate}
                    type="text"
                    placeholder="Присвоить кодовое имя дню..."
                    className="w-full bg-slate-800/50 border border-slate-700 rounded px-3 py-1.5 font-mono text-sm text-blue-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    defaultValue={dayNames[selectedDate] || ''}
                    onBlur={(e) => onSetDayName(selectedDate, e.target.value)}
                    maxLength={30}
                  />
                </div>

                <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
                    {tasksForSelectedDate.length > 0 ? (
                        <TaskList 
                            tasks={tasksForSelectedDate} 
                            completedToday={completedToday} 
                            onComplete={onComplete}
                            onDelete={onDelete} 
                        />
                    ) : (
                        <div className="text-center py-8 text-slate-600 font-mono">
                           <Inbox size={24} className="mx-auto mb-2" />
                           Нет директив на эту дату.
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                   <QuickAddTask onAdd={onAdd} defaultDate={selectedDate} />
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
