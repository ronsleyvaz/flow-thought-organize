
import { Card, CardContent } from '@/components/ui/card';

interface ApiKeyWarningProps {
  apiKey: string;
}

const ApiKeyWarning = ({ apiKey }: ApiKeyWarningProps) => {
  if (apiKey) return null;

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardContent className="p-4">
        <p className="text-yellow-800 text-sm">
          Please configure your OpenAI API key in Settings to enable transcript processing.
        </p>
      </CardContent>
    </Card>
  );
};

export default ApiKeyWarning;
