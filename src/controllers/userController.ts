import { Request, Response } from 'express';
import { UserService } from '../services/userService';

export class UserController {
  constructor(private userService: UserService) {}

  list = async (req: Request, res: Response) => {
    try {
      const students = await this.userService.listStudents();
      res.status(200).json(students);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const student = await this.userService.createStudent(req.body);
      res.status(201).json(student);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
    }
  };

  update = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const student = await this.userService.updateStudent(req.params.id, req.body);
      res.status(200).json(student);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
    }
  };

  resetPassword = async (req: Request<{ id: string }>, res: Response) => {
    try {
      await this.userService.resetPassword(req.params.id, req.body.password);
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
    }
  };

  deactivate = async (req: Request<{ id: string }>, res: Response) => {
    try {
      await this.userService.deactivateStudent(req.params.id);
      res.status(200).json({ message: 'Student deactivated successfully' });
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
    }
  };
}