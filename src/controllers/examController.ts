import { Request, Response, NextFunction } from 'express';
import { ExamService } from '../services/examService';

export class ExamController {
  constructor(private examService: ExamService) {}

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const exams = await this.examService.listExams();
      res.status(200).json(exams);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const exam = await this.examService.getExam(req.params.id);
      res.status(200).json(exam);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const exam = await this.examService.createExam(req.body);
      res.status(201).json(exam);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const exam = await this.examService.updateExam(req.params.id, req.body);
      res.status(200).json(exam);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.examService.deleteExam(req.params.id);
      res.status(200).json({ message: 'Exam deleted' });
    } catch (error) {
      next(error);
    }
  };
}
