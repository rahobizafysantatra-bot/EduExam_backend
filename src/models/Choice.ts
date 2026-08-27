export interface Choice {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
}

export interface CreateChoiceDTO {
  text: string;
  isCorrect: boolean;
}

export interface ChoiceForStudent {
  id: string;
  text: string;
}