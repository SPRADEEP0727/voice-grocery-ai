
import React from 'react';
import { Mic, Sparkles, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const HeroSection = () => {
  return (
    <section className="text-center space-y-8 py-12">
      <div className="space-y-4">
        <div className="inline-flex items-center space-x-2 bg-gradient-secondary rounded-full px-4 py-2 text-sm font-medium">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>AI-Powered Organization</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
          Speak Your 
          <span className="bg-gradient-primary bg-clip-text text-transparent"> Grocery List</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Just say what you need. Our AI automatically organizes your items by store section 
          for the most efficient shopping experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-md">
          <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 mx-auto">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Voice Input</h3>
          <p className="text-muted-foreground text-sm">
            Simply speak your grocery needs naturally. No need to organize or structure.
          </p>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-md">
          <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 mx-auto">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">AI Organization</h3>
          <p className="text-muted-foreground text-sm">
            Automatically sorts items by store sections: Produce, Dairy, Bakery, and more.
          </p>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-md">
          <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 mx-auto">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Smart Shopping</h3>
          <p className="text-muted-foreground text-sm">
            Efficient store navigation with organized lists that save time and money.
          </p>
        </div>
      </div>
    </section>
  );
};
