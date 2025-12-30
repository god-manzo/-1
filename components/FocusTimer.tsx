
import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Timer, Coffee } from 'lucide-react';
import { StatKey } from '../types';

interface FocusTimerProps {
  onComplete: (durationMinutes: number) => void;
}

export function FocusTimer({ onComplete }: FocusTimerProps) {
  const DEFAULT_TIME = 25 * 60; // 25 minutes
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (mode === 'focus') {
        onComplete(25);
        setTimeLeft(5 * 60); // 5 min break
        setMode('break');
      } else {
        setTimeLeft(DEFAULT_TIME);
        setMode('focus');
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, onComplete]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(DEFAULT_TIME);
    setMode('focus');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((mode === 'focus' ? DEFAULT_TIME : 300) - timeLeft) / (mode === 'focus' ? DEFAULT_TIME : 300) * 100;

  return (
    <div className="relative bg-[#0a0f1c] border-2 border-slate-800 rounded-sm p-6 overflow-hidden group">
      {/* Background Grid Animation */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      
      {/* Decorative Lines */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 mb-4">
           {mode === 'focus' ? (
             <Timer className="text-blue-500 animate-pulse" size={16} />
           ) : (
             <Coffee className="text-green-500 animate-bounce" size={16} />
           )}
           <span className={`text-xs font-mono font-bold tracking-[0.2em] uppercase ${mode === 'focus' ? 'text-blue-400' : 'text-green-400'}`}>
             {mode === 'focus' ? 'ПРОТОКОЛ ФОКУСИРОВКИ' : 'РЕЖИМ ВОССТАНОВЛЕНИЯ'}
           </span>
        </div>

        {/* Digital Timer Display */}
        <div className="relative mb-6">
          <div className="text-6xl md:text-7xl font-mono font-bold text-white tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            {formatTime(timeLeft)}
          </div>
          {/* Progress Bar under timer */}
          <div className="w-full h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${mode === 'focus' ? 'bg-blue-500' : 'bg-green-500'}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTimer}
            className={`w-14 h-14 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
              isActive 
                ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' 
                : 'border-blue-500 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]'
            }`}
          >
            {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </button>
          
          <button 
            onClick={resetTimer}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-700 text-slate-500 hover:text-red-400 hover:border-red-500/50 transition-colors"
          >
            <Square size={14} fill="currentColor" />
          </button>
        </div>

        <div className="mt-6 text-[10px] text-slate-600 font-mono text-center max-w-xs">
           {isActive 
             ? "СИСТЕМА: ПОДДЕРЖАНИЕ КОНЦЕНТРАЦИИ. ВНЕШНИЕ РАЗДРАЖИТЕЛИ БЛОКИРОВАНЫ."
             : "ИНИЦИИРУЙТЕ ТАЙМЕР ДЛЯ НАЧАЛА ПРОЦЕССА УСВОЕНИЯ НАВЫКОВ."}
        </div>
      </div>
    </div>
  );
}
