import { Choice, CreateChoiceDTO, ChoiceForStudent } from './Choice';

export interface Question {
  id: string;
  examId: string;
  statement: string;
  points: number;
}

export type CreateQuestionDTO = Omit<Question, 'id' | 'examId'> & {
  choices: CreateChoiceDTO[];
};


export type UpdateQuestionDTO = Omit<Question, 'id' | 'examId'> & {
  choices: CreateChoiceDTO[];
};

export interface QuestionWithChoices extends Question {
  choices: Choice[];
}

export interface QuestionForStudent extends Question {
  choices: ChoiceForStudent[];
}