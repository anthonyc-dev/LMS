# Account lifecycle and EmailJS email

Admin user management has Active and Deactivated account views. Deactivation
preserves the original account ID and all library history. Pending requests,
outstanding loans and unpaid fines must be resolved first. Admins cannot
deactivate their own account. Only admins can restore an account.

Public registration checks active and deactivated accounts. Reserved email,
phone or school ID returns HTTP 409; deactivated accounts require administrator
recovery. Restoration never creates another identity or makes old JWTs valid.

## Environment

Set these values in the backend's untracked `.env` and deployment secrets:

```dotenv
EMAILJS_PUBLIC_KEY=<emailjs-public-key>
EMAILJS_SERVICE_ID=<emailjs-service-id>
EMAILJS_DOCTOR_TEMPLATE_ID=<lms-account-template-id>
EMAILJS_PATIENT_TEMPLATE_ID=<lms-library-template-id>
EMAIL_OUTBOX_SECRET=<random-secret-at-least-32-bytes>
EMAILJS_PRIVATE_KEY=<emailjs-private-key>
```

The legacy DOCTOR/PATIENT environment names are retained for compatibility.
DOCTOR now identifies LMS account notifications; PATIENT identifies borrowing
and password-reset notifications. Both templates must be saved with:

- To Email: `{{to_email}}`
- Subject: `{{subject}}`
- From Name: LMS
- Body: use `docs/emailjs/account-template.html` or `library-template.html`
- Do not save private data: enabled, especially for credentials/OTP
- No static Bcc/Cc recipients or linked auto-reply template

Templates use `{{{message_html}}}` for backend-generated HTML. User-controlled
book titles are HTML-escaped by the backend. Do not pass medical appointment
fields or untrusted HTML. Sender address comes from the connected EmailJS email
service, not from arbitrary request data. EmailJS account settings must permit
server API requests. Keep Use Private Key enabled in EmailJS. The backend requires this private key;
private keys belong only in backend environment secrets.

Keep EMAIL_OUTBOX_SECRET stable across app instances and redeployments until
pending jobs have drained. A random value was generated in local `.env`.

## Migrations

From `backend`, run `pnpm migration:run`. The missing notifications migration
is required by existing borrowing flows. AccountLifecycleAndEmailOutbox adds
`users.authVersion` and `email_jobs`; it does not remove existing data.

Restart the backend after deploying code and applying migrations.

## Delivery behavior

Admin-created account credentials and borrowing request/confirmation/rejection
emails are encrypted and queued in the same database transaction as the action.
The scheduled worker sends committed jobs through the official EmailJS REST API.
Provider errors do not undo account/loan creation. Password reset OTP uses
EmailJS directly and reports a controlled HTTP 503 on delivery failure.

EmailJS returns HTTP 200 with text OK; this means provider acceptance, not inbox
receipt. The worker processes one job per ten-second tick. Confirmed 4xx
rejections retry with bounded exponential backoff for at most 23 hours.
EmailJS has no idempotency key, so the worker commits a processing claim before
sending. A network timeout, ambiguous server response, or interrupted sender
marks delivery unknown instead of automatically sending a duplicate. Sent,
expired and unknown payloads are erased. No body, password or key is logged.

Check pending/failed/unknown delivery using a database operator account:

```sql
SELECT id, status, attempts, "lastError", "nextAttemptAt", "createdAt"
FROM email_jobs
WHERE status <> 'sent'
ORDER BY "createdAt";
```

Fix configuration or template errors to allow confirmed-rejected pending jobs
to retry. Inspect EmailJS history or recipient confirmation for unknown jobs;
do not automatically resend them. Use password recovery if account credentials
could not be received. Never create a duplicate user to recover email delivery.

## Validation

Run scoped Jest regression suites, backend `pnpm exec tsc --noEmit`,
`pnpm build`, and frontend `pnpm lint` / `pnpm build`.
The rollback-only database helper is:

```powershell
pnpm exec ts-node -r tsconfig-paths/register scripts/verify-account-email.integration.ts
```

It requires an available book copy, sends no email, and rolls back all fixtures,
borrowing changes, notifications and queued email jobs.
