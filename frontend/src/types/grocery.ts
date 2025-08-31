export interface GroceryItem {
  id: string;
  name: string;
  category?: string;
  isCompleted: boolean;
  addedAt: string;
}

export interface GroceryList {
  id: string;
  user_id: string;
  title: string;
  items: GroceryItem[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
  status: 'active' | 'completed' | 'archived';
}

export interface GroceryHistory {
  lists: GroceryList[];
  totalLists: number;
  totalItems: number;
  completedLists: number;
}
