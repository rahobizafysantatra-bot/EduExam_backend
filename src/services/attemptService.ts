import { randomUUID } from 'crypto';
import * as AttemptRepositorie from '../repositories/attemptRepository';
import * as QuestionRepositorie from '../repositories/questionRepository';
import { Attempt, AttemptSummaryDTO, ExamResultsDTO } from '../models/Attempt';
import { Answer, SubmitExamDTO } from '../models/Answer';
import { NotFoundError, ConflictError, ValidationError, ForbiddenError } from '../security/errors';

export const listAvailableExams = async (studentId: string) => {
  return AttemptRepositorie.findAvailableExamsForStudent(studentId);
};

export const getExamForStudent = async (examId: string, studentId: string) => {
  const exam = await AttemptRepositorie.findExamWindow(examId);

  if (!exam) {
    throw new NotFoundError('Exam not found');
  }

  const now = new Date();

  if (now < new Date(exam.startDate) || now > new Date(exam.endDate)) {
    throw new ForbiddenError('Exam is not available');
  }

  const alreadyAttempted = await AttemptRepositorie.findByExamAndStudent(examId, studentId);

  if (alreadyAttempted) {
    throw new ConflictError('Exam already taken');
  }

  const questions = await QuestionRepositorie.findByExamId(examId);

  const questionsForStudent = questions.map(question => ({
    id: question.id,
    statement: question.statement,
    points: question.points,
    position: question.position,
    choices: question.choices.map(choice => ({
      id: choice.id,
      text: choice.text,
    })),
  }));

  return {
    ...exam,
    questions: questionsForStudent,
  };
};

export const submitExam = async (examId: string, studentId: string, dto: SubmitExamDTO) => {
  if (!dto || !Array.isArray(dto.answers)) {
    throw new ValidationError('Answers must be an array');
  }

  const existing = await AttemptRepositorie.findByExamAndStudent(examId, studentId);

  if (existing) {
    throw new ConflictError('Exam already taken');
  }

  const exam = await AttemptRepositorie.findExamWindow(examId);

  if (!exam) {
    throw new NotFoundError('Exam not found');
  }

  const now = new Date();

  if (now < new Date(exam.startDate) || now > new Date(exam.endDate)) {
    throw new ForbiddenError('Exam is not available');
  }

  const questions = await QuestionRepositorie.findByExamId(examId);

  const submittedQuestionIds = new Set<string>();

  for (const answer of dto.answers) {
    if (submittedQuestionIds.has(answer.questionId)) {
      throw new ValidationError('Duplicate question');
    }

    submittedQuestionIds.add(answer.questionId);

    const question = questions.find(q => q.id === answer.questionId);

    if (!question) {
      throw new ValidationError('Question does not belong to exam');
    }

    const choice = question.choices.find(c => c.id === answer.choiceId);

    if (!choice) {
      throw new ValidationError('Choice does not belong to question');
    }
  }

  let score = 0;

  const totalPoints = questions.reduce((sum, question) => sum + question.points, 0);
  const answers: Answer[] = [];
  const correction = [];
  const attemptId = randomUUID();

  for (const question of questions) {
    const submitted = dto.answers.find(answer => answer.questionId === question.id);
    const studentChoiceId = submitted?.choiceId ?? null;
    const correctChoice = question.choices.find(choice => choice.isCorrect);

    if (!correctChoice) {
      throw new Error(`Question ${question.id} has no correct choice`);
    }

    const isCorrect = studentChoiceId !== null && studentChoiceId === correctChoice.id;

    if (isCorrect) {
      score += question.points;
    }

    if (studentChoiceId !== null) {
      answers.push({
        id: randomUUID(),
        attemptId,
        questionId: question.id,
        choiceId: studentChoiceId,
      });
    }

    correction.push({
      questionId: question.id,
      statement: question.statement,
      points: question.points,
      studentChoiceId,
      correctChoiceId: correctChoice.id,
      isCorrect,
    });
  }

  const attempt: Attempt = {
    id: attemptId,
    examId,
    studentId,
    submittedAt: new Date(),
    score,
  };

  await AttemptRepositorie.insertAttemptWithAnswers(attempt, answers);

  return {
    score,
    totalPoints,
    correction,
  };
};

export const getMyResults = async (studentId: string): Promise<AttemptSummaryDTO[]> => {
  return AttemptRepositorie.findByStudentId(studentId);
};

export const getExamResultsForAdmin = async (examId: string): Promise<ExamResultsDTO> => {
  const exam = await AttemptRepositorie.findExamWindow(examId);

  if (!exam) {
    throw new NotFoundError('Exam not found');
  }

  return AttemptRepositorie.findResultsForExam(examId);
};
