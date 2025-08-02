# Quick Environment Setup Script
# Run this after you get your DATABASE_URL from Railway or Supabase

Write-Host "🔧 CivicTrack Environment Setup" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

# Check if .env.production already exists
if (Test-Path ".env.production") {
    Write-Host "⚠️  .env.production already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "❌ Cancelled" -ForegroundColor Red
        exit
    }
}

Write-Host ""
Write-Host "Please paste your DATABASE_URL from Railway or Supabase:" -ForegroundColor Yellow
Write-Host "Examples:" -ForegroundColor Gray
Write-Host "  Railway: postgresql://postgres:xxx@containers-us-west-xxx.railway.app:5432/railway" -ForegroundColor Gray
Write-Host "  Supabase: postgresql://postgres.xxx:password@aws-0-us-west-1.pooler.supabase.com:6543/postgres" -ForegroundColor Gray
Write-Host ""

$databaseUrl = Read-Host "DATABASE_URL"

if ([string]::IsNullOrWhiteSpace($databaseUrl)) {
    Write-Host "❌ DATABASE_URL cannot be empty!" -ForegroundColor Red
    exit 1
}

# Validate DATABASE_URL format
if ($databaseUrl -notmatch "^postgresql://") {
    Write-Host "❌ Invalid DATABASE_URL format! Must start with 'postgresql://'" -ForegroundColor Red
    exit 1
}

Write-Host ""
$domain = Read-Host "Your production domain (or press Enter for localhost:3000)"
if ([string]::IsNullOrWhiteSpace($domain)) {
    $domain = "http://localhost:3000"
} elseif ($domain -notmatch "^https?://") {
    $domain = "https://$domain"
}

# Generate secure random secret
$secret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Create .env.production file
$envContent = @"
# CivicTrack Production Environment
# Generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Database Configuration
DATABASE_URL="$databaseUrl"

# Next.js Configuration
NEXTAUTH_SECRET="$secret"
NEXTAUTH_URL="$domain"

# Optional: Email Configuration
# EMAIL_SERVER="smtp://username:password@smtp.example.com:587"
# EMAIL_FROM="noreply@your-domain.com"

# Optional: File Upload Configuration
# AWS_S3_BUCKET="your-bucket-name"
# AWS_ACCESS_KEY_ID="your-access-key"
# AWS_SECRET_ACCESS_KEY="your-secret-key"
# AWS_REGION="us-east-1"
"@

$envContent | Out-File -FilePath ".env.production" -Encoding UTF8

Write-Host "Environment file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Configuration:" -ForegroundColor Cyan
Write-Host "  DATABASE_URL: $($databaseUrl.Substring(0, [Math]::Min(50, $databaseUrl.Length)))..." -ForegroundColor White
Write-Host "  NEXTAUTH_URL: $domain" -ForegroundColor White
Write-Host "  NEXTAUTH_SECRET: [Generated 32-character secure key]" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Yellow
Write-Host "1. Run deployment script: .\deploy-postgresql.ps1" -ForegroundColor White
Write-Host "2. Or manually deploy:" -ForegroundColor White
Write-Host "   - Copy PostgreSQL schema: Copy-Item 'prisma/schema.postgresql.prisma' 'prisma/schema.prisma' -Force" -ForegroundColor Gray
Write-Host "   - Generate client: npx prisma generate" -ForegroundColor Gray
Write-Host "   - Run migrations: npx prisma migrate deploy" -ForegroundColor Gray
Write-Host "   - Seed database: node scripts/migrate-to-postgresql.js" -ForegroundColor Gray
Write-Host "   - Build app: npm run build" -ForegroundColor Gray
Write-Host ""
