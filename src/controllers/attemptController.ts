import { Response, NextFunction } from 'express';
import { AuthRequest } from '../security/types';
import * as AttemptService from '../services/attemptService';

export async function listMyExams(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const exams = await AttemptService.listAvailableExams(req.user!.id);
    res.json(exams);
  } catch (err) {
    next(err);
  }
}

export async function getMyExam(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const exam = await AttemptService.getExamForStudent(String(req.params.examId), req.user!.id);
    res.json(exam);
  } catch (err) {
    next(err);
  }
}

export async function submitExam(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await AttemptService.submitExam(String(req.params.examId), req.user!.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function myResults(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const results = await AttemptService.getMyResults(req.user!.id);
    res.json(results);
  } catch (err) {
    next(err);
  }
}

export async function adminExamResults(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const results = await AttemptService.getExamResultsForAdmin(String(req.params.examId));
    res.json(results);
  } catch (err) {
    next(err);
  }
}
