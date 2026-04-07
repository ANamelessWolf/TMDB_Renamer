import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { searchTvShow, getTvShowSeasons } from '../services/tmdb.service';
import { createError } from '../middleware/errorHandler';

export async function searchShow(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(errors.array()[0].msg as string, 400));
    }

    const { query } = req.body as { query: string };
    const result = await searchTvShow(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getSeasons(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const showId = parseInt(req.params.showId, 10);
    if (isNaN(showId)) {
      return next(createError('showId must be a valid number', 400));
    }

    const result = await getTvShowSeasons(showId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
