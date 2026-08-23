export interface Answer {
  id: string;
  attemptId: string;
  questionId: string;
  choiceId: string | null;
}

export interface SubmitAnswerDTO {
  questionId: string;
  choiceId: string | null;
}

export interface SubmitExamDTO {
  answers: SubmitAnswerDTO[];
}

export interface AnswerCorrectionDTO {
  questionId: string;
  statement: string;
  points: number;
  earnedPoints: number;
  choices: { id: string; text: string; isCorrect: boolean }[];
  selectedChoiceId: string | null;
}

export interface ExamResultDetailDTO {
  attemptId: string;
  examId: string;
  score: number;
  maxScore: number;
  submittedAt: Date;
  corrections: AnswerCorrectionDTO[];
}