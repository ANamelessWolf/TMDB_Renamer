import { Router } from 'express';
import { healthRouter } from './health.routes';
import { filesRouter } from './files.routes';
import { tmdbRouter } from './tmdb.routes';
import { renameRouter } from './rename.routes';

export const router = Router();

router.use('/health', healthRouter);
router.use('/files', filesRouter);
router.use('/tmdb', tmdbRouter);
router.use('/rename', renameRouter);
