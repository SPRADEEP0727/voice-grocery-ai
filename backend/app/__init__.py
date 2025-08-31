from flask import Flask
from flask_cors import CORS
import os

app = Flask(__name__)

# CORS configuration for production and development
if os.getenv('VERCEL_ENV') == 'production':
    # Production CORS - update these URLs after deployment
    CORS(app, origins=[
        'https://your-frontend-domain.vercel.app',  # Update this after frontend deployment
        'https://groceries-ai.vercel.app',  # Example domain
        'https://*.vercel.app',  # Allow all Vercel subdomains
        'file://',  # Allow local file testing
        '*'  # Temporary: allow all origins for testing
else:
    # Development CORS - allow localhost
    CORS(app, origins=[
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:4173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:4173'
    ])

from app import routes
