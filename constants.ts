
import { StatKey } from './types';
import { 
  Dumbbell, 
  Brain, 
  Zap, 
  Target, 
  Sparkles 
} from 'lucide-react';

export const STAT_CONFIG: Record<StatKey, { label: string, color: string, icon: any, description: string }> = {
  [StatKey.STRENGTH]: { 
    label: 'Сила', 
    color: '#ef4444', // Red 500
    icon: Dumbbell,
    description: 'Физические нагрузки, выносливость и общее состояние.'
  },
  [StatKey.INTELLECT]: { 
    label: 'Интеллект', 
    color: '#3b82f6', // Blue 500
    icon: Brain,
    description: 'Обучение, анализ данных, решение сложных задач.'
  },
  [StatKey.AGILITY]: { 
    label: 'Ловкость', 
    color: '#10b981', // Emerald 500
    icon: Zap,
    description: 'Скорость реакции, адаптивность, бытовые задачи.'
  },
  [StatKey.DISCIPLINE]: { 
    label: 'Дисциплина', 
    color: '#f59e0b', // Amber 500
    icon: Target,
    description: 'Следование рутине, формирование привычек, самоконтроль.'
  },
  [StatKey.CHARISMA]: { 
    label: 'Харизма', 
    color: '#ec4899', // Pink 500
    icon: Sparkles,
    description: 'Социальные взаимодействия, эмпатия, лидерство.'
  },
};

export const INITIAL_PROFILE = {
  name: "Оперативник",
  avatar: "", // Empty string will trigger fallback icon
  level: 1,
  currentXp: 0,
  xpToNextLevel: 500,
  stats: {
    [StatKey.STRENGTH]: 1,
    [StatKey.INTELLECT]: 1,
    [StatKey.AGILITY]: 1,
    [StatKey.DISCIPLINE]: 1,
    [StatKey.CHARISMA]: 1,
  },
  totalTasksCompleted: 0,
  joinedAt: new Date().toISOString(),
};

export const STORAGE_KEY = 'victory-diary-rpg-v2';