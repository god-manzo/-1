

import { useState, useEffect, useCallback } from 'react';
import { GameState, Task, StatKey, LogMessage, Profile, VictoryLog, Priority } from '../types';
import { INITIAL_PROFILE, STORAGE_KEY } from '../constants';

const todayKey = () => new Date().toISOString().slice(0, 10);

const DEFAULT_HABITS = [
  { title: "Ежедневная тренировка (Сила)", stat: StatKey.STRENGTH, xp: 100 },
  { title: "Чтение системного руководства (Интеллект)", stat: StatKey.INTELLECT, xp: 120 },
];

export function useGameState() {
  // FIX: Renamed the state variable from `useState` to `gameState` to avoid conflict with the hook and fix reference errors.
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: Ensure tasks have new fields
        const migratedTasks = (parsed.tasks || []).map((t: any) => ({
            ...t,
            priority: t.priority || Priority.E_RANK,
            dueDate: t.dueDate || (t.id.startsWith('daily-') ? todayKey() : null),
            isHabit: t.isHabit !== undefined ? t.isHabit : t.id.startsWith('daily-')
        }));

        const migratedProfile = { ...INITIAL_PROFILE, ...parsed.profile };
        delete migratedProfile.hp;
        delete migratedProfile.maxHp;


        return { 
          ...parsed, 
          tasks: migratedTasks,
          profile: migratedProfile,
          victoryHistory: parsed.victoryHistory || [],
          lastLoginDate: parsed.lastLoginDate || todayKey(),
          dayNames: parsed.dayNames || {}
        };
      } catch (e) {
        console.error("Файл сохранения поврежден", e);
      }
    }
    return {
      profile: INITIAL_PROFILE,
      tasks: [],
      victoryHistory: [],
      completedToday: {},
      lastLoginDate: todayKey(),
      dayNames: {},
    };
  });

  const [logs, setLogs] = useState<LogMessage[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  const addLog = useCallback((text: string, type: LogMessage['type'] = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setLogs(prev => [{ id, text, type, timestamp: Date.now() }, ...prev].slice(0, 5));
    setTimeout(() => {
      setLogs(prev => prev.filter(l => l.id !== id));
    }, 5000);
  }, []);

  const resetDay = useCallback(() => {
    const today = todayKey();
    if (gameState.lastLoginDate !== today) {
      
      setGameState(prev => {
        // Regenerate Habits if missing
        let currentTasks = [...prev.tasks];
        const habits = currentTasks.filter(t => t.isHabit);
        
        if (habits.length === 0) {
            const newHabits = DEFAULT_HABITS.map((h, i) => ({
                id: `habit-${Date.now()}-${i}`,
                title: h.title,
                stat: h.stat,
                xpValue: h.xp,
                streak: 0,
                createdAt: new Date().toISOString(),
                priority: Priority.A_RANK,
                dueDate: null, // Habits recur, dueDate logic handled by view usually, or set to today
                isHabit: true
            }));
            currentTasks = [...currentTasks, ...newHabits];
        }

        return {
          ...prev,
          completedToday: {}, // Reset daily completion
          tasks: currentTasks,
          lastLoginDate: today,
        };
      });
      
      addLog("Дата системы обновлена. Статус синхронизирован.", 'warning');
    }
  }, [gameState.lastLoginDate, addLog]);

  const checkLevelUp = (currentProfile: Profile, addedXp: number): Profile => {
    let { level, currentXp, xpToNextLevel } = currentProfile;
    let newXp = currentXp + addedXp;
    let newLevel = level;
    let newXpToNext = xpToNextLevel;
    let leveledUp = false;

    while (newXp >= newXpToNext) {
      newXp -= newXpToNext;
      newLevel++;
      newXpToNext = Math.floor(newXpToNext * 1.3);
      leveledUp = true;
    }

    if (leveledUp) {
      addLog(`СИСТЕМНОЕ УВЕДОМЛЕНИЕ: НОВЫЙ УРОВЕНЬ! РАНГ ПОВЫШЕН ДО ${newLevel}`, 'level-up');
    }

    return {
      ...currentProfile,
      level: newLevel,
      currentXp: newXp,
      xpToNextLevel: newXpToNext,
    };
  };

  const recordVictory = (title: string, description: string, stat: StatKey) => {
    const xpReward = 50;

    setGameState(prev => {
      const newStats = { ...prev.profile.stats };
      newStats[stat] = (newStats[stat] || 0) + 0.1;

      const updatedProfile = checkLevelUp({ ...prev.profile, stats: newStats }, xpReward);

      return {
        ...prev,
        victoryHistory: [{
            id: Date.now().toString(), title, description, stat, xpGained: xpReward, timestamp: Date.now()
        }, ...prev.victoryHistory],
        profile: updatedProfile
      };
    });
    addLog(`Достижение записано. +${xpReward} XP`, 'success');
  };

  const completeTask = (taskId: string) => {
    const task = gameState.tasks.find(t => t.id === taskId);
    if (!task) return;
    const isHabit = task.isHabit;
    if (isHabit && gameState.completedToday[taskId]) return; 

    setGameState(prev => {
      const newStats = { ...prev.profile.stats };
      newStats[task.stat] = (newStats[task.stat] || 0) + (task.xpValue * 0.005);
      
      const updatedProfile = checkLevelUp({
        ...prev.profile,
        stats: newStats,
        totalTasksCompleted: prev.profile.totalTasksCompleted + 1
      }, task.xpValue);

      const taskLog: VictoryLog = {
        id: `task-${Date.now()}`,
        title: task.title,
        description: isHabit ? 'Ежедневный протокол выполнен' : 'Директива выполнена',
        stat: task.stat,
        xpGained: task.xpValue,
        timestamp: Date.now()
      };

      const updatedTasks = isHabit 
        ? prev.tasks 
        : prev.tasks.filter(t => t.id !== taskId);

      return {
        ...prev,
        tasks: updatedTasks,
        victoryHistory: [taskLog, ...prev.victoryHistory],
        completedToday: { ...prev.completedToday, [taskId]: true },
        profile: updatedProfile
      };
    });

    addLog(`Директива выполнена: ${task.title}`, 'success');
  };

  const addTask = (title: string, stat: StatKey, xpValue: number, priority: Priority = Priority.E_RANK, dueDate: string | null = null, isHabit: boolean = false) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      stat,
      xpValue,
      streak: 0,
      createdAt: new Date().toISOString(),
      priority,
      dueDate,
      isHabit
    };
    setGameState(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
    addLog("Получена новая директива.", 'info');
  };

  const deleteTask = (taskId: string) => {
    setGameState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId),
      completedToday: { ...prev.completedToday, [taskId]: false }
    }));
  };

  const updateProfile = (name: string, avatar: string) => {
    setGameState(prev => ({ ...prev, profile: { ...prev.profile, name, avatar } }));
  };
  
  const setDayName = (date: string, name: string) => {
    setGameState(prev => {
      const newDayNames = { ...prev.dayNames };
      if (name.trim()) {
        newDayNames[date] = name;
      } else {
        delete newDayNames[date];
      }
      return { ...prev, dayNames: newDayNames };
    });
    
    if (name.trim()) {
      addLog(`Дню ${date} присвоено имя: ${name.trim()}`, 'info');
    } else {
      addLog(`Имя для дня ${date} удалено.`, 'info');
    }
  };

  return {
    gameState,
    logs,
    completeTask,
    addTask,
    deleteTask,
    resetDay,
    updateProfile,
    recordVictory,
    setDayName
  };
}