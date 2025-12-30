
import { useState, useEffect, useCallback } from 'react';
import { GameState, Task, StatKey, LogMessage, Profile, VictoryLog, Priority, SaveSnapshot, PersistedState } from '../types';
import { INITIAL_PROFILE, STAT_CONFIG } from '../constants';
import { loadState, saveState, pushHistory } from './usePersistence';
import { useSystemAnalysis } from './useSystemAnalysis';

const todayKey = () => new Date().toISOString().slice(0, 10);

const DEFAULT_HABITS = [
  { title: "Ежедневная тренировка (Сила)", stat: StatKey.STRENGTH, xp: 100 },
  { title: "Чтение системного руководства (Интеллект)", stat: StatKey.INTELLECT, xp: 120 },
];

const initialGameState: GameState = {
    profile: INITIAL_PROFILE,
    tasks: [],
    victoryHistory: [],
    completedToday: {},
    lastLoginDate: todayKey(),
    dayNames: {},
};

export function useGameState(onLevelUp: () => void) {
  const [persistedState, setPersistedState] = useState<PersistedState>(() => {
    const saved = loadState();
    return saved || { version: 1, current: initialGameState, history: [] };
  });

  const { current: gameState, history } = persistedState;
  
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const { systemAnalysis, runAnalysis } = useSystemAnalysis(gameState);
  
  // Auto-save whenever the game state changes
  useEffect(() => {
    saveState(persistedState);
  }, [persistedState]);

  // Log new analysis reports
  useEffect(() => {
    const lastLog = logs[0];
    if (systemAnalysis.weeklyReport && lastLog?.text !== systemAnalysis.weeklyReport.fact) {
        addLog(systemAnalysis.weeklyReport.fact, 'analysis');
    }
    if (systemAnalysis.monthlyReport && lastLog?.text !== systemAnalysis.monthlyReport.fact) {
        addLog(systemAnalysis.monthlyReport.fact, 'analysis');
    }
    if (systemAnalysis.seasonalReport && lastLog?.text !== systemAnalysis.seasonalReport.fact) {
        addLog(`Сезон классифицирован: ${systemAnalysis.seasonalReport.archetype}`, 'analysis');
    }
  }, [systemAnalysis]);


  // Wrapper for all state changes to manage history
  const commit = useCallback((updater: (state: GameState) => GameState, logMessage?: { text: string; type: LogMessage['type'] }) => {
    setPersistedState(prev => {
      const newState = updater(prev.current);
      return {
        ...prev,
        current: newState,
        history: pushHistory(prev.history, prev.current),
      };
    });
    if (logMessage) {
        addLog(logMessage.text, logMessage.type);
    }
  }, []);

  const undo = useCallback(() => {
    if (history.length > 0) {
      setPersistedState(prev => {
        const lastSnapshot = prev.history[prev.history.length - 1];
        return {
          ...prev,
          current: lastSnapshot.state,
          history: prev.history.slice(0, -1),
        };
      });
      addLog("Последнее действие отменено.", 'warning');
    }
  }, [history.length]);


  const addLog = useCallback((text: string, type: LogMessage['type'] = 'info') => {
    setLogs(prev => {
      // Prevent duplicate logs
      if (prev.length > 0 && prev[0].text === text) return prev;
      const id = Date.now().toString() + Math.random().toString();
      const newLogs = [{ id, text, type, timestamp: Date.now() }, ...prev];
      return newLogs.slice(0, 5);
    });
    setTimeout(() => {
      setLogs(prev => prev.slice(0, prev.length -1));
    }, 5000);
  }, []);

  const resetDay = useCallback(() => {
    if (gameState.lastLoginDate !== todayKey()) {
      // Run AI analysis before committing the daily reset
      runAnalysis();
      
      commit(prev => {
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
                dueDate: null,
                isHabit: true
            }));
            currentTasks = [...currentTasks, ...newHabits];
        }

        return {
          ...prev,
          completedToday: {},
          tasks: currentTasks,
          lastLoginDate: todayKey(),
        };
      }, { text: "Дата системы обновлена. Статус синхронизирован.", type: 'warning' });
    }
  }, [gameState.lastLoginDate, commit, runAnalysis]);

  // Daily check on mount and focus
  useEffect(() => {
    resetDay();
  }, [resetDay]);

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
      onLevelUp(); // Trigger UI effect
    }

    return {
      ...currentProfile,
      level: newLevel,
      currentXp: newXp,
      xpToNextLevel: newXpToNext,
    };
  };

  const analyzeAndAdvise = (state: GameState) => {
      const recentCompleted = Object.keys(state.completedToday).length;
      const todayStr = new Date().toISOString().slice(0, 10);
      const pendingToday = state.tasks.filter(t => (t.isHabit || (t.dueDate && t.dueDate <= todayStr)) && !state.completedToday[t.id]).length;

      if (pendingToday > 5 && recentCompleted < 2) {
          addLog("Перегрузка протоколов. Рассмотрите возможность снижения нагрузки для поддержания эффективности.", 'advisor');
      } else if (pendingToday === 0 && recentCompleted > 3) {
          addLog("Высокая производительность. Система рекомендует добавить новую директиву для дальнейшего развития.", 'advisor');
      }
  };

  const recordVictory = (title: string, description: string, stat: StatKey) => {
    const xpReward = 50;
    commit(prev => {
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
    }, { text: `Достижение: ${title}. +${xpReward} XP`, type: 'achievement' });
  };

  const completeTask = (taskId: string) => {
    const task = gameState.tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.isHabit && gameState.completedToday[taskId]) return; 

    commit(prev => {
      const newStats = { ...prev.profile.stats };
      const statGain = task.xpValue * 0.005;
      newStats[task.stat] = (newStats[task.stat] || 0) + statGain;
      addLog(`ПАРАМЕТР ${STAT_CONFIG[task.stat].label.toUpperCase()} УЛУЧШЕН [+${statGain.toFixed(2)}]`, 'stat_up');
      
      const updatedProfile = checkLevelUp({
        ...prev.profile,
        stats: newStats,
        totalTasksCompleted: prev.profile.totalTasksCompleted + 1
      }, task.xpValue);

      const taskLog: VictoryLog = {
        id: `task-${Date.now()}`,
        title: task.title,
        description: task.isHabit ? 'Ежедневный протокол выполнен' : 'Директива выполнена',
        stat: task.stat,
        xpGained: task.xpValue,
        timestamp: Date.now()
      };

      const updatedTasks = task.isHabit 
        ? prev.tasks 
        : prev.tasks.filter(t => t.id !== taskId);
        
      const nextState = {
        ...prev,
        tasks: updatedTasks,
        victoryHistory: [taskLog, ...prev.victoryHistory],
        completedToday: { ...prev.completedToday, [taskId]: true },
        profile: updatedProfile
      };
      
      analyzeAndAdvise(nextState); // Local AI advisor
      
      return nextState;

    }, { text: `Директива выполнена: ${task.title}`, type: 'success' });
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
    commit(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }), { text: "Получена новая директива.", type: 'info' });
  };

  const deleteTask = (taskId: string) => {
    commit(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId),
      completedToday: { ...prev.completedToday, [taskId]: false }
    }));
  };

  const updateProfile = (name: string, avatar: string) => {
    commit(prev => ({ ...prev, profile: { ...prev.profile, name, avatar } }));
  };
  
  const setDayName = (date: string, name: string) => {
    commit(prev => {
      const newDayNames = { ...prev.dayNames };
      if (name.trim()) {
        newDayNames[date] = name;
      } else {
        delete newDayNames[date];
      }
      return { ...prev, dayNames: newDayNames };
    }, { text: `Дню ${date} присвоено имя: ${name.trim()}`, type: 'info' });
  };

  return {
    gameState,
    logs,
    systemAnalysis,
    completeTask,
    addTask,
    deleteTask,
    resetDay,
    updateProfile,
    recordVictory,
    setDayName,
    undo,
    hasHistory: history.length > 0,
  };
}
