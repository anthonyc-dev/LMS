import { AuthGuard } from './guard/auth.guard';
import { JwtService } from '@nestjs/jwt';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = {
      verify: jest.fn(),
    } as unknown as JwtService;

    guard = new AuthGuard(jwtService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
