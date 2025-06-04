
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Save, Webhook, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SettingsProps {
  onApiKeyChange: (apiKey: string) => void;
}

const Settings = ({ onApiKeyChange }: SettingsProps) => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(localStorage.getItem('fireflies_webhook') || '');
  const [webhookSecret, setWebhookSecret] = useState(localStorage.getItem('fireflies_webhook_secret') || '');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    localStorage.setItem('openai_api_key', apiKey);
    onApiKeyChange(apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveWebhook = () => {
    localStorage.setItem('fireflies_webhook', webhookUrl);
    localStorage.setItem('fireflies_webhook_secret', webhookSecret);
    toast({
      title: "Webhook Settings Saved",
      description: "Fireflies webhook configuration has been updated.",
    });
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL first",
        variant: "destructive",
      });
      return;
    }

    setIsTestingWebhook(true);
    try {
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webhookUrl,
          secret: webhookSecret
        }),
      });

      if (response.ok) {
        toast({
          title: "Webhook Test Successful",
          description: "Your webhook is properly configured and reachable.",
        });
      } else {
        throw new Error('Webhook test failed');
      }
    } catch (error) {
      toast({
        title: "Webhook Test Failed",
        description: "Could not reach the webhook URL. Please check your configuration.",
        variant: "destructive",
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>OpenAI API Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">OpenAI API Key</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  id="apiKey"
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
              <Button onClick={handleSave} disabled={!apiKey.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
            {saved && (
              <p className="text-sm text-green-600">API key saved successfully!</p>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Your API key is stored locally in your browser and never sent to our servers.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Webhook className="h-5 w-5 mr-2" />
            Fireflies Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-app.com/api/fireflies-webhook"
            />
            <p className="text-xs text-gray-500">
              This is where Fireflies will send new transcript notifications
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="webhookSecret">Webhook Secret (Optional)</Label>
            <Input
              id="webhookSecret"
              type="password"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder="Optional secret for webhook verification"
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleSaveWebhook} disabled={!webhookUrl.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Save Webhook
            </Button>
            <Button 
              variant="outline" 
              onClick={handleTestWebhook} 
              disabled={!webhookUrl.trim() || isTestingWebhook}
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isTestingWebhook ? 'Testing...' : 'Test Webhook'}
            </Button>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Setup Instructions:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Go to your Fireflies.ai dashboard</li>
              <li>2. Navigate to Integrations → Webhooks</li>
              <li>3. Add a new webhook with the URL above</li>
              <li>4. Select "New Meeting Transcribed" as the trigger event</li>
              <li>5. Test the webhook to ensure it's working</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
