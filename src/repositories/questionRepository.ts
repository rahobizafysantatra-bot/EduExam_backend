import { randomUUID } from 'crypto';
import { pool } from '../config/db';
import { Question, QuestionWithChoices, CreateQuestionDTO, UpdateQuestionDTO } from '../models/Question';
import { Choice } from '../models/Choice';

function mapChoiceRow(row: any): Choice {
  return {
    id: row.id,
    questionId: row.question_id,
    text: row.text,
    isCorrect: row.is_correct,
  };
}

function mapQuestionRow(row: any): Question {
  return {
    id: row.id,
    examId: row.exam_id,
    statement: row.statement,
    points: Number(row.points),
  };
}

export async function findByExamId(examId: string): Promise<QuestionWithChoices[]> {
  const questionsResult = await pool.query(
    'SELECT * FROM question WHERE exam_id = $1 ORDER BY id',
    [examId]
  );
  const questions = questionsResult.rows.map(mapQuestionRow);

  const result: QuestionWithChoices[] = [];
  for (const question of questions) {
    const choicesResult = await pool.query(
      'SELECT * FROM choice WHERE question_id = $1 ORDER BY id',
      [question.id]
    );
    result.push({ ...question, choices: choicesResult.rows.map(mapChoiceRow) });
  }
  return result;
}

export async function findById(questionId: string): Promise<QuestionWithChoices | null> {
  const questionResult = await pool.query('SELECT * FROM question WHERE id = $1', [questionId]);
  if (questionResult.rows.length === 0) return null;

  const question = mapQuestionRow(questionResult.rows[0]);
  const choicesResult = await pool.query(
    'SELECT * FROM choice WHERE question_id = $1 ORDER BY id',
    [questionId]
  );
  return { ...question, choices: choicesResult.rows.map(mapChoiceRow) };
}

export async function countAttemptsForExam(examId: string): Promise<number> {
  const result = await pool.query('SELECT COUNT(*) FROM attempt WHERE exam_id = $1', [examId]);
  return Number(result.rows[0].count);
}

export async function findExamIdByQuestionId(questionId: string): Promise<string | null> {
  const result = await pool.query('SELECT exam_id FROM question WHERE id = $1', [questionId]);
  return result.rows[0]?.exam_id ?? null;
}

export async function create(examId: string, dto: CreateQuestionDTO): Promise<QuestionWithChoices> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const questionId = randomUUID();
    await client.query(
      'INSERT INTO question (id, exam_id, statement, points) VALUES ($1, $2, $3, $4)',
      [questionId, examId, dto.statement, dto.points]
    );

    const choices: Choice[] = [];
    for (const choiceInput of dto.choices) {
      const choiceId = randomUUID();
      await client.query(
        'INSERT INTO choice (id, question_id, text, is_correct) VALUES ($1, $2, $3, $4)',
        [choiceId, questionId, choiceInput.text, choiceInput.isCorrect]
      );
      choices.push({ id: choiceId, questionId, text: choiceInput.text, isCorrect: choiceInput.isCorrect });
    }

    await client.query('COMMIT');
    return { id: questionId, examId, statement: dto.statement, points: dto.points, choices };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function update(questionId: string, examId: string, dto: UpdateQuestionDTO): Promise<QuestionWithChoices> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      'UPDATE question SET statement = $1, points = $2 WHERE id = $3',
      [dto.statement, dto.points, questionId]
    );

    await client.query('DELETE FROM choice WHERE question_id = $1', [questionId]);

    const choices: Choice[] = [];
    for (const choiceInput of dto.choices) {
      const choiceId = randomUUID();
      await client.query(
        'INSERT INTO choice (id, question_id, text, is_correct) VALUES ($1, $2, $3, $4)',
        [choiceId, questionId, choiceInput.text, choiceInput.isCorrect]
      );
      choices.push({ id: choiceId, questionId, text: choiceInput.text, isCorrect: choiceInput.isCorrect });
    }

    await client.query('COMMIT');
    return { id: questionId, examId, statement: dto.statement, points: dto.points, choices };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await pool.query('DELETE FROM question WHERE id = $1', [questionId]);
}
