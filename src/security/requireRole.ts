import { Response, NextFunction } from 'express';
import { AuthRequest, AuthUser } from './types';
import { UnauthorizedError, ForbiddenError } from './errors';

export const requireRole = (role: AuthUser['role']) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('No token provided'));
    }

    if (req.user.role !== role) {
      const message = role === 'ADMIN' ? 'Admin access required' : 'Student access required';
      return next(new ForbiddenError(message));
    }

    next();
  };
};
