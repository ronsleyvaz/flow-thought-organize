
import { CheckSquare, Calendar, Lightbulb, User, Clock, Flag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface ExtractedItemProps {
  item: {
    id: string;
    type: 'task' | 'event' | 'idea' | 'contact';
    title: string;
    description?: string;
    category: 'Business' | 'Personal' | 'Home' | 'Projects';
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    assignee?: string;
    confidence: number;
    approved: boolean;
  };
  onToggleApproval: (id: string) => void;
}

const ExtractedItem = ({ item, onToggleApproval }: ExtractedItemProps) => {
  const getTypeIcon = () => {
    switch (item.type) {
      case 'task':
        return <CheckSquare className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'idea':
        return <Lightbulb className="h-4 w-4" />;
      case 'contact':
        return <User className="h-4 w-4" />;
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case 'task':
        return 'text-blue-600';
      case 'event':
        return 'text-green-600';
      case 'idea':
        return 'text-yellow-600';
      case 'contact':
        return 'text-purple-600';
    }
  };

  const getCategoryColor = () => {
    switch (item.category) {
      case 'Business':
        return 'bg-blue-100 text-blue-700';
      case 'Personal':
        return 'bg-green-100 text-green-700';
      case 'Home':
        return 'bg-purple-100 text-purple-700';
      case 'Projects':
        return 'bg-orange-100 text-orange-700';
    }
  };

  const getPriorityColor = () => {
    switch (item.priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-200",
      item.approved ? "bg-green-50 border-green-200" : "bg-white hover:shadow-md"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={item.approved}
            onCheckedChange={() => onToggleApproval(item.id)}
            className="mt-1"
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <div className={cn("flex items-center", getTypeColor())}>
                {getTypeIcon()}
                <span className="ml-1 text-xs font-medium uppercase">
                  {item.type}
                </span>
              </div>
              <Badge variant="outline" className={getCategoryColor()}>
                {item.category}
              </Badge>
              <Badge variant="outline" className={getPriorityColor()}>
                <Flag className="h-3 w-3 mr-1" />
                {item.priority}
              </Badge>
              <Badge variant="outline" className="bg-gray-100 text-gray-600">
                {item.confidence}% confidence
              </Badge>
            </div>
            
            <h3 className="font-medium text-gray-900">{item.title}</h3>
            
            {item.description && (
              <p className="text-sm text-gray-600">{item.description}</p>
            )}
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {item.dueDate && (
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {item.dueDate}
                </div>
              )}
              {item.assignee && (
                <div className="flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  {item.assignee}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm">Edit</Button>
            <Button variant="ghost" size="sm">Delete</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExtractedItem;
