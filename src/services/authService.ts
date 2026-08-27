import { UserRepository } from '../repositories/userRepository';
import { comparePassword } from '../security/password';
import { generateToken } from '../security/jwt';
import { UnauthorizedError } from '../security/errors';

const userRepository = new UserRepository();

export const login = async (email: string, password: string) => {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Account disabled');
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);

  if (!passwordMatches) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = generateToken({
    id: user.id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
    },
  };
};
