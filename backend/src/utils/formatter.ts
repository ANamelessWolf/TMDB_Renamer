/**
 * Shared filename formatting utilities.
 * These rules are mirrored in the frontend formatter.util.ts.
 */

const WINDOWS_INVALID_CHARS = /[\\/:*?"<>|]/g;
const MULTI_SPACE = /\s{2,}/g;

/**
 * Builds the Sxx prefix portion (e.g. "S01", "S00")
 */
function seasonPrefix(season: number): string {
  return 'S' + String(season).padStart(2, '0');
}

/**
 * Builds the episode code portion for one episode number.
 * Uses 3-digit padding if number > 99.
 */
function episodeCode(episodeNumber: number): string {
  const digits = episodeNumber > 99 ? 3 : 2;
  return 'E' + String(episodeNumber).padStart(digits, '0');
}

/**
 * Builds the full episode prefix.
 * @example buildEpisodePrefix(1, [1])      → "S01E01"
 * @example buildEpisodePrefix(1, [1, 2])   → "S01E01E02"
 * @example buildEpisodePrefix(0, [1])      → "S00E01"
 * @example buildEpisodePrefix(1, [100])    → "S01E100"
 */
export function buildEpisodePrefix(season: number, episodeNumbers: number[]): string {
  const sorted = [...episodeNumbers].sort((a, b) => a - b);
  return seasonPrefix(season) + sorted.map(episodeCode).join('');
}

/**
 * Truncates a title to maxLen characters, appending "..." if needed.
 */
export function truncateTitle(title: string, maxLen = 30): string {
  const trimmed = title.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.substring(0, maxLen - 3) + '...';
}

/**
 * Removes characters invalid in Windows file/folder names.
 */
export function sanitizeWindowsFilename(name: string): string {
  return name
    .replace(WINDOWS_INVALID_CHARS, '-')
    .replace(MULTI_SPACE, ' ')
    .trim();
}

/**
 * Builds the full destination filename.
 * @param season       - Season number (0 = specials)
 * @param episodes     - Array of { episode_number, name }
 * @param extension    - File extension including dot (e.g. ".mkv")
 * @param customTitle  - Optional override for the title portion
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
 * Extracts the file extension from a filename (including the dot).
 * Returns empty string if no extension.
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === 0) return '';
  return filename.substring(lastDot).toLowerCase();
}
