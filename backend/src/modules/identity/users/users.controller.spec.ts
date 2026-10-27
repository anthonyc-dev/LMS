jest.mock('src/config/jwt.config', () => ({
  jwtConstants: { secret: 'unit-test-secret' },
}));
import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import request from 'supertest';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/common/guard/passport-auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Role } from 'src/common/enums/role.enum';
import type { Request } from 'express';
import type { Server } from 'http';

describe('Admin account lifecycle HTTP authorization', () => {
  let app: INestApplication<Server>;
  const restore = jest.fn().mockResolvedValue({
    id: '4cd0ec22-d11b-468f-864f-eb6c70aa71fc',
    password: 'must-not-leak',
  });
  const deactivate = jest.fn().mockResolvedValue(undefined);
  const auth = {
    canActivate(context: ExecutionContext) {
      const req = context
        .switchToHttp()
        .getRequest<Request & { user: { sub: string; role: string } }>();
      const role = req.headers['x-test-role'];
      if (typeof role !== 'string') throw new UnauthorizedException();
      req.user = { sub: 'admin-actor-id', role };
      return true;
    },
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        RolesGuard,
        { provide: UsersService, useValue: { restore, deactivate } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(auth)
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();
    app = module.createNestApplication();
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([Role.STUDENT, Role.FACULTY])(
    'denies restoration to %s',
    async (role) => {
      await request(app.getHttpServer())
        .post('/users/4cd0ec22-d11b-468f-864f-eb6c70aa71fc/restore')
        .set('x-test-role', role)
        .expect(403);
      expect(restore).not.toHaveBeenCalled();
    },
  );

  it('denies unauthenticated restoration', async () => {
    await request(app.getHttpServer())
      .post('/users/4cd0ec22-d11b-468f-864f-eb6c70aa71fc/restore')
      .expect(401);
  });

  it('allows admin restoration without exposing password', async () => {
    const result = await request(app.getHttpServer())
      .post('/users/4cd0ec22-d11b-468f-864f-eb6c70aa71fc/restore')
      .set('x-test-role', Role.ADMIN)
      .expect(200);
    expect(restore).toHaveBeenCalledWith(
      '4cd0ec22-d11b-468f-864f-eb6c70aa71fc',
    );
    expect(result.body).not.toHaveProperty('password');
  });

  it('passes authenticated actor to deactivation protection', async () => {
    await request(app.getHttpServer())
      .post('/users/4cd0ec22-d11b-468f-864f-eb6c70aa71fc/deactivate')
      .set('x-test-role', Role.ADMIN)
      .expect(204);
    expect(deactivate).toHaveBeenCalledWith(
      '4cd0ec22-d11b-468f-864f-eb6c70aa71fc',
      'admin-actor-id',
    );
  });
});
