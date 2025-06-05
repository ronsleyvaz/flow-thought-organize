
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, LogIn, LogOut, RefreshCw, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firefliesService } from '@/services/firefliesService';
import { extractItemsFromText } from '@/services/openaiService';

interface FirefliesIntegrationProps {
  onTranscriptProcessed: (items: any, transcriptId: string) => void;
  apiKey: string;
}

const FirefliesIntegration = ({ onTranscriptProcessed, apiKey }: FirefliesIntegrationProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsAuthenticated(firefliesService.isAuthenticated());
    setCurrentUser(firefliesService.getCurrentUser());
    setLastSyncTime(localStorage.getItem('fireflies_last_sync'));
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoggingIn(true);
    
    try {
      const success = await firefliesService.login(email, password);
      
      if (success) {
        setIsAuthenticated(true);
        setCurrentUser(firefliesService.getCurrentUser());
        setPassword(''); // Clear password for security
        toast({
          title: "Login Successful",
          description: "Connected to Fireflies successfully",
        });
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "Failed to connect to Fireflies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    firefliesService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLastSyncTime(null);
    localStorage.removeItem('fireflies_last_sync');
    toast({
      title: "Logged Out",
      description: "Disconnected from Fireflies",
    });
  };

  const handleSyncTranscripts = async () => {
    if (!apiKey) {
      toast({
        title: "OpenAI API Key Required",
        description: "Please configure your OpenAI API key in settings first",
        variant: "destructive",
      });
      return;
    }

    setIsFetching(true);
    
    try {
      const transcripts = await firefliesService.getRecentTranscripts(5);
      let processedCount = 0;

      for (const transcript of transcripts) {
        if (transcript.transcript && transcript.transcript.trim()) {
          console.log(`Processing transcript: ${transcript.title}`);
          
          const extractedData = await extractItemsFromText(transcript.transcript, apiKey);
          
          if (extractedData && (
            extractedData.tasks.length > 0 || 
            extractedData.events.length > 0 || 
            extractedData.ideas.length > 0 || 
            extractedData.contacts.length > 0
          )) {
            onTranscriptProcessed(extractedData, transcript.id);
            processedCount++;
          }
        }
      }

      const syncTime = new Date().toISOString();
      setLastSyncTime(syncTime);
      localStorage.setItem('fireflies_last_sync', syncTime);

      toast({
        title: "Sync Complete",
        description: `Processed ${processedCount} transcripts from Fireflies`,
      });
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync transcripts",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LogIn className="h-5 w-5 mr-2" />
            Connect to Fireflies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fireflies-email">Email</Label>
            <Input
              id="fireflies-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fireflies-password">Password</Label>
            <div className="relative">
              <Input
                id="fireflies-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your Fireflies password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleLogin} 
            disabled={isLoggingIn || !email || !password}
            className="w-full"
          >
            {isLoggingIn ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-2" />
                Connect to Fireflies
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500">
            Use your Fireflies.ai account credentials to connect and automatically sync transcripts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <LogIn className="h-5 w-5 mr-2 text-green-600" />
            Connected to Fireflies
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-green-800">
            Connected as: <strong>{currentUser?.name || currentUser?.email}</strong>
          </p>
          {lastSyncTime && (
            <p className="text-xs text-green-600 mt-1">
              Last sync: {new Date(lastSyncTime).toLocaleString()}
            </p>
          )}
        </div>

        <Button 
          onClick={handleSyncTranscripts} 
          disabled={isFetching}
          className="w-full"
        >
          {isFetching ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Syncing Transcripts...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Sync Recent Transcripts
            </>
          )}
        </Button>

        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click "Sync Recent Transcripts" to fetch your latest Fireflies transcripts</li>
            <li>• Each transcript will be automatically processed for tasks, events, ideas, and contacts</li>
            <li>• Extracted items will appear in your TranscriptFlow dashboard</li>
            <li>• You can sync manually or set up regular syncing</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default FirefliesIntegration;
