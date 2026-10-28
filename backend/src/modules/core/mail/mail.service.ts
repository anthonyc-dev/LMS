import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  createCipheriv,
  createDecipheriv,
  hkdfSync,
  randomBytes,
} from 'crypto';
import { DataSource, EntityManager } from 'typeorm';
import { EmailJob } from './entities/email-job.entity';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  kind?: 'account' | 'borrowing' | 'password-reset';
}

export function escapeEmailHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[char]!,
  );
}

class EmailDeliveryFailure extends ServiceUnavailableException {
  constructor(
    readonly outcome: 'retry' | 'unknown',
    readonly reason: string,
  ) {
    super('Email delivery unavailable. Please try again later.');
  }
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private encryptionKey(): Buffer {
    const secret = process.env.EMAIL_OUTBOX_SECRET;
    if (!secret)
      throw new ServiceUnavailableException(
        'Email encryption is not configured',
      );
    return Buffer.from(
      hkdfSync('sha256', secret, 'lms-email-outbox', 'payload-v1', 32),
    );
  }

  private encrypt(message: EmailMessage): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey(), iv);
    const ciphertext = Buffer.concat([
      cipher.update(JSON.stringify(message), 'utf8'),
      cipher.final(),
    ]);
    return [iv, cipher.getAuthTag(), ciphertext]
      .map((part) => part.toString('base64'))
      .join('.');
  }

  private decrypt(payload: string): EmailMessage {
    const [iv, tag, ciphertext] = payload
      .split('.')
      .map((part) => Buffer.from(part, 'base64'));
    const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey(), iv);
    decipher.setAuthTag(tag);
    return JSON.parse(
      Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString(
        'utf8',
      ),
    ) as EmailMessage;
  }

  // Caller supplies its transaction: a rolled-back account/loan cannot send email.
  async queue(manager: EntityManager, message: EmailMessage): Promise<void> {
    const repository = manager.getRepository(EmailJob);
    await repository.save(
      repository.create({ payload: this.encrypt(message) }),
    );
  }

  async send(message: EmailMessage): Promise<void> {
    const templateId =
      message.kind === 'account'
        ? process.env.EMAILJS_DOCTOR_TEMPLATE_ID
        : process.env.EMAILJS_PATIENT_TEMPLATE_ID;
    if (
      !process.env.EMAILJS_PUBLIC_KEY ||
      !process.env.EMAILJS_SERVICE_ID ||
      !process.env.EMAILJS_PRIVATE_KEY ||
      !templateId
    ) {
      throw new EmailDeliveryFailure('retry', 'configuration_missing');
    }
    let response: Response;
    try {
      response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({
          service_id: process.env.EMAILJS_SERVICE_ID,
          template_id: templateId,
          user_id: process.env.EMAILJS_PUBLIC_KEY,
          accessToken: process.env.EMAILJS_PRIVATE_KEY,
          template_params: {
            to_email: message.to,
            subject: message.subject,
            message_html: message.html,
          },
        }),
      });
    } catch {
      // Timeout/network failure can occur after provider accepts the email.
      this.logger.error('EmailJS request outcome unknown');
      throw new EmailDeliveryFailure('unknown', 'network_outcome_unknown');
    }
    if (!response.ok) {
      this.logger.error('EmailJS rejected request: HTTP ' + response.status);
      const confirmedRejection =
        response.status >= 400 &&
        response.status < 500 &&
        response.status !== 408;
      throw new EmailDeliveryFailure(
        confirmedRejection ? 'retry' : 'unknown',
        'provider_http_' + response.status,
      );
    }
    // EmailJS returns text OK, not a provider message ID.
    let acknowledgement: string;
    try {
      acknowledgement = await response.text();
    } catch {
      throw new EmailDeliveryFailure('unknown', 'acknowledgement_unreadable');
    }
    if (acknowledgement.trim() !== 'OK')
      throw new EmailDeliveryFailure('unknown', 'acknowledgement_invalid');
  }

  @Cron(CronExpression.EVERY_10_SECONDS, { waitForCompletion: true })
  async deliverPending(): Promise<void> {
    try {
      // Persist claim BEFORE contacting EmailJS. It has no idempotency API.
      // A crashed sender must not automatically resend a possibly accepted job.
      const job = await this.dataSource.transaction(async (manager) => {
        const repository = manager.getRepository(EmailJob);
        const next = await repository
          .createQueryBuilder('job')
          .where('job.status IN (:...statuses)', {
            statuses: ['pending', 'processing'],
          })
          .andWhere('job.nextAttemptAt <= :now', { now: new Date() })
          .orderBy('job.createdAt', 'ASC')
          .setLock('pessimistic_write')
          .setOnLocked('skip_locked')
          .getOne();
        if (!next) return null;
        if (next.status === 'processing') {
          next.status = 'unknown';
          next.lastError = 'sender_interrupted';
          next.payload = null;
          await repository.save(next);
          return null;
        }
        if (Date.now() - next.createdAt.getTime() >= 23 * 3600000) {
          next.status = 'failed';
          next.lastError = 'delivery_window_expired';
          next.payload = null;
          await repository.save(next);
          return null;
        }
        next.status = 'processing';
        next.attempts++;
        next.nextAttemptAt = new Date(Date.now() + 5 * 60000);
        await repository.save(next);
        return next;
      });
      if (!job) return;
      try {
        await this.send(this.decrypt(job.payload!));
        job.status = 'sent';
        job.payload = null;
        job.lastError = null;
      } catch (error) {
        const failure = error instanceof EmailDeliveryFailure ? error : null;
        job.lastError = failure?.reason || 'payload_invalid';
        if (failure?.outcome === 'retry') {
          job.status = 'pending';
          job.nextAttemptAt = new Date(
            Date.now() +
              Math.min(3600000, 30000 * 2 ** Math.min(job.attempts - 1, 7)),
          );
        } else {
          job.status = 'unknown';
          job.payload = null;
        }
        this.logger.warn(
          'Email job ' +
            job.id +
            ': ' +
            job.lastError +
            '; attempt ' +
            job.attempts,
        );
      }
      await this.dataSource.transaction(async (manager) => {
        await manager.getRepository(EmailJob).save(job);
      });
    } catch {
      this.logger.error(
        'Email outbox worker failed; persisted jobs retained for recovery',
      );
    }
  }
}
