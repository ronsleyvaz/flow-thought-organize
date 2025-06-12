
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckSquare, Calendar, Lightbulb, User, FileText } from 'lucide-react';

interface ProcessingCardProps {
  transcript: {
    id: string;
    name: string;
    status: 'completed';
    extractedItems: number;
    timestamp: string;
    duration: string;
    type: 'meeting' | 'voice-memo' | 'brainstorm';
  };
  onViewDetails?: (id: string) => void;
}

const ProcessingCard = ({ transcript, onViewDetails }: ProcessingCardProps) => {
  const getTypeIcon = () => {
    switch (transcript.type) {
      case 'meeting':
        return <User className="h-4 w-4" />;
      case 'voice-memo':
        return <FileText className="h-4 w-4" />;
      case 'brainstorm':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = () => {
    switch (transcript.type) {
      case 'meeting':
        return 'text-primary';
      case 'voice-memo':
        return 'text-green-600';
      case 'brainstorm':
        return 'text-yellow-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <div className={`flex items-center ${getTypeColor()}`}>
                {getTypeIcon()}
                <span className="ml-1 text-xs font-medium uppercase tracking-wide">
                  {transcript.type.replace('-', ' ')}
                </span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {transcript.status}
              </Badge>
            </div>
            
            <h3 className="font-medium text-foreground leading-snug">{transcript.name}</h3>
            
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {transcript.duration}
              </div>
              <div className="flex items-center">
                <CheckSquare className="h-3 w-3 mr-1" />
                {transcript.extractedItems} items
              </div>
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(transcript.timestamp).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          {onViewDetails && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewDetails(transcript.id)}
              className="ml-4 transition-all duration-200 hover:bg-accent"
            >
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingCard;
