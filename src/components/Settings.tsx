
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Save, Webhook, Copy, ExternalLink } from 'lucide-react';
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

  const copyWebhookExample = () => {
    const examplePayload = `{
  "event_type": "transcript_ready",
  "transcript_id": "abc123",
  "meeting_title": "Team Standup",
  "transcript_url": "https://fireflies.ai/transcript/abc123",
  "summary": "Meeting summary here...",
  "transcript_text": "Full transcript text here..."
}`;
    navigator.clipboard.writeText(examplePayload);
    toast({
      title: "Copied",
      description: "Example webhook payload copied to clipboard",
    });
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
            <Label htmlFor="webhookUrl">Your Webhook Endpoint</Label>
            <Input
              id="webhookUrl"
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-app.com/api/fireflies-webhook"
            />
            <p className="text-xs text-gray-500">
              This is the endpoint where Fireflies will send transcript notifications
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

          <Button onClick={handleSaveWebhook} disabled={!webhookUrl.trim()}>
            <Save className="h-4 w-4 mr-2" />
            Save Webhook Settings
          </Button>

          <div className="bg-blue-50 p-4 rounded-lg space-y-4">
            <h4 className="font-medium text-blue-900 mb-2">Setup Instructions:</h4>
            <ol className="text-sm text-blue-800 space-y-2">
              <li>1. Create a webhook endpoint in your backend that can receive POST requests</li>
              <li>2. Go to your Fireflies.ai dashboard</li>
              <li>3. Navigate to Integrations → Webhooks</li>
              <li>4. Add a new webhook with your endpoint URL above</li>
              <li>5. Select "transcript_ready" as the event type</li>
              <li>6. Configure your endpoint to process the transcript data</li>
            </ol>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-blue-900">Example Webhook Payload:</h5>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyWebhookExample}
                  className="text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <pre className="text-xs bg-blue-100 p-3 rounded overflow-x-auto">
{`{
  "event_type": "transcript_ready",
  "transcript_id": "abc123",
  "meeting_title": "Team Standup",
  "transcript_url": "https://fireflies.ai/transcript/abc123",
  "summary": "Meeting summary...",
  "transcript_text": "Full transcript text..."
}`}
              </pre>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <ExternalLink className="h-4 w-4" />
              <a 
                href="https://docs.fireflies.ai/graphql-api/webhooks" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Fireflies Webhook Documentation
              </a>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Important Notes:</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Webhooks require a backend server to receive the POST requests</li>
              <li>• This frontend app cannot directly receive webhooks from Fireflies</li>
              <li>• You'll need to implement a webhook endpoint that processes the data and sends it to TranscriptFlow</li>
              <li>• Consider using services like Zapier, Make.com, or your own API server</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
