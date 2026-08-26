import { randomUUID } from 'crypto';
import * as AttemptRepositorie from '../repositories/attemptRepository';
import * as QuestionRepositorie from '../repositories/questionRepository';
import { HttpError } from '../security/HttpError';
import { Attempt, AttemptSummaryDTO, ExamResultsDTO } from '../models/Attempt';
import { Answer, SubmitExamDTO, ExamResultDetailDTO, AnswerCorrectionDTO } from '../models/Answer';

export const listAvailableExams = async (studentId: string) => {
  return AttemptRepositorie.findAvailableExamsForStudent(studentId);
};

export const getExamForStudent = async (examId: string, studentId: string) => {
  const exam = await AttemptRepositorie.findExamWindow(examId);
  if (!exam) {
    throw new HttpError(404, 'Exam not found');
  }
  const now = new Date();

  if (now < new Date(exam.startDate) || now > new Date(exam.endDate)) {
    throw new HttpError(403, "The window for this exam is not open");
  }

  const alreadyAttempted = await AttemptRepositorie.findByExamAndStudent(
    examId,
    studentId
  );

  if (alreadyAttempted) {
    throw new HttpError(403, 'You have already taken this exam');
  }

  const questions = await QuestionRepositorie.findByExamId(examId);

  const questionsForStudent = questions.map((q) => ({
    id: q.id,
    statement: q.statement,
    points: q.points,
    choices: q.choices.map((c) => ({
      id: c.id,
      text: c.text,
    })),
  }));

  return {
    ...exam,
    questions: questionsForStudent,
  };
};

export const submitExam = async (
  examId: string,
  studentId: string,
  dto: SubmitExamDTO
): Promise<ExamResultDetailDTO> => {
  const existing = await AttemptRepositorie.findByExamAndStudent(
    examId,
    studentId
  );

  if (existing) {
    throw new HttpError(409, 'You have already submitted this exam');
  }

  const exam = await AttemptRepositorie.findExamWindow(examId);

  if (!exam) {
    throw new HttpError(404, 'Exam not found');
  }

  const now = new Date();

  if (now < new Date(exam.startDate) || now > new Date(exam.endDate)) {
    throw new HttpError(403, "The window for this exam is not open");
  }

  const questions = await QuestionRepositorie.findByExamId(examId);

  let score = 0;

  const maxScore = questions.reduce(
    (sum, q) => sum + q.points,
    0
  );

  const answers: Answer[] = [];
  const corrections: AnswerCorrectionDTO[] = [];

  const attemptId = randomUUID();

  for (const question of questions) {
    const submitted = dto.answers.find(
      (a) => a.questionId === question.id
    );

    const selectedChoiceId = submitted?.choiceId ?? null;

    let earnedPoints = 0;

    if (selectedChoiceId !== null) {
      const selectedChoice = question.choices.find(
        (c) => c.id === selectedChoiceId
      );

      if (selectedChoice?.isCorrect) {
        earnedPoints = question.points;
      }

      answers.push({
        id: randomUUID(),
        attemptId,
        questionId: question.id,
        choiceId: selectedChoiceId,
      });
    }

    score += earnedPoints;

    corrections.push({
      questionId: question.id,
      statement: question.statement,
      points: question.points,
      earnedPoints,
      choices: question.choices.map((c) => ({
        id: c.id,
        text: c.text,
        isCorrect: c.isCorrect,
      })),
      selectedChoiceId,
    });
  }

  const attempt: Attempt = {
    id: attemptId,
    examId,
    studentId,
    submittedAt: new Date(),
    score,
  };

  await AttemptRepositorie.insertAttemptWithAnswers(
    attempt,
    answers
  );

  return {
    attemptId,
    examId,
    score,
    maxScore,
    submittedAt: attempt.submittedAt,
    corrections,
  };
};

export const getMyResults = async (
  studentId: string
): Promise<AttemptSummaryDTO[]> => {
  return AttemptRepositorie.findByStudentId(studentId);
};

export const getExamResultsForAdmin = async (
  examId: string
): Promise<ExamResultsDTO> => {
  return AttemptRepositorie.findResultsForExam(examId);
};
