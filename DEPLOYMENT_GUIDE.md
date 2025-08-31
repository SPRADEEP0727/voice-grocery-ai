# Vercel Deployment Guide

## Prerequisites
1. GitHub account
2. Vercel account (sign up at https://vercel.com)
3. Push your code to GitHub repository

## Step 1: Push Code to GitHub

First, make sure your code is pushed to a GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit - Voice-based Grocery AI with Razorpay"
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Step 2: Deploy Backend (Flask API)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "New Project"**
3. **Import from GitHub**: Select your repository
4. **Configure Backend Deployment**:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Settings**: Leave default (Vercel will detect Python)
   - **Environment Variables** (Add these):
     ```
     OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
     ```

5. **Deploy**: Click "Deploy"
6. **Note the Backend URL**: Something like `https://your-backend.vercel.app`

## Step 3: Deploy Frontend (React/Vite)

1. **Create Another New Project** in Vercel
2. **Import same GitHub repository**
3. **Configure Frontend Deployment**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables** (Add these):
     ```
     VITE_SUPABASE_PROJECT_ID=ctjjydfzlickiglhfbvv
     VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0amp5ZGZ6bGlja2lnbGhmYnZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDYyNTcsImV4cCI6MjA3MjEyMjI1N30.6hn93NsXLsI2-X1VpXalOOEGyzpMQRdp3Sgi4tDUoT8
     VITE_SUPABASE_URL=https://ctjjydfzlickiglhfbvv.supabase.co
     VITE_RAZORPAY_KEY=rzp_test_RBkdVA1TD9wkf5
     VITE_API_URL=<YOUR_BACKEND_URL_FROM_STEP_2>
     ```

4. **Deploy**: Click "Deploy"

## Step 4: Configure CORS

After both deployments, update the backend CORS settings:

1. **Go to backend deployment**
2. **Update CORS origins in your Flask app** to include your frontend URL
3. **Redeploy backend**

## Step 5: Update Frontend API URL

1. **Get your backend URL** from Vercel dashboard
2. **Update frontend environment variable** `VITE_API_URL` to point to your backend
3. **Redeploy frontend**

## Environment Variables Summary

### Backend Environment Variables:
- `OPENAI_API_KEY`: Your OpenAI API key

### Frontend Environment Variables:
- `VITE_SUPABASE_PROJECT_ID`: ctjjydfzlickiglhfbvv
- `VITE_SUPABASE_PUBLISHABLE_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- `VITE_SUPABASE_URL`: https://ctjjydfzlickiglhfbvv.supabase.co
- `VITE_RAZORPAY_KEY`: rzp_test_RBkdVA1TD9wkf5
- `VITE_API_URL`: Your backend URL from Vercel

## Troubleshooting

### Common Issues:

1. **CORS Error**: Make sure backend CORS is configured to allow your frontend domain
2. **Environment Variables**: Double-check all environment variables are set correctly
3. **Build Errors**: Check build logs in Vercel dashboard
4. **API Connection**: Ensure `VITE_API_URL` points to correct backend URL

### Testing Deployment:

1. **Backend**: Visit `https://your-backend.vercel.app/health` - should return JSON
2. **Frontend**: Visit your frontend URL - should load the app
3. **Voice Input**: Test voice functionality
4. **Payment**: Test Razorpay integration

## Production Checklist:

- [ ] Backend deployed and responding
- [ ] Frontend deployed and loading
- [ ] Environment variables configured
- [ ] CORS properly set up
- [ ] Voice input working
- [ ] AI categorization working
- [ ] Razorpay payments working
- [ ] Custom domains configured (optional)

## Custom Domains (Optional):

1. **Go to Project Settings** in Vercel
2. **Domains Tab**
3. **Add your custom domain**
4. **Configure DNS** as instructed by Vercel
