import { CourseRepository } from '../repositories/courseRepository';
import { CreateCourseDTO, UpdateCourseDTO, Course } from '../models/Course';
import { NotFoundError, ConflictError, ValidationError } from '../security/errors';

export class CourseService {
  constructor(private courseRepository: CourseRepository) {}

  async listCourses(): Promise<Course[]> {
    return this.courseRepository.findAll();
  }

  async getCourse(id: string): Promise<Course> {
    const course = await this.courseRepository.findById(id);

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    return course;
  }

  async createCourse(dto: CreateCourseDTO): Promise<Course> {
    if (!dto.code?.trim()) {
      throw new ValidationError('Course code is required');
    }

    if (!dto.name?.trim()) {
      throw new ValidationError('Course name is required');
    }

    return this.courseRepository.create({
      ...dto,
      code: dto.code.trim(),
      name: dto.name.trim(),
    });
  }

  async updateCourse(id: string, dto: UpdateCourseDTO): Promise<Course> {
    const existing = await this.courseRepository.findById(id);

    if (!existing) {
      throw new NotFoundError('Course not found');
    }

    if (!dto.code?.trim()) {
      throw new ValidationError('Course code is required');
    }

    if (!dto.name?.trim()) {
      throw new ValidationError('Course name is required');
    }

    const updated = await this.courseRepository.update(id, {
      ...dto,
      code: dto.code.trim(),
      name: dto.name.trim(),
    });

    if (!updated) {
      throw new NotFoundError('Course not found');
    }

    return updated;
  }

  async deleteCourse(id: string): Promise<void> {
    const existing = await this.courseRepository.findById(id);

    if (!existing) {
      throw new NotFoundError('Course not found');
    }

    const hasExams = await this.courseRepository.hasExams(id);

    if (hasExams) {
      throw new ConflictError('Cannot delete a course that has exams');
    }

    await this.courseRepository.delete(id);
  }
}
