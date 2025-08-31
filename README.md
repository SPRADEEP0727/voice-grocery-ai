# 🛒 Groceries AI - Voice-Based Grocery List Builder

A modern SaaS application that uses AI and voice recognition to help users create and organize grocery lists efficiently.

## ✨ Features

- 🎤 **Voice Input**: Speak your grocery items naturally
- 🤖 **AI Categorization**: Smart categorization using AutoGen and OpenAI
- 📱 **Modern UI**: Clean, responsive React interface built with Vite + TypeScript
- 💳 **Razorpay Payments**: Subscription-based monetization (₹499/month)
- 👤 **User Authentication**: Secure login with Supabase
- 📊 **Grocery History**: Save and manage multiple grocery lists
- 🏪 **Store Categories**: Items organized by store sections

## 🏗️ Tech Stack

### Frontend (`/frontend`)
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** + **Shadcn/ui** for styling
- **Supabase** for authentication
- **Speech Recognition API** for voice input
- **Razorpay** for payments

### Backend (`/backend`)
- **Flask** Python web framework
- **AutoGen** for AI agent orchestration
- **OpenAI GPT-3.5-turbo** for intelligent categorization
- **Flask-CORS** for cross-origin requests

## 📝 API Endpoints

- `GET /health` - Health check
- `POST /grocery-list` - AI categorization of grocery items
- `POST /recipe-groceries` - Get ingredients from recipe text

## � Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
python run.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Deployment

This project is configured for **Vercel** deployment:

### Backend (Vercel)
```bash
cd backend
vercel
```

### Frontend (Vercel)  
```bash
cd frontend
vercel
```

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## 📋 Environment Variables

### Backend (`backend/.env`)
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Frontend (`frontend/.env`)
```
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
VITE_SUPABASE_URL=your_supabase_url
VITE_RAZORPAY_KEY=your_razorpay_test_key
VITE_API_URL=http://localhost:5000
```

## 🎯 Key Features

### Voice Recognition
- Natural language processing: "I need milk, eggs, and bananas"
- Browser Speech Recognition API
- Multi-item parsing from single speech input

### AI Categorization
- **Dairy & Eggs**: milk, cheese, yogurt
- **Meat & Seafood**: chicken, fish, mutton
- **Fruits & Vegetables**: apples, onions, tomatoes  
- **Spices & Masala**: turmeric, chili powder, garam masala
- **Pantry & Staples**: rice, flour, oil

### Subscription Model
- **Free Trial**: 7 days full access
- **Monthly Plan**: ₹499/month  
- **Yearly Plan**: ₹4999/year (17% savings)
- **Payment Methods**: UPI, Cards, Net Banking, Wallets

---

Built with ❤️ using React, Flask, and OpenAI
