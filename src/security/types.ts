import { Request } from 'express';

export interface AuthUser {
  id: string;
  role: 'ADMIN' | 'STUDENT';
}

// req.user is set by authMiddleware after the JWT has been decoded
export interface AuthRequest extends Request {
  user?: AuthUser;
}
