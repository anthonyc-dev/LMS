import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { jwtConstants } from 'src/config/jwt.config';
import type { JwtPayload } from 'src/common/guard/auth.guard';
import type { NotificationView } from './notifications.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/identity/users/entities/user.entity';
import type { IncomingMessage } from 'node:http';

export interface NotificationPayload {
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

function isAllowedOrigin(origin: string | undefined): boolean {
  const allowed = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return !origin || allowed.includes(origin);
}

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      callback(null, isAllowedOrigin(origin));
    },
    credentials: true,
  },
  // CORS alone does not enforce origin restrictions on WebSocket upgrades.
  allowRequest: (
    request: IncomingMessage,
    callback: (error: string | null, allowed: boolean) => void,
  ) => {
    callback(null, isAllowedOrigin(request.headers.origin));
  },
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  /**
   * Maps userId -> Set of connected sockets (supports multiple tabs/devices).
   */
  private connectedClients = new Map<string, Set<Socket>>();

  /**
   * Maps socketId -> { userId, role } for quick lookups.
   */
  private socketMeta = new Map<string, { userId: string; role: string }>();

  afterInit() {
    this.logger.log('Notifications WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      let token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.headers?.authorization as string);

      if (token && token.startsWith('Bearer ')) {
        token = token.replace('Bearer ', '');
      }

      if (!token) {
        this.logger.warn(
          `Client ${client.id} disconnected: no auth token provided`,
        );
        client.disconnect();
        return;
      }

      const payload = jwt.verify(token, jwtConstants.secret) as JwtPayload &
        jwt.JwtPayload;
      if (typeof payload.sub !== 'string' || !payload.sub || !payload.exp) {
        client.disconnect(true);
        return;
      }

      const user = await this.users.findOne({
        where: { id: payload.sub },
        select: { id: true, role: true, authVersion: true },
      });
      if (!user || user.authVersion !== (payload.authVersion ?? 0)) {
        client.disconnect();
        return;
      }
      // Database lookup may finish after the transport has disconnected.
      if (!client.connected) return;

      const userId = payload.sub;
      const role = user.role;

      // Track the socket
      if (!this.connectedClients.has(userId)) {
        this.connectedClients.set(userId, new Set());
      }
      this.connectedClients.get(userId)!.add(client);
      this.socketMeta.set(client.id, { userId, role });
      const expiresIn = payload.exp * 1000 - Date.now();
      if (expiresIn <= 0) {
        client.disconnect(true);
        return;
      }
      const expiryTimer = setTimeout(() => {
        client.emit('notifications:expired');
        client.disconnect(true);
      }, expiresIn);
      expiryTimer.unref();
      client.once('disconnect', () => clearTimeout(expiryTimer));

      // Join role-based room so we can broadcast by role
      void client.join(`role:${role}`);
      // Client transport "connect" fires before async authorization finishes.
      client.emit('notifications:ready');

      this.logger.log(
        `Client connected: ${client.id} | user=${userId} | role=${role}`,
      );
    } catch (error) {
      this.logger.warn(
        `Client ${client.id} disconnected: invalid token — ${(error as Error).message}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const meta = this.socketMeta.get(client.id);
    if (meta) {
      const sockets = this.connectedClients.get(meta.userId);
      if (sockets) {
        sockets.delete(client);
        if (sockets.size === 0) {
          this.connectedClients.delete(meta.userId);
        }
      }
      this.socketMeta.delete(client.id);
      this.logger.log(
        `Client disconnected: ${client.id} | user=${meta.userId}`,
      );
    }
  }

  emitToUser(userId: string, notification: NotificationView): void {
    const sockets = this.connectedClients.get(userId);
    if (sockets) {
      for (const socket of sockets) {
        socket.emit('notification', notification);
      }
      this.logger.debug(
        `Sent notification to user ${userId}: ${notification.type}`,
      );
    }
  }

  disconnectUser(userId: string): void {
    const sockets = this.connectedClients.get(userId);
    if (!sockets) return;
    for (const socket of [...sockets]) socket.disconnect(true);
    this.connectedClients.delete(userId);
  }

  emitChanged(userId: string): void {
    for (const socket of this.connectedClients.get(userId) ?? []) {
      socket.emit('notifications:changed');
    }
  }
}
