import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { renameFiles } from '../services/rename.service';
import { createError } from '../middleware/errorHandler';
import type { RenameRequestDto } from '../models/dtos/rename.dto';

export async function renameFilesController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(errors.array()[0].msg as string, 400));
    }

    const dto = req.body as RenameRequestDto;
    const result = await renameFiles(dto);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
