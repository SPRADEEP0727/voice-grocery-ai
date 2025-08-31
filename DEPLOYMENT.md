# Groceries AI - Vercel Deployment Guide

## Prerequisites
1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`

## Backend Deployment

### 1. Deploy Backend
```bash
cd backend
vercel --prod
```

### 2. Set Environment Variables for Backend
```bash
vercel env add OPENAI_API_KEY
# Enter your OpenAI API key: YOUR_OPENAI_API_KEY_HERE
```

## Frontend Deployment

### 1. Set Environment Variables for Frontend
```bash
cd frontend
vercel env add VITE_SUPABASE_PROJECT_ID
# Enter: ctjjydfzlickiglhfbvv

vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0amp5ZGZ6bGlja2lnbGhmYnZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDYyNTcsImV4cCI6MjA3MjEyMjI1N30.6hn93NsXLsI2-X1VpXalOOEGyzpMQRdp3Sgi4tDUoT8

vercel env add VITE_SUPABASE_URL
# Enter: https://ctjjydfzlickiglhfbvv.supabase.co

vercel env add VITE_RAZORPAY_KEY
# Enter: rzp_test_RBkdVA1TD9wkf5

vercel env add VITE_API_URL
# Enter: [YOUR_BACKEND_VERCEL_URL] (you'll get this after backend deployment)
```

### 2. Deploy Frontend
```bash
vercel --prod
```

## Deployment Steps:

### Step 1: Deploy Backend First
```bash
cd d:\my_saas\groceries_ai\backend
vercel --prod
```
Note the backend URL you get (e.g., https://groceries-ai-backend.vercel.app)

### Step 2: Update Frontend API URL
Update the VITE_API_URL environment variable with your backend URL:
```bash
cd d:\my_saas\groceries_ai\frontend
vercel env add VITE_API_URL
# Enter: https://your-backend-url.vercel.app
```

### Step 3: Deploy Frontend
```bash
vercel --prod
```

## Alternative: Deploy via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import from GitHub (if you have a repository)
4. Deploy backend first, then frontend
5. Set environment variables in the dashboard

## Testing Deployment
1. Test backend: `https://your-backend-url.vercel.app/health`
2. Test frontend: Open your frontend URL and try the voice input feature
3. Test Razorpay: Try subscribing to a plan

## Environment Variables Summary

### Backend:
- `OPENAI_API_KEY`: Your OpenAI API key

### Frontend:
- `VITE_SUPABASE_PROJECT_ID`: ctjjydfzlickiglhfbvv
- `VITE_SUPABASE_PUBLISHABLE_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- `VITE_SUPABASE_URL`: https://ctjjydfzlickiglhfbvv.supabase.co
- `VITE_RAZORPAY_KEY`: rzp_test_RBkdVA1TD9wkf5
- `VITE_API_URL`: https://your-backend-url.vercel.app
