# Notification verification: October 20, 2026

## Result

Notification service, HTTP endpoints and real Socket.IO delivery passed for
admin, faculty (staff), and student roles against the configured database using
a local test application. Production notifications remain blocked by deployed
health and origin failures. A signed-in production browser flow was not tested.

EmailJS delivery was confirmed by the user. This verification sent no emails.

## Passed

- Focused Jest run: 4 suites, 31 tests, including JWT account checks, role
  delivery, recipient isolation, multiple tabs, allowed/rejected origins,
  expired authorization and transaction commit failures.
- Database integration: authenticated HTTP access for all three roles; delivery
  to two tabs; persisted unread counts; read, read-all, dismiss and dismiss-all;
  offline recovery; cross-user read/dismiss rejection; invalid query rejection.
- Actual faculty/student borrow requests, rejection and confirmation generated
  borrower notifications and admin request notifications. Returning the loan
  restored the copy for the next test.
- Backend TypeScript, build and scoped ESLint checks passed.

The integration helper uses the actual JWT strategy, notification controller,
service, gateway, and transaction-bound repositories. It starts no mail worker
or scheduler. All fixture accounts, notification rows, loan changes and queued
email jobs were rolled back. Role fanout occurs only inside that transaction;
the local gateway has no production browser connections.

Run from `backend`:

```sh
pnpm test --runInBand --runTestsByPath src/modules/core/notifications/notifications.gateway.spec.ts src/modules/core/notifications/notifications.service.spec.ts src/modules/circulation/borrowings/borrowings.service.spec.ts src/common/guard/jwt.strategy.spec.ts
pnpm exec ts-node -r tsconfig-paths/register scripts/verify-notifications.integration.ts
```

The integration helper requires an available book copy and configured database,
JWT secrets and email outbox encryption. Local HTTP/WebSocket and database
network access must be available. It intentionally does not commit changes, so
the integration run does not independently prove durability after a real commit;
commit ordering and rollback failure paths are covered by focused Jest tests.

## Production observations

The deployed frontend at `https://cs-lms-2026.vercel.app` returned HTTP 200.
Its current entry bundle references `https://lms-lyws.onrender.com`.

- Backend `/health`: HTTP 503, status `error` after an initial timeout.
- `/notifications` without Origin: HTTP 401, `Unauthorized`, as expected.
- `/notifications` with Origin `https://cs-lms-2026.vercel.app`: HTTP 500,
  `Internal server error`, no `Access-Control-Allow-Origin` header.
- Socket.IO polling handshake with that Origin: HTTP 200 without an allowed
  origin header. This does not establish browser authorization or delivery.

The origin-dependent result is consistent with the backend's configured-origin
rejection path. The deployed environment must allow the exact frontend origin.
The health failure also needs diagnosis in deployed service logs. No deployment
configuration was changed during this verification.

## Coverage gaps and limits

- Return, extension, overdue-warning and fine-issued notification producers are
  absent from the current backend. Frontend icons/toast handling for a type do
  not establish that a corresponding event is generated.
- The full backend Jest run was not clean: existing controller/service scaffold
  tests lack required repository/configuration providers. Its initial gateway
  failures were caused by sandbox networking; the focused run with networking
  enabled passed. Unrelated tests were not rewritten.
- Signed-in production rendering, toast presentation and account switching
  remain unverified. Correct deployment health and origins, then perform a
  controlled production browser test for each role before claiming full
  production readiness.
