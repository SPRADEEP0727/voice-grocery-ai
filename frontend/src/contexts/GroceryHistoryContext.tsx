import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { GroceryList, GroceryItem } from '@/types/grocery';
import { supabase } from '@/integrations/supabase/client';

interface GroceryHistoryContextType {
  groceryLists: GroceryList[];
  currentList: GroceryList | null;
  loading: boolean;
  createNewList: (title?: string) => GroceryList;
  addItemsToCurrentList: (items: string[]) => void;
  toggleItemCompletion: (itemId: string) => void;
  completeCurrentList: () => void;
  archiveList: (listId: string) => void;
  deleteList: (listId: string) => void;
  getListsByDate: (date: Date) => GroceryList[];
  getListsInDateRange: (startDate: Date, endDate: Date) => GroceryList[];
  updateListTitle: (listId: string, title: string) => void;
}

const GroceryHistoryContext = createContext<GroceryHistoryContextType | undefined>(undefined);

export const GroceryHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [groceryLists, setGroceryLists] = useState<GroceryList[]>([]);
  const [currentList, setCurrentList] = useState<GroceryList | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Always load grocery history, even without user (for testing)
    loadGroceryHistory();
  }, [user]);

  const loadGroceryHistory = async () => {
    try {
      setLoading(true);
      
      // For now, we'll use localStorage to simulate database storage
      // Use a fixed key if no user is available
      const storageKey = user ? `grocery_history_${user.id}` : 'grocery_history_guest';
      const stored = localStorage.getItem(storageKey);
      
      console.log('Loading grocery history for key:', storageKey);
      console.log('Stored data:', stored);
      
      if (stored) {
        const parsedLists: GroceryList[] = JSON.parse(stored);
        setGroceryLists(parsedLists);
        console.log('Loaded lists:', parsedLists);
        
        // Find the most recent active list
        const activeList = parsedLists.find(list => list.status === 'active');
        setCurrentList(activeList || null);
        console.log('Active list:', activeList);
      } else {
        // Create initial empty state
        console.log('No stored data found, initializing empty state');
        setGroceryLists([]);
        setCurrentList(null);
      }
    } catch (error) {
      console.error('Error loading grocery history:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveToStorage = (lists: GroceryList[]) => {
    // Use guest key if no user is available
    const storageKey = user ? `grocery_history_${user.id}` : 'grocery_history_guest';
    localStorage.setItem(storageKey, JSON.stringify(lists));
    console.log('Saved grocery history with key:', storageKey);
    console.log('Saved lists:', lists);
  };

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const createNewList = (title?: string) => {
    const now = new Date().toISOString();
    const newList: GroceryList = {
      id: generateId(),
      user_id: user?.id || 'guest',
      title: title || `Grocery List - ${new Date().toLocaleDateString()}`,
      items: [],
      created_at: now,
      updated_at: now,
      status: 'active'
    };

    // Complete the current active list if it exists
    const updatedLists = groceryLists.map(list => {
      if (list.status === 'active') {
        return { ...list, status: 'completed' as const, completed_at: now };
      }
      return list;
    });

    const newLists = [newList, ...updatedLists];
    setGroceryLists(newLists);
    setCurrentList(newList);
    saveToStorage(newLists);

    return newList;
  };

  const addItemsToCurrentList = (items: string[]) => {
    console.log('🔥 GroceryHistoryContext.addItemsToCurrentList called with:', items);
    console.log('🔥 currentList:', currentList);
    console.log('🔥 groceryLists:', groceryLists);
    
    const now = new Date().toISOString();
    const newItems: GroceryItem[] = items.map(item => ({
      id: generateId(),
      name: item.trim(),
      isCompleted: false,
      addedAt: now
    }));

    console.log('🔥 Generated newItems:', newItems);
    
    if (!currentList) {
      // Create a new list if none exists
      console.log('🔥 Creating new list because currentList is null');
      const newList: GroceryList = {
        id: generateId(),
        user_id: user?.id || 'guest',
        title: `Grocery List - ${new Date().toLocaleDateString()}`,
        items: newItems, // Add items directly to the new list
        created_at: now,
        updated_at: now,
        status: 'active'
      };

      console.log('🔥 Created new list with items:', newList);

      // Complete the current active list if it exists
      const updatedLists = groceryLists.map(list => {
        if (list.status === 'active') {
          return { ...list, status: 'completed' as const, completed_at: now };
        }
        return list;
      });

      const finalLists = [newList, ...updatedLists];
      console.log('🔥 Final lists to save:', finalLists);
      
      setGroceryLists(finalLists);
      setCurrentList(newList);
      saveToStorage(finalLists);
      return;
    }
    
    console.log('🔥 Adding to existing list:', currentList.id);
    
    // Update existing list
    const updatedList = {
      ...currentList,
      items: [...currentList.items, ...newItems],
      updated_at: now
    };

    const updatedLists = groceryLists.map(list => 
      list.id === currentList.id ? updatedList : list
    );

    console.log('🔥 Updated existing list:', updatedList);
    console.log('🔥 Final updated lists:', updatedLists);

    setGroceryLists(updatedLists);
    setCurrentList(updatedList);
    saveToStorage(updatedLists);
  };

  const addItemsToList = (listId: string, items: string[]) => {
    console.log('🔥 addItemsToList called with listId:', listId, 'items:', items);
    console.log('🔥 Current groceryLists before update:', groceryLists);
    
    const now = new Date().toISOString();
    const newItems: GroceryItem[] = items.map(item => ({
      id: generateId(),
      name: item.trim(),
      isCompleted: false,
      addedAt: now
    }));

    console.log('🔥 Generated newItems:', newItems);

    // Find the target list
    const targetListIndex = groceryLists.findIndex(list => list.id === listId);
    console.log('🔥 Target list index:', targetListIndex);
    
    if (targetListIndex === -1) {
      console.error('🔥 List not found with ID:', listId);
      return;
    }

    const updatedLists = [...groceryLists];
    const targetList = updatedLists[targetListIndex];
    
    const updatedList = {
      ...targetList,
      items: [...targetList.items, ...newItems],
      updated_at: now
    };
    
    updatedLists[targetListIndex] = updatedList;

    console.log('🔥 Updated list:', updatedList);
    console.log('🔥 Final updatedLists:', updatedLists);
    
    if (targetList.id === currentList?.id) {
      console.log('🔥 Setting currentList to:', updatedList);
      setCurrentList(updatedList);
    }

    console.log('🔥 Setting groceryLists to:', updatedLists);
    setGroceryLists(updatedLists);
    saveToStorage(updatedLists);
  };

  const toggleItemCompletion = (itemId: string) => {
    if (!currentList) return;

    const updatedLists = groceryLists.map(list => {
      if (list.id === currentList.id) {
        const updatedItems = list.items.map(item => {
          if (item.id === itemId) {
            return { ...item, isCompleted: !item.isCompleted };
          }
          return item;
        });

        const updatedList = {
          ...list,
          items: updatedItems,
          updated_at: new Date().toISOString()
        };

        setCurrentList(updatedList);
        return updatedList;
      }
      return list;
    });

    setGroceryLists(updatedLists);
    saveToStorage(updatedLists);
  };

  const completeCurrentList = () => {
    if (!currentList) return;

    const now = new Date().toISOString();
    const updatedLists = groceryLists.map(list => {
      if (list.id === currentList.id) {
        return {
          ...list,
          status: 'completed' as const,
          completed_at: now,
          updated_at: now
        };
      }
      return list;
    });

    setGroceryLists(updatedLists);
    setCurrentList(null);
    saveToStorage(updatedLists);
  };

  const archiveList = (listId: string) => {
    const updatedLists = groceryLists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          status: 'archived' as const,
          updated_at: new Date().toISOString()
        };
      }
      return list;
    });

    setGroceryLists(updatedLists);
    
    if (currentList?.id === listId) {
      setCurrentList(null);
    }
    
    saveToStorage(updatedLists);
  };

  const deleteList = (listId: string) => {
    const updatedLists = groceryLists.filter(list => list.id !== listId);
    setGroceryLists(updatedLists);
    
    if (currentList?.id === listId) {
      setCurrentList(null);
    }
    
    saveToStorage(updatedLists);
  };

  const getListsByDate = (date: Date) => {
    const dateStr = date.toDateString();
    return groceryLists.filter(list => {
      const listDate = new Date(list.created_at).toDateString();
      return listDate === dateStr;
    });
  };

  const getListsInDateRange = (startDate: Date, endDate: Date) => {
    return groceryLists.filter(list => {
      const listDate = new Date(list.created_at);
      return listDate >= startDate && listDate <= endDate;
    });
  };

  const updateListTitle = (listId: string, title: string) => {
    const updatedLists = groceryLists.map(list => {
      if (list.id === listId) {
        const updatedList = {
          ...list,
          title: title.trim(),
          updated_at: new Date().toISOString()
        };
        
        if (list.id === currentList?.id) {
          setCurrentList(updatedList);
        }
        
        return updatedList;
      }
      return list;
    });

    setGroceryLists(updatedLists);
    saveToStorage(updatedLists);
  };

  const value: GroceryHistoryContextType = {
    groceryLists,
    currentList,
    loading,
    createNewList,
    addItemsToCurrentList,
    toggleItemCompletion,
    completeCurrentList,
    archiveList,
    deleteList,
    getListsByDate,
    getListsInDateRange,
    updateListTitle
  };

  return (
    <GroceryHistoryContext.Provider value={value}>
      {children}
    </GroceryHistoryContext.Provider>
  );
};

export const useGroceryHistory = () => {
  const context = useContext(GroceryHistoryContext);
  if (context === undefined) {
    throw new Error('useGroceryHistory must be used within a GroceryHistoryProvider');
  }
  return context;
};
