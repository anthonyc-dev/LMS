# Catalog search modal

Scope: new CatalogSearchDialog and BrowseBooksPage integration. No backend, database, dependency, or borrowing changes.

Search button opens a modal using the application default theme colors and the supplied compact list layout. All / Physical / E-books tabs use the existing catalog API and include hybrid titles in both relevant tabs. Search title, author, or ISBN with 350 ms debounce; category filters and paginated results remain on the server. Rows show real format/availability, link to role-specific details, and close the modal. Queries start only while modal is mounted; reopening resets search and filters. Catalog grid and its existing format/category filters remain.

Verification: browser fixture assertions passed for modal opening/autofocus; pagination; eBook/hybrid filtering; author and ISBN search; clearing; category/format intersection and empty state; error state; Escape focus restoration; reset on reopen; result navigation. Desktop and 375x667 phone layout visually checked. Review reported no actionable findings. Disposable fixtures/server removed.

Live requested route redirects to login in the agent browser. Real-account search and deployment remain unverified. No real records were changed.

Final checks: frontend production build, full frontend ESLint, and git diff --check passed. No temporary fixtures remain.
