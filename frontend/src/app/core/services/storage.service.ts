import { Injectable } from '@angular/core';
import type { SessionState } from '../models/mapping.models';

const STORAGE_KEY = 'tmdb_renamer_session';
/** Invalidate stored state after 24 hours of inactivity */
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class StorageService {
  saveSession(state: SessionState): void {
    try {
      const payload: SessionState = { ...state, savedAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // localStorage may be full or unavailable — fail silently
    }
  }

  loadSession(): SessionState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as SessionState;

      // Invalidate stale sessions
      if (!parsed.savedAt || Date.now() - parsed.savedAt > MAX_AGE_MS) {
        this.clearSession();
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  clearSession(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Returns true if a saved session exists for the given path.
   * Used to decide whether to restore or start fresh.
   */
  hasSessionForPath(folderPath: string): boolean {
    const session = this.loadSession();
    return session?.folderPath === folderPath;
  }
}
