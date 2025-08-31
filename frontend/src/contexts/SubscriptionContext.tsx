import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  created_at: string;
}

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  plans: SubscriptionPlan[];
  isOnFreeTrial: boolean;
  trialDaysLeft: number;
  hasActiveSubscription: boolean;
  canUseVoiceInput: boolean;
  loading: boolean;
  subscribeToPlan: (planId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  resumeSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Default plans
const defaultPlans: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 499,
    interval: 'month',
    features: [
      'Unlimited voice input',
      'AI-powered grocery list generation',
      'Smart item categorization',
      'Export to popular grocery apps',
      'Priority customer support'
    ]
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    price: 4999,
    interval: 'year',
    features: [
      'Unlimited voice input',
      'AI-powered grocery list generation',
      'Smart item categorization',
      'Export to popular grocery apps',
      'Priority customer support',
      'Advanced meal planning (coming soon)',
      '2 months free'
    ]
  }
];

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans] = useState<SubscriptionPlan[]>(defaultPlans);
  const [loading, setLoading] = useState(true);

  // Calculate trial status
  const isOnFreeTrial = subscription?.status === 'trial' || (!subscription && user);
  const trialDaysLeft = subscription?.trial_end 
    ? Math.max(0, Math.ceil((new Date(subscription.trial_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : user ? 30 : 0; // 30 days for new users

  const hasActiveSubscription = subscription?.status === 'active';
  const canUseVoiceInput = hasActiveSubscription || isOnFreeTrial;

  useEffect(() => {
    if (user) {
      loadUserSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const loadUserSubscription = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // In a real app, you would fetch from your subscription table
      // For now, we'll simulate the subscription state
      const userCreatedAt = new Date(user.created_at);
      const now = new Date();
      const daysSinceCreation = Math.floor((now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if user has been using the app for less than 30 days (free trial)
      if (daysSinceCreation < 30) {
        const trialEnd = new Date(userCreatedAt);
        trialEnd.setDate(trialEnd.getDate() + 30);
        
        const mockSubscription: UserSubscription = {
          id: 'trial-' + user.id,
          user_id: user.id,
          plan_id: 'trial',
          status: 'trial',
          current_period_start: user.created_at,
          current_period_end: trialEnd.toISOString(),
          trial_end: trialEnd.toISOString(),
          created_at: user.created_at
        };
        
        setSubscription(mockSubscription);
      } else {
        // Trial expired, user needs to subscribe
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPlan = async (planId: string) => {
    if (!user) throw new Error('User must be logged in');
    
    try {
      // In a real app, you would integrate with Stripe or similar payment processor
      console.log('Subscribing to plan:', planId);
      
      // Simulate successful subscription
      const now = new Date();
      const endDate = new Date();
      const plan = plans.find(p => p.id === planId);
      
      if (plan?.interval === 'year') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }
      
      const newSubscription: UserSubscription = {
        id: 'sub-' + user.id + '-' + planId,
        user_id: user.id,
        plan_id: planId,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: endDate.toISOString(),
        created_at: now.toISOString()
      };
      
      setSubscription(newSubscription);
      
      // Here you would typically save to your database
      // await supabase.from('subscriptions').insert(newSubscription);
      
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      throw error;
    }
  };

  const cancelSubscription = async () => {
    if (!subscription) return;
    
    try {
      // In a real app, you would cancel via your payment processor
      console.log('Cancelling subscription:', subscription.id);
      
      const updatedSubscription = {
        ...subscription,
        status: 'cancelled' as const
      };
      
      setSubscription(updatedSubscription);
      
      // Here you would typically update your database
      // await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('id', subscription.id);
      
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  };

  const resumeSubscription = async () => {
    if (!subscription) return;
    
    try {
      // In a real app, you would resume via your payment processor
      console.log('Resuming subscription:', subscription.id);
      
      const updatedSubscription = {
        ...subscription,
        status: 'active' as const
      };
      
      setSubscription(updatedSubscription);
      
    } catch (error) {
      console.error('Error resuming subscription:', error);
      throw error;
    }
  };

  const value: SubscriptionContextType = {
    subscription,
    plans,
    isOnFreeTrial,
    trialDaysLeft,
    hasActiveSubscription,
    canUseVoiceInput,
    loading,
    subscribeToPlan,
    cancelSubscription,
    resumeSubscription
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
