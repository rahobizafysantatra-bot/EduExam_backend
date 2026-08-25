import { Request, Response } from 'express';
import { ExamService } from '../services/examService';

export class ExamController {
  constructor(private examService: ExamService) {}

  list = async (req: Request, res: Response) => {
    try {
      const exams = await this.examService.listExams();
      res.status(200).json(exams);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
    }
  };

  getById = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const exam = await this.examService.getExam(req.params.id);
      res.status(200).json(exam);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const exam = await this.examService.createExam(req.body);
      res.status(201).json(exam);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
    }
  };

  update = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const exam = await this.examService.updateExam(req.params.id, req.body);
      res.status(200).json(exam);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
    }
  };

  delete = async (req: Request<{ id: string }>, res: Response) => {
    try {
      await this.examService.deleteExam(req.params.id);
      res.status(200).json({ message: 'Exam deleted successfully' });
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
    }
  };
}