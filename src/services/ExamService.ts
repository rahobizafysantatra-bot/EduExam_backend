import { ExamRepository } from '../repositories/ExamRepository';
import { CourseRepository } from '../repositories/CourseRepository';
import { CreateExamDTO, UpdateExamDTO, Exam } from '../models/Exam';

export class ExamService {
  constructor(
    private examRepository: ExamRepository,
    private courseRepository: CourseRepository
  ) {}

  async listExams(): Promise<Exam[]> {
    return this.examRepository.findAll();
  }

  async getExam(id: string): Promise<Exam> {
    const exam = await this.examRepository.findById(id);
    if (!exam) {
      const err: any = new Error('Exam not found');
      err.status = 404;
      throw err;
    }
    return exam;
  }

  async createExam(dto: CreateExamDTO): Promise<Exam> {
    if (new Date(dto.startDate) >= new Date(dto.endDate)) {
      const err: any = new Error('Start date must be before end date');
      err.status = 400;
      throw err;
    }

    const course = await this.courseRepository.findById(dto.courseId);
    if (!course) {
      const err: any = new Error('Course not found');
      err.status = 400;
      throw err;
    }

    return this.examRepository.create(dto);
  }

  async updateExam(id: string, dto: UpdateExamDTO): Promise<Exam> {
    const existing = await this.examRepository.findById(id);
    if (!existing) {
      const err: any = new Error('Exam not found');
      err.status = 404;
      throw err;
    }

    const hasAttempts = await this.examRepository.hasAttempts(id);
    if (hasAttempts && (dto.startDate || dto.endDate)) {
      const err: any = new Error('Cannot modify the dates of an exam that has attempts');
      err.status = 409;
      throw err;
    }

    const start = dto.startDate ? new Date(dto.startDate) : existing.startDate;
    const end = dto.endDate ? new Date(dto.endDate) : existing.endDate;
    if (start >= end) {
      const err: any = new Error('Start date must be before end date');
      err.status = 400;
      throw err;
    }

    const updated = await this.examRepository.update(id, dto);
    if (!updated) {
      const err: any = new Error('Exam not found');
      err.status = 404;
      throw err;
    }
    return updated;
  }

  async deleteExam(id: string): Promise<void> {
    const existing = await this.examRepository.findById(id);
    if (!existing) {
      const err: any = new Error('Exam not found');
      err.status = 404;
      throw err;
    }

    const hasAttempts = await this.examRepository.hasAttempts(id);
    if (hasAttempts) {
      const err: any = new Error('Cannot delete an exam that has attempts');
      err.status = 409;
      throw err;
    }

    await this.examRepository.delete(id);
  }
}