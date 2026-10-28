import { UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtStrategy } from './jwt.strategy';
import { Role } from '../enums/role.enum';

jest.mock('src/config/jwt.config', () => ({
  jwtConstants: { secret: 'test-secret' },
}));

describe('JwtStrategy account state', () => {
  const payload = {
    sub: 'user-id',
    email: 'old@example.com',
    role: Role.ADMIN,
    authVersion: 0,
  };
  const findOne = jest.fn();
  const strategy = new JwtStrategy({
    getRepository: () => ({ findOne }),
  } as unknown as DataSource);

  it('rejects deleted/missing users even with a valid JWT', async () => {
    findOne.mockResolvedValue(null);
    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects pre-deletion JWT after account restoration', async () => {
    findOne.mockResolvedValue({ id: payload.sub, authVersion: 1 });
    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('uses current database role and email', async () => {
    findOne.mockResolvedValue({
      id: payload.sub,
      email: 'new@example.com',
      role: Role.STUDENT,
      authVersion: 0,
    });
    await expect(strategy.validate(payload)).resolves.toEqual({
      sub: payload.sub,
      email: 'new@example.com',
      role: Role.STUDENT,
    });
  });
});
