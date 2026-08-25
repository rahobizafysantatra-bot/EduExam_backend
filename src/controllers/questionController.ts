import { Response, NextFunction } from 'express';
import { AuthRequest } from '../security/types';
import * as QuestionService from '../services/questionService';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const questions = await QuestionService.listForAdmin(String(req.params.examId));
    res.json(questions);
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const question = await QuestionService.create(String(req.params.examId), req.body);
    res.status(201).json(question);
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const question = await QuestionService.update(String(req.params.questionId), req.body);
    res.json(question);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await QuestionService.remove(String(req.params.questionId));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
