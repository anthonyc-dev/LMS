import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { EventEmitter } from 'node:events';
import { createRequire } from 'node:module';
import { User } from '../../identity/users/entities/user.entity';
import { NotificationsGateway } from './notifications.gateway';
import { Role } from 'src/common/enums/role.enum';

// Reuse the installed frontend test client without adding a backend dependency.
interface TestSocket extends EventEmitter {
  connected: boolean;
  disconnect(): TestSocket;
}
const { io } = createRequire(__filename)(
  '../../../../../frontend/node_modules/socket.io-client',
) as {
  io(
    this: void,
    url: string,
    options: {
      auth: { token: string };
      transports: string[];
      reconnection: boolean;
      extraHeaders?: Record<string, string>;
    },
  ): TestSocket;
};

jest.mock('src/config/jwt.config', () => ({
  jwtConstants: { secret: 'notification-gateway-test-secret' },
}));

describe('NotificationsGateway live Socket.IO transport', () => {
  let app: INestApplication;
  let gateway: NotificationsGateway;
  let url: string;
  const clients: TestSocket[] = [];
  const users = { findOne: jest.fn() };
  const originalOrigin = process.env.CORS_ORIGIN;
  const token = (sub = 'user-1', authVersion = 1, expiresIn = 60) =>
    jwt.sign(
      { sub, authVersion, role: 'admin' },
      'notification-gateway-test-secret',
      { expiresIn },
    );

  const connect = (
    accessToken: string,
    event = 'notifications:ready',
    origin?: string,
  ) => {
    const client = io(url, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnection: false,
      extraHeaders: origin ? { Origin: origin } : undefined,
    });
    clients.push(client);
    return new Promise<TestSocket>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error(`Missing ${event}`)),
        3000,
      );
      client.once(event, () => {
        clearTimeout(timeout);
        resolve(client);
      });
      client.once('connect_error', (error: Error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  };

  beforeAll(async () => {
    process.env.CORS_ORIGIN = 'https://first.example, https://second.example';
    const module = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        { provide: getRepositoryToken(User), useValue: users },
      ],
    }).compile();
    app = module.createNestApplication();
    gateway = app.get(NotificationsGateway);
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });

  beforeEach(() =>
    users.findOne.mockImplementation(({ where }: { where: { id: string } }) =>
      Promise.resolve({ id: where.id, role: 'student', authVersion: 1 }),
    ),
  );

  afterEach(() => {
    clients.splice(0).forEach((client) => client.disconnect());
  });
  afterAll(async () => {
    await app.close();
    if (originalOrigin === undefined) delete process.env.CORS_ORIGIN;
    else process.env.CORS_ORIGIN = originalOrigin;
  });

  it('delivers notifications only to authorized recipient and all their tabs', async () => {
    const first = await connect(token());
    const second = await connect(token());
    const other = await connect(token('user-2'));
    const leaked = jest.fn();
    other.on('notification', leaked);
    const received = [first, second].map(
      (client) =>
        new Promise((resolve) => client.once('notification', resolve)),
    );
    const view = {
      id: 'notice-1',
      type: 'TEST',
      title: 'Test',
      message: 'Message',
      createdAt: new Date().toISOString(),
      read: false,
    };
    gateway.emitToUser('user-1', view);
    expect(await Promise.all(received)).toEqual([view, view]);
    expect(leaked).not.toHaveBeenCalled();
  });

  it('broadcasts read/dismiss invalidation to connected tabs', async () => {
    const client = await connect(token());
    const changed = new Promise((resolve) =>
      client.once('notifications:changed', resolve),
    );
    gateway.emitChanged('user-1');
    await changed;
  });

  it.each([Role.ADMIN, Role.FACULTY, Role.STUDENT])(
    'delivers to %s using database role rather than claimed token role',
    async (role) => {
      users.findOne.mockImplementation(({ where }: { where: { id: string } }) =>
        Promise.resolve({ id: where.id, role, authVersion: 1 }),
      );
      const client = await connect(token());
      const received = new Promise((resolve) =>
        client.once('notification', resolve),
      );
      const view = {
        id: `notice-${role}`,
        type: 'TEST',
        title: 'Role test',
        message: 'Message',
        createdAt: new Date().toISOString(),
        read: false,
      };
      gateway.emitToUser('user-1', view);
      expect(await received).toEqual(view);
    },
  );

  it('accepts allowed origin after trimming configured whitespace', async () => {
    const client = await connect(
      token(),
      'notifications:ready',
      'https://second.example',
    );
    expect(client.connected).toBe(true);
  });

  it('rejects untrusted origin on WebSocket transport', async () => {
    await expect(
      connect(token(), 'notifications:ready', 'https://untrusted.example'),
    ).rejects.toThrow();
  });

  it('rejects stale JWT after account authVersion changes', async () => {
    const client = await connect(token('user-1', 0), 'disconnect');
    expect(client.connected).toBe(false);
  });

  it('rejects deactivated or missing users', async () => {
    users.findOne.mockResolvedValue(null);
    const client = await connect(token(), 'disconnect');
    expect(client.connected).toBe(false);
  });

  it('ends expired authorization and signals HTTP session refresh', async () => {
    const client = await connect(token('user-1', 1, 2));
    const expired = new Promise((resolve) =>
      client.once('notifications:expired', resolve),
    );
    const disconnected = new Promise((resolve) =>
      client.once('disconnect', resolve),
    );
    await expired;
    await disconnected;
    expect(client.connected).toBe(false);
  });
});
