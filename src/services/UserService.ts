import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/UserRepository';
import { CreateStudentDTO, UpdateStudentDTO, UserDTO, User } from '../models/User';

const SALT_ROUNDS = 10;

function toDTO(user: User): UserDTO {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
}

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async listStudents(): Promise<UserDTO[]> {
    const students = await this.userRepository.findAllStudents();
    return students.map(toDTO);
  }

  async createStudent(dto: CreateStudentDTO): Promise<UserDTO> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      const err: any = new Error('Account with this email already exists');
      err.status = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      passwordHash,
      role: 'STUDENT',
    });
    return toDTO(user);
  }

  async updateStudent(id: string, dto: UpdateStudentDTO): Promise<UserDTO> {
    const existing = await this.userRepository.findById(id);
    if (!existing || existing.role !== 'STUDENT') {
      const err: any = new Error('Student not found');
      err.status = 404;
      throw err;
    }

    const updated = await this.userRepository.update(id, dto);
    if (!updated) {
      const err: any = new Error('Student not found');
      err.status = 404;
      throw err;
    }
    return toDTO(updated);
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    const existing = await this.userRepository.findById(id);
    if (!existing || existing.role !== 'STUDENT') {
      const err: any = new Error('Student not found');
      err.status = 404;
      throw err;
    }
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.userRepository.updatePasswordHash(id, passwordHash);
  }

  async deactivateStudent(id: string): Promise<void> {
    const existing = await this.userRepository.findById(id);
    if (!existing || existing.role !== 'STUDENT') {
      const err: any = new Error('Student not found');
      err.status = 404;
      throw err;
    }
    await this.userRepository.deactivate(id);
  }
}