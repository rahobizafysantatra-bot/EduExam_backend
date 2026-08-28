export type UserRole = 'ADMIN' | 'STUDENT';

export interface User {
  id: string;
  firstName?: string | null;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateStudentDTO {
  firstName?: string;
  name: string;
  email: string;
  password: string;
}

export interface UpdateStudentDTO {
  firstName?: string | null;
  name: string;
  email: string;
  password?: string;
  isActive?: boolean;
}

export type UserDTO = Omit<User, 'passwordHash' | 'createdAt'>;