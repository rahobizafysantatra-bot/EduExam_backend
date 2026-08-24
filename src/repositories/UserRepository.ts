import { randomUUID } from 'crypto';
import { pool } from '../config/db';
import { User, UserRole } from '../models/User';

function mapRowToUser(row: any): User {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role as UserRole,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

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
    const result = await pool.query(
      `SELECT * FROM "user" WHERE role = 'STUDENT' ORDER BY last_name, first_name`
    );
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
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    role: UserRole;
  }): Promise<User> {
    const id = user.role === 'STUDENT' ? await this.generateNextStudentId() : randomUUID();

    const result = await pool.query(
      `INSERT INTO "user" (id, first_name, last_name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)
       RETURNING *`,
      [id, user.firstName, user.lastName, user.email, user.passwordHash, user.role]
    );
    return mapRowToUser(result.rows[0]);
  }

  async update(
    id: string,
    fields: Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>
  ): Promise<User | null> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (fields.firstName !== undefined) {
      setClauses.push(`first_name = $${i++}`);
      values.push(fields.firstName);
    }
    if (fields.lastName !== undefined) {
      setClauses.push(`last_name = $${i++}`);
      values.push(fields.lastName);
    }
    if (fields.email !== undefined) {
      setClauses.push(`email = $${i++}`);
      values.push(fields.email);
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE "user" SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    return result.rows[0] ? mapRowToUser(result.rows[0]) : null;
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await pool.query('UPDATE "user" SET password_hash = $1 WHERE id = $2', [passwordHash, id]);
  }

  async deactivate(id: string): Promise<void> {
    await pool.query('UPDATE "user" SET is_active = FALSE WHERE id = $1', [id]);
  }
}