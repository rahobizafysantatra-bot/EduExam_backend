import { Response, NextFunction } from 'express';
import { AuthRequest, AuthUser } from './types';
import { HttpError } from './HttpError';

export const requireRole = (role: AuthUser['role']) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpError(401, 'Authentication required'));
    }

    if (req.user.role !== role) {
      return next(new HttpError(403, 'Access denied for this role'));
    }

    next();
  };
};
