
import React, { useState, useRef } from 'react';
import { StatKey, Priority } from '../types';
import { CornerDownLeft, Plus, Calendar, Flag } from 'lucide-react';

interface QuickAddTaskProps {
  onAdd: (title: string, stat: StatKey, xp: number, priority: Priority, dueDate: string | null) => void;
  defaultDate?: string | null;
}

export function QuickAddTask({ onAdd, defaultDate = null }: QuickAddTaskProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.E_RANK);
  const [dueDate, setDueDate] = useState<string | null>(defaultDate);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const togglePriority = () => {
    const priorities = [Priority.E_RANK, Priority.B_RANK, Priority.A_RANK, Priority.S_RANK];
    const currentIndex = priorities.indexOf(priority);
    setPriority(priorities[(currentIndex + 1) % priorities.length]);
  };

  const toggleDate = () => {
    if (dueDate) setDueDate(null);
    else setDueDate(new Date().toISOString().slice(0, 10)); // Today
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (title.trim()) {
      onAdd(title, StatKey.DISCIPLINE, 20, priority, dueDate);
      setTitle('');
      setPriority(Priority.E_RANK);
      setDueDate(defaultDate);
      inputRef.current?.blur();
    } else {
      inputRef.current?.focus();
    }
  };

  const getPriorityColor = (p: Priority) => {
    switch(p) {
        case Priority.S_RANK: return 'text-red-500';
        case Priority.A_RANK: return 'text-amber-500';
        case Priority.B_RANK: return 'text-blue-500';
        default: return 'text-slate-500';
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={`
        relative flex flex-col gap-2 p-3 rounded-md border-2 transition-all duration-300 bg-[#0b101b]
        ${isFocused 
          ? 'border-blue-600 shadow-[0_0_25px_rgba(37,99,235,0.2)]' 
          : 'border-slate-800 hover:border-slate-700'}
      `}
    >
      <div className="flex items-center gap-3">
        <button 
            type="button"
            onClick={handleSubmit}
            className={`
                flex items-center justify-center w-6 h-6 rounded-sm transition-all duration-300 active:scale-90
                ${isFocused || title.trim() ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300'}
            `}
        >
            <Plus size={16} strokeWidth={3} />
        </button>

        <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ввести новую директиву..."
            className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder-slate-600 font-mono text-sm"
        />
      </div>

      {(isFocused || title) && (
        <div className="flex justify-between items-center pl-9 pt-1 animate-fade-in">
            <div className="flex gap-2">
                <button 
                    type="button" 
                    onClick={toggleDate}
                    className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${dueDate ? 'text-green-400' : 'text-slate-500'}`}
                    title="Срок выполнения"
                >
                    <Calendar size={16} />
                </button>
                <button 
                    type="button"
                    onClick={togglePriority}
                    className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${getPriorityColor(priority)}`}
                    title="Приоритет"
                >
                    <Flag size={16} fill={priority !== Priority.E_RANK ? "currentColor" : "none"} />
                </button>
            </div>

            <button 
                type="submit"
                className={`
                    p-1.5 rounded-sm transition-all duration-200 flex items-center gap-2 px-3
                    ${title.trim() ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-slate-800 text-slate-600'}
                `}
            >
                <span className="text-[10px] font-mono font-bold uppercase">Ввод</span>
                <CornerDownLeft size={14} />
            </button>
        </div>
      )}
    </form>
  );
}
