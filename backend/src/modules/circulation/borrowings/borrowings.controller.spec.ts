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
import type { Server } from 'http';
import type { Request } from 'express';
import { JwtAuthGuard } from 'src/common/guard/passport-auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Role } from 'src/common/enums/role.enum';
import { BorrowingsController } from './borrowings.controller';
import { BorrowingsService } from './borrowings.service';
describe('Borrowing decision HTTP authorization', () => {
  let app: INestApplication<Server>;
  const id = '4cd0ec22-d11b-468f-864f-eb6c70aa71fc';
  const service = {
    confirmBorrowing: jest.fn().mockResolvedValue({ ok: true }),
    rejectBorrowing: jest.fn().mockResolvedValue({ ok: true }),
  };
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [BorrowingsController],
      providers: [
        RolesGuard,
        { provide: BorrowingsService, useValue: service },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate(context: ExecutionContext) {
          const req = context
            .switchToHttp()
            .getRequest<Request & { user: { sub: string; role: string } }>();
          const role = req.headers['x-test-role'];
          if (typeof role !== 'string') throw new UnauthorizedException();
          req.user = { sub: 'actor', role };
          return true;
        },
      })
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

  it.each(['confirm', 'reject'])(
    'allows only admin to %s requests',
    async (decision) => {
      for (const role of [Role.STUDENT, Role.FACULTY]) {
        await request(app.getHttpServer())
          .patch('/borrowings/' + id + '/' + decision)
          .set('x-test-role', role)
          .expect(403);
      }
      await request(app.getHttpServer())
        .patch('/borrowings/' + id + '/' + decision)
        .expect(401);
      expect(service.confirmBorrowing).not.toHaveBeenCalled();
      expect(service.rejectBorrowing).not.toHaveBeenCalled();
      await request(app.getHttpServer())
        .patch('/borrowings/' + id + '/' + decision)
        .set('x-test-role', Role.ADMIN)
        .expect(200);
      expect(
        decision === 'confirm'
          ? service.confirmBorrowing
          : service.rejectBorrowing,
      ).toHaveBeenCalledWith(id);
    },
  );
  it('rejects invalid borrowing ID before decision', async () => {
    await request(app.getHttpServer())
      .patch('/borrowings/invalid/confirm')
      .set('x-test-role', Role.ADMIN)
      .expect(400);
    expect(service.confirmBorrowing).not.toHaveBeenCalled();
  });
});
