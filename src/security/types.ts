import { Request } from 'express';

export interface AuthUser {
  id: string;
  role: 'ADMIN' | 'STUDENT';
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
