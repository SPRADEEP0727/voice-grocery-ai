from flask import request, jsonify
from app import app
from common.agent import organize_groceries, suggest_groceries_for_recipe

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Voice-Based Grocery List Builder API is running',
        'version': '1.0.0'
    })

@app.route('/grocery-list', methods=['POST'])
def grocery_list():
    data = request.json
    items = data.get('items', [])
    organized = organize_groceries(items)
    return jsonify({'organized_list': organized})

@app.route('/recipe-groceries', methods=['POST'])
def recipe_groceries():
    data = request.json
    recipe = data.get('recipe', '')
    groceries = suggest_groceries_for_recipe(recipe)
    return jsonify({'groceries': groceries})
