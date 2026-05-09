import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../../common/guard/auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;

  beforeEach(() => {
    jwtService = {
      verify: jest.fn(),
    } as unknown as JwtService;

    reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as unknown as Reflector;

    guard = new AuthGuard(jwtService, reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
