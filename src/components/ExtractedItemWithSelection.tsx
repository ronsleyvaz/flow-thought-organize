
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ExtractedItem } from '@/hooks/useUserAppState';
import { useBatchSelection } from '@/contexts/BatchSelectionContext';
import ApprovalWorkflow from './ApprovalWorkflow';
import { Calendar, User, Edit3, Trash2, CheckSquare2, ChevronDown, ChevronRight } from 'lucide-react';

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
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className={`border rounded-lg transition-all duration-200 ${item.completed ? 'opacity-75 bg-gray-50' : 'bg-white'} ${isItemSelected(item.id) ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="flex items-center justify-between p-3 hover:bg-gray-50">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {showSelection && (
              <Checkbox
                checked={isItemSelected(item.id)}
                onCheckedChange={() => toggleItemSelection(item.id)}
                className="flex-shrink-0"
              />
            )}
            
            <CollapsibleTrigger className="flex items-center gap-2 flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </CollapsibleTrigger>

            <span className="text-lg flex-shrink-0">{getTypeIcon(item.type)}</span>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-medium text-sm truncate ${item.completed ? 'line-through text-gray-500' : ''}`}>
                  {item.title}
                </h3>
                <Badge variant="outline" className={`${getPriorityColor(item.priority)} text-xs px-1 py-0`}>
                  {item.priority}
                </Badge>
                {item.completed && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 text-xs px-1 py-0">
                    ✓
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="truncate">{item.category}</span>
                {item.dueDate && (
                  <span className="flex items-center gap-1 flex-shrink-0">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.dueDate).toLocaleDateString()}
                  </span>
                )}
                {item.assignee && (
                  <span className="flex items-center gap-1 flex-shrink-0">
                    <User className="h-3 w-3" />
                    {item.assignee}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {item.approved && !item.completed && showCompletionToggle && onToggleCompletion && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleCompletion(item.id)}
                className="text-blue-600 hover:text-blue-700 h-7 px-2 text-xs"
              >
                Complete
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="h-7 w-7 p-0"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item.id)}
              className="text-red-600 hover:text-red-700 h-7 w-7 p-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <CollapsibleContent className="px-3 pb-3">
          <div className="pl-8 space-y-3 border-t pt-3">
            {item.description && (
              <div>
                <span className="text-xs font-medium text-gray-700">Description:</span>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              {item.dueDate && (
                <div>
                  <span className="text-xs font-medium text-gray-700">Due Date:</span>
                  <p className="text-gray-600">{new Date(item.dueDate).toLocaleDateString()}</p>
                </div>
              )}
              
              {item.assignee && (
                <div>
                  <span className="text-xs font-medium text-gray-700">Assigned to:</span>
                  <p className="text-gray-600">{item.assignee}</p>
                </div>
              )}
              
              <div>
                <span className="text-xs font-medium text-gray-700">Category:</span>
                <p className="text-gray-600">{item.category}</p>
              </div>
              
              <div>
                <span className="text-xs font-medium text-gray-700">Source:</span>
                <p className="text-gray-600 truncate">{transcriptName}</p>
              </div>
            </div>

            {!item.approved && (
              <ApprovalWorkflow
                item={item}
                onApprove={onToggleApproval}
                onReject={onReject}
                transcriptName={transcriptName}
              />
            )}

            {item.approved && (
              <div className="flex items-center gap-2 text-xs">
                <CheckSquare2 className="h-3 w-3 text-green-600" />
                <span className="text-green-600">Approved</span>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ExtractedItemWithSelection;
