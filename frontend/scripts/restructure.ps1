$ErrorActionPreference = "Stop"
$base = $PSScriptRoot + "\..\src"

# Phase 1: Create directories
$dirs = @(
    "app/providers", "app/router", "app/store",
    "features/auth/api", "features/auth/hooks", "features/auth/components",
    "features/auth/pages", "features/auth/types", "features/auth/services", "features/auth/validations",
    "features/users/api", "features/users/hooks", "features/users/components",
    "features/users/pages", "features/users/types", "features/users/services",
    "features/books/api", "features/books/hooks", "features/books/components",
    "features/books/pages", "features/books/types", "features/books/services",
    "shared/components/Button", "shared/components/Input", "shared/components/Modal",
    "shared/components/DataTable", "shared/components/ui",
    "shared/hooks", "shared/utils", "shared/constants", "shared/types", "shared/lib", "shared/validations",
    "layouts/DashboardLayout", "layouts/AuthLayout",
    "assets/images", "assets/icons", "assets/fonts",
    "styles"
)

foreach ($d in $dirs) {
    $path = Join-Path $base $d
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Force -Path $path | Out-Null
        Write-Host "Created: $d"
    }
}
Write-Host "`n=== Phase 1 complete: directories created ===`n"

# Phase 2: Move files
# Helper function
function MoveFile($from, $to) {
    $src = Join-Path $base $from
    $dst = Join-Path $base $to
    if (Test-Path $src) {
        $dstDir = Split-Path $dst -Parent
        if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Force -Path $dstDir | Out-Null }
        Move-Item -Path $src -Destination $dst -Force
        Write-Host "  Moved: $from -> $to"
    } else {
        Write-Host "  SKIP (not found): $from"
    }
}

# --- app/ ---
Write-Host "Moving app-level files..."
MoveFile "store/authStore.ts" "app/store/authStore.ts"

# --- features/auth/ ---
Write-Host "Moving auth feature files..."
MoveFile "pages/LoginPage.tsx" "features/auth/pages/LoginPage.tsx"
MoveFile "pages/RegisterPage.tsx" "features/auth/pages/RegisterPage.tsx"
MoveFile "pages/ForgotPassword.tsx" "features/auth/pages/ForgotPassword.tsx"
MoveFile "pages/ResetPassword.tsx" "features/auth/pages/ResetPassword.tsx"
MoveFile "pages/UnauthorizedPage.tsx" "features/auth/pages/UnauthorizedPage.tsx"
MoveFile "components/commons/ProtectedRoute.tsx" "features/auth/components/ProtectedRoute.tsx"
MoveFile "components/commons/PublicRoute.tsx" "features/auth/components/PublicRoute.tsx"
MoveFile "components/commons/Can.tsx" "features/auth/components/Can.tsx"
MoveFile "lib/authEventBus.ts" "features/auth/services/authEventBus.ts"
MoveFile "lib/schemas.ts" "features/auth/validations/schemas.ts"

# --- features/users/ ---
Write-Host "Moving users feature files..."
MoveFile "pages/admin/UserManagement.tsx" "features/users/pages/UserManagement.tsx"
MoveFile "pages/student/ProfilePage.tsx" "features/users/pages/ProfilePage.tsx"
MoveFile "pages/student/SettingsPage.tsx" "features/users/pages/SettingsPage.tsx"
MoveFile "lib/api/users.ts" "features/users/api/users.ts"
MoveFile "components/admin/userManagement/UserModal.tsx" "features/users/components/UserModal.tsx"
MoveFile "components/admin/userManagement/DeleteUserModal.tsx" "features/users/components/DeleteUserModal.tsx"

# --- features/books/ ---
Write-Host "Moving books feature files..."
MoveFile "lib/api/books.ts" "features/books/api/books.ts"
MoveFile "lib/api/categories.ts" "features/books/api/categories.ts"
MoveFile "lib/api/shelves.ts" "features/books/api/shelves.ts"
MoveFile "hooks/useBooks.ts" "features/books/hooks/useBooks.ts"
MoveFile "types/book.ts" "features/books/types/book.ts"
MoveFile "types/category.ts" "features/books/types/category.ts"
MoveFile "types/shelf.ts" "features/books/types/shelf.ts"
MoveFile "pages/admin/BooksPage.tsx" "features/books/pages/BooksPage.tsx"
MoveFile "pages/admin/AddBookPage.tsx" "features/books/pages/AddBookPage.tsx"
MoveFile "pages/admin/InventoryPage.tsx" "features/books/pages/InventoryPage.tsx"
MoveFile "pages/admin/CategoryPage.tsx" "features/books/pages/CategoryPage.tsx"
MoveFile "pages/admin/ShelfPage.tsx" "features/books/pages/ShelfPage.tsx"
MoveFile "pages/admin/AdminBorrowingHistory.tsx" "features/books/pages/AdminBorrowingHistory.tsx"
MoveFile "pages/admin/AdminDashboardPage.tsx" "features/books/pages/AdminDashboardPage.tsx"
MoveFile "pages/student/BrowseBooksPage.tsx" "features/books/pages/BrowseBooksPage.tsx"
MoveFile "pages/student/BorrowBooksPage.tsx" "features/books/pages/BorrowBooksPage.tsx"
MoveFile "pages/student/BorrowingHistoryPage.tsx" "features/books/pages/BorrowingHistoryPage.tsx"
MoveFile "pages/student/MyBooksPage.tsx" "features/books/pages/MyBooksPage.tsx"
MoveFile "pages/student/SchedulePage.tsx" "features/books/pages/SchedulePage.tsx"
MoveFile "pages/faculty/FacultyDashboardPage.tsx" "features/books/pages/FacultyDashboardPage.tsx"
MoveFile "pages/DashboardPage.tsx" "features/books/pages/DashboardPage.tsx"
MoveFile "components/admin/books/EditBookModal.tsx" "features/books/components/EditBookModal.tsx"
MoveFile "components/admin/books/DeleteBookModal.tsx" "features/books/components/DeleteBookModal.tsx"
MoveFile "components/admin/category/CategoryModal.tsx" "features/books/components/CategoryModal.tsx"
MoveFile "components/admin/category/CategoryPageSkeleton.tsx" "features/books/components/CategoryPageSkeleton.tsx"
MoveFile "components/admin/category/DeleteCategoryModal.tsx" "features/books/components/DeleteCategoryModal.tsx"
MoveFile "components/admin/shelf/ShelfFormModal.tsx" "features/books/components/ShelfFormModal.tsx"
MoveFile "components/admin/shelf/DeleteShelfModal.tsx" "features/books/components/DeleteShelfModal.tsx"

# --- shared/ ---
Write-Host "Moving shared files..."
# Move all ui components
Get-ChildItem -Path (Join-Path $base "components/ui") -File | ForEach-Object {
    MoveFile "components/ui/$($_.Name)" "shared/components/ui/$($_.Name)"
}
MoveFile "components/commons/GlobalLoading.tsx" "shared/components/GlobalLoading.tsx"
MoveFile "components/commons/Sidebar.tsx" "shared/components/Sidebar.tsx"
MoveFile "components/commons/MobileNav.tsx" "shared/components/MobileNav.tsx"
MoveFile "components/commons/TableSkeleton.tsx" "shared/components/DataTable/TableSkeleton.tsx"
MoveFile "components/commons/loading-overlay.tsx" "shared/components/Modal/loading-overlay.tsx"
MoveFile "components/commons/PageLoaderProvider.tsx" "shared/components/PageLoaderProvider.tsx"
MoveFile "hooks/use-mobile.ts" "shared/hooks/use-mobile.ts"
MoveFile "hooks/usePageTitle.ts" "shared/hooks/usePageTitle.ts"
MoveFile "lib/utils.ts" "shared/lib/utils.ts"
MoveFile "lib/axios.ts" "shared/lib/axios.ts"
MoveFile "lib/roles.ts" "shared/utils/roles.ts"
MoveFile "pages/NotFoundPage.tsx" "shared/components/NotFoundPage.tsx"

# --- layouts/ ---
Write-Host "Moving layout files..."
MoveFile "layouts/AdminLayout.tsx" "layouts/DashboardLayout/index.tsx"

# --- styles/ ---
Write-Host "Moving styles..."
MoveFile "index.css" "styles/globals.css"

# --- assets/ ---
Write-Host "Moving assets..."
# Move dashboard folder into images
if (Test-Path (Join-Path $base "assets/dashboard")) {
    Move-Item -Path (Join-Path $base "assets/dashboard") -Destination (Join-Path $base "assets/images/dashboard") -Force
    Write-Host "  Moved: assets/dashboard -> assets/images/dashboard"
}
MoveFile "assets/hero.png" "assets/images/hero.png"
MoveFile "assets/react.svg" "assets/icons/react.svg"
MoveFile "assets/vite.svg" "assets/icons/vite.svg"

Write-Host "`n=== Phase 2 complete: files moved ===`n"
