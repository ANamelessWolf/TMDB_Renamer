import { renameFile } from '../utils/fileSystem';
import { logger } from '../utils/logger';
import type { RenameRequestDto, RenameResponseDto, RenameResultDto } from '../models/dtos/rename.dto';

export async function renameFiles(dto: RenameRequestDto): Promise<RenameResponseDto> {
  logger.info(`Starting rename operation: ${dto.mappings.length} mapping(s) in "${dto.folderPath}"`);

  const results: RenameResultDto[] = [];

  for (const mapping of dto.mappings) {
    if (mapping.source === mapping.destination) {
      logger.debug(`Skipping identical mapping: "${mapping.source}"`);
      results.push({ source: mapping.source, destination: mapping.destination, success: true });
      continue;
    }

    try {
      renameFile(dto.folderPath, mapping.source, mapping.destination);
      results.push({ source: mapping.source, destination: mapping.destination, success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error(`Failed to rename "${mapping.source}" → "${mapping.destination}": ${message}`);
      results.push({
        source: mapping.source,
        destination: mapping.destination,
        success: false,
        error: message,
      });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.length - successCount;

  logger.info(`Rename complete: ${successCount} success, ${failureCount} failed`);

  return {
    data: {
      results,
      successCount,
      failureCount,
    },
  };
}
