import { Router } from 'express';
import { body } from 'express-validator';
import { renameFilesController } from '../controllers/rename.controller';

export const renameRouter = Router();

/**
 * @openapi
 * /api/rename:
 *   post:
 *     tags: [Rename]
 *     summary: Rename video files
 *     description: Renames files on the backend host machine according to the provided source→destination mappings.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RenameRequest'
 *     responses:
 *       200:
 *         description: Rename results (may include partial failures)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RenameResponse'
 *       400:
 *         description: Validation error
 *       500:
 *         description: File system error
 */
renameRouter.post(
  '/',
  [
    body('folderPath').isString().notEmpty().withMessage('folderPath is required'),
    body('mappings').isArray({ min: 1 }).withMessage('mappings must be a non-empty array'),
    body('mappings.*.source').isString().notEmpty().withMessage('Each mapping must have a source'),
    body('mappings.*.destination')
      .isString()
      .notEmpty()
      .withMessage('Each mapping must have a destination'),
  ],
  renameFilesController,
);
