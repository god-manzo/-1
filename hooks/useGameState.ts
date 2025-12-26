import { useState, useEffect, useCallback } from 'react';
import { GameState, Task, StatKey, LogMessage, Profile, VictoryLog } from '../types';
import { INITIAL_PROFILE, STORAGE_KEY } from '../constants';

const todayKey = () => new Date().toISOString().slice(0, 10);

const DAILY_QUESTS_TEMPLATES = [
  { title: "Записать 3 небольшие победы", stat: StatKey.DISCIPLINE, xp: 100, hp: 150 },
  { title: "Час фокусной работы", stat: StatKey.INTELLECT, xp: 150, hp: 200 },
  { title: "Физическая активность", stat: StatKey.STRENGTH, xp: 120, hp: 180 },
];

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration logic for v2
        return { 
          ...parsed, 
          profile: {
            ...INITIAL_PROFILE,
            ...parsed.profile,
            hp: parsed.profile.hp || 1000,
            maxHp: parsed.profile.maxHp || 1000
          },
          victoryHistory: parsed.victoryHistory || [],
          lastLoginDate: parsed.lastLoginDate || todayKey() 
        };
      } catch (e) {
        console.error("Save file corrupted", e);
      }
    }
    return {
      profile: INITIAL_PROFILE,
      tasks: [],
      victoryHistory: [],
      completedToday: {},
      lastLoginDate: todayKey(),
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

  // Система смены дня и регенерации квестов
  const resetDay = useCallback(() => {
    const today = todayKey();
    if (gameState.lastLoginDate !== today) {
      
      setGameState(prev => {
        // Усталость за новый день
        const newHp = Math.max(0, prev.profile.hp - 250); 
        
        // Генерация дейликов, если их нет
        let newTasks = [...prev.tasks];
        if (newTasks.filter(t => !prev.completedToday[t.id]).length < 3) {
           const defaults = DAILY_QUESTS_TEMPLATES.map((tpl, idx) => ({
             id: `daily-${today}-${idx}`,
             title: tpl.title,
             stat: tpl.stat,
             xpValue: tpl.xp,
             hpReward: tpl.hp,
             streak: 0,
             createdAt: new Date().toISOString()
           }));
           // Оставляем пользовательские, добавляем дефолтные
           newTasks = [...newTasks.filter(t => !t.id.startsWith('daily-')), ...defaults];
        }

        return {
          ...prev,
          completedToday: {},
          tasks: newTasks,
          lastLoginDate: today,
          profile: {
            ...prev.profile,
            hp: newHp
          }
        };
      });
      
      addLog("Новый день! HP снижено от усталости. Выполни квесты для восстановления.", 'warning');
    }
  }, [gameState.lastLoginDate, addLog]);

  const checkLevelUp = (currentProfile: Profile, addedXp: number): Profile => {
    let { level, currentXp, xpToNextLevel, maxHp, hp } = currentProfile;
    let newXp = currentXp + addedXp;
    let newLevel = level;
    let newXpToNext = xpToNextLevel;
    let newMaxHp = maxHp;
    let newHp = hp;
    let leveledUp = false;

    while (newXp >= newXpToNext) {
      newXp -= newXpToNext;
      newLevel++;
      newXpToNext = Math.floor(newXpToNext * 1.3);
      newMaxHp += 100; // +100 Max HP per level
      newHp = newMaxHp; // Full heal on level up
      leveledUp = true;
    }

    if (leveledUp) {
      addLog(`ПОВЫШЕНИЕ УРОВНЯ! Теперь ты уровень ${newLevel}`, 'level-up');
    }

    return {
      ...currentProfile,
      level: newLevel,
      currentXp: newXp,
      xpToNextLevel: newXpToNext,
      maxHp: newMaxHp,
      hp: newHp
    };
  };

  // Запись свободной победы
  const recordVictory = (title: string, description: string, stat: StatKey) => {
    const xpReward = 50;
    const hpReward = 50;

    setGameState(prev => {
      const newStats = { ...prev.profile.stats };
      newStats[stat] = (newStats[stat] || 0) + 0.1;

      // Heal logic
      const healedHp = Math.min(prev.profile.maxHp, prev.profile.hp + hpReward);

      const updatedProfile = checkLevelUp({
        ...prev.profile,
        hp: healedHp,
        stats: newStats,
      }, xpReward);

      const newLog: VictoryLog = {
        id: Date.now().toString(),
        title,
        description,
        stat,
        xpGained: xpReward,
        timestamp: Date.now()
      };

      return {
        ...prev,
        victoryHistory: [newLog, ...prev.victoryHistory],
        profile: updatedProfile
      };
    });
    addLog(`Победа записана! +${xpReward} XP, +${hpReward} HP`, 'success');
  };

  const completeTask = (taskId: string) => {
    if (gameState.completedToday[taskId]) return;

    const task = gameState.tasks.find(t => t.id === taskId);
    if (!task) return;

    setGameState(prev => {
      const newStats = { ...prev.profile.stats };
      newStats[task.stat] = (newStats[task.stat] || 0) + (task.xpValue * 0.005);

      const healedHp = Math.min(prev.profile.maxHp, prev.profile.hp + task.hpReward);

      const updatedProfile = checkLevelUp({
        ...prev.profile,
        hp: healedHp,
        stats: newStats,
        totalTasksCompleted: prev.profile.totalTasksCompleted + 1
      }, task.xpValue);

      return {
        ...prev,
        completedToday: { ...prev.completedToday, [taskId]: true },
        profile: updatedProfile
      };
    });

    addLog(`Квест выполнен: +${task.xpValue} XP | HP восстановлено`, 'success');
  };

  const addTask = (title: string, stat: StatKey, xpValue: number) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      stat,
      xpValue,
      hpReward: Math.floor(xpValue * 1.5),
      streak: 0,
      createdAt: new Date().toISOString()
    };
    setGameState(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
    addLog("Новая цель добавлена в журнал.", 'info');
  };

  const deleteTask = (taskId: string) => {
    setGameState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId),
      completedToday: { ...prev.completedToday, [taskId]: false }
    }));
  };

  const updateProfile = (name: string, avatar: string) => {
    setGameState(prev => ({
      ...prev,
      profile: { ...prev.profile, name, avatar }
    }));
    addLog("Профиль обновлен", 'info');
  };

  return {
    gameState,
    logs,
    completeTask,
    addTask,
    deleteTask,
    resetDay,
    updateProfile,
    recordVictory
  };
}
