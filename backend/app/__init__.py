from flask import Flask
from flask_cors import CORS
import os

app = Flask(__name__)

# CORS configuration - allow all origins for testing and production
CORS(app, origins="*")

from app import routes
