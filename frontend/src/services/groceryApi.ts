// API service for connecting to Flask backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://voice-grocery-ai-backend.onrender.com';

export interface OrganizedGroceries {
  [category: string]: string[];
}

export interface RecipeIngredient {
  item: string;
  quantity: string;
  category: string;
}

export interface RecipeResponse {
  ingredients: RecipeIngredient[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class GroceryApiService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log('📡 Making API request to:', url);
      console.log('📡 Request options:', options);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📡 Response data:', data);
      
      // Check if response has error field
      if (data.error) {
        return { error: data.error };
      }

      return { data };
    } catch (error) {
      console.error('📡 API request failed:', error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  async checkHealth(): Promise<ApiResponse<{ status: string; message: string; version: string }>> {
    return this.makeRequest('/health', { method: 'GET' });
  }

  async organizeGroceries(items: string[]): Promise<ApiResponse<OrganizedGroceries>> {
    console.log('📡 groceryApiService.organizeGroceries called with:', items);
    console.log('📡 Making POST request to /grocery-list');
    
    return this.makeRequest('/grocery-list', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  async getRecipeIngredients(recipe: string): Promise<ApiResponse<RecipeResponse>> {
    return this.makeRequest('/recipe-groceries', {
      method: 'POST',
      body: JSON.stringify({ recipe }),
    });
  }
}

export const groceryApiService = new GroceryApiService();
