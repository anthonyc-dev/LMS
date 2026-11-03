jest.mock('src/config/jwt.config', () => ({
  jwtConstants: { secret: 'unit-test-secret' },
}));
import { Test } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CsrfService } from 'src/common/services/csrf.service';

describe('AuthController', () => {
  let controller: AuthController;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: {} }, CsrfService],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get(AuthController);
  });

  it('issues a random CSRF token and matching browser cookie', () => {
    const cookie = jest.fn();
    const result = controller.getCsrfToken({ cookie } as unknown as Response);
    expect(result.csrfToken).toMatch(/^[a-f0-9]{64}$/);
    expect(cookie).toHaveBeenCalledWith(
      'csrf_token',
      result.csrfToken,
      expect.objectContaining({ httpOnly: false, path: '/' }),
    );
  });
});
