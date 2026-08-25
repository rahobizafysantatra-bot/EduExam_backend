import * as QuestionRepositorie from '../repositories/questionRepository';
import { CreateQuestionDTO, UpdateQuestionDTO, QuestionWithChoices, QuestionForStudent } from '../models/Question';
import { HttpError } from '../security/HttpError';

function validateChoices(choices: { text: string; isCorrect: boolean }[]) {
  if (choices.length < 2 || choices.length > 6) {
    throw new HttpError(400, 'A question must have between 2 and 6 choices.');
  }
  const correctCount = choices.filter((c) => c.isCorrect).length;
  if (correctCount !== 1) {
    throw new HttpError(400, 'A question must have exactly one correct choice.');
  }
}

async function assertExamNotLocked(examId: string) {
  const attemptsCount = await QuestionRepositorie.countAttemptsForExam(examId);
  if (attemptsCount > 0) {
    throw new HttpError(409, "The exam already has attempts, the questions are locked");
  }
}

export async function listForAdmin(examId: string): Promise<QuestionWithChoices[]> {
  return QuestionRepositorie.findByExamId(examId);
}

export async function listForStudent(examId: string): Promise<QuestionForStudent[]> {
  const questions = await QuestionRepositorie.findByExamId(examId);
  return questions.map((q) => ({
    id: q.id,
    examId: q.examId,
    statement: q.statement,
    points: q.points,
    choices: q.choices.map((c) => ({ id: c.id, questionId: c.questionId, text: c.text })),
  }));
}

export async function create(examId: string, dto: CreateQuestionDTO): Promise<QuestionWithChoices> {
  validateChoices(dto.choices);
  await assertExamNotLocked(examId);
  return QuestionRepositorie.create(examId, dto);
}

export async function update(questionId: string, dto: UpdateQuestionDTO): Promise<QuestionWithChoices> {
  validateChoices(dto.choices);

  const examId = await QuestionRepositorie.findExamIdByQuestionId(questionId);
  if (!examId) {
    throw new HttpError(404, 'Question not found');
  }
  await assertExamNotLocked(examId);

  return QuestionRepositorie.update(questionId, examId, dto);
}

export async function remove(questionId: string): Promise<void> {
  const examId = await QuestionRepositorie.findExamIdByQuestionId(questionId);
  if (!examId) {
    throw new HttpError(404, 'Question not found');
  }
  await assertExamNotLocked(examId);

  await QuestionRepositorie.deleteQuestion(questionId);
}
