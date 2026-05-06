import { User } from 'src/modules/users/user.entity';

export function sanitizeUser(user: User) {
  const sanitized = { ...user };
  delete (sanitized as Record<string, unknown>).password;
  return sanitized;
}
