# Borrowing approval and eBooks implementation plan

Goal: user borrow requests wait for admin confirmation; admins upload Cloudinary PDFs for catalog readers.

Architecture: reuse borrowing transactions, notifications, catalog and Cloudinary SDK. Admin loans remain immediate. Pending requests reserve copies and count toward limits; approval starts 14-day loan; rejection releases copy. Serialize allocation and decisions.

PDF design: authenticated raw Cloudinary assets, 10 MB limit, MIME/signature validation, generated asset IDs. Store asset ID and filename in books; authenticated endpoint generates temporary read URL. Admin upload/replace/remove dialog; browser reader with open fallback. Existing title search includes eBooks. No new dependencies.

- [x] Regression tests: pending reservation, approval dates, invalid decisions, PDF validation.
- [x] Approval/rejection API, admin confirmation form, user text and cache updates.
- [x] PDF utility, book migration/API, admin dialog, catalog label and reader.
- [x] Backend tests/build, frontend build/lint, focused backend lint and diff review.

Cloudinary PDF delivery verified. eBook migration applied at user request; application deployment remains outside this task.

## Result and usage

Admin: Borrowing Records > Pending approval > Review request. Select approval/rejection and confirm reviewed details. Approval starts a 14-day loan; admin-created loans stay immediate. Pending copies remain reserved until decision and count toward loan limits. Generic edits/deletes cannot bypass pending decisions.

Admin eBooks: register a catalog title if needed, then Books > title action menu > eBook PDF. Upload, replace, read, or remove PDF. Catalog title search includes eBooks; users open book details > Read eBook PDF. Existing book metadata requirements (including ISBN/category) remain in effect. No physical copies needed to read a PDF.

Migration AddBookEbooks1793491200000 applied successfully using the project's migration command against the configured application database over a direct connection. Verified migration ledger entry and both nullable varchar columns (ebookPublicId, ebookFileName). Existing Cloudinary environment credentials are reused. No new dependencies.

Verification: backend build, changed-backend-file ESLint, frontend build and full frontend lint passed. All 30 feature tests passed (5 suites). Live Cloudinary smoke test uploaded one generated PDF, signed read returned HTTP 200 application/pdf, unsigned read returned HTTP 401, and temporary asset deletion returned ok. Code review found no remaining actionable issues. git diff --check passed.

Full backend suite after setup repairs: all 31 suites and 118 tests passed. Fixed missing dependency providers in 15 existing test suites, isolated auth test JWT configuration, and kept production guards unchanged. Service tests now exercise successful and missing record lookups; auth controller test exercises CSRF token/cookie creation. Backend build, full backend TypeScript check (including specs), and changed spec ESLint passed. Fixed a Cloudinary SDK upload_stream mock overload exposed by the full type-check. Reviewer reported no actionable issues.

Not verified: application browser flows, real PostgreSQL concurrency, production application deployment. .ai/AGENTS.md is absent; supplied project instructions and LMS workflow were followed.
