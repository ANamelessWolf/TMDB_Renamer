/**
 * Cleans a raw folder/path name into a likely TMDB-searchable show title.
 *
 * Handles common patterns like:
 *   "Urusei Yatsura (1981)"          → "Urusei Yatsura (1981)"  (keep year for disambiguation)
 *   "Anime [U-V]"                    → "Anime"
 *   "My.Show.Name.2020"              → "My Show Name 2020"
 *   "My_Show_Name"                   → "My Show Name"
 *   "ShowName - Season 1"            → "ShowName"
 *   "ShowName [1080p][BluRay]"       → "ShowName"
 */

const BRACKET_CONTENT = /\[([^\]]*)\]/g;
const PAREN_QUALITY = /\(\s*(1080p|720p|480p|4K|BluRay|WEB|HDTV|x264|x265|HEVC|AAC|AC3)\s*\)/gi;
const SEASON_SUFFIX = /[-–]\s*(season|s)\s*\d+\s*$/i;
const TRAILING_DASH = /[-–\s]+$/;
const DOTS_OR_UNDERSCORES = /[._]+/g;

/**
 * Extracts the most likely show title from a folder path.
 * Uses the last meaningful path segment.
 */
export function extractTitleFromPath(folderPath: string): string {
  const normalized = folderPath.replace(/\\/g, '/').replace(/\/+$/, '');
  const segments = normalized.split('/').filter(Boolean);

  if (segments.length === 0) return '';

  // Use the last path segment as the show folder
  let candidate = segments[segments.length - 1];
  return cleanTitle(candidate);
}

/**
 * Cleans a raw folder name into a search-friendly title.
 */
export function cleanTitle(raw: string): string {
  let title = raw;

  // Remove known quality/format tags in square brackets like [1080p], [BluRay], [SubGroup]
  // But preserve brackets that might be part of the name (short tags are usually metadata)
  title = title.replace(BRACKET_CONTENT, (match, content: string) => {
    // Keep if content looks like part of the title (e.g. letters + spaces, > 3 chars)
    // Remove if it looks like a tag (all caps, or quality keywords)
    const isTag = /^[A-Z0-9\-. ]+$/.test(content) && content.length < 20;
    return isTag ? '' : match;
  });

  // Remove quality tags in parentheses
  title = title.replace(PAREN_QUALITY, '');

  // Remove season suffixes
  title = title.replace(SEASON_SUFFIX, '');

  // Replace dots/underscores with spaces (common in scene naming)
  title = title.replace(DOTS_OR_UNDERSCORES, ' ');

  // Remove trailing dashes/spaces
  title = title.replace(TRAILING_DASH, '').trim();

  // Collapse multiple spaces
  title = title.replace(/\s{2,}/g, ' ').trim();

  return title;
}
