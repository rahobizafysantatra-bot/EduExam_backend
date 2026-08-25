import { CourseRepository } from '../repositories/CourseRepository';
import { CreateCourseDTO, UpdateCourseDTO, Course } from '../models/Course';

export class CourseService {
  constructor(private courseRepository: CourseRepository) {}

  async listCourses(): Promise<Course[]> {
    return this.courseRepository.findAll();
  }

  async getCourse(id: string): Promise<Course> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      const err: any = new Error('Course not found');
      err.status = 404;
      throw err;
    }
    return course;
  }

  async createCourse(dto: CreateCourseDTO): Promise<Course> {
    return this.courseRepository.create(dto);
  }

  async updateCourse(id: string, dto: UpdateCourseDTO): Promise<Course> {
    const updated = await this.courseRepository.update(id, dto);
    if (!updated) {
      const err: any = new Error('Course not found');
      err.status = 404;
      throw err;
    }
    return updated;
  }

  async deleteCourse(id: string): Promise<void> {
    const existing = await this.courseRepository.findById(id);
    if (!existing) {
      const err: any = new Error('Course not found');
      err.status = 404;
      throw err;
    }

    const hasExams = await this.courseRepository.hasExams(id);
    if (hasExams) {
      const err: any = new Error('Cannot delete course with associated exams');
      err.status = 409;
      throw err;
    }

    await this.courseRepository.delete(id);
  }
}