import type { TmdbEpisode } from './api.models';

/**
 * Persisted state for a single file's episode links.
 * Only manually added episodes are stored here; the base auto-link is computed.
 */
export interface FileMappingState {
  file: string;
  /** Episode numbers manually added by the user via the modal */
  extraEpisodeNumbers: number[];
  /** Optional user-edited title override (replaces auto-generated title portion) */
  customTitle?: string;
}

/**
 * Computed display state for a single file.
 * Derived from FileMappingState + episode list on every recalculation.
 */
export interface FileMappingDisplay {
  file: string;
  extension: string;
  /** Auto-assigned base episode (null if no more episodes available) */
  baseEpisode: TmdbEpisode | null;
  /** Manually added extra episodes */
  extraEpisodes: TmdbEpisode[];
  /** All episodes (base + extra), sorted by episode_number */
  allEpisodes: TmdbEpisode[];
  /** Full destination filename e.g. "S01E01E02 Title / Title 2.mkv" */
  destination: string;
  /** Editable title portion only (without prefix and extension) */
  editableTitle: string;
}

/**
 * The full session state that gets persisted in localStorage.
 */
export interface SessionState {
  folderPath: string;
  showId: number | null;
  showName: string;
  selectedSeasonNumber: number;
  mappingStates: FileMappingState[];
  /** Timestamp of last save, used for cache invalidation checks */
  savedAt: number;
}
