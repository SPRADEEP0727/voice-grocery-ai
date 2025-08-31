
import React from 'react';
import { HeroSection } from '@/components/HeroSection';
import { VoiceInput } from '@/components/VoiceInput';
import { GroceryList } from '@/components/GroceryList';
import { SubscriptionDisplay } from '@/components/SubscriptionDisplay';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { GroceryHistory } from '@/components/GroceryHistory';
import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useGroceryHistory } from '@/contexts/GroceryHistoryContext';

const Index = () => {
  const [isRecording, setIsRecording] = React.useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = React.useState(false);
  const [showHistoryModal, setShowHistoryModal] = React.useState(false);
  
  const { canUseVoiceInput } = useSubscription();
  const { 
    currentList, 
    addItemsToCurrentList, 
    groceryLists, 
    loading: groceryLoading 
  } = useGroceryHistory();

  const handleVoiceInput = (transcription: string) => {
    console.log('🏠 Index.tsx handleVoiceInput called with transcription:', transcription);
    // Note: The actual processing is now handled entirely in VoiceInput component
    // This callback is just for logging/backward compatibility
  };

  const handleOpenSubscriptionModal = () => {
    setShowSubscriptionModal(true);
  };

  const handleOpenHistoryModal = () => {
    setShowHistoryModal(true);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100">
        <Header onSubscriptionClick={handleOpenSubscriptionModal} />
        
        <main className="container mx-auto px-4 py-8 space-y-12">
          <HeroSection />
          
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={handleOpenHistoryModal}
                  variant="outline"
                  className="bg-white/60 backdrop-blur-sm border-blue-200 hover:bg-blue-50"
                >
                  <History className="w-4 h-4 mr-2" />
                  View Grocery History
                </Button>
              </div>
            </div>
            
            <VoiceInput 
              onTranscription={handleVoiceInput}
              isRecording={isRecording}
              onRecordingChange={setIsRecording}
              disabled={!canUseVoiceInput}
              onSubscriptionClick={handleOpenSubscriptionModal}
            />
            
            <GroceryList />
          </div>
        </main>

        <SubscriptionModal 
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />

        <GroceryHistory 
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
        />
      </div>
    </ProtectedRoute>
  );
};

export default Index;
