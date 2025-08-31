import React from 'react';
import { Check, X, Plus, Archive, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useGroceryHistory } from '@/contexts/GroceryHistoryContext';
import { GroceryItem } from '@/types/grocery';
import { useToast } from '@/hooks/use-toast';

interface GroceryListProps {
  // Keep for backward compatibility, but we'll primarily use the context
  items?: string[];
  onItemsChange?: (items: string[]) => void;
}

interface GrocerySection {
  name: string;
  items: GroceryItem[];
  icon: string;
  color: string;
}

export const GroceryList = ({ items: legacyItems = [], onItemsChange }: GroceryListProps) => {
  const { 
    currentList, 
    toggleItemCompletion, 
    completeCurrentList,
    createNewList
  } = useGroceryHistory();
  const { toast } = useToast();

  // Use current list from context or fallback to legacy items
  const displayItems = currentList?.items || legacyItems.map(item => ({
    id: `legacy-${item}`,
    name: item,
    isCompleted: false,
    addedAt: new Date().toISOString()
  }));

  console.log('🍎 GroceryList render - currentList:', currentList);
  console.log('🍎 GroceryList render - displayItems:', displayItems);
  console.log('🍎 GroceryList render - legacyItems:', legacyItems);

  // Simulate AI categorization
  const categorizeItems = (items: GroceryItem[]): GrocerySection[] => {
    const categories: Record<string, { items: GroceryItem[], icon: string, color: string }> = {
      'Produce': { items: [], icon: '🥕', color: 'bg-green-100 border-green-300' },
      'Dairy': { items: [], icon: '🥛', color: 'bg-blue-100 border-blue-300' },
      'Bakery': { items: [], icon: '🥖', color: 'bg-yellow-100 border-yellow-300' },
      'Meat & Seafood': { items: [], icon: '🥩', color: 'bg-red-100 border-red-300' },
      'Pantry': { items: [], icon: '🥫', color: 'bg-purple-100 border-purple-300' },
      'Other': { items: [], icon: '🛒', color: 'bg-gray-100 border-gray-300' }
    };

    items.forEach(item => {
      const lowerItem = item.name.toLowerCase();
      
      if (['apple', 'apples', 'banana', 'bananas', 'carrot', 'carrots', 'tomato', 'tomatoes', 'lettuce', 'spinach'].some(produce => lowerItem.includes(produce))) {
        categories['Produce'].items.push(item);
      } else if (['milk', 'cheese', 'yogurt', 'butter', 'cream'].some(dairy => lowerItem.includes(dairy))) {
        categories['Dairy'].items.push(item);
      } else if (['bread', 'bagel', 'muffin', 'croissant', 'roll'].some(bakery => lowerItem.includes(bakery))) {
        categories['Bakery'].items.push(item);
      } else if (['chicken', 'beef', 'pork', 'fish', 'salmon', 'egg', 'eggs'].some(meat => lowerItem.includes(meat))) {
        categories['Meat & Seafood'].items.push(item);
      } else if (['rice', 'pasta', 'beans', 'oil', 'salt', 'sugar', 'flour'].some(pantry => lowerItem.includes(pantry))) {
        categories['Pantry'].items.push(item);
      } else {
        categories['Other'].items.push(item);
      }
    });

    return Object.entries(categories)
      .map(([name, data]) => ({ name, ...data }))
      .filter(section => section.items.length > 0);
  };

  const sections = categorizeItems(displayItems);
  const completedItems = displayItems.filter(item => item.isCompleted).length;
  const totalItems = displayItems.length;

  const handleItemCheck = (item: GroceryItem) => {
    if (currentList) {
      toggleItemCompletion(item.id);
    }
    // For legacy support
    if (onItemsChange && !currentList) {
      // This is for backward compatibility with the old system
      console.log('Legacy item check not fully supported with new history system');
    }
  };

  const handleRemoveItem = (item: GroceryItem) => {
    if (currentList) {
      // Remove item from current list
      const updatedItems = currentList.items.filter(i => i.id !== item.id);
      // You would need to add a removeItem method to the context for this to work properly
      // For now, we'll just show a toast
      toast({
        title: "Item Removal",
        description: "Item removal functionality will be added in the next update.",
        variant: "default"
      });
    }
    
    // For legacy support
    if (onItemsChange && !currentList) {
      onItemsChange(legacyItems.filter(i => i !== item.name));
    }
  };

  const handleCompleteList = () => {
    if (currentList) {
      completeCurrentList();
      toast({
        title: "List Completed!",
        description: "Your grocery list has been marked as completed and saved to history.",
      });
    }
  };

  const handleCreateNewList = () => {
    createNewList();
    toast({
      title: "New List Created",
      description: "Started a fresh grocery list. Your previous list has been saved.",
    });
  };

  if (displayItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-12 h-12 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No items in your list yet
        </h3>
        <p className="text-gray-600 mb-6">
          Use voice input above to add items to your grocery list
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {currentList?.title || 'Your Grocery List'}
        </h2>
        <p className="text-muted-foreground">
          Items organized by store section for efficient shopping
        </p>
        
        {currentList && (
          <div className="flex items-center justify-center space-x-4 mt-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Created {new Date(currentList.created_at).toLocaleDateString()}</span>
            </div>
            
            <div className="flex space-x-2">
              {totalItems > 0 && completedItems === totalItems && (
                <Button 
                  onClick={handleCompleteList}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Complete List
                </Button>
              )}
              
              <Button 
                onClick={handleCreateNewList}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                New List
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {sections.map((section) => (
          <Card key={section.name} className={`${section.color} border-2`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <span className="text-2xl">{section.icon}</span>
                <span>{section.name}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  ({section.items.length} items)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {section.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-2 bg-white/60 rounded-lg">
                  <Checkbox
                    checked={item.isCompleted}
                    onCheckedChange={() => handleItemCheck(item)}
                  />
                  <span 
                    className={`flex-1 ${item.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                  >
                    {item.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center pt-4">
        <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-success" />
            <span>{completedItems} completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <Plus className="w-4 h-4 text-primary" />
            <span>{totalItems - completedItems} remaining</span>
          </div>
        </div>
        
        {completedItems === totalItems && totalItems > 0 && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              🎉 Congratulations! You've completed your entire grocery list!
            </p>
            <Button 
              onClick={handleCompleteList}
              className="mt-2 bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Archive className="w-4 h-4 mr-2" />
              Mark List as Complete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
