/**
 * Frontend formatter utilities — mirrors backend src/utils/formatter.ts logic.
 * Keep these in sync.
 */

const WINDOWS_INVALID_CHARS = /[\\/:*?"<>|]/g;
const MULTI_SPACE = /\s{2,}/g;

function seasonPrefix(season: number): string {
  return 'S' + String(season).padStart(2, '0');
}

function episodeCode(episodeNumber: number): string {
  const digits = episodeNumber > 99 ? 3 : 2;
  return 'E' + String(episodeNumber).padStart(digits, '0');
}

/**
 * Builds the full episode prefix.
 * @example buildEpisodePrefix(1, [1])    → "S01E01"
 * @example buildEpisodePrefix(1, [1, 2]) → "S01E01E02"
 * @example buildEpisodePrefix(0, [1])    → "S00E01"
 */
export function buildEpisodePrefix(season: number, episodeNumbers: number[]): string {
  const sorted = [...episodeNumbers].sort((a, b) => a - b);
  return seasonPrefix(season) + sorted.map(episodeCode).join('');
}

/**
 * Truncates a title to maxLen characters with trailing "...".
 */
export function truncateTitle(title: string, maxLen = 30): string {
  const trimmed = title.trim();
  return trimmed.length <= maxLen ? trimmed : trimmed.substring(0, maxLen - 3) + '...';
}

/**
 * Removes characters invalid in Windows filenames.
 */
export function sanitizeWindowsFilename(name: string): string {
  return name.replace(WINDOWS_INVALID_CHARS, '-').replace(MULTI_SPACE, ' ').trim();
}

/**
 * Builds the full destination filename.
 */
export function buildDestinationFilename(
  season: number,
  episodes: Array<{ episode_number: number; name: string }>,
  extension: string,
  customTitle?: string,
): string {
  if (episodes.length === 0) return '';

  const sorted = [...episodes].sort((a, b) => a.episode_number - b.episode_number);
  const prefix = buildEpisodePrefix(season, sorted.map((e) => e.episode_number));

  const titlePart = customTitle
    ? customTitle.trim()
    : sorted.map((e) => truncateTitle(e.name)).join(' / ');

  const sanitized = sanitizeWindowsFilename(titlePart);
  return `${prefix} ${sanitized}${extension}`;
}

/**
 * Extracts the file extension (with dot) from a filename.
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot <= 0 ? '' : filename.substring(lastDot).toLowerCase();
}

/**
 * Returns the display label for a season number.
 * Season 0 is always "Specials".
 */
export function getSeasonLabel(seasonNumber: number, seasonName?: string): string {
  if (seasonNumber === 0) return 'Specials (S00)';
  return seasonName || `Season ${seasonNumber}`;
}
