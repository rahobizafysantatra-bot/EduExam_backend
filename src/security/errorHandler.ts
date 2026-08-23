import { Request, Response, NextFunction } from 'express';
import { HttpError } from './HttpError';

// RG-13 : every API error is returned as { "message": "..." } with the right HTTP status
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }

  console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
}
