import { listVideoFiles } from '../utils/fileSystem';
import { extractTitleFromPath } from '../utils/titleCleaner';
import type { FilesListResponseDto } from '../models/dtos/files.dto';
import { logger } from '../utils/logger';

export function listFilesInFolder(folderPath: string): FilesListResponseDto {
  logger.info(`Listing video files in: ${folderPath}`);

  const files = listVideoFiles(folderPath);
  const extractedTitle = extractTitleFromPath(folderPath);

  logger.info(`Found ${files.length} video files. Extracted title: "${extractedTitle}"`);

  return {
    data: {
      items: files.map((file) => ({ file })),
      total: files.length,
      path: folderPath,
      extractedTitle,
    },
  };
}
