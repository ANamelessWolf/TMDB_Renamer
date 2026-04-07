import express, { Application } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { router } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

export function createApp(): Application {
  const app = express();

  // ── Middleware ────────────────────────────────────────
  app.use(cors({
    origin: env.cors.origins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  // ── Swagger UI ────────────────────────────────────────
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'TMDB Renamer API Docs',
    swaggerOptions: { persistAuthorization: true },
  }));

  // Return raw OpenAPI spec as JSON
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // ── API Routes ────────────────────────────────────────
  app.use('/api', router);

  // ── Error Handler (must be last) ─────────────────────
  app.use(errorHandler);

  return app;
}
