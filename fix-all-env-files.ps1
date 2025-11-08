# PowerShell script to find and fix ALL .env files with wrong Supabase URL
# Run this in the project root: .\fix-all-env-files.ps1

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  FINDING AND FIXING ALL .ENV FILES" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$wrongUrl = "dpyvbkrfasiskdrqimhf"
$correctUrl = "lcpexhkqaqftaqdtgebp"
$wrongKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRweXZia3JmYXNpc2tkcnFpbWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDEzNzUsImV4cCI6MjA3ODE3NzM3NX0.JGb_M_zbh2Lzrca8O_GY8UtCvMnZocsiUBEbpELsLV8"
$correctKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjcGV4aGtxYXFmdGFxZHRnZWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTcwNDIsImV4cCI6MjA3ODE5MzA0Mn0.z6pY_kCftjr1hT6zW7qCVEYHc4D0X8HLAuk_6N2IbcY"

$filesFixed = 0
$filesChecked = 0

# Find all .env files
Write-Host "Step 1: Finding all .env files..." -ForegroundColor Yellow
$envFiles = Get-ChildItem -Path . -Filter ".env*" -File -Recurse -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch "node_modules" -and $_.FullName -notmatch "\.git"
}

Write-Host "Found $($envFiles.Count) .env file(s)" -ForegroundColor Gray
Write-Host ""

# Check and fix each file
Write-Host "Step 2: Checking and fixing files..." -ForegroundColor Yellow
foreach ($file in $envFiles) {
    $filesChecked++
    Write-Host "Checking: $($file.FullName)" -ForegroundColor Gray

    $content = Get-Content $file.FullName -Raw
    $needsFix = $false

    if ($content -match $wrongUrl) {
        Write-Host "  ❌ Found wrong URL: $wrongUrl" -ForegroundColor Red
        $content = $content -replace $wrongUrl, $correctUrl
        $needsFix = $true
    }

    if ($content -match [regex]::Escape($wrongKey)) {
        Write-Host "  ❌ Found wrong key" -ForegroundColor Red
        $content = $content -replace [regex]::Escape($wrongKey), $correctKey
        $needsFix = $true
    }

    if ($needsFix) {
        $content | Out-File -FilePath $file.FullName -Encoding utf8 -NoNewline
        Write-Host "  ✅ FIXED!" -ForegroundColor Green
        $filesFixed++
    } else {
        if ($content -match $correctUrl) {
            Write-Host "  ✅ Already correct" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  No Supabase URL found (might be a different .env file)" -ForegroundColor Yellow
        }
    }
    Write-Host ""
}

# Check supabase/config.toml
Write-Host "Step 3: Checking supabase/config.toml..." -ForegroundColor Yellow
$configPath = "supabase\config.toml"
if (Test-Path $configPath) {
    $configContent = Get-Content $configPath -Raw
    if ($configContent -match $wrongUrl) {
        Write-Host "  ❌ Found wrong project ID in config.toml" -ForegroundColor Red
        $configContent = $configContent -replace $wrongUrl, $correctUrl
        $configContent | Out-File -FilePath $configPath -Encoding utf8 -NoNewline
        Write-Host "  ✅ FIXED config.toml!" -ForegroundColor Green
        $filesFixed++
    } elseif ($configContent -match $correctUrl) {
        Write-Host "  ✅ config.toml is correct" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️  supabase/config.toml not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  SUMMARY" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Files checked: $filesChecked" -ForegroundColor White
Write-Host "Files fixed: $filesFixed" -ForegroundColor White
Write-Host ""

if ($filesFixed -gt 0) {
    Write-Host "✅ Fixed $filesFixed file(s)!" -ForegroundColor Green
    Write-Host ""
    Write-Host "NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "1. STOP the frontend (Ctrl+C)" -ForegroundColor White
    Write-Host "2. Delete: node_modules\.vite" -ForegroundColor White
    Write-Host "3. Restart: npm run dev" -ForegroundColor White
    Write-Host "4. Test: http://localhost:8080/diagnostic" -ForegroundColor White
} else {
    Write-Host "✅ All files are already correct!" -ForegroundColor Green
    Write-Host ""
    Write-Host "If diagnostic still shows wrong URL:" -ForegroundColor Yellow
    Write-Host "1. Close PowerShell and open a NEW one" -ForegroundColor White
    Write-Host "2. Delete node_modules and reinstall:" -ForegroundColor White
    Write-Host "   Remove-Item -Recurse -Force node_modules" -ForegroundColor Gray
    Write-Host "   npm install" -ForegroundColor Gray
    Write-Host "3. Restart: npm run dev" -ForegroundColor White
}

Write-Host "============================================================" -ForegroundColor Cyan
