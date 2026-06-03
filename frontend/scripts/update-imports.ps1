$ErrorActionPreference = "Stop"
$base = Join-Path $PSScriptRoot "..\src"

# Define import replacement map (old pattern -> new pattern)
$replacements = @(
    # Store
    @{ Old = '@/store/authStore'; New = '@/app/store/authStore' },

    # UI components
    @{ Old = '@/components/ui/'; New = '@/shared/components/ui/' },

    # Commons -> shared or feature
    @{ Old = '@/components/commons/PageLoaderProvider'; New = '@/shared/components/PageLoaderProvider' },
    @{ Old = '@/components/commons/GlobalLoading'; New = '@/shared/components/GlobalLoading' },
    @{ Old = '@/components/commons/Sidebar'; New = '@/shared/components/Sidebar' },
    @{ Old = '@/components/commons/MobileNav'; New = '@/shared/components/MobileNav' },
    @{ Old = '@/components/commons/TableSkeleton'; New = '@/shared/components/DataTable/TableSkeleton' },
    @{ Old = '@/components/commons/loading-overlay'; New = '@/shared/components/Modal/loading-overlay' },
    @{ Old = '@/components/commons/ProtectedRoute'; New = '@/features/auth/components/ProtectedRoute' },
    @{ Old = '@/components/commons/PublicRoute'; New = '@/features/auth/components/PublicRoute' },
    @{ Old = '@/components/commons/Can'; New = '@/features/auth/components/Can' },

    # Admin components
    @{ Old = '@/components/admin/books/'; New = '@/features/books/components/' },
    @{ Old = '@/components/admin/category/'; New = '@/features/books/components/' },
    @{ Old = '@/components/admin/shelf/'; New = '@/features/books/components/' },
    @{ Old = '@/components/admin/userManagement/'; New = '@/features/users/components/' },

    # Lib
    @{ Old = '@/lib/utils'; New = '@/shared/lib/utils' },
    @{ Old = '@/lib/axios'; New = '@/shared/lib/axios' },
    @{ Old = '@/lib/roles'; New = '@/shared/utils/roles' },
    @{ Old = '@/lib/schemas'; New = '@/features/auth/validations/schemas' },
    @{ Old = '@/lib/authEventBus'; New = '@/features/auth/services/authEventBus' },
    @{ Old = '@/lib/api/books'; New = '@/features/books/api/books' },
    @{ Old = '@/lib/api/categories'; New = '@/features/books/api/categories' },
    @{ Old = '@/lib/api/shelves'; New = '@/features/books/api/shelves' },
    @{ Old = '@/lib/api/users'; New = '@/features/users/api/users' },

    # Hooks
    @{ Old = '@/hooks/useBooks'; New = '@/features/books/hooks/useBooks' },
    @{ Old = '@/hooks/usePageTitle'; New = '@/shared/hooks/usePageTitle' },
    @{ Old = '@/hooks/use-mobile'; New = '@/shared/hooks/use-mobile' },

    # Types
    @{ Old = '@/types/book'; New = '@/features/books/types/book' },
    @{ Old = '@/types/category'; New = '@/features/books/types/category' },
    @{ Old = '@/types/shelf'; New = '@/features/books/types/shelf' },

    # Pages (cross-feature imports)
    @{ Old = '@/pages/admin/UserManagement'; New = '@/features/users/pages/UserManagement' },
    @{ Old = '@/pages/admin/'; New = '@/features/books/pages/' },
    @{ Old = '@/pages/student/'; New = '@/features/books/pages/' },
    @{ Old = '@/pages/'; New = '@/features/books/pages/' },

    # Layouts
    @{ Old = '@/layouts/AdminLayout'; New = '@/layouts/DashboardLayout' }
)

$count = 0
$filesChanged = 0

# Find all .ts and .tsx files
$files = Get-ChildItem -Path $base -Recurse -Include "*.ts","*.tsx" | Where-Object { -not $_.FullName.Contains("node_modules") }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    if (-not $content) { continue }

    $original = $content
    foreach ($r in $replacements) {
        if ($content.Contains($r.Old)) {
            $content = $content.Replace($r.Old, $r.New)
            $count++
        }
    }

    if ($content -ne $original) {
        # Use .NET method to write without BOM
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        $filesChanged++
        Write-Host "Updated: $($file.FullName.Replace($base, 'src'))"
    }
}

Write-Host "`n=== Phase 3 complete: $count replacements in $filesChanged files ===`n"
