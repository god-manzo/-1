
import { GameState, PersistedState, SaveSnapshot } from '../types';

const STORAGE_KEY = "rpg-diary-save-v3";
const VERSION = 1;
const MAX_HISTORY = 20;

export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version === VERSION) {
      return parsed;
    }
    return null; // Ignore old versions
  } catch {
    return null;
  }
}

export function saveState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save state:", error);
  }
}

export function pushHistory(
  history: SaveSnapshot[],
  state: GameState
): SaveSnapshot[] {
  const next = [...history, { timestamp: Date.now(), state }];
  // Return the last MAX_HISTORY items
  return next.slice(-MAX_HISTORY);
}
