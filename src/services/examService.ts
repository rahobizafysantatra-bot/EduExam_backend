import { ExamRepository } from '../repositories/examRepository';
import { CourseRepository } from '../repositories/courseRepository';
import { CreateExamDTO, UpdateExamDTO, Exam } from '../models/Exam';
import { HttpError } from '../security/HttpError';

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
      throw new HttpError( 404,'Exam not found');
    }
    return exam;
  }

  async createExam(dto: CreateExamDTO): Promise<Exam> {
    if (new Date(dto.startDate) >= new Date(dto.endDate)) {
      throw new HttpError( 400,'Start date must be before end date');
    }

    const course = await this.courseRepository.findById(dto.courseId);
    if (!course) {
      throw new HttpError( 404,'Course not found');
    }

    return this.examRepository.create(dto);
  }

  async updateExam(id: string, dto: UpdateExamDTO): Promise<Exam> {
    const existing = await this.examRepository.findById(id);
    if (!existing) {
      throw new HttpError( 404,'Exam not found');
    }

    const hasAttempts = await this.examRepository.hasAttempts(id);
    if (hasAttempts && (dto.startDate || dto.endDate)) {
      throw new HttpError( 409,'Cannot modify the dates of an exam that has attempts');
    }

    const start = dto.startDate ? new Date(dto.startDate) : existing.startDate;
    const end = dto.endDate ? new Date(dto.endDate) : existing.endDate;
    if (start >= end) {
      throw new HttpError( 400,'Start date must be before end date');
    }

    const updated = await this.examRepository.update(id, dto);
    if (!updated) {
      throw new HttpError( 404,'Exam not found');
    }
    return updated;
  }

  async deleteExam(id: string): Promise<void> {
    const existing = await this.examRepository.findById(id);
    if (!existing) {
      throw new HttpError( 404,'Exam not found');
    }

    const hasAttempts = await this.examRepository.hasAttempts(id);
    if (hasAttempts) {
      throw new HttpError( 409,'Cannot delete an exam that has attempts');
    }

    await this.examRepository.delete(id);
  }
}