export interface RenameMappingDto {
  source: string;
  destination: string;
}

export interface RenameRequestDto {
  folderPath: string;
  mappings: RenameMappingDto[];
}

export interface RenameResultDto {
  source: string;
  destination: string;
  success: boolean;
  error?: string;
}

export interface RenameResponseDto {
  data: {
    results: RenameResultDto[];
    successCount: number;
    failureCount: number;
  };
}
