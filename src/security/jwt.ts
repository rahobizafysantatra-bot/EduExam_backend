import jwt from 'jsonwebtoken';
import { AuthUser } from './types';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = '8h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export function generateToken(user: AuthUser): string {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): AuthUser {
  const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
  return { id: decoded.id, role: decoded.role };
}
