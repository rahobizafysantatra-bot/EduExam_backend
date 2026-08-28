import * as QuestionRepositorie from '../repositories/questionRepository';
import { CreateQuestionDTO, UpdateQuestionDTO, QuestionWithChoices, QuestionForStudent } from '../models/Question';
import { NotFoundError, ConflictError, ValidationError } from '../security/errors';

const validateChoices = (choices: { text: string; isCorrect: boolean }[]) => {
  if (!Array.isArray(choices) || choices.length < 2 || choices.length > 6) {
    throw new ValidationError('A question must have between 2 and 6 choices');
  }

  const correctCount = choices.filter(choice => choice.isCorrect).length;

  if (correctCount !== 1) {
    throw new ValidationError('A question must have exactly one correct choice');
  }

  for (const choice of choices) {
    if (!choice.text?.trim()) {
      throw new ValidationError('Choice text is required');
    }
  }
};

const validateQuestion = (dto: CreateQuestionDTO | UpdateQuestionDTO) => {
  if (!dto.statement?.trim()) {
    throw new ValidationError('Question statement is required');
  }

  if (dto.points !== undefined && dto.points < 1) {
    throw new ValidationError('Question points must be at least 1');
  }

  if (dto.position !== undefined && dto.position < 1) {
    throw new ValidationError('Question position must be at least 1');
  }

  validateChoices(dto.choices);
};

const assertExamNotLocked = async (examId: string) => {
  const attemptsCount = await QuestionRepositorie.countAttemptsForExam(examId);

  if (attemptsCount > 0) {
    throw new ConflictError('Cannot modify questions of an exam that has attempts');
  }
};

export const listForAdmin = async (examId: string): Promise<QuestionWithChoices[]> => {
  return QuestionRepositorie.findByExamId(examId);
};

export const listForStudent = async (examId: string): Promise<QuestionForStudent[]> => {
  const questions = await QuestionRepositorie.findByExamId(examId);

  return questions.map(question => ({
    id: question.id,
    statement: question.statement,
    points: question.points,
    position: question.position,
    choices: question.choices.map(choice => ({
      id: choice.id,
      text: choice.text,
    })),
  }));
};

export const create = async (
  examId: string,
  dto: CreateQuestionDTO
): Promise<QuestionWithChoices> => {
  validateQuestion(dto);
  await assertExamNotLocked(examId);

  return QuestionRepositorie.create(examId, {
    ...dto,
    statement: dto.statement.trim(),
    points: dto.points ?? 1,
    position: dto.position ?? 1,
  });
};

export const update = async (
  questionId: string,
  dto: UpdateQuestionDTO
): Promise<QuestionWithChoices> => {
  validateQuestion(dto);

  const examId = await QuestionRepositorie.findExamIdByQuestionId(questionId);

  if (!examId) {
    throw new NotFoundError('Question not found');
  }

  await assertExamNotLocked(examId);

  return QuestionRepositorie.update(questionId, examId, {
    ...dto,
    statement: dto.statement.trim(),
  });
};

export const remove = async (questionId: string): Promise<void> => {
  const examId = await QuestionRepositorie.findExamIdByQuestionId(questionId);

  if (!examId) {
    throw new NotFoundError('Question not found');
  }

  await assertExamNotLocked(examId);
  await QuestionRepositorie.deleteQuestion(questionId);
};
