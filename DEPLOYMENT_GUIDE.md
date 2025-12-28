# Vercel Deployment Guide

This guide will help you prepare and deploy your Farmers Marketplace app to Vercel.

## ⚠️ Prerequisites

Before deploying, you **MUST** complete the following migrations:

1. **Migrate from SQLite to a cloud database** (Vercel Postgres, PlanetScale, Supabase, etc.)
2. **Migrate file uploads to cloud storage** (Vercel Blob, AWS S3, Cloudinary, etc.)

See `VERCEL_DEPLOYMENT_ASSESSMENT.md` for detailed information.

---

## Step 1: Database Migration

### Option A: Vercel Postgres (Recommended)

1. **Create Vercel Postgres Database:**
   - Go to your Vercel dashboard
   - Navigate to Storage → Create Database → Postgres
   - Note the connection string

2. **Update Database Configuration:**

   Update `server/config/db.js`:
   ```javascript
   const { Sequelize } = require('sequelize');
   require('dotenv').config();

   let sequelize;

   if (process.env.DATABASE_URL) {
     // Production (Vercel Postgres)
     sequelize = new Sequelize(process.env.DATABASE_URL, {
       dialect: 'postgres',
       dialectOptions: {
         ssl: {
           require: true,
           rejectUnauthorized: false
         }
       },
       logging: process.env.NODE_ENV === 'development' ? console.log : false
     });
   } else {
     // Development (SQLite)
     sequelize = new Sequelize({
       dialect: 'sqlite',
       storage: './database.sqlite',
       logging: console.log
     });
   }

   const testConnection = async () => {
     try {
       await sequelize.authenticate();
       console.log('Database connection established successfully.');
     } catch (error) {
       console.error('Unable to connect to the database:', error);
       throw error;
     }
   };

   module.exports = { sequelize, testConnection };
   ```

3. **Update Sequelize Config:**

   Update `server/config/database.js`:
   ```javascript
   require('dotenv').config();

   module.exports = {
     development: {
       dialect: 'sqlite',
       storage: './database.sqlite',
       logging: console.log
     },
     production: {
       use_env_variable: 'DATABASE_URL',
       dialect: 'postgres',
       dialectOptions: {
         ssl: {
           require: true,
           rejectUnauthorized: false
         }
       },
       logging: false
     }
   };
   ```

4. **Run Migrations:**
   ```bash
   cd server
   DATABASE_URL=your_vercel_postgres_url npm run migrate
   ```

### Option B: PlanetScale (MySQL)

Similar process but use MySQL connection string and update dialect to 'mysql'.

---

## Step 2: File Storage Migration

### Option A: Vercel Blob Storage (Recommended)

1. **Install Vercel Blob:**
   ```bash
   cd server
   npm install @vercel/blob
   ```

2. **Update Multer Configuration:**

   Create `server/config/multer-blob.js`:
   ```javascript
   const multer = require('multer');
   const { put } = require('@vercel/blob');
   const path = require('path');

   // Use memory storage for Vercel Blob
   const storage = multer.memoryStorage();

   const fileFilter = (req, file, cb) => {
     if (file.mimetype.startsWith('image/')) {
       cb(null, true);
     } else {
       cb(new Error('Only image files are allowed!'), false);
     }
   };

   const upload = multer({
     storage: storage,
     fileFilter: fileFilter,
     limits: {
       fileSize: 5 * 1024 * 1024, // 5MB
       files: 1
     }
   });

   // Upload to Vercel Blob
   const uploadToBlob = async (file, filename) => {
     const blob = await put(filename, file.buffer, {
       access: 'public',
       contentType: file.mimetype
     });
     return blob.url;
   };

   module.exports = { upload, uploadToBlob };
   ```

3. **Update Product Controller:**

   In `server/controllers/productController.js`, update the `createProduct` function:
   ```javascript
   const { uploadToBlob } = require('../config/multer-blob');
   
   // In createProduct function:
   let image_url = null;
   if (req.file) {
     const filename = `product-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
     image_url = await uploadToBlob(req.file, filename);
   }
   ```

4. **Set Environment Variable:**
   - In Vercel dashboard, add: `BLOB_READ_WRITE_TOKEN` (get from Vercel Blob settings)

### Option B: Cloudinary

1. **Install Cloudinary:**
   ```bash
   npm install cloudinary multer-storage-cloudinary
   ```

2. **Configure Cloudinary** (similar pattern to Vercel Blob)

---

## Step 3: Environment Variables

Set these in your Vercel project dashboard (Settings → Environment Variables):

### Backend Environment Variables:
```
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=production
PORT=5000
DATABASE_URL=your_database_connection_string
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token (if using Vercel Blob)
```

### Frontend Environment Variables:
```
VITE_API_URL=https://your-backend-domain.vercel.app/api
VITE_NODE_ENV=production
```

---

## Step 4: Update CORS Configuration

Ensure `server/server.js` has proper CORS configuration for production:

```javascript
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
  : ['http://localhost:3000', 'http://localhost:5173'];
```

---

## Step 5: Deploy Backend

**Option A: Deploy as Separate Projects (Recommended for Monorepo)**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy Backend:**
   ```bash
   cd server
   vercel
   ```
   - When prompted, select "Create a new project"
   - Project name: `farmers-app-backend` (or your choice)
   - Root directory: `./` (current directory)
   - Override settings: No

4. **Note the deployment URL** (e.g., `https://farmers-app-backend.vercel.app`)

**Option B: Deploy as Single Project (Using vercel.json)**

If you want to deploy both frontend and backend in one project:
- The `vercel.json` in the root will handle routing
- Deploy from root: `vercel`
- This is more complex and may have limitations

---

## Step 6: Deploy Frontend

1. **Update API URL:**

   Create `client/.env.production`:
   ```env
   VITE_API_URL=https://your-backend-domain.vercel.app/api
   ```

2. **Create `client/vercel.json` for frontend:**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite"
   }
   ```

3. **Deploy Frontend:**
   ```bash
   cd client
   vercel
   ```
   - When prompted, select "Create a new project"
   - Project name: `farmers-app-frontend` (or your choice)
   - Root directory: `./` (current directory)
   - Override settings: No

4. **Update Backend CORS:**
   - Go to backend project in Vercel dashboard
   - Settings → Environment Variables
   - Update `ALLOWED_ORIGINS` to include frontend URL:
     ```
     https://farmers-app-frontend.vercel.app
     ```

---

## Step 7: Configure Custom Domains (Optional)

1. In Vercel dashboard, go to your project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

---

## Step 8: Socket.IO Configuration

Socket.IO may need additional configuration on Vercel. Test real-time features after deployment.

If issues occur:
- Consider using Redis adapter for Socket.IO
- Or use alternative real-time solutions (Pusher, Ably, etc.)

---

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Check SSL requirements for your database provider
- Ensure database allows connections from Vercel IPs

### File Upload Issues
- Verify blob storage token is set
- Check file size limits
- Ensure proper CORS headers

### API Not Found (404)
- Verify `vercel.json` routes are correct
- Check that API routes start with `/api/`
- Ensure serverless function is properly configured

### CORS Errors
- Verify `ALLOWED_ORIGINS` includes your frontend URL
- Check that credentials are properly configured
- Ensure frontend uses correct API URL

---

## Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] File uploads working
- [ ] Authentication working
- [ ] API endpoints responding
- [ ] Frontend connecting to backend
- [ ] Real-time features (Socket.IO) working
- [ ] Images loading correctly
- [ ] Environment variables set
- [ ] CORS configured correctly
- [ ] Health check endpoint working

---

## Monitoring

- Use Vercel's built-in analytics
- Monitor function logs in Vercel dashboard
- Set up error tracking (Sentry, etc.)
- Monitor database performance

---

## Cost Considerations

- Vercel Hobby plan: Free for personal projects
- Vercel Postgres: Pay-as-you-go
- Vercel Blob: Generous free tier
- Consider usage limits for production

---

**Need Help?** Check Vercel documentation or the assessment file for more details.

