import type { ErrorRequestHandler } from 'express';
import { NotFoundError, ConflictError, ValidationError, UnauthorizedError, ForbiddenError } from './errors';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ValidationError) {
    res.status(400).json({ message: err.message });
    return;
  }

  if (err instanceof UnauthorizedError) {
    res.status(401).json({ message: err.message });
    return;
  }

  if (err instanceof ForbiddenError) {
    res.status(403).json({ message: err.message });
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(404).json({ message: err.message });
    return;
  }

  if (err instanceof ConflictError) {
    res.status(409).json({ message: err.message });
    return;
  }

  console.error(err);

  res.status(500).json({ message: 'Internal server error' });
};
