import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/common/enums/role.enum';
import { User } from 'src/modules/identity/users/entities/user.entity';
import {
  EntityManager,
  IsNull,
  LessThanOrEqual,
  MoreThan,
  Repository,
} from 'typeorm';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';
import { Notification } from './entities/notification.entity';
import {
  NotificationPayload,
  NotificationsGateway,
} from './notifications.gateway';

const RETENTION_DAYS = 90;

export interface NotificationTransaction {
  manager: EntityManager;
  pending: { userId: string; view: NotificationView }[];
}

export interface NotificationView {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  createdAt: string;
  read: boolean;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async findForUser(userId: string, query: ListNotificationsQueryDto) {
    const now = new Date();
    const where = {
      userId,
      dismissedAt: IsNull(),
      expiresAt: MoreThan(now),
    };
    const [items, total, unreadCount] = await Promise.all([
      this.notificationRepository.find({
        where,
        order: { createdAt: 'DESC' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.notificationRepository.count({ where }),
      this.notificationRepository.count({
        where: { ...where, readAt: IsNull() },
      }),
    ]);

    return {
      items: items.map((notification) => this.toView(notification)),
      total,
      unreadCount,
      page: query.page,
      limit: query.limit,
    };
  }

  async markAsRead(userId: string, id: string): Promise<NotificationView> {
    const notification = await this.findVisibleOwned(userId, id);
    if (!notification.readAt) {
      notification.readAt = new Date();
      await this.notificationRepository.save(notification);
      this.notificationsGateway.emitChanged(userId);
    }
    return this.toView(notification);
  }

  async markAllAsRead(userId: string): Promise<{ updated: number }> {
    const result = await this.notificationRepository.update(
      {
        userId,
        readAt: IsNull(),
        dismissedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      { readAt: new Date() },
    );
    this.notificationsGateway.emitChanged(userId);
    return { updated: result.affected ?? 0 };
  }

  async dismiss(userId: string, id: string): Promise<void> {
    const notification = await this.findVisibleOwned(userId, id);
    notification.dismissedAt = new Date();
    await this.notificationRepository.save(notification);
    this.notificationsGateway.emitChanged(userId);
  }

  async dismissAll(userId: string): Promise<{ updated: number }> {
    const result = await this.notificationRepository.update(
      {
        userId,
        dismissedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      { dismissedAt: new Date() },
    );
    this.notificationsGateway.emitChanged(userId);
    return { updated: result.affected ?? 0 };
  }

  async sendToUser(
    userId: string,
    payload: NotificationPayload,
    transaction?: NotificationTransaction,
  ): Promise<NotificationView> {
    const repository =
      transaction?.manager.getRepository(Notification) ??
      this.notificationRepository;
    const notification = repository.create({
      userId,
      ...payload,
      data: payload.data ?? null,
      readAt: null,
      dismissedAt: null,
      expiresAt: this.retentionDate(),
    });
    const saved = await repository.save(notification);
    const view = this.toView(saved);
    if (transaction) transaction.pending.push({ userId, view });
    else this.notificationsGateway.emitToUser(userId, view);
    return view;
  }

  async sendToRole(
    role: Role,
    payload: NotificationPayload,
    transaction?: NotificationTransaction,
  ): Promise<number> {
    const users =
      transaction?.manager.getRepository(User) ?? this.userRepository;
    const repository =
      transaction?.manager.getRepository(Notification) ??
      this.notificationRepository;
    const recipients = await users.find({
      where: { role },
      select: { id: true },
    });
    if (recipients.length === 0) return 0;

    const expiresAt = this.retentionDate();
    const notifications = recipients.map(({ id: userId }) =>
      repository.create({
        userId,
        ...payload,
        data: payload.data ?? null,
        readAt: null,
        dismissedAt: null,
        expiresAt,
      }),
    );
    const saved = await repository.save(notifications, {
      chunk: 500,
    });
    saved.forEach((notification) => {
      const view = this.toView(notification);
      if (transaction)
        transaction.pending.push({ userId: notification.userId, view });
      else this.notificationsGateway.emitToUser(notification.userId, view);
    });
    return saved.length;
  }

  publishCommitted(transaction: NotificationTransaction): void {
    for (const { userId, view } of transaction.pending) {
      try {
        this.notificationsGateway.emitToUser(userId, view);
      } catch {
        // A transport failure cannot undo an already committed loan.
        this.logger.warn(
          'Realtime delivery failed; notification remains persisted',
        );
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async deleteExpired(): Promise<number> {
    const result = await this.notificationRepository.delete({
      expiresAt: LessThanOrEqual(new Date()),
    });
    const deleted = result.affected ?? 0;
    if (deleted > 0) {
      this.logger.log(`Deleted ${deleted} expired notifications`);
    }
    return deleted;
  }

  private async findVisibleOwned(
    userId: string,
    id: string,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: {
        id,
        userId,
        dismissedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  private retentionDate(): Date {
    const expiresAt = new Date();
    expiresAt.setUTCDate(expiresAt.getUTCDate() + RETENTION_DAYS);
    return expiresAt;
  }

  private toView(notification: Notification): NotificationView {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      ...(notification.data ? { data: notification.data } : {}),
      createdAt: notification.createdAt.toISOString(),
      read: notification.readAt !== null,
    };
  }
}
