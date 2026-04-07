import { Router } from 'express';
import { healthCheck } from '../controllers/health.controller';

export const healthRouter = Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     description: Returns server status, uptime, and timestamp.
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
healthRouter.get('/', healthCheck);
