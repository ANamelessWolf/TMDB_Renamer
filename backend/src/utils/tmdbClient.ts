import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env';
import { logger } from './logger';
import type {
  TmdbSearchResult,
  TmdbSeasonDetail,
  TmdbTvDetail,
} from '../models/dtos/tmdb.dto';

class TmdbClient {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: env.tmdb.baseUrl,
      timeout: 10_000,
      params: {
        api_key: env.tmdb.apiKey,
        language: 'en-US',
      },
    });

    this.http.interceptors.response.use(
      (res) => res,
      (err) => {
        const status: number = err.response?.status;
        const url: string = err.config?.url ?? 'unknown';
        logger.error(`TMDB request failed [${status}] ${url}`, {
          message: err.message,
          data: err.response?.data,
        });
        return Promise.reject(err);
      },
    );
  }

  /**
   * Searches for TV shows by name.
   */
  async searchTv(query: string): Promise<TmdbSearchResult[]> {
    logger.debug(`TMDB search TV: "${query}"`);
    const res = await this.http.get<{ results: TmdbSearchResult[]; total_results: number }>(
      '/search/tv',
      { params: { query } },
    );
    return res.data.results ?? [];
  }

  /**
   * Fetches full TV show details (includes season list with episode_count).
   */
  async getTvDetail(showId: number): Promise<TmdbTvDetail> {
    logger.debug(`TMDB get TV detail: showId=${showId}`);
    const res = await this.http.get<TmdbTvDetail>(`/tv/${showId}`);
    return res.data;
  }

  /**
   * Fetches full season detail including episode list.
   */
  async getSeasonDetail(showId: number, seasonNumber: number): Promise<TmdbSeasonDetail> {
    logger.debug(`TMDB get season detail: showId=${showId} season=${seasonNumber}`);
    const res = await this.http.get<TmdbSeasonDetail>(
      `/tv/${showId}/season/${seasonNumber}`,
    );
    return res.data;
  }
}

export const tmdbClient = new TmdbClient();
