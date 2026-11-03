# Hybrid library plan

One catalog record per title; physical copies and Cloudinary PDFs remain independent. User confirmed immediate authenticated eBook reading. Reuse existing tables and workflows instead of creating separate catalogs or digital borrowing records.

- [x] Validate server format/category filters and pagination; expose physical copy count separately from PDF availability.
- [x] Unified Library Catalog with All / Physical / eBook / Both filters, accurate labels, pagination and error/empty states.
- [x] Dedicated admin eBook management; retain shared catalog metadata and physical copy management. eBook creation opens PDF upload instead of physical-copy prompt. Removing a PDF must not delete physical holdings.
- [x] Book details show independent physical-loan and digital-reading sections. EBook-only titles never show unavailable physical-loan controls. Physical borrowing keeps approval/return/fine rules; digital access uses existing protected Cloudinary links.
- [x] Run backend tests/build/typecheck/lint, frontend build/lint, review final diff.

No schema migration needed. Existing metadata requirements remain. Application deployment outside scope.

## Verification and result

Admin navigation now exposes Library Catalog, Physical Books, eBooks, and Physical Circulation. New eBook registration reuses catalog metadata creation, then opens PDF upload instead of the physical-copy prompt. Existing titles can receive a PDF through the catalog action menu. Dedicated eBook management can replace/remove PDFs without deleting shared titles. One title can have physical holdings, a PDF, or both.

Passed: 31 backend suites / 127 tests; backend build and full TypeScript check; focused backend ESLint; frontend production build and full lint; diff whitespace check. Review found no actionable issues.

Read-only integration queries on the configured database verified All / Physical / eBook / Both filters and combined search. No schema migration or record changes required.

Browser checks used disposable fixtures: unified catalog format filtering; eBook-only details without physical borrowing/shelf controls; PDF reader; hybrid title with independent digital/physical sections; physical approval prompt; eBook management menu omitting shared-title deletion; PDF replacement/removal controls. Corrected selected filter labels during browser verification. Temporary fixture files and server removed. Fixture category data used the wrong response envelope; confirmed the production controller/client contract remains compatible. Browser category selection was not independently exercised.

Limits: existing catalog metadata requirements remain (including ISBN and category); no digital loan/return/fine records created. Application deployment and real-account end-to-end workflows not performed.
