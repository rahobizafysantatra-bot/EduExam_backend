import { pool } from '../config/db';
import { Exam, CreateExamDTO, UpdateExamDTO } from '../models/Exam';

function mapRowToExam(row: any): Exam {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
  };
}

export class ExamRepository {
  async findAll(): Promise<Exam[]> {
    const result = await pool.query('SELECT * FROM exam ORDER BY start_date');
    return result.rows.map(mapRowToExam);
  }

  async findById(id: string): Promise<Exam | null> {
    const result = await pool.query('SELECT * FROM exam WHERE id = $1', [id]);
    return result.rows[0] ? mapRowToExam(result.rows[0]) : null;
  }

  async findByCourseId(courseId: string): Promise<Exam[]> {
    const result = await pool.query('SELECT * FROM exam WHERE course_id = $1 ORDER BY start_date', [courseId]);
    return result.rows.map(mapRowToExam);
  }

  private async generateNextExamId(): Promise<string> {
    const result = await pool.query(
      `SELECT MAX(CAST(id AS INTEGER)) AS max_id FROM exam`
    );

    const maxId = result.rows[0].max_id;
    const nextNumber = maxId ? maxId + 1 : 1;

    return nextNumber.toString();
  }

  async create(exam: CreateExamDTO): Promise<Exam> {
    const id = await this.generateNextExamId();
    const result = await pool.query(
      `INSERT INTO exam (id, course_id, title, description, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, exam.courseId, exam.title, exam.description, exam.startDate, exam.endDate]
    );
    return mapRowToExam(result.rows[0]);
  }

  async update(id: string, fields: UpdateExamDTO): Promise<Exam | null> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (fields.title !== undefined) {
      setClauses.push(`title = $${i++}`);
      values.push(fields.title);
    }
    if (fields.description !== undefined) {
      setClauses.push(`description = $${i++}`);
      values.push(fields.description);
    }
    if (fields.startDate !== undefined) {
      setClauses.push(`start_date = $${i++}`);
      values.push(fields.startDate);
    }
    if (fields.endDate !== undefined) {
      setClauses.push(`end_date = $${i++}`);
      values.push(fields.endDate);
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE exam SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    return result.rows[0] ? mapRowToExam(result.rows[0]) : null;
  }

  async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM exam WHERE id = $1', [id]);
  }

  async hasAttempts(examId: string): Promise<boolean> {
    const result = await pool.query('SELECT 1 FROM attempt WHERE exam_id = $1 LIMIT 1', [examId]);
    return (result.rowCount ?? 0) > 0;
  }
}