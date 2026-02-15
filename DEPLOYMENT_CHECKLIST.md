# EduHub Deployment Checklist

## Quick Deployment in 5 Steps

### Step 1: Prepare Your Code ✅
```bash
# Make sure everything is committed
git status
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Step 2: Deploy Frontend (Vercel) - 5 minutes
- [ ] Go to https://vercel.com
- [ ] Click "New Project"
- [ ] Select your GitHub repository
- [ ] Framework: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Add Environment Variable:
  - Key: `VITE_API_URL`
  - Value: `http://localhost:5000` (will update later)
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] Note your Vercel URL (e.g., `https://eduhub.vercel.app`)

### Step 3: Deploy Backend (Railway) - 5 minutes
- [ ] Go to https://railway.app
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose your repository
- [ ] Railway auto-detects Node.js
- [ ] Add Environment Variables:
  ```
  PORT=5000
  MONGODB_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret_key
  GEMINI_API_KEY=your_gemini_api_key
  HUGGINGFACE_API_KEY=your_huggingface_api_key
  YOUTUBE_API_KEY=your_youtube_api_key
  NODE_ENV=production
  ```
- [ ] Click "Deploy"
- [ ] Wait for deployment
- [ ] Note your Railway URL (e.g., `https://eduhub-backend.railway.app`)

### Step 4: Update Frontend API URL - 2 minutes
- [ ] Go back to Vercel dashboard
- [ ] Select your project
- [ ] Go to Settings → Environment Variables
- [ ] Update `VITE_API_URL` to your Railway backend URL
- [ ] Redeploy (Vercel will auto-redeploy)

### Step 5: Test Your Deployment - 5 minutes
- [ ] Visit your Vercel frontend URL
- [ ] Try to sign up
- [ ] Try to upload a file
- [ ] Try to generate a quiz
- [ ] Check browser console for errors
- [ ] Check backend logs for errors

---

## Deployment Platforms Comparison

| Platform | Frontend | Backend | Database | Cost | Ease |
|----------|----------|---------|----------|------|------|
| **Vercel + Railway** | ✅ | ✅ | ✅ | Free | ⭐⭐⭐⭐⭐ |
| Netlify + Heroku | ✅ | ✅ | ✅ | $50+ | ⭐⭐⭐⭐ |
| AWS | ✅ | ✅ | ✅ | $50+ | ⭐⭐⭐ |
| DigitalOcean | ✅ | ✅ | ✅ | $20+ | ⭐⭐⭐⭐ |
| Docker | ✅ | ✅ | ✅ | Varies | ⭐⭐⭐ |

---

## Environment Variables You Need

### From Your Current .env File
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

### For Production
- [ ] Change `JWT_SECRET` to a new random string (min 32 chars)
- [ ] Keep API keys same (or generate new ones if needed)
- [ ] Set `NODE_ENV=production`

---

## Common Issues & Solutions

### Issue: Frontend can't connect to backend
**Solution:**
1. Check CORS in backend (`backend/src/index.js`)
2. Verify API URL in Vercel environment variables
3. Check browser console for exact error

### Issue: File uploads not working
**Solution:**
1. Check upload directory exists on backend
2. Verify file size limits
3. Check multer configuration

### Issue: Database connection fails
**Solution:**
1. Verify MongoDB URI is correct
2. Check IP whitelist in MongoDB Atlas
3. Ensure database exists

### Issue: Ollama/AI features not working
**Solution:**
1. If using Ollama, ensure it's running
2. Check API keys are valid
3. Verify API rate limits

---

## After Deployment

### Monitor Your App
- [ ] Setup error tracking (Sentry)
- [ ] Setup uptime monitoring (UptimeRobot)
- [ ] Monitor database usage
- [ ] Check application logs daily

### Optimize Performance
- [ ] Enable caching
- [ ] Optimize database queries
- [ ] Setup CDN for static assets
- [ ] Monitor response times

### Security
- [ ] Enable HTTPS (auto on Vercel/Railway)
- [ ] Setup rate limiting
- [ ] Regular security updates
- [ ] Backup database regularly

### Scaling
- [ ] Monitor user growth
- [ ] Plan for horizontal scaling
- [ ] Setup load balancing if needed
- [ ] Optimize database indexes

---

## Deployment URLs After Setup

Once deployed, you'll have:
- **Frontend:** `https://your-project.vercel.app`
- **Backend:** `https://your-project.railway.app`
- **Database:** MongoDB Atlas (cloud)

---

## Rollback Procedure

If something goes wrong:

**Vercel:**
1. Go to Deployments
2. Click on previous deployment
3. Click "Redeploy"

**Railway:**
1. Go to Deployments
2. Select previous deployment
3. Click "Redeploy"

---

## Cost Breakdown (Monthly)

| Service | Free Tier | Paid |
|---------|-----------|------|
| Vercel | ✅ Unlimited | $20+ |
| Railway | ✅ $5 credit | $5-50 |
| MongoDB Atlas | ✅ 512MB | $57+ |
| **Total** | **$0** | **$20-100+** |

---

## Next Steps After Deployment

1. **Setup Custom Domain**
   - Buy domain (Namecheap, GoDaddy)
   - Point to Vercel/Railway
   - Enable SSL

2. **Setup Email Notifications**
   - Configure email service
   - Setup password reset emails
   - Setup notification emails

3. **Setup Analytics**
   - Google Analytics
   - Sentry for errors
   - Custom dashboards

4. **Setup Backups**
   - MongoDB automated backups
   - Database snapshots
   - Code repository backups

5. **Setup CI/CD**
   - Automated tests on push
   - Automated deployments
   - Staging environment

---

## Support

- **Vercel Support:** https://vercel.com/support
- **Railway Support:** https://railway.app/support
- **MongoDB Support:** https://www.mongodb.com/support
- **GitHub Issues:** Create issue in your repo

---

## Deployment Status

- [ ] Frontend deployed
- [ ] Backend deployed
- [ ] Database connected
- [ ] Environment variables set
- [ ] API connection working
- [ ] File uploads working
- [ ] Authentication working
- [ ] AI features working
- [ ] Analytics working
- [ ] Custom domain setup (optional)

---

**Estimated Time:** 20-30 minutes
**Difficulty:** Easy ⭐⭐
**Cost:** Free (with free tiers)

**You're ready to deploy! 🚀**
