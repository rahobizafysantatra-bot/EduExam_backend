import { pool } from '../config/db';
import { Course, CreateCourseDTO } from '../models/Course';

function mapRowToCourse(row: any): Course {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
  };
}

export class CourseRepository {
  async findAll(): Promise<Course[]> {
    const result = await pool.query('SELECT * FROM course ORDER BY code');
    return result.rows.map(mapRowToCourse);
  }

  async findById(id: string): Promise<Course | null> {
    const result = await pool.query('SELECT * FROM course WHERE id = $1', [id]);
    return result.rows[0] ? mapRowToCourse(result.rows[0]) : null;
  }

  private async generateNextCourseId(): Promise<string> {
    const result = await pool.query(
      `SELECT MAX(CAST(id AS INTEGER)) AS max_id FROM course`
    );

    const maxId = result.rows[0].max_id;
    const nextNumber = maxId ? maxId + 1 : 1;

    return nextNumber.toString();
  }

  async create(course: CreateCourseDTO): Promise<Course> {
    const id = await this.generateNextCourseId();
    const result = await pool.query(
      `INSERT INTO course (id, code, name, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, course.code, course.name, course.description]
    );
    return mapRowToCourse(result.rows[0]);
  }

  async update(id: string, fields: Partial<Pick<Course, 'code' | 'name' | 'description'>>): Promise<Course | null> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (fields.code !== undefined) {
      setClauses.push(`code = $${i++}`);
      values.push(fields.code);
    }
    if (fields.name !== undefined) {
      setClauses.push(`name = $${i++}`);
      values.push(fields.name);
    }
    if (fields.description !== undefined) {
      setClauses.push(`description = $${i++}`);
      values.push(fields.description);
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE course SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    return result.rows[0] ? mapRowToCourse(result.rows[0]) : null;
  }

  async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM course WHERE id = $1', [id]);
  }

  async hasExams(courseId: string): Promise<boolean> {
    const result = await pool.query('SELECT 1 FROM exam WHERE course_id = $1 LIMIT 1', [courseId]);
    return (result.rowCount ?? 0) > 0;
  }
}