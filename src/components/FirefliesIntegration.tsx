
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Save, RefreshCw, Download, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firefliesService } from '@/services/firefliesService';
import { extractItemsFromText } from '@/services/openaiService';
import TranscriptSelector from '@/components/TranscriptSelector';

interface FirefliesIntegrationProps {
  onTranscriptProcessed: (items: any, transcriptId: string) => void;
  apiKey: string;
}

interface Transcript {
  id: string;
  title: string;
  transcript_url: string;
  summary: {
    overview: string;
    action_items: string[];
    keywords: string[];
  };
  date: string;
  duration: number;
}

const FirefliesIntegration = ({ onTranscriptProcessed, apiKey }: FirefliesIntegrationProps) => {
  const [firefliesToken, setFirefliesToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [tokenSaved, setTokenSaved] = useState(false);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [showTranscriptSelector, setShowTranscriptSelector] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedToken = firefliesService.getStoredToken();
    if (storedToken) {
      setFirefliesToken(storedToken);
      setIsConfigured(true);
    }
    setLastSyncTime(localStorage.getItem('fireflies_last_sync'));
  }, []);

  const handleSaveToken = () => {
    if (!firefliesToken.trim()) {
      toast({
        title: "Missing Token",
        description: "Please enter your Fireflies API token",
        variant: "destructive",
      });
      return;
    }

    firefliesService.setApiToken(firefliesToken);
    setIsConfigured(true);
    setTokenSaved(true);
    setTimeout(() => setTokenSaved(false), 2000);
    
    toast({
      title: "Token Saved",
      description: "Fireflies API token configured successfully",
    });
  };

  const handleDisconnect = () => {
    firefliesService.clearToken();
    setFirefliesToken('');
    setIsConfigured(false);
    setLastSyncTime(null);
    localStorage.removeItem('fireflies_last_sync');
    
    toast({
      title: "Disconnected",
      description: "Fireflies integration disconnected",
    });
  };

  const handleFetchTranscripts = async () => {
    if (!apiKey) {
      toast({
        title: "OpenAI API Key Required",
        description: "Please configure your OpenAI API key first",
        variant: "destructive",
      });
      return;
    }

    setIsFetching(true);
    
    try {
      const fetchedTranscripts = await firefliesService.getRecentTranscripts(10);
      setTranscripts(fetchedTranscripts);
      setShowTranscriptSelector(true);
      
      toast({
        title: "Transcripts Loaded",
        description: `Found ${fetchedTranscripts.length} recent transcripts`,
      });
    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: "Fetch Failed",
        description: error instanceof Error ? error.message : "Failed to fetch transcripts",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleTranscriptsSelected = async (selectedTranscripts: Transcript[]) => {
    setIsProcessing(true);
    let processedCount = 0;

    try {
      for (const transcript of selectedTranscripts) {
        console.log(`Processing transcript: ${transcript.title}`);
        
        // Fetch the actual transcript content using the transcript ID
        const transcriptContent = await firefliesService.getTranscriptContent(transcript.id);
        
        if (transcriptContent && transcriptContent.trim()) {
          console.log(`Transcript content length: ${transcriptContent.length}`);
          const extractedData = await extractItemsFromText(transcriptContent, apiKey);
          
          console.log('Extracted data from ChatGPT:', extractedData);
          
          if (extractedData && (
            extractedData.tasks.length > 0 || 
            extractedData.events.length > 0 || 
            extractedData.ideas.length > 0 || 
            extractedData.contacts.length > 0
          )) {
            console.log('Calling onTranscriptProcessed with data:', extractedData);
            onTranscriptProcessed(extractedData, transcript.id);
            processedCount++;
          } else {
            console.log('No items extracted from transcript:', transcript.title);
          }
        } else {
          console.log('No content found for transcript:', transcript.title);
        }
      }

      const syncTime = new Date().toISOString();
      setLastSyncTime(syncTime);
      localStorage.setItem('fireflies_last_sync', syncTime);
      setShowTranscriptSelector(false);

      toast({
        title: "Processing Complete",
        description: `Successfully processed ${processedCount} of ${selectedTranscripts.length} transcripts`,
      });
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process transcripts",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToMain = () => {
    setShowTranscriptSelector(false);
    setTranscripts([]);
  };

  if (!isConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect to Fireflies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How to get your Fireflies API Token:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Visit <a href="https://app.fireflies.ai/integrations/custom/api" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center">Fireflies API Settings <ExternalLink className="h-3 w-3 ml-1" /></a></li>
              <li>Sign in with your Google or Microsoft account</li>
              <li>Generate a new API token</li>
              <li>Copy the token and paste it below</li>
            </ol>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fireflies-token">Fireflies API Token</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  id="fireflies-token"
                  type={showToken ? 'text' : 'password'}
                  value={firefliesToken}
                  onChange={(e) => setFirefliesToken(e.target.value)}
                  placeholder="Your Fireflies API token"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button onClick={handleSaveToken} disabled={!firefliesToken.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
            {tokenSaved && (
              <p className="text-sm text-green-600">API token saved successfully!</p>
            )}
          </div>

          <p className="text-xs text-gray-500">
            Your API token is stored locally in your browser and never sent to our servers.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (showTranscriptSelector) {
    return (
      <TranscriptSelector
        transcripts={transcripts}
        onTranscriptsSelected={handleTranscriptsSelected}
        onBack={handleBackToMain}
        isProcessing={isProcessing}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Download className="h-5 w-5 mr-2 text-green-600" />
            Connected to Fireflies
          </span>
          <Button variant="outline" size="sm" onClick={handleDisconnect}>
            Disconnect
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Fireflies integration active</strong>
          </p>
          {lastSyncTime && (
            <p className="text-xs text-green-600 mt-1">
              Last sync: {new Date(lastSyncTime).toLocaleString()}
            </p>
          )}
        </div>

        <Button 
          onClick={handleFetchTranscripts} 
          disabled={isFetching}
          className="w-full"
        >
          {isFetching ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Loading Transcripts...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Browse Recent Transcripts
            </>
          )}
        </Button>

        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click "Browse Recent Transcripts" to see your latest Fireflies transcripts</li>
            <li>• Select which transcripts you want to process</li>
            <li>• Each selected transcript will be analyzed for tasks, events, ideas, and contacts</li>
            <li>• Extracted items will appear in your TranscriptFlow dashboard</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default FirefliesIntegration;
