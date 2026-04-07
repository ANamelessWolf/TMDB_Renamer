// ── Files API ─────────────────────────────────────────

export interface FileItem {
  file: string;
}

export interface FilesListResponse {
  data: {
    items: FileItem[];
    total: number;
    path: string;
    extractedTitle: string;
  };
}

// ── TMDB API ──────────────────────────────────────────

export interface TmdbShowResult {
  id: number;
  name: string;
  original_name: string;
  first_air_date: string;
  overview: string;
  poster_path: string | null;
}

export interface TmdbSearchResponse {
  data: {
    results: TmdbShowResult[];
    total_results: number;
  };
}

export interface TmdbEpisode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  air_date: string | null;
}

export interface TmdbSeason {
  season_number: number;
  name: string;
  episode_count: number;
  episodes: TmdbEpisode[];
}

export interface TmdbSeasonsResponse {
  data: {
    showId: number;
    showName: string;
    seasons: TmdbSeason[];
  };
}

// ── Rename API ────────────────────────────────────────

export interface RenameMapping {
  source: string;
  destination: string;
}

export interface RenameRequest {
  folderPath: string;
  mappings: RenameMapping[];
}

export interface RenameResult {
  source: string;
  destination: string;
  success: boolean;
  error?: string;
}

export interface RenameResponse {
  data: {
    results: RenameResult[];
    successCount: number;
    failureCount: number;
  };
}

// ── Health ────────────────────────────────────────────

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
}
