import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/userRepository';
import { CreateStudentDTO, UpdateStudentDTO, UserDTO, User } from '../models/User';
import { NotFoundError, ConflictError, ValidationError } from '../security/errors';

const SALT_ROUNDS = 10;

function toDTO(user: User): UserDTO {
  return {
    id: user.id,
    firstName: user.firstName,
    name: user.name,
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
    if (!dto.name?.trim()) {
      throw new ValidationError('Name is required');
    }

    if (!dto.email?.trim()) {
      throw new ValidationError('Email is required');
    }

    if (!dto.password) {
      throw new ValidationError('Password is required');
    }

    const existing = await this.userRepository.findByEmail(dto.email);

    if (existing) {
      throw new ConflictError('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.userRepository.create({
      firstName: dto.firstName?.trim() || null,
      name: dto.name.trim(),
      email: dto.email.trim(),
      passwordHash,
      role: 'STUDENT',
    });

    return toDTO(user);
  }

  async updateStudent(id: string, dto: UpdateStudentDTO): Promise<UserDTO> {
    const existing = await this.userRepository.findById(id);

    if (!existing || existing.role !== 'STUDENT') {
      throw new NotFoundError('Student not found');
    }

    if (!dto.name?.trim()) {
      throw new ValidationError('Name is required');
    }

    if (!dto.email?.trim()) {
      throw new ValidationError('Email is required');
    }

    const userWithSameEmail = await this.userRepository.findByEmail(dto.email);

    if (userWithSameEmail && userWithSameEmail.id !== id) {
      throw new ConflictError('Email already in use');
    }

    const updated = await this.userRepository.update(id, {
      firstName: dto.firstName !== undefined ? dto.firstName?.trim() || null : undefined,
      name: dto.name.trim(),
      email: dto.email.trim(),
      isActive: dto.isActive,
    });

    if (!updated) {
      throw new NotFoundError('Student not found');
    }

    if (dto.password) {
      const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
      await this.userRepository.updatePasswordHash(id, passwordHash);
    }

    return toDTO(updated);
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    const existing = await this.userRepository.findById(id);

    if (!existing || existing.role !== 'STUDENT') {
      throw new NotFoundError('Student not found');
    }

    if (!newPassword) {
      throw new ValidationError('Password is required');
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.userRepository.updatePasswordHash(id, passwordHash);
  }

  async deactivateStudent(id: string): Promise<UserDTO> {
    const existing = await this.userRepository.findById(id);

    if (!existing || existing.role !== 'STUDENT') {
      throw new NotFoundError('Student not found');
    }

    const deactivated = await this.userRepository.deactivate(id);

    if (!deactivated) {
      throw new NotFoundError('Student not found');
    }

    return toDTO(deactivated);
  }
}
