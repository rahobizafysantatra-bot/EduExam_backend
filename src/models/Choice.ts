export interface Choice {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
}

export type CreateChoiceDTO = Omit<Choice, 'id' | 'questionId'>;

export type ChoiceForStudent = Omit<Choice, 'isCorrect'>;