import React, { useState } from 'react';
import { StatKey } from '../types';
import { STAT_CONFIG } from '../constants';
import { X, ChevronDown, Check, Swords } from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, stat: StatKey, xpValue: number) => void;
}

export function AddTaskModal({ isOpen, onClose, onAdd }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [stat, setStat] = useState<StatKey>(StatKey.DISCIPLINE);
  const [xpValue, setXpValue] = useState(20);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title, stat, xpValue);
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-surface border border-slate-700 w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-scale-up">
        <div className="bg-slate-900/50 p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Swords className="text-accent" size={20} />
            Новый Квест
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Название цели</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Прочитать главу книги"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Категория</label>
            <div className="relative">
               <select 
                 value={stat}
                 onChange={(e) => setStat(e.target.value as StatKey)}
                 className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white appearance-none focus:outline-none focus:border-primary cursor-pointer"
               >
                 {Object.entries(STAT_CONFIG).map(([key, config]) => (
                   <option key={key} value={key}>{config.label}</option>
                 ))}
               </select>
               <ChevronDown className="absolute right-3 top-3.5 text-slate-500 pointer-events-none" size={16} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Сложность (Награда)</label>
            <div className="flex gap-2">
              {[20, 50, 100].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setXpValue(val)}
                  className={`flex-1 py-2 rounded-lg border transition-all ${
                    xpValue === val 
                      ? 'bg-primary/20 border-primary text-primary' 
                      : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs uppercase mb-0.5">
                    {val === 20 ? 'Легко' : val === 50 ? 'Норм' : 'Сложно'}
                  </div>
                  <div className="font-bold">{val} XP</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-bold py-3 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
            >
              <Check size={18} /> Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
