import { CourseRepository } from '../repositories/courseRepository';
import { CreateCourseDTO, UpdateCourseDTO, Course } from '../models/Course';
import { HttpError } from '../security/HttpError';

export class CourseService {
  constructor(private courseRepository: CourseRepository) {}

  async listCourses(): Promise<Course[]> {
    return this.courseRepository.findAll();
  }

  async getCourse(id: string): Promise<Course> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new HttpError( 404,'Course not found');
    }
    return course;
  }

  async createCourse(dto: CreateCourseDTO): Promise<Course> {
    return this.courseRepository.create(dto);
  }

  async updateCourse(id: string, dto: UpdateCourseDTO): Promise<Course> {
    const updated = await this.courseRepository.update(id, dto);
    if (!updated) {
      throw new HttpError( 404,'Course not found');
    }
    return updated;
  }

  async deleteCourse(id: string): Promise<void> {
    const existing = await this.courseRepository.findById(id);
    if (!existing) {
      throw new HttpError( 404,'Course not found');
    }

    const hasExams = await this.courseRepository.hasExams(id);
    if (hasExams) {
      throw new HttpError( 409,'Cannot delete course with associated exams');
    }

    await this.courseRepository.delete(id);
  }
}