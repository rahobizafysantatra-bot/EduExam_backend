import { Response, NextFunction } from 'express';
import { AuthRequest } from '../security/types';
import * as AttemptService from '../services/attemptService';

export const listMyExams = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const exams = await AttemptService.listAvailableExams(req.user!.id);
    res.status(200).json(exams);
  } catch (error) {
    next(error);
  }
};

export const getMyExam = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const exam = await AttemptService.getExamForStudent(String(req.params.examId), req.user!.id);
    res.status(200).json(exam);
  } catch (error) {
    next(error);
  }
};

export const submitExam = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await AttemptService.submitExam(String(req.params.id), req.user!.id, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const myResults = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const results = await AttemptService.getMyResults(req.user!.id);
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

export const adminExamResults = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const results = await AttemptService.getExamResultsForAdmin(String(req.params.id));
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};
