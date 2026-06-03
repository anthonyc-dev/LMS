$ErrorActionPreference = "Stop"
$base = Join-Path $PSScriptRoot "..\src"

$replacements = @(
    @{ Old = '@/assets/dashboard/'; New = '@/assets/images/dashboard/' },
    @{ Old = '@/assets/hero.png'; New = '@/assets/images/hero.png' },
    @{ Old = '@/assets/react.svg'; New = '@/assets/icons/react.svg' },
    @{ Old = '@/assets/vite.svg'; New = '@/assets/icons/vite.svg' }
)

$files = Get-ChildItem -Path $base -Recurse -Include "*.ts","*.tsx"
$filesChanged = 0

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $original = $content
    
    foreach ($r in $replacements) {
        if ($content.Contains($r.Old)) {
            $content = $content.Replace($r.Old, $r.New)
        }
    }
    
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        $filesChanged++
        Write-Host "Updated: $($file.Name)"
    }
}

Write-Host "`nFixed asset paths in $filesChanged files"
