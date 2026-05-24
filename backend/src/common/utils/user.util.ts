import { User } from 'src/modules/users/entities/user.entity';

export function sanitizeUser(user: User) {
  const sanitized = { ...user };
  delete (sanitized as Record<string, unknown>).password;
  return sanitized;
}
