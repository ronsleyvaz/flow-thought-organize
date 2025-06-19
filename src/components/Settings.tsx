
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff, Save, Key, Trash2, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FirefliesIntegration from './FirefliesIntegration';
import StateManager from './StateManager';

interface SettingsProps {
  onApiKeyChange: (apiKey: string) => void;
  onFirefliesTranscriptProcessed: (extractedData: any, transcriptId: string) => void;
  autoSave: boolean;
  onAutoSaveChange: (enabled: boolean) => void;
  exportState: () => void;
  importState: (file: File) => void;
  clearAllData: () => void;
  lastSaved?: string;
}

const Settings = ({ 
  onApiKeyChange, 
  onFirefliesTranscriptProcessed, 
  autoSave, 
  onAutoSaveChange,
  exportState,
  importState,
  clearAllData,
  lastSaved
}: SettingsProps) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedApiKey = localStorage.getItem('openai_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      onApiKeyChange(storedApiKey);
    }
  }, [onApiKeyChange]);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Missing API Key",
        description: "Please enter your OpenAI API key",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('openai_api_key', apiKey);
    onApiKeyChange(apiKey);
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2000);
    
    toast({
      title: "API Key Saved",
      description: "OpenAI API key saved successfully",
    });
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey('');
    onApiKeyChange('');
    
    toast({
      title: "API Key Cleared",
      description: "OpenAI API key has been removed",
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Configure your API keys, integrations, and preferences</p>
      </div>

      {/* Auto-Save Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-save">Auto-save</Label>
              <p className="text-sm text-gray-500">
                Automatically save your data as you work
              </p>
            </div>
            <Switch
              id="auto-save"
              checked={autoSave}
              onCheckedChange={onAutoSaveChange}
            />
          </div>
          <p className="text-xs text-gray-500">
            When enabled, your transcripts and extracted items are automatically saved to your browser's local storage.
          </p>
        </CardContent>
      </Card>

      {/* State Management */}
      <StateManager
        onExport={exportState}
        onImport={importState}
        onClear={clearAllData}
        lastSaved={lastSaved}
      />

      {/* OpenAI API Key Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="h-5 w-5 mr-2" />
            OpenAI API Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How to get your OpenAI API Key:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI API Keys</a></li>
              <li>Sign in to your OpenAI account</li>
              <li>Click "Create new secret key"</li>
              <li>Copy the key and paste it below</li>
            </ol>
          </div>

          <div className="space-y-2">
            <Label htmlFor="openai-api-key">OpenAI API Key</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  id="openai-api-key"
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button onClick={handleSaveApiKey} disabled={!apiKey.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              {apiKey && (
                <Button variant="outline" onClick={handleClearApiKey}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
            {apiKeySaved && (
              <p className="text-sm text-green-600">API key saved successfully!</p>
            )}
          </div>

          <p className="text-xs text-gray-500">
            Your API key is stored locally in your browser and is only used to make requests to OpenAI.
          </p>
        </CardContent>
      </Card>

      {/* Fireflies Integration */}
      <FirefliesIntegration 
        onTranscriptProcessed={onFirefliesTranscriptProcessed}
        apiKey={apiKey}
      />
    </div>
  );
};

export default Settings;
