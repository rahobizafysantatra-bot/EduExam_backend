import { Request, Response, NextFunction } from 'express';
import { HttpError } from './HttpError';

export const errorHandler = (err: unknown,req: Request,res: Response,next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }

  console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
};
