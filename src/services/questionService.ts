import * as QuestionRepositorie from '../repositories/questionRepository';
import { CreateQuestionDTO, UpdateQuestionDTO, QuestionWithChoices, QuestionForStudent } from '../models/Question';
import { HttpError } from '../security/HttpError';

const validateChoices = (choices: { text: string; isCorrect: boolean }[]) => {
  if (choices.length < 2 || choices.length > 6) {
    throw new HttpError(400, 'A question must have between 2 and 6 choices.');
  }
  const correctCount = choices.filter((c) => c.isCorrect).length;
  if (correctCount !== 1) {
    throw new HttpError(400, 'A question must have exactly one correct choice.');
  }
};

const assertExamNotLocked = async (examId: string) => {
  const attemptsCount = await QuestionRepositorie.countAttemptsForExam(examId);
  if (attemptsCount > 0) {
    throw new HttpError(409, "The exam already has attempts, the questions are locked");
  }
};

export const listForAdmin = async (
  examId: string
): Promise<QuestionWithChoices[]> => {
  return QuestionRepositorie.findByExamId(examId);
};

export const listForStudent = async (
  examId: string
): Promise<QuestionForStudent[]> => {
  const questions = await QuestionRepositorie.findByExamId(examId);

  return questions.map((q) => ({
    id: q.id,
    examId: q.examId,
    statement: q.statement,
    points: q.points,
    choices: q.choices.map((c) => ({
      id: c.id,
      questionId: c.questionId,
      text: c.text,
    })),
  }));
};

export const create = async (
  examId: string,
  dto: CreateQuestionDTO
): Promise<QuestionWithChoices> => {
  validateChoices(dto.choices);
  await assertExamNotLocked(examId);

  return QuestionRepositorie.create(examId, dto);
};

export const update = async (
  questionId: string,
  dto: UpdateQuestionDTO
): Promise<QuestionWithChoices> => {
  validateChoices(dto.choices);

  const examId = await QuestionRepositorie.findExamIdByQuestionId(questionId);

  if (!examId) {
    throw new HttpError(404, 'Question not found');
  }

  await assertExamNotLocked(examId);

  return QuestionRepositorie.update(questionId, examId, dto);
};

export const remove = async (questionId: string): Promise<void> => {
  const examId = await QuestionRepositorie.findExamIdByQuestionId(questionId);

  if (!examId) {
    throw new HttpError(404, 'Question not found');
  }

  await assertExamNotLocked(examId);

  await QuestionRepositorie.deleteQuestion(questionId);
};
