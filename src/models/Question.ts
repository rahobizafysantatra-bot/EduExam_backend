import { Choice, CreateChoiceDTO, ChoiceForStudent } from './Choice';

export interface Question {
  id: string;
  examId: string;
  statement: string;
  points: number;
  position: number;
}

export interface CreateQuestionDTO {
  statement: string;
  points?: number;
  position?: number;
  choices: CreateChoiceDTO[];
}

export interface UpdateQuestionDTO {
  statement: string;
  points?: number;
  position?: number;
  choices: CreateChoiceDTO[];
}

export interface QuestionWithChoices extends Question {
  choices: Choice[];
}

export interface QuestionForStudent {
  id: string;
  statement: string;
  points: number;
  position: number;
  choices: ChoiceForStudent[];
}