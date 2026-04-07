import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { listFilesInFolder } from '../services/files.service';
import { createError } from '../middleware/errorHandler';

export function listFiles(req: Request, res: Response, next: NextFunction): void {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(errors.array()[0].msg as string, 400));
    }

    const { path } = req.body as { path: string };
    const result = listFilesInFolder(path);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
