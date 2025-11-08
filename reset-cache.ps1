# PowerShell script to completely restart everything with fresh cache
# This will fix the "still showing 5 assignments" issue

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  COMPLETE RESET & RESTART" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify .env file is correct
Write-Host "Step 1: Verifying .env configuration..." -ForegroundColor Yellow
$envContent = Get-Content ".env" -Raw
if ($envContent -match "lcpexhkqaqftaqdtgebp") {
    Write-Host "✅ Frontend .env is correct (using lcpexhkqaqftaqdtgebp)" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend .env is WRONG!" -ForegroundColor Red
    Write-Host "   Expected: lcpexhkqaqftaqdtgebp" -ForegroundColor Red
    exit 1
}

$backendEnvContent = Get-Content "backend\.env" -Raw
if ($backendEnvContent -match "lcpexhkqaqftaqdtgebp") {
    Write-Host "✅ Backend .env is correct (using lcpexhkqaqftaqdtgebp)" -ForegroundColor Green
} else {
    Write-Host "❌ Backend .env is WRONG!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Clean all caches
Write-Host "Step 2: Cleaning all caches..." -ForegroundColor Yellow

# Remove node_modules/.vite cache
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite"
    Write-Host "✅ Cleared Vite cache" -ForegroundColor Green
}

# Remove dist folder
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Cleared dist folder" -ForegroundColor Green
}

Write-Host ""

# Step 3: Instructions
Write-Host "Step 3: Next steps..." -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: You need to:" -ForegroundColor Yellow
Write-Host "1. STOP the frontend (Ctrl+C in the terminal running 'npm run dev')" -ForegroundColor White
Write-Host "2. CLOSE that PowerShell window completely" -ForegroundColor White
Write-Host "3. Open a NEW PowerShell window" -ForegroundColor White
Write-Host "4. Run: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Then open in browser (INCOGNITO):" -ForegroundColor Yellow
Write-Host "   http://localhost:8080/diagnostic" -ForegroundColor Cyan
Write-Host ""
Write-Host "The diagnostic page will show:" -ForegroundColor Yellow
Write-Host "   - Which Supabase URL it's using (should be lcpexhkqaqftaqdtgebp)" -ForegroundColor Gray
Write-Host "   - How many assignments it finds (should be 44)" -ForegroundColor Gray
Write-Host ""
Write-Host "If it shows the WRONG URL or WRONG count, the cache is still there." -ForegroundColor Yellow
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  CACHE CLEARED - RESTART FRONTEND NOW" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
