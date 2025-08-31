
import autogen
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure autogen with OpenAI API key
config_list = [
    {
        "model": "gpt-3.5-turbo",
        "api_key": os.getenv("OPENAI_API_KEY"),
        "base_url": "https://api.openai.com/v1"
    }
]

def organize_groceries(items):
    """Organize grocery items by store categories using autogen agent"""
    try:
        # Create user proxy agent
        user_proxy = autogen.UserProxyAgent(
            name="user_proxy",
            human_input_mode="NEVER",
            max_consecutive_auto_reply=1,
            code_execution_config=False,
        )
        
        # Create grocery categorizer agent
        grocery_categorizer = autogen.AssistantAgent(
            name="grocery_categorizer",
            llm_config={"config_list": config_list, "temperature": 0},
            system_message="""You are an expert grocery categorization system. Your task is to:

1. Categorize grocery items into appropriate store sections
2. Use standard grocery store categories like: dairy, meat, vegetables, fruits, spices, bakery, grains, frozen, beverages, snacks, cleaning, personal_care, etc.
3. Return ONLY a valid JSON object with categories as keys and arrays of items as values
4. Do not include any explanatory text, only the JSON response
5. Group similar items together intelligently

Example format:
{
  "dairy": ["milk", "cheese"],
  "meat": ["chicken", "beef"],
  "spices": ["chilli powder", "turmeric"],
  "vegetables": ["onion", "tomato"]
}"""
        )
        
        prompt = f"Categorize these grocery items: {items}. Return only valid JSON with categories and items."
        
        # Start the conversation
        chat_result = user_proxy.initiate_chat(
            grocery_categorizer,
            message=prompt,
            max_turns=1,
            silent=True
        )
        
        # Extract the last message from the agent
        last_message = chat_result.chat_history[-1]['content']
        
        # Try to parse JSON from the response
        try:
            # Clean the response - remove any non-JSON text
            json_start = last_message.find('{')
            json_end = last_message.rfind('}') + 1
            if json_start != -1 and json_end != 0:
                json_str = last_message[json_start:json_end]
                categorized_items = json.loads(json_str)
                return categorized_items
            else:
                return {"error": "Could not parse categorization response"}
        except json.JSONDecodeError:
            return {"error": "Invalid JSON response from agent", "raw_response": last_message}
            
    except Exception as e:
        return {"error": f"Agent processing failed: {str(e)}"}

def suggest_groceries_for_recipe(recipe):
    """Suggest groceries for a recipe using autogen agent"""
    try:
        # Create user proxy agent
        user_proxy = autogen.UserProxyAgent(
            name="user_proxy",
            human_input_mode="NEVER",
            max_consecutive_auto_reply=1,
            code_execution_config=False,
        )
        
        # Create recipe analyzer agent
        recipe_analyzer = autogen.AssistantAgent(
            name="recipe_analyzer",
            llm_config={"config_list": config_list, "temperature": 0},
            system_message="""You are an expert recipe analyzer and grocery list generator. Your task is to:

1. Analyze the given recipe and extract ALL required ingredients
2. Include specific quantities and measurements where possible
3. Consider common pantry items that might be needed (oils, salt, basic spices)
4. Categorize each ingredient into appropriate grocery store sections
5. Return ONLY a valid JSON object with the specified format
6. Do not include any explanatory text, only the JSON response

Example format:
{
  "ingredients": [
    {"item": "chicken breast", "quantity": "500g", "category": "meat"},
    {"item": "onion", "quantity": "2 large", "category": "vegetables"},
    {"item": "tomato", "quantity": "3 medium", "category": "vegetables"},
    {"item": "garam masala", "quantity": "1 tsp", "category": "spices"}
  ]
}"""
        )
        
        prompt = f"Analyze this recipe and provide a complete grocery list with quantities and categories: {recipe}. Return only valid JSON."
        
        # Start the conversation
        chat_result = user_proxy.initiate_chat(
            recipe_analyzer,
            message=prompt,
            max_turns=1,
            silent=True
        )
        
        # Extract the last message from the agent
        last_message = chat_result.chat_history[-1]['content']
        
        # Try to parse JSON from the response
        try:
            # Clean the response - remove any non-JSON text
            json_start = last_message.find('{')
            json_end = last_message.rfind('}') + 1
            if json_start != -1 and json_end != 0:
                json_str = last_message[json_start:json_end]
                recipe_ingredients = json.loads(json_str)
                return recipe_ingredients
            else:
                return {"error": "Could not parse recipe analysis response"}
        except json.JSONDecodeError:
            return {"error": "Invalid JSON response from agent", "raw_response": last_message}
            
    except Exception as e:
        return {"error": f"Recipe analysis failed: {str(e)}"}
