# Deploy Frontend to Vercel

## Why Vercel Solves Camera Issue
✅ Vercel provides automatic HTTPS
✅ Camera will work without any configuration
✅ No need for SSL certificates or Chrome flags

## Deployment Steps

### 1. Prepare Environment Variables
Create `.env.production` in frontend folder:
```env
VITE_BIOSTAR_URL=https://your-backend-url.com
```

### 2. Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

**Option B: Using Vercel Dashboard**
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Set Root Directory: `frontend`
5. Add Environment Variable:
   - Name: `VITE_BIOSTAR_URL`
   - Value: `https://your-backend-url.com`
6. Click "Deploy"

### 3. Update Backend CORS

Add Vercel domain to backend CORS:
```javascript
// backend/server.js
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-app.vercel.app'  // Add this
  ]
}));
```

### 4. Test Camera Access
1. Open: `https://your-app.vercel.app`
2. Camera will work automatically ✅

## Backend Deployment Options

### Option 1: Railway
```bash
cd backend
railway login
railway init
railway up
```

### Option 2: Render
1. Go to https://render.com
2. New Web Service
3. Connect repository
4. Root Directory: `backend`
5. Build: `npm install`
6. Start: `npm start`

### Option 3: AWS EC2 + PM2
```bash
# On EC2 instance
git clone your-repo
cd backend
npm install
pm2 start server.js
pm2 save
```

## Final Configuration

Update `.env.production`:
```env
VITE_BIOSTAR_URL=https://your-backend.railway.app
```

Redeploy frontend:
```bash
vercel --prod
```

✅ **Done! Camera will work on any device accessing your Vercel URL**
