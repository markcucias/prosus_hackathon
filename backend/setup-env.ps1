# PowerShell script to create .env file
$envContent = @"
# ============================================
# AGENTIC AI STUDY COMPANION - CONFIGURATION
# ============================================

USER_EMAIL=doe839319@gmail.com
SENDER_EMAIL=doe839319@gmail.com
SENDER_PASSWORD=qcokkdvzyhskelwo

SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587

MONGODB_CONNECTION_STRING=mongodb+srv://prosus-db-user:yLFIMGwT48qUKxDG@prosus-db-user.wfei3mu.mongodb.net/?retryWrites=true&w=majority

SUPABASE_URL=https://lcpexhkqaqftaqdtgebp.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjcGV4aGtxYXFmdGFxZHRnZWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTcwNDIsImV4cCI6MjA3ODE5MzA0Mn0.z6pY_kCftjr1hT6zW7qCVEYHc4D0X8HLAuk_6N2IbcY
"@

$envPath = Join-Path $PSScriptRoot ".env"
$envContent | Out-File -FilePath $envPath -Encoding utf8 -NoNewline

Write-Host "✅ Created .env file at: $envPath" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Configuration:" -ForegroundColor Cyan
Write-Host "   USER_EMAIL: doe839319@gmail.com"
Write-Host "   SENDER_EMAIL: doe839319@gmail.com"
Write-Host "   SENDER_PASSWORD: qcokkdvzyhskelwo (16 characters)"
Write-Host ""
Write-Host "✅ Ready to use!" -ForegroundColor Green

