# Vercel Deployment - Fixed! ✅

Your application is now configured for Vercel deployment. Here's what was fixed and how to deploy.

## 🔧 What Was Fixed

1. ✅ **Updated `vercel.json`** - Fixed build and install commands for monorepo structure
2. ✅ **Database Configuration** - Now supports cloud databases (PostgreSQL/MySQL) via `DATABASE_URL`
3. ✅ **Root `package.json`** - Added build scripts for Vercel
4. ✅ **Cloud Storage** - Already configured for Cloudinary (images work on Vercel)
5. ✅ **Serverless Function** - API entry point properly configured

## 📋 Pre-Deployment Checklist

### 1. Set Up Cloud Database (Required)

SQLite won't work on Vercel. You need a cloud database:

**Option A: Vercel Postgres (Recommended)**
1. Go to your Vercel project dashboard
2. Navigate to Storage → Create Database → Postgres
3. Copy the connection string

**Option B: Other Cloud Databases**
- **Supabase** (Free tier available): https://supabase.com
- **PlanetScale** (MySQL, free tier): https://planetscale.com
- **Neon** (PostgreSQL, free tier): https://neon.tech
- **Railway** (PostgreSQL): https://railway.app

### 2. Set Up Cloudinary (For Image Storage)

1. Sign up at https://cloudinary.com (free tier available)
2. Get your credentials from the dashboard:
   - Cloud Name
   - API Key
   - API Secret

### 3. Environment Variables

Set these in your Vercel project dashboard (Settings → Environment Variables):

**Required:**
```
JWT_SECRET=your_jwt_secret_key_here_min_32_characters
NODE_ENV=production
```

**For Database (choose one):**
```
# For PostgreSQL (Vercel Postgres, Supabase, Neon, Railway)
DATABASE_URL=postgresql://user:password@host:port/database
DATABASE_DIALECT=postgres
DATABASE_SSL=true

# OR for MySQL (PlanetScale)
DATABASE_URL=mysql://user:password@host:port/database
DATABASE_DIALECT=mysql
DATABASE_SSL=true
```

**For Cloudinary (Image Storage):**
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**For CORS (if frontend is on different domain):**
```
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

## 🚀 Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Import project in Vercel:**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your repository
   - Vercel will auto-detect the configuration

3. **Set environment variables** (see above)

4. **Deploy!**

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy from project root:**
   ```bash
   vercel
   ```

4. **Follow prompts:**
   - Link to existing project or create new
   - Confirm settings
   - Deploy!

5. **For production deployment:**
   ```bash
   vercel --prod
   ```

## 🔄 After Deployment

### 1. Run Database Migrations

After first deployment, you need to run migrations to create tables:

**Option A: Via Vercel CLI (Recommended)**
```bash
vercel env pull .env.local
cd server
npx sequelize-cli db:migrate
```

**Option B: Via Vercel Function**
Create a temporary migration endpoint or use Vercel's CLI to run migrations.

**Option C: Manual Setup**
Connect to your database and run the SQL from your migration files.

### 2. Update Frontend API URL

If deploying frontend separately, update `client/src/utils/api.js` or set environment variable:
```
VITE_API_URL=https://your-backend.vercel.app/api
```

### 3. Test Your Deployment

- Health check: `https://your-app.vercel.app/health`
- API endpoint: `https://your-app.vercel.app/api/products`
- Frontend: `https://your-app.vercel.app`

## 🐛 Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Ensure `installCommand` in `vercel.json` installs both server and client dependencies
- Check that all dependencies are listed in `server/package.json` and `client/package.json`

**Error: "Database connection failed"**
- Verify `DATABASE_URL` is set correctly in Vercel environment variables
- Check database credentials and network access
- Ensure database allows connections from Vercel's IPs

### Runtime Errors

**Error: "JWT_SECRET is required"**
- Set `JWT_SECRET` in Vercel environment variables
- Use a strong, random secret (at least 32 characters)

**Error: "Images not uploading"**
- Verify Cloudinary credentials are set
- Check Vercel function logs for Cloudinary errors

**Error: "Socket.IO not working"**
- Socket.IO is disabled in serverless mode (expected)
- Consider using alternative real-time solutions for production

### Database Issues

**Tables don't exist:**
- Run migrations after deployment (see "After Deployment" section)
- Check database connection string format

**Connection timeout:**
- Verify `DATABASE_SSL=true` for cloud databases
- Check database firewall settings
- Ensure database allows external connections

## 📝 Project Structure

```
Farmers-App/
├── api/
│   └── index.js          # Vercel serverless function entry
├── client/               # Frontend (React + Vite)
│   ├── src/
│   └── package.json
├── server/               # Backend (Express)
│   ├── config/
│   │   ├── db.js         # Database config (supports cloud DBs)
│   │   ├── multer.js     # File upload (memory storage)
│   │   └── cloudStorage.js # Cloudinary integration
│   └── package.json
├── vercel.json           # Vercel configuration
└── package.json          # Root build scripts
```

## ✅ What Works Now

- ✅ Frontend builds and deploys
- ✅ Backend API as serverless function
- ✅ Cloud database support (PostgreSQL/MySQL)
- ✅ Cloud image storage (Cloudinary)
- ✅ Environment variable configuration
- ✅ CORS configuration
- ✅ Health check endpoint

## ⚠️ Known Limitations

1. **Socket.IO**: Disabled in serverless mode (real-time features won't work)
2. **SQLite**: Not supported on Vercel (use cloud database)
3. **Local File Storage**: Not supported (use cloud storage)

## 🎉 You're Ready!

Your app is now configured for Vercel deployment. Follow the steps above to deploy!

For issues, check:
- Vercel deployment logs
- Function logs in Vercel dashboard
- Environment variables are set correctly

