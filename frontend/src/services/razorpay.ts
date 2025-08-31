// Razorpay service for handling payments

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface PaymentData {
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  userEmail?: string;
  userName?: string;
}

export class RazorpayService {
  private static readonly RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_RBkdVA1TD9wkf5';
  
  static async loadRazorpay(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  static async initiatePayment(paymentData: PaymentData): Promise<RazorpayResponse> {
    const isLoaded = await this.loadRazorpay();
    
    if (!isLoaded) {
      throw new Error('Razorpay SDK failed to load');
    }

    return new Promise((resolve, reject) => {
      const options: RazorpayOptions = {
        key: this.RAZORPAY_KEY,
        amount: paymentData.amount * 100, // Convert to paise
        currency: 'INR', // Explicitly set to INR for UPI and other Indian payment methods
        name: 'Groceries AI',
        description: `Subscription: ${paymentData.planName}`,
        handler: (response: RazorpayResponse) => {
          console.log('✅ Payment successful:', response);
          resolve(response);
        },
        prefill: {
          email: paymentData.userEmail,
          name: paymentData.userName,
          contact: '', // Add phone number if available for UPI
        },
        notes: {
          plan_id: paymentData.planId,
          plan_name: paymentData.planName,
        },
        theme: {
          color: '#16a34a', // Green theme to match the app
        },
        modal: {
          ondismiss: () => {
            console.log('💳 Payment modal dismissed by user');
            reject(new Error('Payment cancelled by user'));
          },
          escape: true, // Allow escape key to close
          backdropclose: false, // Prevent accidental backdrop clicks that cause issues
        },
      };

      console.log('🏦 Opening Razorpay with options:', {
        ...options,
        key: options.key.substring(0, 8) + '...' // Don't log sensitive info
      });
      
      const razorpay = new window.Razorpay(options);
      
      // Add event listeners for better error handling
      razorpay.on('payment.failed', (response: any) => {
        console.error('❌ Payment failed:', response);
        reject(new Error(`Payment failed: ${response.error?.description || 'Unknown error'}`));
      });
      
      // Ensure modal opens properly with a small delay to prevent interaction issues
      setTimeout(() => {
        try {
          razorpay.open();
        } catch (error) {
          console.error('❌ Error opening Razorpay modal:', error);
          reject(new Error('Failed to open payment modal'));
        }
      }, 100);
    });
  }

  static formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
    }).format(amount);
  }
}
