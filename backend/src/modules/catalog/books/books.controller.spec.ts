jest.mock('src/config/jwt.config', () => ({
  jwtConstants: { secret: 'unit-test-secret' },
}));
import {
  ExecutionContext,
  ValidationPipe,
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
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
describe('eBook HTTP authorization and upload limits', () => {
  let app: INestApplication<Server>;
  const id = '4cd0ec22-d11b-468f-864f-eb6c70aa71fc';
  const service = {
    uploadEbook: jest.fn().mockResolvedValue({ ok: true }),
    readEbook: jest.fn().mockResolvedValue({ ok: true }),
    findAll: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    removeEbook: jest.fn().mockResolvedValue({ ok: true }),
  };
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [RolesGuard, { provide: BooksService, useValue: service }],
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
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(['format=audio', 'page=0', 'limit=1001', 'categoryId=invalid'])(
    'rejects invalid catalog query %s',
    async (query) => {
      await request(app.getHttpServer())
        .get('/books?' + query)
        .set('x-test-role', Role.STUDENT)
        .expect(400);
      expect(service.findAll).not.toHaveBeenCalled();
    },
  );
  it('passes validated catalog filters and pagination to service', async () => {
    await request(app.getHttpServer())
      .get('/books?format=both&page=2&limit=12&search=History')
      .set('x-test-role', Role.STUDENT)
      .expect(200);
    expect(service.findAll).toHaveBeenCalledWith(
      2,
      12,
      'History',
      'both',
      undefined,
    );
  });

  it.each([Role.STUDENT, Role.FACULTY])(
    'allows %s reading, denies PDF changes',
    async (role) => {
      const response = await request(app.getHttpServer())
        .get('/books/' + id + '/ebook')
        .set('x-test-role', role)
        .expect(200);
      expect(response.headers['cache-control']).toBe('no-store');
      await request(app.getHttpServer())
        .post('/books/' + id + '/ebook')
        .set('x-test-role', role)
        .expect(403);
      await request(app.getHttpServer())
        .delete('/books/' + id + '/ebook')
        .set('x-test-role', role)
        .expect(403);
      expect(service.uploadEbook).not.toHaveBeenCalled();
      expect(service.removeEbook).not.toHaveBeenCalled();
    },
  );
  it('denies unauthenticated PDF access', async () => {
    await request(app.getHttpServer())
      .get('/books/' + id + '/ebook')
      .expect(401);
    expect(service.readEbook).not.toHaveBeenCalled();
  });
  it('accepts admin multipart PDF and removal', async () => {
    await request(app.getHttpServer())
      .post('/books/' + id + '/ebook')
      .set('x-test-role', Role.ADMIN)
      .attach('pdf', Buffer.from('%PDF-1.7\n%%EOF'), 'book.pdf')
      .expect(201);
    expect(service.uploadEbook).toHaveBeenCalledWith(
      id,
      expect.objectContaining({
        mimetype: 'application/pdf',
        originalname: 'book.pdf',
      }),
    );
    await request(app.getHttpServer())
      .delete('/books/' + id + '/ebook')
      .set('x-test-role', Role.ADMIN)
      .expect(200);
  });
  it('rejects oversized multipart PDF before storage', async () => {
    await request(app.getHttpServer())
      .post('/books/' + id + '/ebook')
      .set('x-test-role', Role.ADMIN)
      .attach('pdf', Buffer.alloc(10 * 1024 * 1024 + 1), 'large.pdf')
      .expect(413);
    expect(service.uploadEbook).not.toHaveBeenCalled();
  });
});
