
import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { StatKey } from '../types';
import { STAT_CONFIG } from '../constants';
import { X, Loader, BrainCircuit, AlertTriangle } from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (title: string, stat: StatKey) => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export function AIAssistantModal({ isOpen, onClose, onAddTask }: AIAssistantModalProps) {
  const [loadingStat, setLoadingStat] = useState<StatKey | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestions = useCallback(async (stat: StatKey) => {
    setLoadingStat(stat);
    setError(null);
    setSuggestions([]);

    const config = STAT_CONFIG[stat];
    const prompt = `You are an assistant in a life RPG game called 'Система Пробуждения'. Suggest 3 short, actionable tasks for the player to improve their '${config.label}' skill. The tasks should be achievable within a day. Provide the response as a valid JSON object with a single key "tasks" which is an array of strings. For example: {"tasks": ["Прочитать одну главу книги", "Решить логическую головоломку", "Посмотреть документальный фильм"]}`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        tasks: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      },
    };

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });
      
      const result = JSON.parse(response.text);
      setSuggestions(result.tasks || []);
    } catch (e) {
      console.error("Ошибка при вызове Gemini API:", e);
      setError("Связь с ассистентом 'Когнитус' прервана. Попробуйте позже.");
    } finally {
      setLoadingStat(null);
    }
  }, []);

  const handleSuggestionClick = (title: string, stat: StatKey) => {
    onAddTask(title, stat);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative bg-[#0b101b] border-2 border-blue-800 w-full max-w-lg rounded-sm shadow-[0_0_50px_rgba(37,99,235,0.2)] animate-scale-up flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="bg-slate-900 border-b border-blue-800 p-3 flex justify-between items-center shadow-md">
          <h3 className="text-lg font-bold text-white font-mono tracking-[0.2em] drop-shadow-[0_0_5px_rgba(59,130,246,0.8)] flex items-center gap-2">
            <BrainCircuit className="text-blue-500" size={18} />
            КОГНИТУС
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            <div>
                <p className="text-sm text-slate-400 font-mono mb-2">Выберите параметр для генерации протоколов:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(STAT_CONFIG).map(([key, config]) => {
                        const k = key as StatKey;
                        return (
                            <button
                                key={k}
                                onClick={() => generateSuggestions(k)}
                                disabled={!!loadingStat}
                                className="p-3 border border-slate-700 bg-slate-900/50 rounded-md flex items-center gap-2 transition-all hover:bg-slate-800 hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <config.icon size={16} style={{ color: config.color }} />
                                <span className="text-xs font-bold text-slate-300 uppercase">{config.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center p-4 border-2 border-dashed border-slate-800 rounded-md bg-black/20 min-h-[150px]">
                {loadingStat && (
                    <div className="flex flex-col items-center gap-2 text-blue-400 animate-pulse">
                        <Loader className="animate-spin" />
                        <span className="text-sm font-mono">Анализ данных...</span>
                    </div>
                )}
                {error && (
                    <div className="text-center text-red-400">
                        <AlertTriangle className="mx-auto mb-2" />
                        <p className="font-mono text-sm">{error}</p>
                    </div>
                )}
                {!loadingStat && !error && suggestions.length > 0 && (
                    <div className="w-full space-y-2">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => handleSuggestionClick(s, Object.keys(STAT_CONFIG).find(key => STAT_CONFIG[key as StatKey].label === STAT_CONFIG[loadingStat || 'strength'].label) as StatKey || StatKey.DISCIPLINE)}
                                className="w-full text-left p-3 bg-slate-800/50 border border-slate-700 rounded-md text-slate-200 hover:bg-blue-600/20 hover:border-blue-500 transition-colors animate-slide-in"
                                style={{animationDelay: `${i * 100}ms`}}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
                 {!loadingStat && !error && suggestions.length === 0 && (
                    <div className="text-center text-slate-600">
                        <p className="font-mono text-sm">Ожидание директивы...</p>
                    </div>
                )}
            </div>
        </div>

        <div className="bg-slate-900 border-t border-slate-800 p-2 text-center">
            <span className="text-[9px] text-slate-600 font-mono tracking-[0.3em] uppercase">
                Генератор Протоколов ИИ
            </span>
        </div>
      </div>
    </div>
  );
}
