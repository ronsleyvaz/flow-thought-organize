import { useState } from 'react';
import { CheckSquare, Calendar, Lightbulb, User, Clock, Flag, FileText, Edit2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import LoadingButton from './LoadingButton';
import ConfirmDialog from './ConfirmDialog';
import { validateExtractedItem, sanitizeInput, ValidationError } from '@/utils/validation';

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
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

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
      // Sanitize inputs
      const sanitizedItem = {
        ...editedItem,
        title: sanitizeInput(editedItem.title),
        description: editedItem.description ? sanitizeInput(editedItem.description) : undefined,
        assignee: editedItem.assignee ? sanitizeInput(editedItem.assignee) : undefined,
      };

      // Validate
      const errors = validateExtractedItem(sanitizedItem);
      setValidationErrors(errors);
      
      if (errors.length === 0) {
        onEdit?.(item.id, sanitizedItem);
        setIsEditing(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedItem(item);
    setValidationErrors([]);
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

  const getFieldError = (fieldName: string) => {
    return validationErrors.find(error => error.field === fieldName);
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
              {/* Show confidence score */}
              <div className="text-xs text-center">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs px-1",
                    item.confidence >= 85 ? "bg-green-50 text-green-700 border-green-200" :
                    item.confidence >= 70 ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                    "bg-red-50 text-red-700 border-red-200"
                  )}
                >
                  {item.confidence}%
                </Badge>
              </div>
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
                  <div>
                    <Input
                      value={editedItem.title}
                      onChange={(e) => setEditedItem({...editedItem, title: e.target.value})}
                      className={cn(
                        "font-medium",
                        getFieldError('title') && "border-red-500 focus:ring-red-500"
                      )}
                      placeholder="Enter title..."
                    />
                    {getFieldError('title') && (
                      <p className="text-xs text-red-600 mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {getFieldError('title')?.message}
                      </p>
                    )}
                  </div>
                  
                  {editedItem.description !== undefined && (
                    <div>
                      <Textarea
                        value={editedItem.description || ''}
                        onChange={(e) => setEditedItem({...editedItem, description: e.target.value})}
                        className={cn(
                          "text-sm resize-none",
                          getFieldError('description') && "border-red-500 focus:ring-red-500"
                        )}
                        rows={2}
                        placeholder="Enter description..."
                      />
                      {getFieldError('description') && (
                        <p className="text-xs text-red-600 mt-1 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {getFieldError('description')?.message}
                        </p>
                      )}
                    </div>
                  )}

                  {validationErrors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-2">
                      <p className="text-xs text-red-800 font-medium mb-1">Please fix these errors:</p>
                      {validationErrors.map((error, index) => (
                        <p key={index} className="text-xs text-red-700">
                          • {error.message}
                        </p>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <LoadingButton 
                      size="sm" 
                      onClick={handleSave}
                      loading={isLoading}
                      loadingText="Saving..."
                      disabled={validationErrors.length > 0}
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
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-foreground leading-snug">{item.title}</h3>
                    {item.confidence < 70 && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 ml-2">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Low confidence
                      </Badge>
                    )}
                  </div>
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
