
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Task, Priority, StatKey } from '../../types';
import { TaskList } from '../TaskList';
import { QuickAddTask } from '../QuickAddTask';
import { YearlyCalendar } from '../YearlyCalendar';
import { 
  Sun, 
  Calendar, 
  Globe, 
  Layers, 
  ListOrdered, 
  GripVertical,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  BrainCircuit,
  Plus,
  Trophy
} from 'lucide-react';
import { AIAssistantModal } from '../AIAssistantModal';
import { motion, AnimatePresence, useMotionValue, useTransform, Reorder } from 'framer-motion';

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

const SwipeCard = ({ task, isFront, index, onSwipe }: { task: Task, isFront: boolean, index: number, onSwipe: (d: 'left' | 'right' | 'up') => void }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(y, [-200, -150, 0], [0, 1, 1]);
    
    // HUD Indicators Opacity
    const topPriorOpacity = useTransform(x, [50, 150], [0, 1]);
    const deferOpacity = useTransform(x, [-150, -50], [1, 0]);
    const completeOpacity = useTransform(y, [-150, -50], [1, 0]);

    const handleDragEnd = (_: any, info: any) => {
        if (info.offset.y < -100) {
            onSwipe('up');
        } else if (info.offset.x > 100) {
            onSwipe('right');
        } else if (info.offset.x < -100) {
            onSwipe('left');
        }
    };

    return (
        <motion.div
            style={{ 
                x, 
                // Fix: Removed duplicate 'y' property here. The conditional 'y' property below handles both states.
                rotate, 
                opacity: isFront ? 1 : 1,
                zIndex: 100 - index,
                scale: isFront ? 1 : 1 - (index * 0.05),
                y: isFront ? y : index * 12
            }}
            drag={isFront ? true : false}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            onDragEnd={handleDragEnd}
            className={`absolute w-full h-full bg-[#0a0f1c] border-2 border-blue-900/40 rounded-sm p-6 flex flex-col justify-between shadow-2xl backdrop-blur-md overflow-hidden ${isFront ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
        >
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(30,41,59,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.2)_1px,transparent_1px)] bg-[size:15px_15px]"></div>
            </div>

            {/* Индикаторы выбора (HUD) */}
            <motion.div style={{ opacity: topPriorOpacity }} className="absolute inset-0 bg-blue-500/10 flex items-center justify-center pointer-events-none z-10 border-4 border-blue-500/20">
                <div className="border-4 border-blue-500 text-blue-500 font-black text-3xl px-6 py-2 rotate-[-12deg] uppercase tracking-tighter shadow-[0_0_20px_rgba(59,130,246,0.5)]">В ПРИОРИТЕТ</div>
            </motion.div>
            
            <motion.div style={{ opacity: deferOpacity }} className="absolute inset-0 bg-red-500/10 flex items-center justify-center pointer-events-none z-10 border-4 border-red-500/20">
                <div className="border-4 border-red-500 text-red-500 font-black text-3xl px-6 py-2 rotate-[12deg] uppercase tracking-tighter shadow-[0_0_20px_rgba(239,68,68,0.5)]">ОТЛОЖИТЬ</div>
            </motion.div>

            <motion.div style={{ opacity: completeOpacity }} className="absolute inset-0 bg-green-500/10 flex items-center justify-center pointer-events-none z-10 border-4 border-green-500/20">
                <div className="flex flex-col items-center">
                    <Trophy size={48} className="text-green-500 mb-2 animate-bounce" />
                    <div className="border-4 border-green-500 text-green-500 font-black text-3xl px-6 py-2 uppercase tracking-tighter shadow-[0_0_20px_rgba(16,185,129,0.5)]">МИССИЯ ВЫПОЛНЕНА</div>
                </div>
            </motion.div>

            <div className="relative z-20">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono font-bold text-blue-500 tracking-[0.3em] uppercase">Tactical_File</span>
                    <div className="px-2 py-0.5 bg-blue-900/20 border border-blue-500/30 text-[8px] font-mono font-bold text-blue-400 uppercase">#{task.id.slice(-4)}</div>
                </div>
                
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight break-words">
                    {task.title}
                </h3>
                
                <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                        RANK-{task.priority}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-950/30 border border-blue-800/40 text-[8px] font-mono font-bold text-blue-500 uppercase tracking-widest">
                        {task.stat.toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="relative z-20 flex justify-between items-end pt-6 border-t border-slate-800">
                <div className="flex flex-col">
                    <span className="text-[8px] text-slate-600 font-mono uppercase tracking-widest">Reward_Value</span>
                    <span className="text-xl font-black text-blue-500 font-mono">{task.xpValue} <span className="text-[10px] text-slate-500">XP</span></span>
                </div>
                {isFront && (
                    <div className="flex flex-col items-end gap-1">
                         <div className="text-[8px] text-slate-600 font-mono uppercase">Swipe_Up_To_Complete</div>
                         <div className="flex gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                        </div>
                    </div>
                )}
            </div>

            {isFront && (
                <motion.div 
                    animate={{ top: ['0%', '100%', '0%'] }} 
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[1px] bg-blue-400/20 shadow-[0_0_8px_rgba(59,130,246,0.3)] z-30"
                />
            )}
        </motion.div>
    );
};

const TodayPlanning = ({ tasks, completedToday, onComplete, onDelete, onAdd }: PlanningViewProps) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const initialTasks = useMemo(() => 
        tasks.filter(t => (t.isHabit || (t.dueDate && t.dueDate <= todayStr)) && !completedToday[t.id]),
    [tasks, completedToday, todayStr]);

    const completedTasks = useMemo(() => 
        tasks.filter(t => (t.isHabit || (t.dueDate && t.dueDate <= todayStr)) && completedToday[t.id]),
    [tasks, completedToday, todayStr]);

    const [orderedTasks, setOrderedTasks] = useState<Task[]>([]);
    const [mode, setMode] = useState<'stack' | 'list'>('stack');
    const [swipeIndex, setSwipeIndex] = useState(0);

    useEffect(() => {
        if (orderedTasks.length === 0 && initialTasks.length > 0) {
            setOrderedTasks(initialTasks);
        } else if (initialTasks.length > 0) {
            const currentIds = new Set(orderedTasks.map(t => t.id));
            const newTasks = initialTasks.filter(t => !currentIds.has(t.id));
            const stillActive = orderedTasks.filter(t => initialTasks.some(it => it.id === t.id));
            if (newTasks.length > 0 || stillActive.length !== orderedTasks.length) {
                setOrderedTasks([...stillActive, ...newTasks]);
            }
        }
    }, [initialTasks]);

    const handleSwipe = (direction: 'left' | 'right' | 'up') => {
        const currentTask = orderedTasks[swipeIndex];
        if (!currentTask) return;
        
        const newOrder = [...orderedTasks];
        
        if (direction === 'up') {
            // Выполнение задачи
            onComplete(currentTask.id);
            // Задача сама исчезнет из списка initialTasks через useEffect синхронизацию
            // Но для плавности UI мы можем передвинуть индекс вперед
            setSwipeIndex(prev => prev + 1);
        } else {
            // Приоритизация
            newOrder.splice(swipeIndex, 1);
            if (direction === 'right') newOrder.unshift(currentTask);
            else newOrder.push(currentTask);
            setSwipeIndex(prev => prev + 1);
            setOrderedTasks(newOrder);
        }
    };

    const isFinished = swipeIndex >= orderedTasks.length && orderedTasks.length > 0;

    return (
        <div className="space-y-6">
            <div className="sticky top-0 z-30 bg-[#0b0f1a]/95 backdrop-blur-md pb-4 pt-2 border-b border-slate-800/50">
                <QuickAddTask onAdd={onAdd} defaultDate={todayStr} />
            </div>

            <div className="flex justify-between items-center bg-slate-900/40 p-1.5 rounded-sm border border-slate-800/60 shadow-inner">
                <div className="flex gap-1">
                    <button 
                        onClick={() => { setMode('stack'); setSwipeIndex(0); }}
                        className={`px-4 py-1.5 rounded-sm flex items-center gap-2 text-[10px] font-mono font-bold uppercase transition-all ${mode === 'stack' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Layers size={14} /> Тактика
                    </button>
                    <button 
                        onClick={() => setMode('list')}
                        className={`px-4 py-1.5 rounded-sm flex items-center gap-2 text-[10px] font-mono font-bold uppercase transition-all ${mode === 'list' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <ListOrdered size={14} /> Очередь
                    </button>
                </div>
                <div className="px-3 text-[10px] font-mono text-blue-500/60 font-bold uppercase tracking-[0.2em]">
                    {mode === 'stack' && !isFinished && orderedTasks.length > 0 ? `Анализ Списка: ${swipeIndex + 1}/${orderedTasks.length}` : 'Цели Упорядочены'}
                </div>
            </div>

            <div className="min-h-[450px] relative">
                <AnimatePresence mode="wait">
                    {mode === 'stack' && !isFinished && orderedTasks.length > 0 ? (
                        <motion.div 
                            key="stack"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="flex flex-col items-center justify-center py-8"
                        >
                            <div className="relative w-full max-w-sm aspect-[4/5] flex items-center justify-center">
                                {orderedTasks.map((task, idx) => {
                                    if (idx < swipeIndex || idx > swipeIndex + 2) return null;
                                    return (
                                        <SwipeCard 
                                            key={task.id} 
                                            task={task} 
                                            isFront={idx === swipeIndex} 
                                            index={idx - swipeIndex}
                                            onSwipe={handleSwipe}
                                        />
                                    );
                                })}
                            </div>

                            <div className="mt-14 flex items-center gap-6">
                                <button 
                                    onClick={() => handleSwipe('left')}
                                    title="В конец очереди"
                                    className="p-5 rounded-full border-2 border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all hover:scale-110 active:scale-95 shadow-lg shadow-red-500/5"
                                >
                                    <ArrowLeft size={28} />
                                </button>
                                
                                <button 
                                    onClick={() => handleSwipe('up')}
                                    title="Выполнить задачу"
                                    className="p-6 rounded-full border-4 border-green-500/30 text-green-500 hover:bg-green-500/20 transition-all hover:scale-110 active:scale-95 shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                                >
                                    <ArrowUp size={36} />
                                </button>

                                <button 
                                    onClick={() => handleSwipe('right')}
                                    title="В начало очереди"
                                    className="p-5 rounded-full border-2 border-blue-500/20 text-blue-500 hover:bg-blue-500/10 transition-all hover:scale-110 active:scale-95 shadow-lg shadow-blue-500/5"
                                >
                                    <ArrowRight size={28} />
                                </button>
                            </div>
                            
                            <div className="mt-6 text-[10px] text-slate-600 font-mono text-center uppercase tracking-widest animate-pulse">
                                Свайп вверх для завершения
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="list"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {orderedTasks.length > 0 ? (
                                <Reorder.Group 
                                    axis="y" 
                                    values={orderedTasks} 
                                    onReorder={setOrderedTasks}
                                    className="space-y-3"
                                >
                                    {orderedTasks.map((task) => (
                                        <Reorder.Item 
                                            key={task.id} 
                                            value={task}
                                            className="cursor-grab active:cursor-grabbing flex items-center gap-3 group"
                                        >
                                            <div className="text-slate-800 group-hover:text-blue-600 transition-colors shrink-0">
                                                <GripVertical size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <TaskList 
                                                    tasks={[task]} 
                                                    completedToday={completedToday} 
                                                    onComplete={onComplete} 
                                                    onDelete={onDelete} 
                                                />
                                            </div>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            ) : (
                                <div className="py-20 text-center border-2 border-dashed border-slate-900 rounded-sm">
                                    <span className="text-slate-700 font-mono text-sm uppercase tracking-widest">Нет активных целей на сегодня</span>
                                </div>
                            )}

                            {completedTasks.length > 0 && (
                                <div className="pt-8 opacity-40 hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-[1px] bg-slate-800 flex-1"></div>
                                        <span className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em]">Протоколы завершены</span>
                                        <div className="h-[1px] bg-slate-800 flex-1"></div>
                                    </div>
                                    <TaskList tasks={completedTasks} completedToday={completedToday} onComplete={onComplete} onDelete={onDelete}/>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
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

  const scrollToInput = () => {
    const input = document.querySelector('input[placeholder="Ввести новую директиву..."]') as HTMLInputElement;
    if (input) {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="border-b border-slate-800 pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 font-mono tracking-wide uppercase">
              <Sun className="text-amber-400" />
              СТРАТЕГИЯ ДНЯ
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-mono uppercase text-[10px] tracking-widest">Приоритезация и распределение нагрузки.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-900/80 border border-slate-800 p-1 rounded-sm flex items-center gap-1 shadow-lg">
              <button onClick={() => setSubView('today')} className={`px-4 py-1.5 text-[10px] font-mono font-bold rounded-sm transition-all ${subView === 'today' ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}>СЕГОДНЯ</button>
              <button onClick={() => setSubView('week')} className={`px-4 py-1.5 text-[10px] font-mono font-bold rounded-sm transition-all ${subView === 'week' ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}>НЕДЕЛЯ</button>
              <button onClick={() => setSubView('year')} className={`px-4 py-1.5 text-[10px] font-mono font-bold rounded-sm transition-all ${subView === 'year' ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}>ГОД</button>
            </div>
            
            <div className="flex gap-2">
                <button 
                    onClick={scrollToInput}
                    title="Быстрая директива"
                    className="bg-green-600/10 border border-green-500/30 p-2 text-green-500 hover:bg-green-500 hover:text-white transition-all rounded-sm shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                    <Plus size={18} strokeWidth={3} />
                </button>
                <button 
                    onClick={() => setIsAIAssistantOpen(true)}
                    className="bg-blue-600/10 border border-blue-500/30 p-2 text-blue-500 hover:bg-blue-500 hover:text-white transition-all rounded-sm shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                    <BrainCircuit size={18} />
                </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="animate-fade-in">
        {subView === 'today' && <TodayPlanning {...props} />}
        {subView === 'week' && <WeekView {...props} />}
        {subView === 'year' && <YearlyCalendar {...props} tasksByDate={tasksByDate} />}
      </div>

      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onAddTask={props.onAdd}
      />
    </div>
  );
}

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
    <div className="flex space-x-4 overflow-x-auto pb-6 custom-scrollbar-horizontal">
        {dates.map((dateStr, index) => {
            const dateObj = new Date(dateStr);
            const isToday = index === 0;
            const dayName = isToday ? 'Сегодня' : dateObj.toLocaleDateString('ru-RU', { weekday: 'long' });
            const dayTasks = tasks.filter(t => t.dueDate === dateStr && !completedToday[t.id]);

            return (
                <div 
                    key={dateStr} 
                    className={`flex-shrink-0 w-80 min-h-[500px] flex flex-col bg-[#0a0f1c] border-2 rounded-sm ${isToday ? 'border-blue-700 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'border-slate-800/50'}`}
                >
                    <div className={`p-4 border-b ${isToday ? 'bg-blue-900/20 border-blue-700' : 'bg-slate-900/40 border-slate-800'}`}>
                        <div className="text-xs font-mono font-bold text-blue-500 uppercase tracking-widest">{dayName}</div>
                        <div className="text-lg font-black text-white">{dateObj.getDate()} {dateObj.toLocaleString('ru-RU', { month: 'short' }).toUpperCase()}</div>
                    </div>
                    <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
                        <TaskList tasks={dayTasks} completedToday={completedToday} onComplete={onComplete} onDelete={onDelete} />
                    </div>
                    <div className="p-3 bg-black/20 border-t border-slate-800/40">
                        <QuickAddTask onAdd={onAdd} defaultDate={dateStr} />
                    </div>
                </div>
            );
        })}
    </div>
  );
};
