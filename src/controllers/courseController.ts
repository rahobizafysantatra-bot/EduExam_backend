import { Request, Response, NextFunction } from 'express';
import { CourseService } from '../services/courseService';

export class CourseController {
  constructor(private courseService: CourseService) {}

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const courses = await this.courseService.listCourses();
      res.status(200).json(courses);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const course = await this.courseService.getCourse(req.params.id);
      res.status(200).json(course);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const course = await this.courseService.createCourse(req.body);
      res.status(201).json(course);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const course = await this.courseService.updateCourse(req.params.id, req.body);
      res.status(200).json(course);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.courseService.deleteCourse(req.params.id);
      res.status(200).json({ message: 'Course deleted' });
    } catch (error) {
      next(error);
    }
  };
}
