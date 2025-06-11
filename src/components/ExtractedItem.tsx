
import { useState } from 'react';
import { CheckSquare, Calendar, Lightbulb, User, Clock, Flag, FileText, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import LoadingButton from './LoadingButton';
import ConfirmDialog from './ConfirmDialog';

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
    completed?: boolean;
    sourceTranscriptId?: string;
    extractedAt?: string;
  };
  onToggleApproval: (id: string) => void;
  onToggleCompletion?: (id: string) => void;
  onEdit?: (id: string, updates: Partial<ExtractedItemProps['item']>) => void;
  onDelete?: (id: string) => void;
  transcriptName?: string;
  showCompletionToggle?: boolean;
}

const ExtractedItem = ({ 
  item, 
  onToggleApproval, 
  onToggleCompletion,
  onEdit, 
  onDelete, 
  transcriptName,
  showCompletionToggle = false 
}: ExtractedItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(item);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        return 'text-primary';
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
        return 'bg-primary/10 text-primary border-primary/20';
      case 'Personal':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Home':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Projects':
        return 'bg-orange-50 text-orange-700 border-orange-200';
    }
  };

  const getPriorityColor = () => {
    switch (item.priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      onEdit?.(item.id, editedItem);
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedItem(item);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete?.(item.id);
    setShowDeleteConfirm(false);
  };

  const handleApprovalToggle = async () => {
    setIsLoading(true);
    try {
      onToggleApproval(item.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompletionToggle = async () => {
    if (onToggleCompletion) {
      setIsLoading(true);
      try {
        onToggleCompletion(item.id);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <Card className={cn(
        "transition-all duration-200 hover:shadow-md",
        item.completed ? "bg-muted/50 border-muted opacity-75" : 
        item.approved ? "bg-green-50/50 border-green-200 shadow-sm" : "bg-card hover:bg-accent/5"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex flex-col gap-2">
              {/* Single checkbox that shows completion status when approved and enabled */}
              {showCompletionToggle && item.approved ? (
                <Checkbox
                  checked={item.completed || false}
                  onCheckedChange={handleCompletionToggle}
                  disabled={isLoading}
                  className="transition-all duration-200"
                />
              ) : (
                <Checkbox
                  checked={item.approved}
                  onCheckedChange={handleApprovalToggle}
                  disabled={isLoading || item.completed}
                  className="transition-all duration-200"
                />
              )}
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center space-x-2 flex-wrap">
                <div className={cn("flex items-center transition-colors duration-200", getTypeColor())}>
                  {getTypeIcon()}
                  <span className="ml-1 text-xs font-medium uppercase tracking-wide">
                    {item.type}
                  </span>
                </div>
                
                {!item.approved && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Needs Review
                  </Badge>
                )}
                
                {item.completed && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
                
                <Badge variant="outline" className={cn("transition-colors duration-200", getCategoryColor())}>
                  {item.category}
                </Badge>
                <Badge variant="outline" className={cn("transition-colors duration-200", getPriorityColor())}>
                  <Flag className="h-3 w-3 mr-1" />
                  {item.priority}
                </Badge>
                <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                  {item.confidence}% confidence
                </Badge>
              </div>
              
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={editedItem.title}
                    onChange={(e) => setEditedItem({...editedItem, title: e.target.value})}
                    className="font-medium"
                    placeholder="Enter title..."
                  />
                  {editedItem.description && (
                    <Textarea
                      value={editedItem.description}
                      onChange={(e) => setEditedItem({...editedItem, description: e.target.value})}
                      className="text-sm resize-none"
                      rows={2}
                      placeholder="Enter description..."
                    />
                  )}
                  <div className="flex space-x-2">
                    <LoadingButton 
                      size="sm" 
                      onClick={handleSave}
                      loading={isLoading}
                      loadingText="Saving..."
                    >
                      Save
                    </LoadingButton>
                    <LoadingButton 
                      size="sm" 
                      variant="outline" 
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      Cancel
                    </LoadingButton>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-medium text-foreground leading-snug">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  )}
                </>
              )}
              
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
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
                {transcriptName && (
                  <div className="flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    From: {transcriptName}
                  </div>
                )}
                {item.extractedAt && (
                  <div className="flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    Extracted {new Date(item.extractedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              {!item.approved && !item.completed && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
                  <p className="text-blue-800">
                    <strong>Review needed:</strong> Check this item's accuracy and approve it to mark as ready for action.
                  </p>
                </div>
              )}
            </div>
            
            {!isEditing && (
              <div className="flex space-x-1">
                <LoadingButton 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  disabled={item.completed}
                  className="h-8 w-8 p-0 hover:bg-accent transition-colors duration-200"
                >
                  <Edit2 className="h-4 w-4" />
                </LoadingButton>
                <LoadingButton 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowDeleteConfirm(true)} 
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </LoadingButton>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  );
};

export default ExtractedItem;
