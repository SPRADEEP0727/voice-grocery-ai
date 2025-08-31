import React from 'react';
import { Crown, Calendar, Clock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface SubscriptionDisplayProps {
  onSubscriptionClick?: () => void;
}

export const SubscriptionDisplay: React.FC<SubscriptionDisplayProps> = ({ onSubscriptionClick }) => {
  const { 
    subscription, 
    isOnFreeTrial, 
    trialDaysLeft, 
    hasActiveSubscription,
    loading 
  } = useSubscription();

  if (loading) {
    return (
      <Card className="inline-block bg-gradient-secondary border-green-300">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Loading subscription...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isOnFreeTrial) {
    return (
      <Card className="inline-block bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Free Trial</p>
                <p className="text-xl font-bold text-foreground">
                  {trialDaysLeft} days left
                </p>
              </div>
            </div>
            
            {trialDaysLeft <= 7 && (
              <div className="border-l border-blue-300 pl-4">
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white"
                  onClick={onSubscriptionClick}
                >
                  <CreditCard className="w-4 h-4 mr-1" />
                  Subscribe Now
                </Button>
              </div>
            )}
          </div>
          
          {trialDaysLeft <= 3 && (
            <div className="mt-3 pt-3 border-t border-blue-300">
              <p className="text-sm text-orange-600 font-medium">
                Your free trial expires soon! Subscribe to continue using all features.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (hasActiveSubscription) {
    const endDate = subscription?.current_period_end ? new Date(subscription.current_period_end) : null;
    const isYearly = subscription?.plan_id === 'yearly';
    
    return (
      <Card className="inline-block bg-gradient-to-r from-green-50 to-emerald-50 border-green-300">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-muted-foreground">Subscription</p>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Active
                  </Badge>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {isYearly ? 'Yearly Plan' : 'Monthly Plan'}
                </p>
                {endDate && (
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Renews {endDate.toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Trial expired, no active subscription
  return (
    <Card className="inline-block bg-gradient-to-r from-orange-50 to-red-50 border-orange-300">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trial Expired</p>
              <p className="text-lg font-bold text-foreground">Subscribe to Continue</p>
            </div>
          </div>
          
          <div className="border-l border-orange-300 pl-4">
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white"
              onClick={onSubscriptionClick}
            >
              <CreditCard className="w-4 h-4 mr-1" />
              Choose Plan
            </Button>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-orange-300">
          <p className="text-sm text-orange-600 font-medium">
            Subscribe now to continue using voice input and all premium features.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
