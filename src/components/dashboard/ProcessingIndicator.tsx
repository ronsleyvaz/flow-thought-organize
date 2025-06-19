
import { Card, CardContent } from '@/components/ui/card';

interface ProcessingIndicatorProps {
  isProcessing: boolean;
}

const ProcessingIndicator = ({ isProcessing }: ProcessingIndicatorProps) => {
  if (!isProcessing) return null;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin h-4 w-4 border-b-2 border-blue-600 rounded-full"></div>
          <p className="text-blue-800 text-sm">Processing with OpenAI...</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingIndicator;
