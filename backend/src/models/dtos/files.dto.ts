export interface FilesListRequestDto {
  path: string;
}

export interface FileItemDto {
  file: string;
}

export interface FilesListResponseDto {
  data: {
    items: FileItemDto[];
    total: number;
    path: string;
    extractedTitle: string;
  };
}
