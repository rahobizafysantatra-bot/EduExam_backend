import { Request, Response } from 'express';
import { CourseService } from '../services/courseService';

export class CourseController {
  constructor(private courseService: CourseService) {}

  list = async (req: Request, res: Response) => {
    try {
      const courses = await this.courseService.listCourses();
      res.status(200).json(courses);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
    }
  };

  getById = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const course = await this.courseService.getCourse(req.params.id);
      res.status(200).json(course);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const course = await this.courseService.createCourse(req.body);
      res.status(201).json(course);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
    }
  };

  update = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const course = await this.courseService.updateCourse(req.params.id, req.body);
      res.status(200).json(course);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
    }
  };

  delete = async (req: Request<{ id: string }>, res: Response) => {
    try {
      await this.courseService.deleteCourse(req.params.id);
      res.status(200).json({ message: 'Course deleted successfully' });
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
    }
  };
}