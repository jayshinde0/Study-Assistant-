# EduHub - Complete Deployment Guide

## Overview
This guide covers deploying EduHub (frontend + backend) to production using popular platforms.

---

## Prerequisites

Before deploying, ensure you have:
- Git repository set up
- Node.js 18+ installed locally
- MongoDB Atlas account (or self-hosted MongoDB)
- API keys ready (Gemini, HuggingFace, YouTube)
- Environment variables configured

---

## Option 1: Deploy to Vercel + Railway (Recommended for Beginners)

### Frontend Deployment (Vercel)

**Step 1: Prepare Frontend**
```bash
cd frontend
npm install
npm run build
```

**Step 2: Deploy to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Select your repository
5. Configure:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```
7. Click "Deploy"

**Step 3: Update API Client**
In `frontend/src/api/client.js`, ensure it uses the environment variable:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

### Backend Deployment (Railway)

**Step 1: Prepare Backend**
```bash
cd backend
npm install
```

**Step 2: Create Procfile**
Create `backend/Procfile`:
```
web: node src/index.js
```

**Step 3: Deploy to Railway**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Add Environment Variables in Railway dashboard:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_key
   HUGGINGFACE_API_KEY=your_huggingface_key
   YOUTUBE_API_KEY=your_youtube_key
   NODE_ENV=production
   ```
7. Railway auto-deploys on push

**Step 4: Update Frontend API URL**
After Railway deployment, update Vercel environment variable with your Railway backend URL.

---

## Option 2: Deploy to Heroku + Netlify

### Frontend Deployment (Netlify)

**Step 1: Connect Repository**
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect GitHub
4. Select repository
5. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `frontend`

**Step 2: Add Environment Variables**
In Netlify dashboard → Site settings → Build & deploy → Environment:
```
VITE_API_URL=https://your-heroku-backend.herokuapp.com
```

**Step 3: Deploy**
Netlify auto-deploys on push to main branch

### Backend Deployment (Heroku)

**Step 1: Install Heroku CLI**
```bash
npm install -g heroku
heroku login
```

**Step 2: Create Heroku App**
```bash
cd backend
heroku create your-app-name
```

**Step 3: Add Environment Variables**
```bash
heroku config:set PORT=5000
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret
heroku config:set GEMINI_API_KEY=your_key
heroku config:set HUGGINGFACE_API_KEY=your_key
heroku config:set YOUTUBE_API_KEY=your_key
heroku config:set NODE_ENV=production
```

**Step 4: Deploy**
```bash
git push heroku main
```

---

## Option 3: Deploy to AWS (EC2 + S3)

### Frontend Deployment (S3 + CloudFront)

**Step 1: Build Frontend**
```bash
cd frontend
npm run build
```

**Step 2: Create S3 Bucket**
1. Go to AWS S3
2. Create bucket: `eduhub-frontend`
3. Enable static website hosting
4. Upload `dist` folder contents

**Step 3: Setup CloudFront**
1. Create CloudFront distribution
2. Point to S3 bucket
3. Set default root object to `index.html`
4. Add error handling for SPA routing

**Step 4: Update API URL**
Set environment variable in build process pointing to your backend

### Backend Deployment (EC2)

**Step 1: Launch EC2 Instance**
- AMI: Ubuntu 22.04 LTS
- Instance type: t3.micro (free tier) or t3.small
- Security group: Allow ports 80, 443, 5000

**Step 2: SSH into Instance**
```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

**Step 3: Install Dependencies**
```bash
sudo apt update
sudo apt install nodejs npm git
```

**Step 4: Clone Repository**
```bash
git clone your-repo-url
cd backend
npm install
```

**Step 5: Setup Environment Variables**
```bash
nano .env
# Add all environment variables
```

**Step 6: Install PM2 (Process Manager)**
```bash
sudo npm install -g pm2
pm2 start src/index.js --name "eduhub-backend"
pm2 startup
pm2 save
```

**Step 7: Setup Nginx Reverse Proxy**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/default
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Step 8: Enable SSL (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Option 4: Docker Deployment (Any Cloud)

### Create Docker Files

**backend/Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "src/index.js"]
```

**frontend/Dockerfile**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**frontend/nginx.conf**
```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
```

**docker-compose.yml** (root directory)
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - NODE_ENV=production
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://backend:5000

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

**Deploy with Docker:**
```bash
docker-compose up -d
```

---

## Option 5: Deploy to DigitalOcean App Platform

**Step 1: Connect Repository**
1. Go to DigitalOcean
2. Create new App
3. Connect GitHub repository
4. Select branch to deploy

**Step 2: Configure Services**
- Add backend service (Node.js)
- Add frontend service (Static site)
- Add MongoDB (managed database)

**Step 3: Set Environment Variables**
In App Platform dashboard, add all required env vars

**Step 4: Deploy**
DigitalOcean auto-deploys on push

---

## Environment Variables Checklist

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-secret-key-min-32-chars
GEMINI_API_KEY=your-gemini-api-key
HUGGINGFACE_API_KEY=your-huggingface-key
YOUTUBE_API_KEY=your-youtube-key
NODE_ENV=production
```

### Frontend (.env or build config)
```
VITE_API_URL=https://your-backend-domain.com
```

---

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] MongoDB connection tested
- [ ] API keys validated
- [ ] Frontend build tested locally (`npm run build`)
- [ ] Backend tested locally (`npm start`)
- [ ] Git repository clean and committed
- [ ] No hardcoded secrets in code
- [ ] CORS configured for production domain
- [ ] SSL/HTTPS enabled
- [ ] Database backups configured
- [ ] Error logging setup
- [ ] Monitoring/alerts configured

---

## Post-Deployment Steps

### 1. Test Endpoints
```bash
# Test backend health
curl https://your-backend-domain.com/health

# Test frontend
Visit https://your-frontend-domain.com
```

### 2. Monitor Logs
- Backend: Check application logs for errors
- Frontend: Check browser console for errors
- Database: Monitor MongoDB Atlas dashboard

### 3. Setup Monitoring
- Use Sentry for error tracking
- Setup uptime monitoring (UptimeRobot)
- Configure email alerts

### 4. Database Backups
- Enable MongoDB Atlas automated backups
- Test restore procedures

### 5. Performance Optimization
- Enable CDN for static assets
- Setup caching headers
- Optimize database indexes

---

## Troubleshooting

### Frontend not connecting to backend
- Check CORS settings in backend
- Verify API URL in frontend environment
- Check browser console for errors

### MongoDB connection fails
- Verify connection string
- Check IP whitelist in MongoDB Atlas
- Ensure database exists

### File uploads not working
- Check upload directory permissions
- Verify multer configuration
- Check file size limits

### Ollama/AI features not working
- Ensure Ollama is running (if self-hosted)
- Check API keys are valid
- Verify API rate limits not exceeded

---

## Scaling Considerations

### For 100+ Users
- Use managed database (MongoDB Atlas)
- Enable caching (Redis)
- Use CDN for static assets
- Setup load balancing

### For 1000+ Users
- Horizontal scaling (multiple backend instances)
- Database replication
- Message queue (Bull/RabbitMQ)
- Separate file storage (S3)

---

## Cost Estimation

| Service | Free Tier | Paid (Monthly) |
|---------|-----------|----------------|
| Vercel Frontend | ✅ | $20+ |
| Railway Backend | ✅ (limited) | $5-50 |
| MongoDB Atlas | ✅ (512MB) | $57+ |
| Netlify Frontend | ✅ | $19+ |
| Heroku Backend | ❌ | $50+ |
| AWS EC2 | ✅ (1 year) | $10-50 |
| DigitalOcean | ❌ | $5-40 |

---

## Recommended Stack for Beginners

**Best Value:**
- Frontend: Vercel (free)
- Backend: Railway (free tier)
- Database: MongoDB Atlas (free tier)
- **Total Cost: $0-10/month**

**Best Performance:**
- Frontend: Netlify (free)
- Backend: DigitalOcean App Platform ($5/month)
- Database: DigitalOcean Managed DB ($15/month)
- **Total Cost: $20/month**

**Enterprise:**
- Frontend: AWS CloudFront + S3
- Backend: AWS EC2 + RDS
- Database: AWS RDS
- **Total Cost: $50-200+/month**

---

## Quick Start Deployment (Vercel + Railway)

```bash
# 1. Build frontend
cd frontend
npm run build

# 2. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 3. Deploy frontend on Vercel
# - Connect GitHub repo
# - Set VITE_API_URL env var
# - Deploy

# 4. Deploy backend on Railway
# - Connect GitHub repo
# - Add environment variables
# - Deploy

# 5. Update Vercel env var with Railway URL
# - Get Railway backend URL
# - Update VITE_API_URL in Vercel
# - Redeploy

# Done! Your app is live 🚀
```

---

## Support & Resources

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [React Deployment](https://vitejs.dev/guide/static-deploy.html)

---

**Last Updated:** February 12, 2026
**Status:** Ready for Production ✅
