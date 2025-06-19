
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ExtractedItem } from '@/hooks/useUserAppState';
import { useBatchSelection } from '@/contexts/BatchSelectionContext';
import ApprovalWorkflow from './ApprovalWorkflow';
import { Calendar, User, Edit3, Trash2, CheckSquare2 } from 'lucide-react';

interface ExtractedItemWithSelectionProps {
  item: ExtractedItem;
  onToggleApproval: (id: string) => void;
  onToggleCompletion?: (id: string) => void;
  onEdit: (id: string, updates: Partial<ExtractedItem>) => void;
  onDelete: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  transcriptName: string;
  showSelection?: boolean;
  showCompletionToggle?: boolean;
}

const ExtractedItemWithSelection = ({
  item,
  onToggleApproval,
  onToggleCompletion,
  onEdit,
  onDelete,
  onReject,
  transcriptName,
  showSelection = true,
  showCompletionToggle = true,
}: ExtractedItemWithSelectionProps) => {
  const { toggleItemSelection, isItemSelected } = useBatchSelection();
  const [isEditing, setIsEditing] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return '📋';
      case 'event': return '📅';
      case 'idea': return '💡';
      case 'contact': return '👤';
      default: return '📄';
    }
  };

  return (
    <Card className={`transition-all duration-200 ${item.completed ? 'opacity-75 bg-gray-50' : ''} ${isItemSelected(item.id) ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {showSelection && (
              <Checkbox
                checked={isItemSelected(item.id)}
                onCheckedChange={() => toggleItemSelection(item.id)}
                className="mt-1"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{getTypeIcon(item.type)}</span>
                <Badge variant="outline" className={getPriorityColor(item.priority)}>
                  {item.priority}
                </Badge>
                <Badge variant="outline">
                  {item.category}
                </Badge>
                {item.completed && (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Completed
                  </Badge>
                )}
              </div>
              <h3 className={`font-semibold ${item.completed ? 'line-through text-gray-500' : ''}`}>
                {item.title}
              </h3>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {item.dueDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
          </div>
        )}

        {item.assignee && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Assigned to: {item.assignee}</span>
          </div>
        )}

        {!item.approved && (
          <ApprovalWorkflow
            item={item}
            onApprove={onToggleApproval}
            onReject={onReject}
            transcriptName={transcriptName}
          />
        )}

        {item.approved && !item.completed && showCompletionToggle && onToggleCompletion && (
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-green-600 flex items-center gap-1">
              <CheckSquare2 className="h-4 w-4" />
              Approved
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleCompletion(item.id)}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              Mark Complete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExtractedItemWithSelection;
