# Production Deployment Script for CivicTrack
# This script helps you deploy to PostgreSQL production environment

Write-Host "🚀 CivicTrack PostgreSQL Production Deployment" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Check if .env.production exists
if (!(Test-Path ".env.production")) {
    Write-Host "❌ .env.production file not found!" -ForegroundColor Red
    Write-Host "Please create .env.production with your PostgreSQL connection string:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "DATABASE_URL='postgresql://username:password@host:5432/database'" -ForegroundColor Cyan
    Write-Host "NEXTAUTH_SECRET='your-super-secure-secret-key'" -ForegroundColor Cyan
    Write-Host "NEXTAUTH_URL='https://your-domain.com'" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can copy .env.example as a template:" -ForegroundColor Yellow
    Write-Host "Copy-Item .env.example .env.production" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Environment file found" -ForegroundColor Green

# Install PostgreSQL dependencies
Write-Host ""
Write-Host "📦 Installing PostgreSQL dependencies..." -ForegroundColor Blue
npm install pg @types/pg

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Update Prisma schema for PostgreSQL
Write-Host ""
Write-Host "🗄️ Updating Prisma schema for PostgreSQL..." -ForegroundColor Blue

# Copy PostgreSQL schema
Copy-Item "prisma/schema.postgresql.prisma" "prisma/schema.prisma" -Force

Write-Host "✅ Prisma schema updated for PostgreSQL" -ForegroundColor Green

# Generate Prisma client
Write-Host ""
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Blue
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prisma client generated" -ForegroundColor Green

# Run database migrations
Write-Host ""
Write-Host "🗃️ Running database migrations..." -ForegroundColor Blue
$env:DATABASE_URL = (Get-Content .env.production | Where-Object { $_ -match "^DATABASE_URL=" } | ForEach-Object { $_.Split('=', 2)[1].Trim('"') })

npx prisma migrate deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to run migrations" -ForegroundColor Red
    Write-Host "Please check your DATABASE_URL and ensure the database is accessible" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Database migrations completed" -ForegroundColor Green

# Seed the database
Write-Host ""
Write-Host "🌱 Seeding production database..." -ForegroundColor Blue
node scripts/migrate-to-postgresql.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to seed database" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database seeded successfully" -ForegroundColor Green

# Build the application
Write-Host ""
Write-Host "🏗️ Building application for production..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build application" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Application built successfully" -ForegroundColor Green

# Success message
Write-Host ""
Write-Host "🎉 DEPLOYMENT READY!" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host ""
Write-Host "Your CivicTrack platform is now ready for production deployment!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Start production server: npm start" -ForegroundColor White
Write-Host "2. Or deploy to cloud:" -ForegroundColor White
Write-Host "   - Vercel: vercel --prod" -ForegroundColor White
Write-Host "   - Railway: railway up" -ForegroundColor White
Write-Host "   - Docker: docker build -t civictrack ." -ForegroundColor White
Write-Host ""
Write-Host "🔐 Demo credentials:" -ForegroundColor Yellow
Write-Host "Admin: admin@civictrack.com / password123" -ForegroundColor White
Write-Host "Official: official@nyc.gov / password123" -ForegroundColor White
Write-Host "Worker: maintenance@nyc.gov / password123" -ForegroundColor White
Write-Host "Citizen: john.doe@email.com / password123" -ForegroundColor White
Write-Host ""
Write-Host "📊 Your database now contains:" -ForegroundColor Cyan
Write-Host "- 7 users with verified accounts" -ForegroundColor White
Write-Host "- 9 realistic civic issues" -ForegroundColor White
Write-Host "- 4 active departments" -ForegroundColor White
Write-Host "- Complete analytics and engagement data" -ForegroundColor White
