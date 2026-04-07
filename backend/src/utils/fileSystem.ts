import fs from 'fs';
import path from 'path';
import { logger } from './logger';

const VIDEO_EXTENSIONS = new Set([
  '.mkv', '.mp4', '.avi', '.mov', '.wmv',
  '.m4v', '.ts', '.m2ts', '.webm', '.flv', '.rmvb', '.rm',
]);

/**
 * Returns true if the extension belongs to a known video format.
 */
export function isVideoFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return VIDEO_EXTENSIONS.has(ext);
}

/**
 * Converts a Windows-style path (e.g. M:\foo\bar) to a Linux mount path
 * (e.g. /mnt/m/foo/bar) when running inside Docker on Linux.
 * Leaves Linux paths untouched.
 */
export function normalizeFolderPath(folderPath: string): string {
  const trimmed = folderPath.trim();
  // Windows absolute path like M:\... or M:/...
  const winDrive = trimmed.match(/^([A-Za-z]):[/\\](.*)/s);
  if (winDrive && process.platform !== 'win32') {
    const drive = winDrive[1].toLowerCase();
    const rest = winDrive[2].replace(/\\/g, '/');
    return `/mnt/${drive}/${rest}`;
  }
  return trimmed.replace(/\\/g, '/');
}

/**
 * Lists all video files (non-recursively) in a given directory path.
 * Returns filenames only (not full paths), sorted alphabetically.
 * Throws if the path is not a valid directory.
 */
export function listVideoFiles(folderPath: string): string[] {
  if (!folderPath || !folderPath.trim()) {
    throw new Error('Folder path is required');
  }

  const normalized = path.normalize(normalizeFolderPath(folderPath));

  let stat: fs.Stats;
  try {
    stat = fs.statSync(normalized);
  } catch {
    throw new Error(`Path does not exist or is not accessible: ${normalized}`);
  }

  if (!stat.isDirectory()) {
    throw new Error(`Path is not a directory: ${normalized}`);
  }

  let entries: string[];
  try {
    entries = fs.readdirSync(normalized);
  } catch (err) {
    logger.error('Failed to read directory', { path: normalized, err });
    throw new Error(`Failed to read directory: ${normalized}`);
  }

  const videoFiles = entries
    .filter((entry) => {
      try {
        const fullPath = path.join(normalized, entry);
        const s = fs.statSync(fullPath);
        return s.isFile() && isVideoFile(entry);
      } catch {
        return false;
      }
    })
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  logger.debug(`Found ${videoFiles.length} video file(s) in ${normalized}`);
  return videoFiles;
}

/**
 * Renames a file from sourceName to destinationName within folderPath.
 * Both names are filenames only (not full paths).
 * Returns true on success, throws on failure.
 */
export function renameFile(folderPath: string, sourceName: string, destinationName: string): void {
  const normalized = path.normalize(normalizeFolderPath(folderPath));
  const sourcePath = path.join(normalized, sourceName);
  const destPath = path.join(normalized, destinationName);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source file not found: ${sourcePath}`);
  }

  if (fs.existsSync(destPath) && sourcePath.toLowerCase() !== destPath.toLowerCase()) {
    throw new Error(`Destination file already exists: ${destPath}`);
  }

  fs.renameSync(sourcePath, destPath);
  logger.info(`Renamed: "${sourceName}" → "${destinationName}"`);
}
