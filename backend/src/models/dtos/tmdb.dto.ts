// ── Raw TMDB API shapes ───────────────────────────────

export interface TmdbSearchResult {
  id: number;
  name: string;
  original_name: string;
  first_air_date: string;
  overview: string;
  poster_path: string | null;
  number_of_seasons?: number;
}

export interface TmdbSeasonSummary {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  air_date: string | null;
  overview: string;
  poster_path: string | null;
}

export interface TmdbEpisode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  air_date: string | null;
  still_path: string | null;
  vote_average: number;
}

export interface TmdbSeasonDetail {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  air_date: string | null;
  episodes: TmdbEpisode[];
}

export interface TmdbTvDetail {
  id: number;
  name: string;
  original_name: string;
  first_air_date: string;
  overview: string;
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: TmdbSeasonSummary[];
  poster_path: string | null;
}

// ── API Request / Response DTOs ───────────────────────

export interface TmdbSearchRequestDto {
  query: string;
}

export interface TmdbSearchResponseDto {
  data: {
    results: TmdbSearchResult[];
    total_results: number;
  };
}

export interface TmdbSeasonsRequestDto {
  showId: number;
}

export interface TmdbSeasonDto {
  season_number: number;
  name: string;
  episode_count: number;
  episodes: TmdbEpisodeDto[];
}

export interface TmdbEpisodeDto {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  air_date: string | null;
}

export interface TmdbSeasonsResponseDto {
  data: {
    showId: number;
    showName: string;
    seasons: TmdbSeasonDto[];
  };
}
