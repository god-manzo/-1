export enum StatKey {
  STRENGTH = 'strength',
  INTELLECT = 'intellect',
  AGILITY = 'agility',
  DISCIPLINE = 'discipline',
  CHARISMA = 'charisma'
}

export enum TabView {
  PROFILE = 'profile',
  QUESTS = 'quests',
  DASHBOARD = 'dashboard'
}

export interface Task {
  id: string;
  title: string;
  stat: StatKey;
  xpValue: number;
  hpReward: number;
  streak: number;
  createdAt: string;
}

export interface VictoryLog {
  id: string;
  title: string;
  description: string;
  stat: StatKey;
  xpGained: number;
  timestamp: number;
}

export interface Profile {
  name: string;
  avatar: string;
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  hp: number;
  maxHp: number;
  stats: Record<StatKey, number>;
  totalTasksCompleted: number;
  joinedAt: string;
}

export interface GameState {
  profile: Profile;
  tasks: Task[];
  victoryHistory: VictoryLog[];
  completedToday: Record<string, boolean>;
  lastLoginDate: string;
}

export interface LogMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'level-up' | 'danger';
  timestamp: number;
}