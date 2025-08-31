
import React from 'react';
import { Mic, MicOff, Volume2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { groceryApiService } from '@/services/groceryApi';
import { useGroceryHistory } from '@/contexts/GroceryHistoryContext';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  isRecording: boolean;
  onRecordingChange: (recording: boolean) => void;
  disabled?: boolean;
  onSubscriptionClick: () => void;
}

export const VoiceInput = ({ 
  onTranscription, 
  isRecording, 
  onRecordingChange, 
  disabled = false,
  onSubscriptionClick
}: VoiceInputProps) => {
  const [transcription, setTranscription] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [recognition, setRecognition] = React.useState<SpeechRecognition | null>(null);
  const [backendConnected, setBackendConnected] = React.useState(false);
  const { toast } = useToast();
  const { addItemsToCurrentList } = useGroceryHistory();

  React.useEffect(() => {
    // Check backend connection
    checkBackendConnection();
    
    // Check if speech recognition is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        console.log('Speech recognition started');
      };

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const currentTranscript = finalTranscript || interimTranscript;
        setTranscription(currentTranscript);

        if (finalTranscript) {
          console.log('Final transcript:', finalTranscript);
          setIsProcessing(true);
          processWithBackend(finalTranscript);
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Voice Recognition Error",
          description: `Error: ${event.error}. Please try again.`,
          variant: "destructive"
        });
        onRecordingChange(false);
        setIsProcessing(false);
      };

      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        if (isRecording && !isProcessing) {
          onRecordingChange(false);
        }
      };

      setRecognition(recognitionInstance);
    } else {
      console.warn('Speech recognition not supported');
      toast({
        title: "Not Supported",
        description: "Voice recognition is not supported in this browser. Please try Chrome or Edge.",
        variant: "destructive"
      });
    }
  }, []);

  const checkBackendConnection = async () => {
    console.log('🔍 CHECKING BACKEND CONNECTION...');
    try {
      const response = await groceryApiService.checkHealth();
      console.log('🔍 Health check response:', response);
      
      if (response.data) {
        setBackendConnected(true);
        console.log('✅ Backend connected successfully:', response.data);
      } else {
        setBackendConnected(false);
        console.error('❌ Backend health check failed:', response.error);
      }
    } catch (error) {
      setBackendConnected(false);
      console.error('❌ Backend connection failed:', error);
    }
  };

  const processWithBackend = async (transcript: string) => {
    try {
      console.log('🎯 processWithBackend called with transcript:', transcript);
      
      // Improved parsing for natural speech patterns
      let items = transcript
        // First, split by obvious delimiters (commas, semicolons, "and")
        .split(/[,;]|(?:\s+and\s+)/gi)
        .map(item => item.trim())
        .filter(item => item.length > 0);

      console.log('🔍 After initial split:', items);

      // If we only got one item, try to extract items from natural speech
      if (items.length === 1) {
        const text = items[0].toLowerCase();
        console.log('🔍 Single item detected, processing:', text);
        
        // Remove common phrases
        const cleanedText = text
          .replace(/^(i need|i want|get me|buy|purchase|add)\s+/i, '')
          .replace(/\s+(please|thanks|thank you)$/i, '')
          .trim();
        
        console.log('🔍 Cleaned text:', cleanedText);
        
        // Split by spaces and filter out common words, keeping likely grocery items
        const words = cleanedText.split(/\s+/);
        console.log('🔍 Words after split:', words);
        
        const groceryItems = words.filter(word => {
          const isCommon = isCommonWord(word);
          const isShort = word.length <= 2;
          const isArticle = /^(the|some|a|an|my|our|your)$/.test(word);
          console.log(`🔍 Word "${word}": common=${isCommon}, short=${isShort}, article=${isArticle}`);
          return word.length > 2 && !isCommon && !isArticle;
        });
        
        console.log('🔍 Filtered grocery items:', groceryItems);
        items = groceryItems.length > 1 ? groceryItems : items;
      }

      // Final filter for common words
      items = items.filter(item => !isCommonWord(item));

      console.log('🔍 Final parsed items for backend:', items);
      console.log('📋 Current grocery context state:', { addItemsToCurrentList });
      console.log('🔗 Backend connection status:', backendConnected);

      if (items.length > 0) {
        // Check backend connection directly before processing
        console.log('🔗 Checking backend connection before processing...');
        const healthResponse = await groceryApiService.checkHealth();
        const isBackendAvailable = !!healthResponse.data;
        
        console.log('🔗 Backend available:', isBackendAvailable);
        
        if (isBackendAvailable) {
          // Send to backend for AI processing
          console.log('🚀 SENDING TO BACKEND /grocery-list endpoint with items:', items);
          console.log('🚀 API call starting...');
          
          const response = await groceryApiService.organizeGroceries(items);
          
          console.log('🔥 BACKEND RESPONSE RECEIVED:', response);
          
          if (response.data) {
            console.log('Backend organized groceries:', response.data);
            
            // Extract all items from organized categories
            const organizedData = response.data.organized_list || response.data;
            console.log('🤖 Organized data from backend:', organizedData);
            
            // Handle the organized response - extract items from categories
            let allItems = [];
            if (typeof organizedData === 'object') {
              // If it's categorized (object with category keys)
              allItems = Object.values(organizedData).flat();
            } else if (Array.isArray(organizedData)) {
              // If it's already a flat array
              allItems = organizedData;
            }
            
            // Ensure all items are strings
            const itemStrings = allItems.map(item => 
              typeof item === 'string' ? item : item.name || item.item || String(item)
            );
            
            console.log('📦 All items extracted:', allItems);
            console.log('📦 Item strings for context:', itemStrings);
            console.log('🚀 About to call addItemsToCurrentList with:', itemStrings);
            
            // Add items to the grocery list context
            addItemsToCurrentList(itemStrings);
            
            console.log('✅ addItemsToCurrentList called successfully');
            
            toast({
              title: "AI Processed Successfully! 🤖",
              description: `Added ${allItems.length} items organized by store sections`,
            });
          } else {
            throw new Error(response.error || 'Failed to organize groceries');
          }
        } else {
          // Fallback: add items directly without AI processing
          console.log('📴 Backend offline - using fallback mode');
          console.log('🔄 Adding items directly:', items);
          
          addItemsToCurrentList(items);
          
          console.log('✅ Fallback addItemsToCurrentList called');
          
          toast({
            title: "Items Added! 📝",
            description: `Added ${items.length} items (backend offline, no AI processing)`,
            variant: "default"
          });
        }
      } else {
        toast({
          title: "No Items Detected",
          description: "Please try speaking grocery items like 'milk, eggs, and bread'",
          variant: "destructive"
        });
      }

      // Also call the parent callback for backward compatibility
      onTranscription(transcript);
      
    } catch (error) {
      console.error('Backend processing error:', error);
      
      // Fallback: parse locally and add to list
      const fallbackItems = transcript
        .split(/[,;]|and(?:\s|$)/gi)
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .filter(item => !isCommonWord(item));
      
      if (fallbackItems.length > 0) {
        addItemsToCurrentList(fallbackItems);
        
        toast({
          title: "Items Added (Fallback)",
          description: `Added ${fallbackItems.length} items without AI processing`,
          variant: "default"
        });
      }
      
      onTranscription(transcript);
    } finally {
      setIsProcessing(false);
      onRecordingChange(false);
    }
  };

  const isCommonWord = (word: string): boolean => {
    const commonWords = [
      'and', 'or', 'the', 'a', 'an', 'i', 'need', 'want', 'buy', 'get', 'also', 
      'plus', 'some', 'my', 'our', 'your', 'please', 'thanks', 'thank', 'you',
      'add', 'purchase', 'me', 'us', 'we', 'they', 'them', 'it', 'is', 'are',
      'have', 'has', 'do', 'does', 'will', 'would', 'could', 'should', 'can'
    ];
    return commonWords.includes(word.toLowerCase()) || word.length < 2;
  };

  const handleStartRecording = () => {
    if (disabled) return;
    
    try {
      // Stop any existing recognition instance first
      if (recognition) {
        try {
          recognition.stop();
          recognition.abort();
        } catch (e) {
          console.log('Previous recognition cleanup:', e);
        }
      }
      
      // Small delay to ensure cleanup is complete
      setTimeout(() => {
        // Create a fresh recognition instance for each recording session
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          const newRecognitionInstance = new SpeechRecognition();
          
          newRecognitionInstance.continuous = true;
          newRecognitionInstance.interimResults = true;
          newRecognitionInstance.lang = 'en-US';

          newRecognitionInstance.onstart = () => {
            console.log('Speech recognition started');
          };

          newRecognitionInstance.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcript;
              } else {
                interimTranscript += transcript;
              }
            }

            const currentTranscript = finalTranscript || interimTranscript;
            setTranscription(currentTranscript);

            if (finalTranscript) {
              console.log('Final transcript:', finalTranscript);
              setIsProcessing(true);
              processWithBackend(finalTranscript);
            }
          };

          newRecognitionInstance.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            
            if (event.error !== 'aborted') {
              toast({
                title: "Voice Recognition Error",
                description: `Error: ${event.error}. Please try again.`,
                variant: "destructive"
              });
            }
            
            onRecordingChange(false);
            setIsProcessing(false);
          };

          newRecognitionInstance.onend = () => {
            console.log('Speech recognition ended');
            if (isRecording && !isProcessing) {
              onRecordingChange(false);
            }
          };

          setRecognition(newRecognitionInstance);
          
          onRecordingChange(true);
          setTranscription('');
          setIsProcessing(false);
          
          // Start the new recognition instance
          try {
            newRecognitionInstance.start();
            console.log('Started voice recording for backend processing');
          } catch (startError) {
            console.error('Error starting new recognition:', startError);
            onRecordingChange(false);
            toast({
              title: "Error",
              description: "Failed to start voice recognition. Please try again in a moment.",
              variant: "destructive"
            });
          }
        }
      }, 100); // 100ms delay to ensure cleanup
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Failed to start voice recognition. Please try again.",
        variant: "destructive"
      });
      onRecordingChange(false);
    }
  };

  const handleStopRecording = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {
        console.log('Stop recognition error:', e);
      }
    }
    onRecordingChange(false);
    setIsProcessing(false);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-grocery">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Add Items by Voice</h2>
            <p className="text-muted-foreground">
              Tap the microphone and speak naturally: "I need milk, eggs, and bread"
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${backendConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <p className="text-sm text-muted-foreground">
                Backend: {backendConnected ? 'Connected' : 'Disconnected'} • AI Processing Available
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              {isRecording && (
                <div className="absolute inset-0 rounded-full bg-red-500 recording-pulse"></div>
              )}
              <Button
                size="lg"
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={disabled || !recognition}
                className={`
                  relative w-24 h-24 rounded-full shadow-lg transition-all duration-300
                  ${isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-gradient-primary hover:opacity-90 text-white'
                  }
                  ${disabled || !recognition ? 'opacity-50 cursor-not-allowed' : ''}
                  ${isRecording ? 'pulse-mic' : ''}
                `}
              >
                {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </Button>
            </div>
          </div>

          {!recognition && (
            <div className="bg-warning/10 border border-warning rounded-lg p-4">
              <p className="text-warning font-medium">
                Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.
              </p>
            </div>
          )}

          {!backendConnected && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 font-medium">
                ⚠️ Backend not connected. Make sure Flask server is running on localhost:5000
              </p>
            </div>
          )}

          {isRecording && (
            <div className="flex items-center justify-center space-x-2 text-red-500">
              <Volume2 className="w-5 h-5 animate-pulse" />
              <span className="font-medium">Listening & Processing with AI...</span>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center space-x-2 text-primary">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium">AI is organizing your groceries...</span>
            </div>
          )}

          {transcription && (
            <div className="bg-gradient-secondary rounded-lg p-4 border border-green-300">
              <p className="text-sm text-muted-foreground mb-1">Transcription:</p>
              <p className="text-lg font-medium text-foreground">{transcription}</p>
            </div>
          )}

          {disabled && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-300 rounded-lg p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    Subscription Required
                  </p>
                  <p className="text-gray-600 mt-2">
                    Subscribe to continue using unlimited voice input and all premium features.
                  </p>
                </div>
                <Button 
                  onClick={onSubscriptionClick}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Choose Your Plan
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
