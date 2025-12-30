
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Type, GenerateContentResponse, FunctionDeclaration } from '@google/genai';
import { StatKey, Priority } from '../types';
import { STAT_CONFIG } from '../constants';
import { X, Loader, BrainCircuit, AlertTriangle, Send, Terminal as TerminalIcon, ChevronRight, Zap, ListChecks, CalendarRange } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (title: string, stat: StatKey, xp: number, priority: Priority, dueDate: string | null, isHabit: boolean) => void;
}

const SYSTEM_INSTRUCTION = `Ты — ИИ-помощник внутри аналитической системы самонаблюдения.

Твоя роль:
— исполнять запросы пользователя
— создавать задачи, шаблоны и события в календаре
— предлагать варианты планирования по запросу

Ты НЕ являешься системой.
Ты не наблюдаешь, не анализируешь и не делаешь выводов о пользователе.

Запрещено:
— оценивать действия пользователя
— делать выводы о дисциплине, характере или прогрессе
— мотивировать, утешать или критиковать
— использовать фразы вроде «тебе стоит», «я заметил», «ты молодец»

Разрешено:
— уточнять детали запроса (периодичность, время, длительность)
— предлагать структурированные варианты (минимум / стандарт / расширенный)
— объяснять, какие действия ты выполнил
— создавать повторяющиеся задачи и шаблоны

Тон:
— нейтральный
— деловой
— точный
— без эмоций

Форма ответов:
— короткие
— структурированные
— ориентированные на действие

Контекст времени:
— ты работаешь только с текущими и будущими задачами
— ТЕКУЩАЯ ДАТА: ${new Date().toISOString().slice(0, 10)}
— при создании задач на конкретную дату используй формат YYYY-MM-DD
— если пользователь говорит "завтра" или указывает дату, вычисли ее относительно текущей

Если запрос пользователя требует анализа поведения или выводов:
— вежливо откажись
— укажи, что это относится к системе, а не к помощнику

Пример отказа:
«Анализ поведения выполняется системой наблюдения. Я могу помочь только с созданием или настройкой задач.»`;

const createDirectiveTool: FunctionDeclaration = {
  name: 'create_directive',
  description: 'Создает новую директиву (задачу) или протокол (привычку) в системе.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { 
        type: Type.STRING, 
        description: 'Название задачи. Должно быть коротким и понятным.' 
      },
      stat: { 
        type: Type.STRING, 
        description: 'Параметр, к которому относится задача.',
        enum: ['strength', 'intellect', 'agility', 'discipline', 'charisma']
      },
      priority: { 
        type: Type.STRING, 
        description: 'Приоритет задачи.',
        enum: ['S', 'A', 'B', 'E']
      },
      isHabit: { 
        type: Type.BOOLEAN, 
        description: 'Является ли задача ежедневным протоколом (привычкой).' 
      },
      dueDate: {
        type: Type.STRING,
        description: 'Дата выполнения в формате YYYY-MM-DD. Если не указана и это не привычка, по умолчанию сегодня.'
      }
    },
    required: ['title', 'stat']
  },
};

const QUICK_COMMANDS = [
    { label: 'Что на сегодня?', icon: ListChecks },
    { label: 'Спланируй неделю', icon: CalendarRange },
    { label: 'Новый протокол тренировок', icon: Zap },
];

export function AIAssistantModal({ isOpen, onClose, onAddTask }: AIAssistantModalProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Модуль "Когнитус" активен. Готов к исполнению директив.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (customText?: string) => {
    const userMessage = (customText || input).trim();
    if (!userMessage || isTyping) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);
    setError(null);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
            ...messages.map(m => ({ role: m.role === 'assistant' ? 'model' as const : 'user' as const, parts: [{ text: m.content }] })),
            { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: [createDirectiveTool] }],
        },
      });

      if (response.functionCalls) {
        for (const call of response.functionCalls) {
          if (call.name === 'create_directive') {
            const { title, stat, priority, isHabit, dueDate } = call.args as any;
            
            // Determine final due date
            let finalDueDate = dueDate;
            if (!isHabit && !finalDueDate) {
                finalDueDate = new Date().toISOString().slice(0, 10);
            }

            onAddTask(
              title, 
              (stat as StatKey) || StatKey.DISCIPLINE, 
              isHabit ? 100 : 50, 
              (priority as Priority) || Priority.B_RANK, 
              isHabit ? null : finalDueDate, 
              !!isHabit
            );
            
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `Директива "${title}" создана.${finalDueDate ? ` Дата: ${finalDueDate}.` : ''} Параметр: ${STAT_CONFIG[stat as StatKey]?.label || 'Дисциплина'}. Тип: ${isHabit ? 'Протокол' : 'Задача'}.` 
            }]);
          }
        }
      }

      if (response.text) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.text || '' }]);
      }
    } catch (e) {
      console.error("Assistant error:", e);
      setError("Ошибка связи. Терминал перезагружается.");
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-[#0b101b] border-2 border-blue-800 w-full max-w-xl rounded-sm shadow-[0_0_80px_rgba(37,99,235,0.3)] flex flex-col h-[75vh] overflow-hidden"
      >
        {/* HUD Scanline Effect Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
            <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] animate-pulse"></div>
        </div>

        {/* Header Terminal Style */}
        <div className="bg-slate-900 border-b border-blue-800 p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
            <h3 className="text-sm font-bold text-blue-400 font-mono tracking-[0.4em] uppercase">
              COGNITUS_TERMINAL v4.2
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Message View Area */}
        <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-5 space-y-6 font-mono text-sm custom-scrollbar bg-[linear-gradient(rgba(30,41,59,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"
        >
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-[90%] p-4 border rounded-sm relative
                ${msg.role === 'user' 
                  ? 'bg-blue-900/10 border-blue-800/50 text-blue-100' 
                  : 'bg-slate-900/80 border-slate-800 text-slate-300'}
              `}>
                <div className="text-[10px] uppercase font-bold text-blue-500/60 mb-2 tracking-[0.2em]">
                  {msg.role === 'user' ? '// OPERATOR_INPUT' : '// COGNITUS_LOG'}
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                
                {/* Decoration Corner */}
                <div className={`absolute top-0 ${msg.role === 'user' ? 'right-0 border-t-2 border-r-2' : 'left-0 border-t-2 border-l-2'} border-blue-500/20 w-3 h-3`}></div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start">
                <div className="max-w-[85%] p-4 border border-blue-900/20 bg-blue-900/5 text-blue-500/40 font-mono text-xs flex items-center gap-3">
                    <Loader className="animate-spin" size={14} />
                    <span>ИНТЕРПРЕТАЦИЯ ДАННЫХ...</span>
                </div>
            </div>
          )}

          {error && (
            <div className="p-4 border border-red-900/50 bg-red-900/10 text-red-500 text-xs flex items-center gap-3">
                <AlertTriangle size={16} /> 
                <span className="uppercase tracking-widest font-black">Критическая ошибка ядра. Синхронизация прервана.</span>
            </div>
          )}
        </div>

        {/* Quick Command Chips */}
        {!isTyping && messages.length < 5 && (
            <div className="px-5 py-3 flex gap-2 flex-wrap bg-slate-950/50 border-t border-blue-900/20">
                {QUICK_COMMANDS.map((cmd, i) => (
                    <button 
                        key={i}
                        onClick={() => handleSend(cmd.label)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-950/20 border border-blue-900/40 rounded-full text-[10px] text-blue-500 hover:bg-blue-500/10 hover:text-blue-300 transition-all font-mono uppercase font-bold"
                    >
                        <cmd.icon size={12} />
                        {cmd.label}
                    </button>
                ))}
            </div>
        )}

        {/* Command Input Area */}
        <div className="p-5 bg-slate-900 border-t border-blue-800/50 shrink-0">
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">
                    <ChevronRight size={20} className="animate-pulse" />
                </div>
                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Введите директиву для исполнения..."
                    className="w-full bg-slate-950 border border-blue-900/40 rounded-sm py-4 pl-12 pr-14 text-blue-100 placeholder-slate-800 focus:outline-none focus:border-blue-500 transition-all font-mono text-sm shadow-inner"
                    autoFocus
                />
                <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isTyping}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 text-blue-900 hover:text-blue-400 disabled:opacity-20 transition-all bg-slate-900 border border-slate-800 rounded-sm"
                >
                    <Send size={18} />
                </button>
            </div>
            <div className="mt-3 flex justify-between items-center px-1">
                <div className="flex gap-4">
                    <span className="text-[8px] text-slate-700 font-bold uppercase tracking-widest">Input: ASCII_UTF8</span>
                    <span className="text-[8px] text-slate-700 font-bold uppercase tracking-widest">Core: Gemini_3_Flash</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="text-[8px] text-blue-900 font-bold uppercase tracking-[0.2em]">
                        Cognitus_Active
                    </div>
                </div>
            </div>
        </div>

      </motion.div>
    </div>
  );
}
