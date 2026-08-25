import { Response, NextFunction } from 'express';
import { AuthRequest } from './types';
import { verifyToken } from './jwt';
import { HttpError } from './HttpError';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Missing or invalid Authorization header'));
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    next(new HttpError(401, 'Invalid or expired token'));
  }
};
