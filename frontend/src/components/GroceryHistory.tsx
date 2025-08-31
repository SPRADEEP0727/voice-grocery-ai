import React, { useState } from 'react';
import { 
  Calendar,
  Clock,
  Archive,
  Trash2,
  Edit3,
  CheckCircle,
  Circle,
  ShoppingBag,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGroceryHistory } from '@/contexts/GroceryHistoryContext';
import { GroceryList } from '@/types/grocery';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';

interface GroceryHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterOption = 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'active' | 'completed' | 'archived';

export const GroceryHistory: React.FC<GroceryHistoryProps> = ({ isOpen, onClose }) => {
  const { 
    groceryLists, 
    loading, 
    archiveList, 
    deleteList, 
    updateListTitle 
  } = useGroceryHistory();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filterLists = (lists: GroceryList[]) => {
    let filtered = lists;

    // Apply date/status filter
    switch (filter) {
      case 'today':
        filtered = filtered.filter(list => isToday(new Date(list.created_at)));
        break;
      case 'yesterday':
        filtered = filtered.filter(list => isYesterday(new Date(list.created_at)));
        break;
      case 'week':
        filtered = filtered.filter(list => isThisWeek(new Date(list.created_at)));
        break;
      case 'month':
        filtered = filtered.filter(list => isThisMonth(new Date(list.created_at)));
        break;
      case 'active':
        filtered = filtered.filter(list => list.status === 'active');
        break;
      case 'completed':
        filtered = filtered.filter(list => list.status === 'completed');
        break;
      case 'archived':
        filtered = filtered.filter(list => list.status === 'archived');
        break;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(list => 
        list.title.toLowerCase().includes(query) ||
        list.items.some(item => item.name.toLowerCase().includes(query))
      );
    }

    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const handleEditTitle = (list: GroceryList) => {
    setEditingListId(list.id);
    setEditTitle(list.title);
  };

  const handleSaveTitle = () => {
    if (editingListId && editTitle.trim()) {
      updateListTitle(editingListId, editTitle.trim());
    }
    setEditingListId(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingListId(null);
    setEditTitle('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-700">Completed</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-700">Archived</Badge>;
      default:
        return null;
    }
  };

  const getDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE'); // Monday, Tuesday, etc.
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  const filteredLists = filterLists(groceryLists);

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center p-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2">Loading history...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center">
            <Calendar className="w-6 h-6 mr-2" />
            Grocery History
          </DialogTitle>
          <DialogDescription>
            View and manage your grocery lists from different dates
          </DialogDescription>
        </DialogHeader>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search lists or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={filter} onValueChange={(value: FilterOption) => setFilter(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Lists</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-gray-600 mb-4">
          {filteredLists.length} {filteredLists.length === 1 ? 'list' : 'lists'} found
        </div>

        {/* Lists */}
        <div className="overflow-y-auto max-h-[60vh] space-y-4">
          {filteredLists.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No lists found</h3>
              <p className="text-gray-500">
                {searchQuery.trim() 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start creating grocery lists to see them here'
                }
              </p>
            </div>
          ) : (
            filteredLists.map((list) => (
              <Card key={list.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {editingListId === list.id ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="text-lg font-semibold"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveTitle();
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            autoFocus
                          />
                          <Button size="sm" onClick={handleSaveTitle}>Save</Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{list.title}</CardTitle>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditTitle(list)}
                            className="p-1"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{getDateDisplay(list.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ShoppingBag className="w-4 h-4" />
                          <span>{list.items.length} items</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            {list.items.filter(item => item.isCompleted).length} completed
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(list.status)}
                      
                      {list.status !== 'archived' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => archiveList(list.id)}
                          className="p-2"
                        >
                          <Archive className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteList(list.id)}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {list.items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {list.items.map((item) => (
                        <div 
                          key={item.id} 
                          className={`flex items-center space-x-2 p-2 rounded-lg border ${
                            item.isCompleted 
                              ? 'bg-green-50 border-green-200 text-green-800' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          {item.isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-400" />
                          )}
                          <span 
                            className={`text-sm ${
                              item.isCompleted ? 'line-through' : ''
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Plus className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No items in this list</p>
                    </div>
                  )}
                  
                  {list.completed_at && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Completed on {format(new Date(list.completed_at), 'MMM d, yyyy \'at\' h:mm a')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
