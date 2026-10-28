import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { createRequire } from 'node:module';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  EntityTarget,
  ObjectLiteral,
} from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { Role } from '../src/common/enums/role.enum';
import { JwtStrategy } from '../src/common/guard/jwt.strategy';
import { jwtConstants } from '../src/config/jwt.config';
import { AppDataSource } from '../src/database/data-source';
import { User } from '../src/modules/identity/users/entities/user.entity';
import { Notification } from '../src/modules/core/notifications/entities/notification.entity';
import { NotificationsController } from '../src/modules/core/notifications/notifications.controller';
import { NotificationsGateway } from '../src/modules/core/notifications/notifications.gateway';
import { NotificationsService } from '../src/modules/core/notifications/notifications.service';
import { BorrowingsService } from '../src/modules/circulation/borrowings/borrowings.service';
import { Borrowing } from '../src/modules/circulation/borrowings/entities/borrowing.entity';
import { BookCopy } from '../src/modules/circulation/book-copies/entities/book-copy.entity';
import { BookCopyStatus } from '../src/common/enums/enum.enums';
import { MailService } from '../src/modules/core/mail/mail.service';

interface TestSocket extends EventEmitter {
  disconnect(): void;
}
const { io } = createRequire(__filename)(
  '../../frontend/node_modules/socket.io-client',
) as {
  io(this: void, url: string, options: Record<string, unknown>): TestSocket;
};

function once(client: TestSocket, event: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      client.off(event, receive);
      client.off('connect_error', fail);
    };
    const receive = (value: unknown) => {
      cleanup();
      resolve(value);
    };
    const fail = () => {
      cleanup();
      reject(new Error(`Socket failed waiting for ${event}`));
    };
    const timer = setTimeout(fail, 5000);
    client.once(event, receive);
    client.once('connect_error', fail);
  });
}

// No AppModule, mail worker or schedule is started. Every DB change rolls back.
// Real JWT guard, HTTP controller, repositories and Socket.IO gateway are used.
async function main() {
  Logger.overrideLogger(false);
  AppDataSource.setOptions({ extra: { connectionTimeoutMillis: 10000 } });
  await AppDataSource.initialize();
  const runner = AppDataSource.createQueryRunner();
  let app: INestApplication | undefined;
  const sockets: TestSocket[] = [];
  const origin = process.env.CORS_ORIGIN;
  process.env.CORS_ORIGIN = 'http://notification-test.invalid';
  try {
    await runner.connect();
    await runner.startTransaction();
    const manager = runner.manager;
    await manager.query("SET LOCAL lock_timeout = '5s'");
    await manager.query("SET LOCAL statement_timeout = '15s'");
    const accounts = [] as User[];
    for (const role of [Role.ADMIN, Role.FACULTY, Role.STUDENT]) {
      const suffix = randomUUID();
      accounts.push(
        await manager.getRepository(User).save({
          role,
          schoolId: `notification-test-${suffix}`,
          fullName: 'Notification Test Only',
          email: `${suffix}@example.invalid`,
          phoneNumber: suffix,
          password: randomUUID(),
          authVersion: 0,
        }),
      );
    }

    const module = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 1000 }]),
      ],
      controllers: [NotificationsController],
      providers: [
        NotificationsService,
        NotificationsGateway,
        JwtStrategy,
        {
          provide: getRepositoryToken(User),
          useValue: manager.getRepository(User),
        },
        {
          provide: getRepositoryToken(Notification),
          useValue: manager.getRepository(Notification),
        },
        {
          provide: DataSource,
          useValue: {
            getRepository: <T extends ObjectLiteral>(entity: EntityTarget<T>) =>
              manager.getRepository(entity),
          },
        },
      ],
    }).compile();
    app = module.createNestApplication({ logger: false });
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.listen(0, '127.0.0.1');
    const url = await app.getUrl();
    const service = app.get(NotificationsService);
    const tokens = accounts.map((user) =>
      jwt.sign(
        { sub: user.id, authVersion: 0, role: user.role },
        jwtConstants.secret,
        { expiresIn: 120 },
      ),
    );
    const request = (index: number, path = '', method = 'GET') =>
      fetch(`${url}/notifications${path}`, {
        method,
        headers: { Authorization: `Bearer ${tokens[index]}` },
        signal: AbortSignal.timeout(10000),
      });
    const connect = async (index: number) => {
      const socket = io(url, {
        auth: { token: tokens[index] },
        transports: ['websocket'],
        reconnection: false,
        extraHeaders: { Origin: 'http://notification-test.invalid' },
      });
      sockets.push(socket);
      await once(socket, 'notifications:ready');
      return socket;
    };
    assert.equal((await fetch(`${url}/notifications`)).status, 401);
    for (let index = 0; index < accounts.length; index++) {
      const user = accounts[index];
      const first = await connect(index);
      const second = await connect(index);
      const delivery = [
        once(first, 'notification'),
        once(second, 'notification'),
      ];
      const view = await service.sendToUser(user.id, {
        type: 'TEST',
        title: 'Notification integration test',
        message: 'Rollback-only fixture',
      });
      assert.deepEqual(await Promise.all(delivery), [view, view]);
      let response = await request(index);
      assert.equal(response.status, 200);
      let data = (await response.json()) as {
        items: { id: string; read: boolean }[];
        unreadCount: number;
        total: number;
      };
      assert.equal(data.unreadCount, 1);
      assert.equal(data.items[0].id, view.id);
      assert.equal(
        (
          await request(
            (index + 1) % accounts.length,
            `/${view.id}/read`,
            'PATCH',
          )
        ).status,
        404,
      );
      assert.equal(
        (
          await request(
            (index + 1) % accounts.length,
            `/${view.id}/dismiss`,
            'PATCH',
          )
        ).status,
        404,
      );
      assert.equal((await request(index, '?limit=101')).status, 400);
      const changed = once(second, 'notifications:changed');
      assert.equal(
        (await request(index, `/${view.id}/read`, 'PATCH')).status,
        200,
      );
      await changed;
      response = await request(index);
      data = (await response.json()) as typeof data;
      assert.equal(data.unreadCount, 0);
      assert.equal(data.items[0].read, true);

      first.disconnect();
      second.disconnect();
      const offline = await service.sendToUser(user.id, {
        type: 'TEST',
        title: 'Offline notification',
        message: 'Recovered through REST',
      });
      await connect(index);
      data = (await (await request(index)).json()) as typeof data;
      assert.ok(data.items.some((item) => item.id === offline.id));
      assert.equal(data.unreadCount, 1);
      assert.equal((await request(index, '/read-all', 'PATCH')).status, 200);
      assert.equal(
        (await request(index, `/${view.id}/dismiss`, 'PATCH')).status,
        204,
      );
      data = (await (await request(index)).json()) as typeof data;
      assert.equal(data.total, 1);
      assert.equal(data.unreadCount, 0);
      assert.equal((await request(index, '/dismiss-all', 'PATCH')).status, 200);
      data = (await (await request(index)).json()) as typeof data;
      assert.equal(data.total, 0);
      assert.equal(
        await manager
          .getRepository(Notification)
          .count({ where: { userId: user.id } }),
        2,
      );
      console.log(
        `${user.role}: HTTP authentication, two-tab realtime, persistence, offline recovery, unread/read/dismiss, cross-user isolation and query validation passed`,
      );
    }

    const transactionSource = {
      transaction: async <T>(callback: (value: EntityManager) => Promise<T>) =>
        manager.transaction(callback),
    } as DataSource;
    const loans = new BorrowingsService(
      manager.getRepository(Borrowing),
      transactionSource,
      service,
      new MailService(transactionSource),
    );
    const copy = await manager
      .getRepository(BookCopy)
      .findOne({ where: { status: BookCopyStatus.AVAILABLE } });
    assert.ok(
      copy,
      'An available copy is required to verify borrowing triggers',
    );
    for (const index of [1, 2]) {
      const pending = await loans.selfBorrow(copy.bookId, accounts[index].id);
      assert.ok(pending);
      await loans.rejectBorrowing(pending.id);
      const approved = await loans.selfBorrow(copy.bookId, accounts[index].id);
      assert.ok(approved);
      await loans.confirmBorrowing(approved.id);
      await loans.returnBorrowing(approved.id);
      const items = await manager
        .getRepository(Notification)
        .find({ where: { userId: accounts[index].id } });
      for (const type of [
        'BORROW_PENDING',
        'BORROW_REJECTED',
        'BORROW_CONFIRMED',
      ]) {
        assert.ok(
          items.some((item) => item.type === type),
          `Missing borrower ${type}`,
        );
      }
      const adminNotices = await manager.getRepository(Notification).find({
        where: {
          userId: accounts[0].id,
          type: 'NEW_BORROWING_REQUEST',
        },
      });
      assert.ok(
        adminNotices.some((item) => item.data?.borrowingId === pending.id),
        'Admin must receive the borrower request',
      );
      console.log(
        `${accounts[index].role}: actual borrow/reject/confirm triggers persisted borrower and admin notifications; return restored copy`,
      );
    }
  } finally {
    sockets.forEach((socket) => socket.disconnect());
    await app?.close();
    if (runner.isTransactionActive) await runner.rollbackTransaction();
    await runner.release();
    await AppDataSource.destroy();
    if (origin === undefined) delete process.env.CORS_ORIGIN;
    else process.env.CORS_ORIGIN = origin;
    console.log('All notification fixtures rolled back; no email sent');
  }
}

void main().catch((error: unknown) => {
  // Do not print database query parameters, connection URLs or credentials.
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String(error.code)
      : '';
  console.error(
    `Notification integration failed (${error instanceof Error ? error.name : 'unknown'}${/^[A-Z0-9_]+$/.test(code) ? `: ${code}` : ''})`,
  );
  process.exitCode = 1;
});
