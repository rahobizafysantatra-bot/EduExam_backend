import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/userRepository';
import { CreateStudentDTO, UpdateStudentDTO, UserDTO, User } from '../models/User';
import { HttpError } from '../security/HttpError';

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
      throw new HttpError( 409,'Account with this email already exists');
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
      throw new HttpError( 404,'Student not found');
    }
    return toDTO(updated);
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    const existing = await this.userRepository.findById(id);
    if (!existing || existing.role !== 'STUDENT') {
      throw new HttpError( 404,'Student not found');
    }
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.userRepository.updatePasswordHash(id, passwordHash);
  }

  async deactivateStudent(id: string): Promise<void> {
    const existing = await this.userRepository.findById(id);
    if (!existing || existing.role !== 'STUDENT') {
      throw new HttpError( 404,'Student not found');
    }
    await this.userRepository.deactivate(id);
  }
}