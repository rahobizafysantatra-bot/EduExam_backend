import { randomUUID } from 'crypto';
import { pool } from '../config/db';
import { Question, QuestionWithChoices, CreateQuestionDTO, UpdateQuestionDTO } from '../models/Question';
import { Choice } from '../models/Choice';

const mapChoiceRow = (row: any): Choice => ({
  id: row.id,
  questionId: row.question_id,
  text: row.text,
  isCorrect: row.is_correct,
});

const mapQuestionRow = (row: any): Question => ({
  id: row.id,
  examId: row.exam_id,
  statement: row.statement,
  points: Number(row.points),
  position: Number(row.position),
});

export const findByExamId = async (examId: string): Promise<QuestionWithChoices[]> => {
  const questionsResult = await pool.query('SELECT * FROM question WHERE exam_id = $1 ORDER BY position ASC, id ASC', [examId]);
  const questions = questionsResult.rows.map(mapQuestionRow);
  const result: QuestionWithChoices[] = [];

  for (const question of questions) {
    const choicesResult = await pool.query('SELECT * FROM choice WHERE question_id = $1 ORDER BY id ASC', [question.id]);

    result.push({
      ...question,
      choices: choicesResult.rows.map(mapChoiceRow),
    });
  }

  return result;
};

export const findById = async (questionId: string): Promise<QuestionWithChoices | null> => {
  const questionResult = await pool.query('SELECT * FROM question WHERE id = $1', [questionId]);

  if (questionResult.rows.length === 0) return null;

  const question = mapQuestionRow(questionResult.rows[0]);
  const choicesResult = await pool.query('SELECT * FROM choice WHERE question_id = $1 ORDER BY id ASC', [questionId]);

  return {
    ...question,
    choices: choicesResult.rows.map(mapChoiceRow),
  };
};

export const countAttemptsForExam = async (examId: string): Promise<number> => {
  const result = await pool.query('SELECT COUNT(*) FROM attempt WHERE exam_id = $1', [examId]);
  return Number(result.rows[0].count);
};

export const findExamIdByQuestionId = async (questionId: string): Promise<string | null> => {
  const result = await pool.query('SELECT exam_id FROM question WHERE id = $1', [questionId]);
  return result.rows[0]?.exam_id ?? null;
};

export const create = async (examId: string, dto: CreateQuestionDTO): Promise<QuestionWithChoices> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const questionId = randomUUID();
    const points = dto.points ?? 1;
    const position = dto.position ?? 1;

    await client.query(
      `
      INSERT INTO question (
        id,
        exam_id,
        statement,
        points,
        position
      )
      VALUES ($1, $2, $3, $4, $5)
      `,
      [questionId, examId, dto.statement, points, position]
    );

    const choices: Choice[] = [];

    for (const choiceInput of dto.choices) {
      const choiceId = randomUUID();

      await client.query(
        `
        INSERT INTO choice (
          id,
          question_id,
          text,
          is_correct
        )
        VALUES ($1, $2, $3, $4)
        `,
        [choiceId, questionId, choiceInput.text, choiceInput.isCorrect]
      );

      choices.push({
        id: choiceId,
        questionId,
        text: choiceInput.text,
        isCorrect: choiceInput.isCorrect,
      });
    }

    await client.query('COMMIT');

    return {
      id: questionId,
      examId,
      statement: dto.statement,
      points,
      position,
      choices,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const update = async (
  questionId: string,
  examId: string,
  dto: UpdateQuestionDTO
): Promise<QuestionWithChoices> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const currentResult = await client.query('SELECT * FROM question WHERE id = $1', [questionId]);

    if (currentResult.rows.length === 0) {
      throw new Error('Question not found');
    }

    const currentQuestion = mapQuestionRow(currentResult.rows[0]);
    const points = dto.points ?? currentQuestion.points;
    const position = dto.position ?? currentQuestion.position;

    await client.query(
      `
      UPDATE question
      SET
        statement = $1,
        points = $2,
        position = $3
      WHERE id = $4
      `,
      [dto.statement, points, position, questionId]
    );

    await client.query('DELETE FROM choice WHERE question_id = $1', [questionId]);

    const choices: Choice[] = [];

    for (const choiceInput of dto.choices) {
      const choiceId = randomUUID();

      await client.query(
        `
        INSERT INTO choice (
          id,
          question_id,
          text,
          is_correct
        )
        VALUES ($1, $2, $3, $4)
        `,
        [choiceId, questionId, choiceInput.text, choiceInput.isCorrect]
      );

      choices.push({
        id: choiceId,
        questionId,
        text: choiceInput.text,
        isCorrect: choiceInput.isCorrect,
      });
    }

    await client.query('COMMIT');

    return {
      id: questionId,
      examId,
      statement: dto.statement,
      points,
      position,
      choices,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const deleteQuestion = async (questionId: string): Promise<void> => {
  await pool.query('DELETE FROM question WHERE id = $1', [questionId]);
};
