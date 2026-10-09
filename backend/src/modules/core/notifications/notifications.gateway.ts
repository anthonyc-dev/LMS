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

export interface NotificationPayload {
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') ?? 'http://localhost:5173',
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

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

  handleConnection(client: Socket) {
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

      const payload = jwt.verify(token, jwtConstants.secret) as JwtPayload;

      const userId = payload.sub;
      const role = payload.role;

      // Track the socket
      if (!this.connectedClients.has(userId)) {
        this.connectedClients.set(userId, new Set());
      }
      this.connectedClients.get(userId)!.add(client);
      this.socketMeta.set(client.id, { userId, role });

      // Join role-based room so we can broadcast by role
      void client.join(`role:${role}`);

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
}
