@echo off
echo Deploying Groceries AI Backend to Vercel...
cd backend

echo Setting up environment variables...
vercel env add OPENAI_API_KEY
echo Environment variables set.

echo Deploying to production...
vercel --prod

echo Backend deployment complete!
echo Please note the backend URL for frontend configuration.
pause
