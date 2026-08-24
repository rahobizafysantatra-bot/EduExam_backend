import { pool } from '../config/db';
import { Attempt, AttemptSummaryDTO, ExamResultsDTO, ExamResultRowDTO } from '../models/Attempt';
import { Answer } from '../models/Answer';

export async function findByExamAndStudent(examId: string, studentId: string): Promise<Attempt | null> {
  const result = await pool.query(
    'SELECT * FROM attempt WHERE exam_id = $1 AND student_id = $2',
    [examId, studentId]
  );
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    examId: row.exam_id,
    studentId: row.student_id,
    submittedAt: row.submitted_at,
    score: Number(row.score),
  };
}

export async function findAvailableExamsForStudent(studentId: string) {
  const result = await pool.query(
    `SELECT e.id, e.course_id, e.title, e.description, e.start_date, e.end_date, c.code AS course_code
     FROM exam e
     JOIN course c ON c.id = e.course_id
     WHERE NOW() BETWEEN e.start_date AND e.end_date
       AND NOT EXISTS (
         SELECT 1 FROM attempt a WHERE a.exam_id = e.id AND a.student_id = $1
       )
     ORDER BY e.start_date`,
    [studentId]
  );
  return result.rows.map((row) => ({
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    courseCode: row.course_code,
  }));
}


export async function findExamWindow(examId: string) {
  const result = await pool.query(
    `SELECT e.id, e.start_date, e.end_date, e.title, c.code AS course_code
     FROM exam e JOIN course c ON c.id = e.course_id
     WHERE e.id = $1`,
    [examId]
  );
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    startDate: row.start_date,
    endDate: row.end_date,
    title: row.title,
    courseCode: row.course_code,
  };
}

export async function insertAttemptWithAnswers(attempt: Attempt, answers: Answer[]): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'INSERT INTO attempt (id, exam_id, student_id, score) VALUES ($1, $2, $3, $4)',
      [attempt.id, attempt.examId, attempt.studentId, attempt.score]
    );
    for (const answer of answers) {
      await client.query(
        'INSERT INTO answer (id, attempt_id, question_id, choice_id) VALUES ($1, $2, $3, $4)',
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
}


export async function findResultsForExam(examId: string): Promise<ExamResultsDTO> {
  const result = await pool.query(
    `SELECT u.id AS student_id, u.first_name, u.last_name, a.score, a.submitted_at
     FROM "user" u
     LEFT JOIN attempt a ON a.student_id = u.id AND a.exam_id = $1
     WHERE u.role = 'STUDENT'
     ORDER BY u.last_name, u.first_name`,
    [examId]
  );

  const results: ExamResultRowDTO[] = result.rows.map((row) => ({
    studentId: row.student_id,
    firstName: row.first_name,
    lastName: row.last_name,
    attempted: row.score !== null,
    score: row.score !== null ? Number(row.score) : null,
    submittedAt: row.submitted_at,
  }));

  const attempted = results.filter((r) => r.attempted);
  const average =
    attempted.length > 0
      ? attempted.reduce((sum, r) => sum + (r.score ?? 0), 0) / attempted.length
      : 0;

  return { results, average, attemptsCount: attempted.length };
}


export async function findByStudentId(studentId: string): Promise<AttemptSummaryDTO[]> {
  const result = await pool.query(
    `SELECT a.id, a.exam_id, a.submitted_at, a.score, e.title AS exam_title, c.code AS course_code
     FROM attempt a
     JOIN exam e ON e.id = a.exam_id
     JOIN course c ON c.id = e.course_id
     WHERE a.student_id = $1
     ORDER BY a.submitted_at DESC`,
    [studentId]
  );
  return result.rows.map((row) => ({
    id: row.id,
    examId: row.exam_id,
    submittedAt: row.submitted_at,
    score: Number(row.score),
    examTitle: row.exam_title,
    courseCode: row.course_code,
  }));
}
