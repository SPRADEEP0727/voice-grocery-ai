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
    # CORS configuration - allow all origins for testing
    CORS(app, origins="*")

from app import routes
