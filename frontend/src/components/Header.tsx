
import React from 'react';
import { Mic, ShoppingCart, User, LogOut, Crown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface HeaderProps {
  onSubscriptionClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSubscriptionClick }) => {
  const { user, signOut } = useAuth();
  const { 
    subscription, 
    isOnFreeTrial, 
    trialDaysLeft, 
    hasActiveSubscription 
  } = useSubscription();

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getSubscriptionBadge = () => {
    if (hasActiveSubscription) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-300">
          <Crown className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    } else if (isOnFreeTrial) {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-300">
          <Clock className="w-3 h-3 mr-1" />
          Trial: {trialDaysLeft}d
        </Badge>
      );
    } else {
      return (
        <Button 
          size="sm" 
          onClick={onSubscriptionClick}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white h-6 px-2 text-xs"
        >
          Subscribe
        </Button>
      );
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full">
            <Mic className="h-6 w-6 text-white" />
          </div>
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6 text-green-600" />
            <h1 className="text-xl font-bold text-gray-900">
              Smart Grocery Assistant
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center">
            {getSubscriptionBadge()}
          </div>
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || user.email} />
                    <AvatarFallback>
                      {user.user_metadata?.full_name 
                        ? getUserInitials(user.user_metadata.full_name)
                        : <User className="h-4 w-4" />
                      }
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user.user_metadata?.full_name && (
                      <p className="font-medium">{user.user_metadata.full_name}</p>
                    )}
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuItem onClick={onSubscriptionClick}>
                  <Crown className="mr-2 h-4 w-4" />
                  Manage Subscription
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};
