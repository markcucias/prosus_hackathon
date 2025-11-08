# PowerShell script to reset MongoDB and trigger sync
# Run this to reset assignments and test the flow

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  RESET MONGODB & SYNC ASSIGNMENTS" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Reset MongoDB
Write-Host "Step 1: Resetting MongoDB processed flags..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5001/api/mongodb/reset" -Method POST -ContentType "application/json"

    if ($response.success) {
        Write-Host "✅ MongoDB reset successful!" -ForegroundColor Green
        Write-Host "   Total assignments: $($response.stats.total_assignments)" -ForegroundColor Gray
        Write-Host "   Unprocessed now: $($response.stats.unprocessed_now)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed to reset MongoDB: $($response.error)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error connecting to backend: $_" -ForegroundColor Red
    Write-Host "   Make sure the backend is running: python backend/api.py" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 2: Instructions for sync
Write-Host "Step 2: Trigger sync" -ForegroundColor Yellow
Write-Host "   Option A: Wait 5 minutes for automatic sync" -ForegroundColor Gray
Write-Host "   Option B: Go to http://localhost:8080 and click 'Sync Calendar'" -ForegroundColor Gray
Write-Host ""

# Step 3: What to expect
Write-Host "What to expect:" -ForegroundColor Yellow
Write-Host "   1. Backend will sync $($response.stats.unprocessed_now) assignments to Supabase" -ForegroundColor Gray
Write-Host "   2. Email notifications will be sent" -ForegroundColor Gray
Write-Host "   3. Click email link to open assignment detail page" -ForegroundColor Gray
Write-Host "   4. Upload materials and create study plan" -ForegroundColor Gray
Write-Host ""

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  RESET COMPLETE!" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
