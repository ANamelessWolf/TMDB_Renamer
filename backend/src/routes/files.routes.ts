import { Router } from 'express';
import { body } from 'express-validator';
import { listFiles } from '../controllers/files.controller';

export const filesRouter = Router();

/**
 * @openapi
 * /api/files/list:
 *   post:
 *     tags: [Files]
 *     summary: List video files in a folder
 *     description: Reads video files from a folder path on the backend host machine and extracts the show title from the path.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FilesListRequest'
 *           example:
 *             path: "M:\\tmp\\Anime [U-V]\\Urusei Yatsura (1981)"
 *     responses:
 *       200:
 *         description: List of video files
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FilesListResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error (path not accessible, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
filesRouter.post(
  '/list',
  [body('path').isString().notEmpty().withMessage('path is required and must be a string')],
  listFiles,
);
