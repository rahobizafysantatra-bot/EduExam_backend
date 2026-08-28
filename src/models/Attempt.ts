export interface Attempt {
  id: string;
  examId: string;
  studentId: string;
  submittedAt: Date;
  score: number;
}

export interface AttemptSummaryDTO {
  examId: string;
  title: string;
  courseCode: string;
  score: number;
  totalPoints: number;
  submittedAt: Date;
  correction: Array<{
    questionId: string;
    statement: string;
    points: number;
    studentChoiceId: string | null;
    correctChoiceId: string;
    isCorrect: boolean;
    choices: Array<{ id: string; text: string }>;
  }>;
}

export interface ExamResultRowDTO {
  studentId: string;
  name: string;
  score: number;
  submittedAt: Date;
}

export interface ExamResultsDTO {
  exam: {
    id: string;
    title: string;
  };
  totalPoints: number;
  average: number | null;
  attemptCount: number;
  results: ExamResultRowDTO[];
}
