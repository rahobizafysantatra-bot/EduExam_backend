import { Response, NextFunction } from 'express';
import { AuthRequest } from '../security/types';
import * as QuestionService from '../services/questionService';

export const list = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questions = await QuestionService.listForAdmin(String(req.params.id));
    res.status(200).json(questions);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const question = await QuestionService.create(String(req.params.id), req.body);
    res.status(201).json(question);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const question = await QuestionService.update(String(req.params.id), req.body);
    res.status(200).json(question);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await QuestionService.remove(String(req.params.id));
    res.status(200).json({ message: 'Question deleted' });
  } catch (error) {
    next(error);
  }
};
