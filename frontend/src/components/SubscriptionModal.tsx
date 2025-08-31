import React, { useState } from 'react';
import { 
  Crown, 
  Check, 
  X, 
  CreditCard, 
  Loader2,
  Gift,
  Banknote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { RazorpayService, PaymentData } from '@/services/razorpay';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { plans, subscribeToPlan, isOnFreeTrial, trialDaysLeft } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(planId);
      
      const plan = plans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      // Check if user is logged in
      if (!user) {
        toast({
          title: "Please login first",
          description: "You need to be logged in to subscribe to a plan.",
          variant: "destructive",
        });
        return;
      }

      // Prepare payment data with Supabase user details
      const paymentData: PaymentData = {
        planId: plan.id,
        planName: plan.name,
        amount: plan.price,
        currency: 'INR',
        userEmail: user.email || '',
        userName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '',
      };

      console.log('🏦 Initiating Razorpay payment:', paymentData);
      
      // Small delay to ensure UI is ready and prevent modal interaction issues
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Initiate Razorpay payment
      const paymentResponse = await RazorpayService.initiatePayment(paymentData);
      
      console.log('🏦 Payment successful:', paymentResponse);
      
      // Store payment info in localStorage for now (you can later save to Supabase)
      const subscriptionData = {
        planId: plan.id,
        planName: plan.name,
        amount: plan.price,
        paymentId: paymentResponse.razorpay_payment_id,
        userId: user.id,
        subscribedAt: new Date().toISOString(),
      };
      
      localStorage.setItem('subscription', JSON.stringify(subscriptionData));
      
      // Process subscription with payment response
      await subscribeToPlan(planId);
      
      toast({
        title: "Payment Successful! 🎉",
        description: `Welcome to ${plan.name}! Your subscription is now active.`,
      });
      
      onClose();
    } catch (error) {
      console.error('Subscription error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('cancelled')) {
        toast({
          title: "Payment Cancelled",
          description: "You can try again when you're ready to subscribe.",
        });
      } else {
        toast({
          title: "Payment Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Choose Your Plan
          </DialogTitle>
          <DialogDescription className="text-center">
            {isOnFreeTrial 
              ? `You have ${trialDaysLeft} days left in your free trial. Subscribe to continue enjoying all features.`
              : "Subscribe to unlock unlimited voice input and premium features."
            }
          </DialogDescription>
        </DialogHeader>

        {isOnFreeTrial && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <Gift className="w-5 h-5 text-blue-600" />
              <p className="text-blue-800 font-medium">
                Special offer: Get your first month free! Your trial time will be added to your subscription.
              </p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const isYearly = plan.interval === 'year';
            const monthlyPrice = isYearly ? plan.price / 12 : plan.price;
            const isLoading = loading === plan.id;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative transition-all duration-300 hover:shadow-lg ${
                  isYearly ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50' : 'border-green-300'
                }`}
              >
                {isYearly && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1">
                      Best Value
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      isYearly 
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}>
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  
                  <div className="space-y-1">
                    <div className="text-3xl font-bold">
                      ₹{monthlyPrice.toFixed(0)}
                      <span className="text-sm font-normal text-muted-foreground">/month</span>
                    </div>
                    {isYearly && (
                      <p className="text-sm text-green-600 font-medium">
                        Save ₹{((plan.price / 12) * 2).toFixed(0)} annually
                      </p>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    className={`w-full ${
                      isYearly 
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90'
                    } text-white`}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Banknote className="w-4 h-4 mr-2" />
                        Pay with Razorpay - {RazorpayService.formatCurrency(plan.price)}
                      </>
                    )}
                  </Button>
                  
                  {isOnFreeTrial && (
                    <p className="text-xs text-center text-muted-foreground">
                      Your remaining trial days will be added to your subscription
                    </p>
                  )}
                  
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-2">
                      Secure payment powered by Razorpay
                    </p>
                    <div className="flex justify-center items-center space-x-2 text-xs text-muted-foreground">
                      <span>💳 Cards</span>
                      <span>🏦 UPI</span>
                      <span>🏪 Net Banking</span>
                      <span>📱 Wallets</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="text-center text-sm text-muted-foreground mt-6">
          <p>Cancel anytime. No hidden fees. Secure payment processing.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
