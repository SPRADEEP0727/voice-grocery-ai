@echo off
echo Deploying Groceries AI Frontend to Vercel...
cd frontend

echo Setting up environment variables...
echo Please enter your backend URL when prompted for VITE_API_URL

vercel env add VITE_SUPABASE_PROJECT_ID
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY  
vercel env add VITE_SUPABASE_URL
vercel env add VITE_RAZORPAY_KEY
vercel env add VITE_API_URL

echo Environment variables set.

echo Building and deploying to production...
vercel --prod

echo Frontend deployment complete!
pause
