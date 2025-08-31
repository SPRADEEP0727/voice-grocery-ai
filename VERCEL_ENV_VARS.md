# Environment Variables for Vercel Deployment

## Backend Environment Variables (Copy these to Vercel Dashboard):

```
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
```

## Frontend Environment Variables (Copy these to Vercel Dashboard):

```
VITE_SUPABASE_PROJECT_ID=ctjjydfzlickiglhfbvv
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0amp5ZGZ6bGlja2lnbGhmYnZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDYyNTcsImV4cCI6MjA3MjEyMjI1N30.6hn93NsXLsI2-X1VpXalOOEGyzpMQRdp3Sgi4tDUoT8
VITE_SUPABASE_URL=https://ctjjydfzlickiglhfbvv.supabase.co
VITE_RAZORPAY_KEY=rzp_test_RBkdVA1TD9wkf5
VITE_API_URL=REPLACE_WITH_YOUR_BACKEND_URL
```

## Deployment Steps Summary:

### 1. Push to GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy Backend First:
- Go to https://vercel.com/new
- Import your GitHub repo
- Set Root Directory: `backend`
- Add environment variables above
- Deploy

### 3. Deploy Frontend:
- Create new project in Vercel
- Import same GitHub repo  
- Set Root Directory: `frontend`
- Set Framework: Vite
- Add environment variables above (update VITE_API_URL with backend URL)
- Deploy

### 4. Update CORS:
- After frontend deployment, update backend CORS origins
- Redeploy backend

## Quick Checklist:
- [ ] Code pushed to GitHub
- [ ] Backend deployed on Vercel
- [ ] Frontend deployed on Vercel  
- [ ] Environment variables configured
- [ ] CORS updated with frontend URL
- [ ] Test all features work
