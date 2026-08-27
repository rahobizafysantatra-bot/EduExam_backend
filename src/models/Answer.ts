export interface Answer {
  id: string;
  attemptId: string;
  questionId: string;
  choiceId: string;
}

export interface SubmitAnswerDTO {
  questionId: string;
  choiceId: string;
}

export interface SubmitExamDTO {
  answers: SubmitAnswerDTO[];
}

export interface AnswerCorrectionDTO {
  questionId: string;
  statement: string;
  points: number;
  studentChoiceId: string | null;
  correctChoiceId: string;
  isCorrect: boolean;
}

export interface ExamResultDetailDTO {
  score: number;
  totalPoints: number;
  correction: AnswerCorrectionDTO[];
}