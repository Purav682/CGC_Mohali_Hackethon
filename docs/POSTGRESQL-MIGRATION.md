# 🚀 PostgreSQL Production Migration Guide

## 📋 **Step-by-Step PostgreSQL Setup**

### **1. Install PostgreSQL Database**

#### **Option A: Local PostgreSQL Installation**
```bash
# Windows (using Chocolatey)
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/
```

#### **Option B: Cloud PostgreSQL (Recommended)**
- **Railway**: https://railway.app (Free tier available)
- **Supabase**: https://supabase.com (Free tier with 2 projects)
- **PlanetScale**: https://planetscale.com (MySQL alternative)
- **AWS RDS**: https://aws.amazon.com/rds/
- **Google Cloud SQL**: https://cloud.google.com/sql
- **Azure Database**: https://azure.microsoft.com/en-us/services/postgresql/

### **2. Create Production Database**

#### **For Railway (Recommended for small projects):**
1. Sign up at https://railway.app
2. Create new project → Add PostgreSQL
3. Copy the connection string from DATABASE_URL

#### **For Supabase (Recommended for full-stack):**
1. Sign up at https://supabase.com
2. Create new project
3. Go to Settings → Database → Connection string
4. Copy the PostgreSQL connection string

#### **For Local Setup:**
```bash
# Create database
createdb civictrack_production

# Create user (optional)
psql -c "CREATE USER civictrack WITH PASSWORD 'your_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE civictrack_production TO civictrack;"
```

### **3. Update Package Dependencies**

Add PostgreSQL driver to your project:
```bash
npm install pg @types/pg
```

### **4. Update Prisma Schema**

The schema file needs to be updated to use PostgreSQL instead of SQLite:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### **5. Environment Configuration**

Create `.env.production` file with your PostgreSQL connection:
```bash
DATABASE_URL="postgresql://username:password@host:5432/database_name"
```

### **6. Database Migration Commands**

```bash
# Install dependencies
npm install

# Generate Prisma client for PostgreSQL
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init_postgresql

# Or for production deployment
npx prisma migrate deploy

# Seed the database with sample data
npx prisma db seed
```

### **7. Data Migration (if needed)**

If you want to transfer your existing SQLite data to PostgreSQL:

```bash
# Export current data
npx prisma db pull
npx prisma db push --force-reset

# Or use the data migration script
node scripts/migrate-to-postgresql.js
```

---

## 🌐 **Production Deployment Options**

### **Option 1: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment variables will be set in Vercel dashboard
```

### **Option 2: Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy
```

### **Option 3: Docker Deployment**
```bash
# Build Docker image
docker build -t civictrack .

# Run with environment variables
docker run -p 3000:3000 --env-file .env.production civictrack
```

### **Option 4: Traditional VPS**
```bash
# Build application
npm run build

# Start production server
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start ecosystem.config.js
```

---

## ⚡ **Quick Start with Railway (5 minutes)**

1. **Create Railway Account**: https://railway.app
2. **Create New Project** → Add PostgreSQL service
3. **Copy DATABASE_URL** from PostgreSQL service
4. **Update your .env.production**:
   ```bash
   DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"
   ```
5. **Deploy your app**:
   ```bash
   # Connect to Railway
   railway login
   railway link

   # Deploy
   railway up
   ```

---

## 🔧 **Environment Variables Checklist**

Create these files with appropriate values:

### **.env.production**
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `NEXTAUTH_SECRET` - Random secret for JWT signing
- ✅ `NEXTAUTH_URL` - Your production domain

### **Optional Production Variables**
- `EMAIL_SERVER` - SMTP server for notifications
- `GOOGLE_MAPS_API_KEY` - For enhanced mapping
- `AWS_S3_BUCKET` - For file uploads
- `SENTRY_DSN` - For error monitoring

---

## 🛡️ **Security Checklist**

- ✅ Use strong database passwords
- ✅ Enable SSL for database connections
- ✅ Set secure NEXTAUTH_SECRET (32+ characters)
- ✅ Use environment variables for all secrets
- ✅ Enable CORS properly for your domain
- ✅ Set up database backups
- ✅ Monitor database connections and performance

---

## 📊 **Post-Deployment Verification**

After deployment, verify everything works:

```bash
# Test database connection
npx prisma db pull

# Check if all tables exist
npx prisma studio

# Test API endpoints
curl https://your-domain.com/api/issues
curl https://your-domain.com/api/dashboard
```

---

## 🚨 **Common Issues & Solutions**

### **Connection Issues**
```bash
# Check if DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

### **Migration Issues**
```bash
# Reset and re-create database
npx prisma migrate reset
npx prisma migrate deploy
```

### **SSL Issues**
Add `?sslmode=require` to your DATABASE_URL if required by your provider.

---

## 🎯 **Production Ready!**

Once you complete these steps, your CivicTrack platform will be running on a production-grade PostgreSQL database with all the enterprise features intact!
