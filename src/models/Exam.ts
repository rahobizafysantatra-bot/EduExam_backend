export interface Exam {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
}

export type CreateExamDTO = Omit<Exam, 'id'>;

export type UpdateExamDTO = Partial<Omit<Exam, 'id' | 'courseId'>>;