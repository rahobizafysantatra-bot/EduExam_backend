export interface Attempt {
  id: string;
  examId: string;
  studentId: string;
  submittedAt: Date;
  score: number;
}

export type AttemptSummaryDTO = Pick<Attempt, 'id' | 'examId' | 'submittedAt' | 'score'> & {
  examTitle: string;
  courseCode: string;
  maxScore: number;
};

export interface ExamResultRowDTO {
  studentId: string;
  firstName: string;
  lastName: string;
  attempted: boolean;
  score: number | null;
  submittedAt: Date | null;
}

export interface ExamResultsDTO {
  results: ExamResultRowDTO[];
  average: number;
  attemptsCount: number;
}