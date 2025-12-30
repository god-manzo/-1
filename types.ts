
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
  type: 'info' | 'success' | 'warning' | 'level-up' | 'danger' | 'stat_up' | 'achievement' | 'advisor' | 'analysis';
  timestamp: number;
}

// Types for the persistence system
export interface SaveSnapshot {
    timestamp: number;
    state: GameState;
}

export interface PersistedState {
    version: number;
    current: GameState;
    history: SaveSnapshot[];
}

// --- Types for the AI Analysis System ---

export interface DailyRecord {
    date: string; // YYYY-MM-DD
    completed: number;
    created: number;
    missed: number; // Due date passed, not completed
}

export interface SystemReport {
    period: string; // e.g., "Неделя 24", "Месяц 6", "Сезон 2"
    fact: string;
    trend: string;
    generatedAt: string;
}

export enum SeasonalArchetype {
    STABLE_GROWTH = "Стабильное наращивание",
    UNSTABLE_GROWTH = "Нестабильное наращивание",
    STAGNATION = "Стагнация",
    REGRESSION = "Регрессия",
    RECOVERY = "Восстановление",
    CRASH = "Срыв",
    VOID = "Недостаточно данных"
}

export interface SeasonalReport extends SystemReport {
    archetype: SeasonalArchetype;
}

export interface SystemAnalysis {
    version: number;
    dailyRecords: Record<string, DailyRecord>; // Key is YYYY-MM-DD
    lastAnalysisDate: string;
    weeklyReport?: SystemReport;
    monthlyReport?: SystemReport;
    seasonalReport?: SeasonalReport;
}
