# EduHub - Quick Deploy Commands

## 🚀 Fastest Way to Deploy (Vercel + Railway)

### Prerequisites
- GitHub account
- Vercel account (free)
- Railway account (free)
- MongoDB Atlas account (free)

---

## Step 1: Prepare Code (2 minutes)

```bash
# Navigate to project root
cd /path/to/eduhub

# Ensure everything is committed
git status
git add .
git commit -m "Ready for production"
git push origin main
```

---

## Step 2: Deploy Frontend to Vercel (5 minutes)

### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend directory
cd frontend
vercel --prod

# Follow prompts:
# - Link to existing project? No
# - Project name: eduhub
# - Framework: Vite
# - Build command: npm run build
# - Output directory: dist
```

### Option B: Using Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select `frontend` as root directory
4. Click Deploy

**After deployment:**
- Note your Vercel URL (e.g., `https://eduhub.vercel.app`)
- Add environment variable:
  - Key: `VITE_API_URL`
  - Value: `http://localhost:5000` (temporary)

---

## Step 3: Deploy Backend to Railway (5 minutes)

### Using Railway CLI
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Navigate to backend
cd backend

# Create new project
railway init

# Add environment variables
railway variables set PORT=5000
railway variables set MONGODB_URI="your_mongodb_uri"
railway variables set JWT_SECRET="your_jwt_secret"
railway variables set GEMINI_API_KEY="your_gemini_key"
railway variables set HUGGINGFACE_API_KEY="your_huggingface_key"
railway variables set YOUTUBE_API_KEY="your_youtube_key"
railway variables set NODE_ENV=production

# Deploy
railway up
```

### Using Railway Dashboard
1. Go to https://railway.app/new
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Add environment variables in dashboard
5. Railway auto-deploys

**After deployment:**
- Note your Railway URL (e.g., `https://eduhub-backend.railway.app`)

---

## Step 4: Connect Frontend to Backend (2 minutes)

```bash
# Update Vercel environment variable
vercel env add VITE_API_URL

# Enter your Railway backend URL when prompted
# Example: https://eduhub-backend.railway.app

# Redeploy frontend
vercel --prod
```

---

## Step 5: Test Deployment (5 minutes)

```bash
# Test frontend
curl https://your-vercel-url.vercel.app

# Test backend
curl https://your-railway-url.railway.app/health

# Test API connection
# Visit frontend and try:
# 1. Sign up
# 2. Upload a file
# 3. Generate a quiz
```

---

## Environment Variables Template

Create a `.env.production` file with:

```env
# Backend
PORT=5000
MONGODB_URI=mongodb+srv://jayshinde4554_db_user:wEFbEZXBPz6ilqV1@cluster0.efzwxt3.mongodb.net/study-assistant?retryWrites=true&w=majority
JWT_SECRET=your-new-secret-key-min-32-chars
GEMINI_API_KEY=your_gemini_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key
YOUTUBE_API_KEY=your_youtube_api_key
NODE_ENV=production

# Frontend
VITE_API_URL=https://your-railway-backend.railway.app
```

---

## Verify Deployment

### Check Frontend
```bash
# Should return HTML
curl https://your-vercel-url.vercel.app

# Check in browser
# Should see EduHub homepage
```

### Check Backend
```bash
# Should return JSON
curl https://your-railway-url.railway.app/health

# Check logs
railway logs
```

### Check Database
```bash
# Login to MongoDB Atlas
# Check connection status
# Verify collections exist
```

---

## Troubleshooting Commands

### View Logs
```bash
# Vercel logs
vercel logs

# Railway logs
railway logs

# MongoDB logs
# Check MongoDB Atlas dashboard
```

### Redeploy
```bash
# Vercel
vercel --prod

# Railway
railway up
```

### Check Environment Variables
```bash
# Vercel
vercel env list

# Railway
railway variables list
```

### Clear Cache
```bash
# Vercel
vercel env pull

# Railway
railway variables pull
```

---

## Alternative: Docker Deployment

### Build Docker Images
```bash
# Build backend
docker build -t eduhub-backend ./backend

# Build frontend
docker build -t eduhub-frontend ./frontend

# Run with docker-compose
docker-compose up -d
```

### Deploy to Docker Hub
```bash
# Login to Docker Hub
docker login

# Tag images
docker tag eduhub-backend your-username/eduhub-backend
docker tag eduhub-frontend your-username/eduhub-frontend

# Push to Docker Hub
docker push your-username/eduhub-backend
docker push your-username/eduhub-frontend

# Deploy on any cloud with Docker support
# (AWS ECS, DigitalOcean, etc.)
```

---

## Alternative: AWS Deployment

### Deploy Frontend to S3 + CloudFront
```bash
# Build frontend
cd frontend
npm run build

# Create S3 bucket
aws s3 mb s3://eduhub-frontend

# Upload build
aws s3 sync dist/ s3://eduhub-frontend

# Create CloudFront distribution
# (Use AWS Console)
```

### Deploy Backend to EC2
```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-instance-ip

# Clone repo
git clone your-repo-url
cd backend

# Install dependencies
npm install

# Start with PM2
pm2 start src/index.js --name eduhub
pm2 startup
pm2 save
```

---

## Alternative: DigitalOcean Deployment

### Using DigitalOcean App Platform
```bash
# Create app.yaml in root directory
# Configure services
# Push to GitHub
# DigitalOcean auto-deploys

# Or use CLI
doctl apps create --spec app.yaml
```

---

## Monitoring After Deployment

### Setup Error Tracking
```bash
# Install Sentry
npm install @sentry/react @sentry/node

# Initialize in code
# Check Sentry dashboard for errors
```

### Setup Uptime Monitoring
```bash
# Go to UptimeRobot.com
# Add monitoring for:
# - Frontend URL
# - Backend URL
# - Database connection
```

### View Logs
```bash
# Vercel
vercel logs --follow

# Railway
railway logs --follow

# Docker
docker logs -f container-name
```

---

## Rollback to Previous Version

### Vercel
```bash
# List deployments
vercel list

# Rollback to previous
vercel rollback
```

### Railway
```bash
# List deployments
railway deployments

# Rollback
railway rollback <deployment-id>
```

---

## Update After Deployment

### Push Updates
```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Auto-deploys on Vercel & Railway
# Check deployment status in dashboards
```

### Manual Redeploy
```bash
# Vercel
vercel --prod

# Railway
railway up
```

---

## Cost Check

```bash
# Vercel
vercel billing

# Railway
railway billing

# MongoDB Atlas
# Check MongoDB Atlas dashboard
```

---

## Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Railway Dashboard: https://railway.app/dashboard
- MongoDB Atlas: https://cloud.mongodb.com
- GitHub: https://github.com

---

## Success Checklist

- [ ] Frontend deployed on Vercel
- [ ] Backend deployed on Railway
- [ ] Environment variables set
- [ ] Frontend can reach backend
- [ ] Sign up works
- [ ] File upload works
- [ ] Quiz generation works
- [ ] Analytics displays
- [ ] No errors in console
- [ ] No errors in logs

---

## Total Time: ~20 minutes
## Total Cost: $0 (free tier)
## Difficulty: Easy ⭐⭐

**Your app is now live! 🚀**

---

## Need Help?

- Check logs: `vercel logs` or `railway logs`
- Check environment variables are set
- Verify API URL is correct
- Check MongoDB connection
- Review error messages in browser console
- Check backend logs for API errors

**Common Issues:**
- CORS error → Check backend CORS config
- API not found → Check API URL in frontend
- Database error → Check MongoDB URI
- File upload fails → Check upload directory
- AI features fail → Check API keys

---

**Last Updated:** February 12, 2026
**Status:** Production Ready ✅
