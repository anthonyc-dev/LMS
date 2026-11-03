# Return fine 500 fix

Root cause: app sent NO COVER while PostgreSQL fines_type_enum only contained OVERDUE, DAMAGED, LOST. Reproduced SQLSTATE22P02 with a read-only enum cast. Entity had also mapped OVERDUE to NO COVER, conflating an overdue fine with a missing-cover fine.

Fix: restore OVERDUE value; add distinct NO_COVER = NO COVER enum member; keep both frontend options and set automatic overdue fines to OVERDUE. Add migration AddNoCoverFineType1793577600000 with ALTER TYPE ADD VALUE IF NOT EXISTS. No history reclassification or fine deletion.

Migration applied through project migration command against configured app database using direct connection; confirmed it was the only pending migration. Verified ledger and real-schema inserts for all four types through a temporary table inside a rolled-back transaction. No real fines or loans modified.

Regression: DTO accepts each of OVERDUE, NO COVER, DAMAGED, LOST. OVERDUE test failed before fix; all six fine tests passed afterward. Code review found no actionable issues.

Limit: migration enum removal requires explicit data-preserving migration; automatic down refuses to remove existing fine types. Actual signed-in financial return not performed.

Final verification: all 31 backend suites / 131 tests passed. Backend and frontend builds passed; full backend TypeScript check, changed-backend-file ESLint, full frontend ESLint, and diff whitespace check passed.

Selection clarification: manual fine dropdown exposes No Cover, Damaged, and Lost only. Automatic overdue calculation, fine creation, backend acceptance, and historical records remain supported.
