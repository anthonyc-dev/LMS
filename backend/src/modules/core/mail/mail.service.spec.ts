import { ServiceUnavailableException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { MailService, escapeEmailHtml } from './mail.service';
import { EmailJob } from './entities/email-job.entity';

describe('EmailJS delivery and transactional outbox', () => {
  const message = {
    to: 'student@example.com',
    subject: 'Account',
    html: '<p>temporary-secret</p>',
    kind: 'account' as const,
  };
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;
  const send = jest.fn();
  let service: MailService;
  let repository: Record<string, jest.Mock>;
  let query: Record<string, jest.Mock>;
  let manager: EntityManager;

  beforeEach(() => {
    process.env.EMAILJS_PUBLIC_KEY = 'test-public-key';
    process.env.EMAILJS_SERVICE_ID = 'test-service';
    process.env.EMAILJS_DOCTOR_TEMPLATE_ID = 'account-template';
    process.env.EMAILJS_PATIENT_TEMPLATE_ID = 'library-template';
    process.env.EMAIL_OUTBOX_SECRET = 'test-only-encryption-secret';
    process.env.EMAILJS_PRIVATE_KEY = 'test-private-key';
    global.fetch = send;
    send.mockReset().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('OK'),
    });
    query = {
      where: jest.fn(),
      andWhere: jest.fn(),
      orderBy: jest.fn(),
      setLock: jest.fn(),
      setOnLocked: jest.fn(),
      getOne: jest.fn().mockResolvedValue(null),
    };
    for (const method of [
      'where',
      'andWhere',
      'orderBy',
      'setLock',
      'setOnLocked',
    ])
      query[method].mockReturnValue(query);
    repository = {
      create: jest.fn((value: Partial<EmailJob>) => value),
      save: jest.fn(),
      createQueryBuilder: jest.fn(() => query),
    };
    manager = { getRepository: () => repository } as unknown as EntityManager;
    service = new MailService({
      transaction: async (
        callback: (value: EntityManager) => Promise<unknown>,
      ) => callback(manager),
    } as unknown as DataSource);
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  async function queuedJob() {
    await service.queue(manager, message);
    return {
      ...(repository.create.mock.calls as [Partial<EmailJob>][])[0][0],
      id: 'job-id',
      createdAt: new Date(),
      attempts: 0,
      status: 'pending',
    } as EmailJob;
  }

  it('encrypts queued credentials and does not send before commit', async () => {
    const job = await queuedJob();
    expect(job.payload).not.toContain('temporary-secret');
    expect(job.payload).not.toContain('student@example.com');
    expect(send).not.toHaveBeenCalled();
  });

  it('uses account template with exact recipient, subject and HTML parameters', async () => {
    await service.send(message);
    expect(send).toHaveBeenCalledWith(
      'https://api.emailjs.com/api/v1.0/email/send',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          service_id: 'test-service',
          template_id: 'account-template',
          user_id: 'test-public-key',
          accessToken: 'test-private-key',
          template_params: {
            to_email: message.to,
            subject: message.subject,
            message_html: message.html,
          },
        }),
      }),
    );
  });

  it.each(['borrowing', 'password-reset'] as const)(
    'uses library template for %s',
    async (kind) => {
      await service.send({ ...message, kind });
      expect(send).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          body: expect.stringContaining('library-template'),
        }),
      );
    },
  );

  it('persists a processing claim before send and clears sensitive payload after acknowledgement', async () => {
    const job = await queuedJob();
    query.getOne.mockResolvedValueOnce(job);
    const persistedStates: string[] = [];
    repository.save.mockImplementation((value: EmailJob) => {
      persistedStates.push(value.status);
    });
    await service.deliverPending();
    expect(persistedStates).toEqual(['processing', 'sent']);
    expect(job.payload).toBeNull();
    expect(query.setOnLocked).toHaveBeenCalledWith('skip_locked');
  });

  it.each([400, 403, 429])(
    'retries confirmed provider rejection HTTP %s',
    async (status) => {
      const job = await queuedJob();
      query.getOne.mockResolvedValueOnce(job);
      send.mockResolvedValue({ ok: false, status });
      await service.deliverPending();
      expect(job.status).toBe('pending');
      expect(job.payload).not.toBeNull();
      expect(job.nextAttemptAt.getTime()).toBeGreaterThan(Date.now());
      expect(job.lastError).toBe('provider_http_' + status);
    },
  );

  it('does not automatically resend after an ambiguous network outcome', async () => {
    const job = await queuedJob();
    query.getOne.mockResolvedValueOnce(job);
    send.mockRejectedValue(new Error('network timeout'));
    await service.deliverPending();
    expect(job.status).toBe('unknown');
    expect(job.payload).toBeNull();
    expect(job.lastError).toBe('network_outcome_unknown');
  });

  it('does not automatically resend an interrupted processing job', async () => {
    const job = {
      id: 'interrupted-job',
      payload: 'encrypted',
      createdAt: new Date(),
      attempts: 1,
      status: 'processing',
    } as EmailJob;
    query.getOne.mockResolvedValueOnce(job);
    await service.deliverPending();
    expect(send).not.toHaveBeenCalled();
    expect(job.status).toBe('unknown');
    expect(job.payload).toBeNull();
  });

  it('expires undelivered jobs and erases sensitive payload', async () => {
    const job = {
      id: 'expired-job',
      payload: 'encrypted',
      createdAt: new Date(Date.now() - 24 * 3600000),
      attempts: 1,
      status: 'pending',
    } as EmailJob;
    query.getOne.mockResolvedValueOnce(job);
    await service.deliverPending();
    expect(send).not.toHaveBeenCalled();
    expect(job.status).toBe('failed');
    expect(job.payload).toBeNull();
  });

  it('rejects missing configuration with controlled 503', async () => {
    delete process.env.EMAILJS_PUBLIC_KEY;
    await expect(service.send(message)).rejects.toThrow(
      ServiceUnavailableException,
    );
    expect(send).not.toHaveBeenCalled();
  });

  it('requires the backend private key without weakening EmailJS authentication', async () => {
    delete process.env.EMAILJS_PRIVATE_KEY;
    await expect(service.send(message)).rejects.toThrow(
      ServiceUnavailableException,
    );
    expect(send).not.toHaveBeenCalled();
  });

  it('escapes user-controlled book titles in email HTML', () => {
    expect(escapeEmailHtml('<script>"&\'</script>')).toBe(
      '&lt;script&gt;&quot;&amp;&#39;&lt;/script&gt;',
    );
  });
});
