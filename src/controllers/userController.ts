import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';

export class UserController {
  constructor(private userService: UserService) {}

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const students = await this.userService.listStudents();
      res.status(200).json(students);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const student = await this.userService.createStudent(req.body);
      res.status(201).json(student);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const student = await this.userService.updateStudent(req.params.id, req.body);
      res.status(200).json(student);
    } catch (error) {
      next(error);
    }
  };

  deactivate = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const student = await this.userService.deactivateStudent(req.params.id);
      res.status(200).json(student);
    } catch (error) {
      next(error);
    }
  };
}
