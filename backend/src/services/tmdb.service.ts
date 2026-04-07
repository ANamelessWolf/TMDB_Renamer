import { tmdbClient } from '../utils/tmdbClient';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';
import type {
  TmdbSearchResponseDto,
  TmdbSeasonsResponseDto,
  TmdbEpisodeDto,
  TmdbSeasonDto,
} from '../models/dtos/tmdb.dto';

export async function searchTvShow(query: string): Promise<TmdbSearchResponseDto> {
  logger.info(`Searching TMDB for TV show: "${query}"`);

  const results = await tmdbClient.searchTv(query);

  return {
    data: {
      results,
      total_results: results.length,
    },
  };
}

export async function getTvShowSeasons(showId: number): Promise<TmdbSeasonsResponseDto> {
  logger.info(`Fetching seasons for TMDB show id=${showId}`);

  const detail = await tmdbClient.getTvDetail(showId);

  if (!detail) {
    throw createError(`TV show with id ${showId} not found`, 404);
  }

  // Fetch all seasons in parallel (includes season 0 = Specials)
  const seasonNumbers = detail.seasons.map((s) => s.season_number);

  const seasonDetails = await Promise.all(
    seasonNumbers.map((n) => tmdbClient.getSeasonDetail(showId, n)),
  );

  const seasons: TmdbSeasonDto[] = seasonDetails.map((sd) => {
    const episodes: TmdbEpisodeDto[] = (sd.episodes ?? [])
      .sort((a, b) => a.episode_number - b.episode_number)
      .map((ep) => ({
        id: ep.id,
        episode_number: ep.episode_number,
        season_number: ep.season_number,
        name: ep.name,
        overview: ep.overview,
        air_date: ep.air_date,
      }));

    return {
      season_number: sd.season_number,
      name: sd.name,
      episode_count: episodes.length,
      episodes,
    };
  });

  // Sort: Specials (0) first, then ascending season numbers
  seasons.sort((a, b) => {
    if (a.season_number === 0) return -1;
    if (b.season_number === 0) return 1;
    return a.season_number - b.season_number;
  });

  return {
    data: {
      showId: detail.id,
      showName: detail.name,
      seasons,
    },
  };
}
