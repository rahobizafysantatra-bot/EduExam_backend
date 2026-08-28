import { Request, Response, NextFunction } from 'express';
import * as AuthService from '../services/authService';

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await AuthService.login(
      email,
      password
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};