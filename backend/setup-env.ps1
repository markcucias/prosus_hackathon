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

SUPABASE_URL=https://dpyvbkrfasiskdrqimhf.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRweXZia3JmYXNpc2tkcnFpbWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDEzNzUsImV4cCI6MjA3ODE3NzM3NX0.JGb_M_zbh2Lzrca8O_GY8UtCvMnZocsiUBEbpELsLV8
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

