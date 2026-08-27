import { pool } from '../config/db';
import { Attempt, AttemptSummaryDTO, ExamResultsDTO, ExamResultRowDTO } from '../models/Attempt';
import { Answer } from '../models/Answer';

export const findByExamAndStudent = async (examId: string, studentId: string): Promise<Attempt | null> => {
  const result = await pool.query(`SELECT * FROM attempt WHERE exam_id = $1 AND student_id = $2`, [examId, studentId]);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];

  return {
    id: row.id,
    examId: row.exam_id,
    studentId: row.student_id,
    submittedAt: row.submitted_at,
    score: Number(row.score),
  };
};

export const findAvailableExamsForStudent = async (studentId: string) => {
  const result = await pool.query(
    `SELECT e.id, e.title, e.description, e.end_date, c.code AS course_code, c.name AS course_name, COUNT(DISTINCT q.id)::int AS question_count, COALESCE(SUM(q.points), 0) AS total_points
     FROM exam e
     JOIN course c ON c.id = e.course_id
     LEFT JOIN question q ON q.exam_id = e.id
     WHERE NOW() BETWEEN e.start_date AND e.end_date
       AND NOT EXISTS (SELECT 1 FROM attempt a WHERE a.exam_id = e.id AND a.student_id = $1)
     GROUP BY e.id, e.title, e.description, e.end_date, c.code, c.name
     ORDER BY e.end_date ASC`,
    [studentId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    course: {
      code: row.course_code,
      name: row.course_name,
    },
    description: row.description,
    endDate: row.end_date,
    questionCount: Number(row.question_count),
    totalPoints: Number(row.total_points),
  }));
};

export const findExamWindow = async (examId: string) => {
  const result = await pool.query(
    `SELECT e.id, e.title, e.description, e.start_date, e.end_date, c.code AS course_code, c.name AS course_name, COUNT(DISTINCT q.id)::int AS question_count, COALESCE(SUM(q.points), 0) AS total_points
     FROM exam e
     JOIN course c ON c.id = e.course_id
     LEFT JOIN question q ON q.exam_id = e.id
     WHERE e.id = $1
     GROUP BY e.id, e.title, e.description, e.start_date, e.end_date, c.code, c.name`,
    [examId]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    course: {
      code: row.course_code,
      name: row.course_name,
    },
    questionCount: Number(row.question_count),
    totalPoints: Number(row.total_points),
  };
};

export const insertAttemptWithAnswers = async (attempt: Attempt, answers: Answer[]): Promise<void> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO attempt (id, exam_id, student_id, score) VALUES ($1, $2, $3, $4)`,
      [attempt.id, attempt.examId, attempt.studentId, attempt.score]
    );

    for (const answer of answers) {
      await client.query(
        `INSERT INTO answer (id, attempt_id, question_id, choice_id) VALUES ($1, $2, $3, $4)`,
        [answer.id, answer.attemptId, answer.questionId, answer.choiceId]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const findResultsForExam = async (examId: string): Promise<ExamResultsDTO> => {
  const examResult = await pool.query(
    `SELECT e.id, e.title, COALESCE(SUM(q.points), 0) AS total_points
     FROM exam e
     LEFT JOIN question q ON q.exam_id = e.id
     WHERE e.id = $1
     GROUP BY e.id, e.title`,
    [examId]
  );

  if (examResult.rows.length === 0) {
    return {
      exam: { id: examId, title: '' },
      totalPoints: 0,
      average: null,
      attemptCount: 0,
      results: [],
    };
  }

  const examRow = examResult.rows[0];

  const result = await pool.query(
    `SELECT u.id AS student_id, u.name, a.score, a.submitted_at
     FROM attempt a
     JOIN "user" u ON u.id = a.student_id
     WHERE a.exam_id = $1 AND u.role = 'STUDENT'
     ORDER BY a.score DESC, u.name ASC`,
    [examId]
  );

  const results: ExamResultRowDTO[] = result.rows.map((row) => ({
    studentId: row.student_id,
    name: row.name,
    score: Number(row.score),
    submittedAt: row.submitted_at,
  }));

  const attemptCount = results.length;
  const average = attemptCount === 0 ? null : Math.round((results.reduce((sum, row) => sum + row.score, 0) / attemptCount) * 100) / 100;

  return {
    exam: {
      id: examRow.id,
      title: examRow.title,
    },
    totalPoints: Number(examRow.total_points),
    average,
    attemptCount,
    results,
  };
};

export const findByStudentId = async (studentId: string): Promise<AttemptSummaryDTO[]> => {
  const result = await pool.query(
    `SELECT a.exam_id, a.submitted_at, a.score, e.title, c.code AS course_code, COALESCE(SUM(q.points), 0) AS total_points
     FROM attempt a
     JOIN exam e ON e.id = a.exam_id
     JOIN course c ON c.id = e.course_id
     LEFT JOIN question q ON q.exam_id = e.id
     WHERE a.student_id = $1
     GROUP BY a.id, a.exam_id, a.submitted_at, a.score, e.title, c.code
     ORDER BY a.submitted_at DESC`,
    [studentId]
  );

  return result.rows.map((row) => ({
    examId: row.exam_id,
    title: row.title,
    courseCode: row.course_code,
    score: Number(row.score),
    totalPoints: Number(row.total_points),
    submittedAt: row.submitted_at,
  }));
};
