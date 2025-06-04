
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProcessingCardProps {
  transcript: {
    id: string;
    name: string;
    status: 'processing' | 'completed' | 'review';
    extractedItems: number;
    timestamp: string;
    duration: string;
    type: 'meeting' | 'voice-memo' | 'brainstorm';
  };
}

const ProcessingCard = ({ transcript }: ProcessingCardProps) => {
  const getStatusIcon = () => {
    switch (transcript.status) {
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'review':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (transcript.status) {
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case 'review':
        return <Badge className="bg-orange-100 text-orange-700">Needs Review</Badge>;
    }
  };

  const getTypeColor = () => {
    switch (transcript.type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-700';
      case 'voice-memo':
        return 'bg-purple-100 text-purple-700';
      case 'brainstorm':
        return 'bg-green-100 text-green-700';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <FileText className="h-5 w-5 mr-2 text-gray-600" />
            {transcript.name}
          </CardTitle>
          {getStatusIcon()}
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>{transcript.timestamp}</span>
          <span>•</span>
          <span>{transcript.duration}</span>
          <Badge variant="outline" className={getTypeColor()}>
            {transcript.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {getStatusBadge()}
            {transcript.status !== 'processing' && (
              <span className="text-sm text-gray-600">
                {transcript.extractedItems} items extracted
              </span>
            )}
          </div>
          {transcript.status === 'review' && (
            <Button size="sm">Review Items</Button>
          )}
          {transcript.status === 'completed' && (
            <Button variant="outline" size="sm">View Details</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingCard;
