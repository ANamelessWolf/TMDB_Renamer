import path from 'path';
import dotenv from 'dotenv';

// Load the backend-local .env regardless of the process working directory.
dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

export const env = {
  port: parseInt(process.env.PORT || '3000', 10),
  publicApiUrl: process.env.PUBLIC_API_URL || `http://localhost:${process.env.PORT || '3000'}`,
  nodeEnv: process.env.NODE_ENV || 'development',
  tmdb: {
    apiKey: process.env.TMDB_API_KEY || '',
    baseUrl: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  },
  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:4204,http://localhost:4200').split(','),
  },
  logLevel: process.env.LOG_LEVEL || 'info',
} as const;

if (!env.tmdb.apiKey) {
  console.warn('[config] WARNING: TMDB_API_KEY is not set. TMDB requests will fail.');
}
