import { randomUUID } from 'crypto';
import { pool } from '../config/db';
import { User, UserRole } from '../models/User';

const mapRowToUser = (row: any): User => ({
  id: row.id,
  firstName: row.first_name ?? null,
  name: row.name,
  email: row.email,
  passwordHash: row.password_hash,
  role: row.role as UserRole,
  isActive: row.is_active,
  createdAt: row.created_at,
});

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM "user" WHERE email = $1', [email]);
    return result.rows[0] ? mapRowToUser(result.rows[0]) : null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM "user" WHERE id = $1', [id]);
    return result.rows[0] ? mapRowToUser(result.rows[0]) : null;
  }

  async findAllStudents(): Promise<User[]> {
    const result = await pool.query('SELECT * FROM "user" WHERE role = \'STUDENT\' ORDER BY name ASC');
    return result.rows.map(mapRowToUser);
  }

  private async generateNextStudentId(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    const prefix = `STD${year}`;
    const result = await pool.query("SELECT nextval('student_id_seq') AS n");
    const sequence = String(result.rows[0].n).padStart(3, '0');
    return `${prefix}${sequence}`;
  }

  async create(user: {
    firstName?: string | null;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
  }): Promise<User> {
    const id = user.role === 'STUDENT' ? await this.generateNextStudentId() : randomUUID();

    const result = await pool.query(
      `
      INSERT INTO "user" (
        id,
        first_name,
        name,
        email,
        password_hash,
        role,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, TRUE)
      RETURNING *
      `,
      [id, user.firstName ?? null, user.name, user.email, user.passwordHash, user.role]
    );

    return mapRowToUser(result.rows[0]);
  }

  async update(
    id: string,
    fields: {
      firstName?: string | null;
      name?: string;
      email?: string;
      isActive?: boolean;
    }
  ): Promise<User | null> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (fields.firstName !== undefined) {
      setClauses.push(`first_name = $${i++}`);
      values.push(fields.firstName);
    }

    if (fields.name !== undefined) {
      setClauses.push(`name = $${i++}`);
      values.push(fields.name);
    }

    if (fields.email !== undefined) {
      setClauses.push(`email = $${i++}`);
      values.push(fields.email);
    }

    if (fields.isActive !== undefined) {
      setClauses.push(`is_active = $${i++}`);
      values.push(fields.isActive);
    }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);

    const result = await pool.query(
      `
      UPDATE "user"
      SET ${setClauses.join(', ')}
      WHERE id = $${i}
      RETURNING *
      `,
      values
    );

    return result.rows[0] ? mapRowToUser(result.rows[0]) : null;
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await pool.query('UPDATE "user" SET password_hash = $1 WHERE id = $2', [passwordHash, id]);
  }

  async deactivate(id: string): Promise<User | null> {
    const result = await pool.query('UPDATE "user" SET is_active = FALSE WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] ? mapRowToUser(result.rows[0]) : null;
  }
}
