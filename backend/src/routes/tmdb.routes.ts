import { Router } from 'express';
import { body } from 'express-validator';
import { searchShow, getSeasons } from '../controllers/tmdb.controller';

export const tmdbRouter = Router();

/**
 * @openapi
 * /api/tmdb/search:
 *   post:
 *     tags: [TMDB]
 *     summary: Search for a TV show on TMDB
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [query]
 *             properties:
 *               query:
 *                 type: string
 *                 example: "Urusei Yatsura (1981)"
 *     responses:
 *       200:
 *         description: Search results from TMDB
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TmdbSearchResponse'
 *       400:
 *         description: Missing or invalid query
 *       500:
 *         description: TMDB API error
 */
tmdbRouter.post(
  '/search',
  [body('query').isString().notEmpty().withMessage('query is required')],
  searchShow,
);

/**
 * @openapi
 * /api/tmdb/shows/{showId}/seasons:
 *   get:
 *     tags: [TMDB]
 *     summary: Get all seasons and episodes for a TV show
 *     description: Returns all seasons (including specials as Season 0) with full episode lists.
 *     parameters:
 *       - in: path
 *         name: showId
 *         required: true
 *         schema:
 *           type: integer
 *         description: TMDB show ID
 *         example: 12345
 *     responses:
 *       200:
 *         description: Seasons and episodes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TmdbSeasonsResponse'
 *       400:
 *         description: Invalid showId
 *       404:
 *         description: Show not found
 *       500:
 *         description: TMDB API error
 */
tmdbRouter.get('/shows/:showId/seasons', getSeasons);
