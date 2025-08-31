from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from common.agent import organize_groceries, suggest_groceries_for_recipe
except ImportError:
    # Fallback if import fails
    def organize_groceries(items):
        return {"test": items}
    
    def suggest_groceries_for_recipe(recipe):
        return {"ingredients": []}

app = Flask(__name__)
CORS(app, origins="*")

@app.route('/', methods=['GET'])
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Voice-Based Grocery List Builder API is running',
        'version': '1.0.0'
    })

@app.route('/grocery-list', methods=['POST'])
def grocery_list():
    try:
        data = request.json
        items = data.get('items', [])
        organized = organize_groceries(items)
        return jsonify({'organized_list': organized})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recipe-groceries', methods=['POST'])
def recipe_groceries():
    try:
        data = request.json
        recipe = data.get('recipe', '')
        groceries = suggest_groceries_for_recipe(recipe)
        return jsonify({'groceries': groceries})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Required for Vercel
app = app
