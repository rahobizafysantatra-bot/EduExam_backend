export type UserRole = 'ADMIN' | 'STUDENT';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateStudentDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export type UpdateStudentDTO = Partial<Pick<User, 'firstName' | 'lastName' | 'email'>> & {
  password?: string;
};

export type UserDTO = Omit<User, 'passwordHash' | 'createdAt'>;