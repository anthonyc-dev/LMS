# Realtime notifications

Borrowing notifications are saved through the same EntityManager as the loan
and queued email. Socket events are published only after the transaction commits.
A rolled-back loan cannot leave a notification behind or emit a success event.
An unavailable transport does not undo committed data.

The gateway validates the JWT, loads the active user and checks authVersion.
It enforces CORS_ORIGIN on polling and WebSocket upgrades, trims configured
origins, and supports multiple tabs per user. Expired sockets signal the client
to refetch through the authenticated HTTP client, which refreshes the session.
Fresh access tokens reconnect the existing socket without losing listeners.

Clients refetch persisted notifications after transport connection and after
gateway authorization finishes. Read/dismiss operations signal every connected
tab to refetch. Dashboard cleanup disconnects the socket and clears cached
notifications so another account cannot inherit the previous account's inbox.

## Deployment

- Set frontend VITE_API_URL to the deployed backend URL before building.
- Set backend CORS_ORIGIN to the exact frontend origin. Comma-separated origins
  are supported. Serve HTTPS and allow `/socket.io/` WebSocket upgrades.
- Apply notification and account/email migrations before starting the backend.
- Configure backend EmailJS secrets and templates as described in
  `account-lifecycle-and-email.md`.
- Current realtime routing is in memory and requires one backend instance.
  Multiple instances need a shared Socket.IO adapter; durable REST storage alone
  does not distribute live events between instances.

## Verification

`notifications.gateway.spec.ts` uses real local Socket.IO connections with a
mocked user repository. It verifies recipient isolation, multiple tabs, state
invalidation, allowed/rejected origins, stale/deactivated accounts and expiry.
Service tests verify transaction-bound persistence and deferred publishing.
Borrowing tests verify no publish on commit failure.

The rollback-only account/email integration helper validates the configured
database and email queue without sending mail. It does not verify deployed code
or recipient inbox delivery. Production verification requires a signed-in test
account, a known test recipient and the deployed frontend/backend.

## Production inspection: October 13, 2026

The public frontend at `https://cs-lms-2026.vercel.app` loads a bundle referencing
`https://lms-lyws.onrender.com`. Read-only checks found:

- Backend `/health`: HTTP 503; database down; app and memory checks up.
- `/notifications` without Origin: HTTP 401 Unauthorized, as expected.
- `/notifications` with the frontend Origin: HTTP 500 and no allowed-origin
  header. Deployed CORS configuration must include the exact frontend origin.
- Socket.IO polling handshake: HTTP 200, but no allowed-origin header for that
  frontend. A public transport handshake does not prove authenticated delivery.
- EmailJS history: HTTP 200; one successful record for each configured account
  and library template. Stored LMS parameters were unavailable, so these records
  do not establish that the current deployed LMS flows sent the emails.

Correct deployed database connectivity and CORS settings, apply pending
migrations, deploy the updated backend/frontend, then verify signed-in account
creation, borrowing mail and notification delivery with an approved test inbox.
No production account or borrowing was created during this inspection.
