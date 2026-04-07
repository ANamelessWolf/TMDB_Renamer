import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TMDB Renamer API',
      version: '1.0.0',
      description: 'API for reading video files, querying TMDB, and renaming files based on episode metadata.',
      contact: {
        name: 'TMDB Renamer',
      },
    },
    servers: [
      {
        url: env.publicApiUrl,
        description: 'Local development server',
      },
    ],
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Files', description: 'File system operations' },
      { name: 'TMDB', description: 'TMDB API integration' },
      { name: 'Rename', description: 'File renaming operations' },
    ],
    components: {
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Something went wrong' },
            message: { type: 'string', example: 'Detailed error message' },
          },
          required: ['error'],
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'number', example: 123.45 },
          },
        },
        FileItem: {
          type: 'object',
          properties: {
            file: {
              type: 'string',
              example: '001 I\'m Lum the Notorious!, It\'s Raining Oil All Over Town.mkv',
            },
          },
          required: ['file'],
        },
        FilesListRequest: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              example: 'M:\\tmp\\Anime [U-V]\\Urusei Yatsura (1981)',
            },
          },
          required: ['path'],
        },
        FilesListResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/FileItem' },
                },
                total: { type: 'number', example: 10 },
                path: { type: 'string', example: 'M:\\tmp\\Anime [U-V]\\Urusei Yatsura (1981)' },
                extractedTitle: { type: 'string', example: 'Urusei Yatsura (1981)' },
              },
            },
          },
        },
        TmdbShowResult: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 12345 },
            name: { type: 'string', example: 'Urusei Yatsura' },
            original_name: { type: 'string', example: 'うる星やつら' },
            first_air_date: { type: 'string', example: '1981-10-14' },
            overview: { type: 'string' },
            poster_path: { type: 'string', nullable: true },
            number_of_seasons: { type: 'number', example: 2 },
          },
        },
        TmdbSearchResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                results: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/TmdbShowResult' },
                },
                total_results: { type: 'number' },
              },
            },
          },
        },
        TmdbEpisode: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            episode_number: { type: 'number', example: 1 },
            season_number: { type: 'number', example: 1 },
            name: { type: 'string', example: "I'm Lum the Notorious!" },
            overview: { type: 'string' },
            air_date: { type: 'string', nullable: true },
          },
        },
        TmdbSeason: {
          type: 'object',
          properties: {
            season_number: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Season 1' },
            episode_count: { type: 'number' },
            episodes: {
              type: 'array',
              items: { $ref: '#/components/schemas/TmdbEpisode' },
            },
          },
        },
        TmdbSeasonsResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                showId: { type: 'number' },
                showName: { type: 'string' },
                seasons: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/TmdbSeason' },
                },
              },
            },
          },
        },
        RenameMapping: {
          type: 'object',
          properties: {
            source: { type: 'string', example: '001 I\'m Lum the Notorious!.mkv' },
            destination: { type: 'string', example: 'S01E01 I\'m Lum the Notorious!.mkv' },
          },
          required: ['source', 'destination'],
        },
        RenameRequest: {
          type: 'object',
          properties: {
            folderPath: { type: 'string', example: 'M:\\tmp\\Anime [U-V]\\Urusei Yatsura (1981)' },
            mappings: {
              type: 'array',
              items: { $ref: '#/components/schemas/RenameMapping' },
              minItems: 1,
            },
          },
          required: ['folderPath', 'mappings'],
        },
        RenameResult: {
          type: 'object',
          properties: {
            source: { type: 'string' },
            destination: { type: 'string' },
            success: { type: 'boolean' },
            error: { type: 'string', nullable: true },
          },
        },
        RenameResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                results: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/RenameResult' },
                },
                successCount: { type: 'number' },
                failureCount: { type: 'number' },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
