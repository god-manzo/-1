import React, { useState } from 'react';
import { StatKey } from '../types';
import { STAT_CONFIG } from '../constants';
import { X, ChevronDown, Trophy, Sparkles } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecord: (title: string, description: string, stat: StatKey) => void;
}

export function VictoryModal({ isOpen, onClose, onRecord }: VictoryModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stat, setStat] = useState<StatKey>(StatKey.DISCIPLINE);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onRecord(title, description, stat);
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-surface border border-slate-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-scale-up border-t-4 border-t-secondary">
        <div className="bg-slate-900/50 p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-secondary flex items-center gap-2">
            <Trophy className="text-secondary" size={20} />
            Записать Победу
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-3 text-sm text-secondary/80 flex gap-2">
            <Sparkles size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              Победа дает мгновенный опыт и восстанавливает здоровье!
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Что случилось?</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Помог коллеге с отчетом"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-600 focus:outline-none focus:border-secondary transition-colors"
              autoFocus
            />
          </div>

          <div>
             <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Подробности (опционально)</label>
             <textarea 
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               placeholder="Как это было?"
               className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-600 focus:outline-none focus:border-secondary transition-colors h-20 resize-none"
             />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Сфера жизни</label>
            <div className="relative">
               <select 
                 value={stat}
                 onChange={(e) => setStat(e.target.value as StatKey)}
                 className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white appearance-none focus:outline-none focus:border-secondary cursor-pointer"
               >
                 {Object.entries(STAT_CONFIG).map(([key, config]) => (
                   <option key={key} value={key}>{config.label}</option>
                 ))}
               </select>
               <ChevronDown className="absolute right-3 top-3.5 text-slate-500 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-secondary to-teal-500 hover:opacity-90 text-white font-bold py-3 rounded-lg shadow-lg shadow-secondary/20 transition-all flex items-center justify-center gap-2"
            >
              <Trophy size={18} /> Зафиксировать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
