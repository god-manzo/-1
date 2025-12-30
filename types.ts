
export enum StatKey {
  STRENGTH = 'strength',
  INTELLECT = 'intellect',
  AGILITY = 'agility',
  DISCIPLINE = 'discipline',
  CHARISMA = 'charisma'
}

export enum TabView {
  INBOX = 'inbox',
  TODAY = 'today',       // Renamed to "Planning" in UI, acts as container
  HABITS = 'habits',     // Daily Protocols
  PROFILE = 'profile',
  DASHBOARD = 'dashboard' // Stats/Focus
}

export enum Priority {
  S_RANK = 'S', // High / Urgent
  A_RANK = 'A', // Medium
  B_RANK = 'B', // Low
  E_RANK = 'E'  // None
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  stat: StatKey;
  priority: Priority;
  dueDate: string | null; // ISO Date string YYYY-MM-DD
  isHabit: boolean;       // If true, resets daily
  xpValue: number;
  streak: number;
  createdAt: string;
  completedAt?: number;
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
  stats: Record<StatKey, number>;
  totalTasksCompleted: number;
  joinedAt: string;
}

export interface GameState {
  profile: Profile;
  tasks: Task[];
  victoryHistory: VictoryLog[];
  completedToday: Record<string, boolean>; // For habits mainly
  lastLoginDate: string;
  dayNames: Record<string, string>;
}

export interface LogMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'level-up' | 'danger';
  timestamp: number;
}