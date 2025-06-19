
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmptyState from './EmptyState';
import { ExtractedItem as ExtractedItemType } from '@/hooks/useUserAppState';
import { ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Clock, AlertCircle } from 'lucide-react';
import { BatchSelectionProvider } from '@/contexts/BatchSelectionContext';
import BatchOperationsToolbar from './BatchOperationsToolbar';
import ExtractedItemWithSelection from './ExtractedItemWithSelection';

interface SortableItemsListProps {
  items: ExtractedItemType[];
  onToggleApproval: (id: string) => void;
  onToggleCompletion?: (id: string) => void;
  onEdit: (id: string, updates: Partial<ExtractedItemType>) => void;
  onDelete: (id: string) => void;
  getTranscriptName: (id: string) => string;
  type?: string;
  category?: string;
  showPendingItems?: boolean;
}

type SortField = 'priority' | 'title' | 'extractedAt' | 'dueDate';
type SortDirection = 'asc' | 'desc';

const SortableItemsList = ({
  items,
  onToggleApproval,
  onToggleCompletion,
  onEdit,
  onDelete,
  getTranscriptName,
  type = 'all',
  category,
  showPendingItems = true
}: SortableItemsListProps) => {
  const [sortField, setSortField] = useState<SortField>('extractedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [activeTab, setActiveTab] = useState(showPendingItems ? 'pending' : 'active');

  // Filter items based on approval and completion status
  const pendingItems = items.filter(item => !item.approved);
  const activeItems = items.filter(item => item.approved && !item.completed);
  const completedItems = items.filter(item => item.approved && item.completed);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const priorityOrder = { high: 3, medium: 2, low: 1 };

  const sortItems = (itemsToSort: ExtractedItemType[]) => {
    return [...itemsToSort].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'priority') {
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
      } else if (sortField === 'title') {
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
      } else if (sortField === 'extractedAt') {
        aValue = new Date(a.extractedAt || 0).getTime();
        bValue = new Date(b.extractedAt || 0).getTime();
      } else if (sortField === 'dueDate') {
        aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const handleBatchApprove = (ids: string[]) => {
    ids.forEach(id => onToggleApproval(id));
  };

  const handleBatchReject = (ids: string[]) => {
    ids.forEach(id => onDelete(id));
  };

  const handleBatchDelete = (ids: string[]) => {
    ids.forEach(id => onDelete(id));
  };

  const handleBatchComplete = (ids: string[]) => {
    if (onToggleCompletion) {
      ids.forEach(id => {
        const item = items.find(i => i.id === id);
        if (item?.approved && !item.completed) {
          onToggleCompletion(id);
        }
      });
    }
  };

  const renderItemsList = (itemsToRender: ExtractedItemType[], showCompletionToggle: boolean = false, isPending: boolean = false) => {
    if (itemsToRender.length === 0) {
      let emptyMessage = '';
      let emptyDescription = '';
      let emptyIcon = Clock;

      if (isPending) {
        emptyMessage = `No ${type === 'all' ? 'items' : `${type}s`}${category ? ` in ${category}` : ''} need review`;
        emptyDescription = "All items have been reviewed and approved";
        emptyIcon = CheckSquare;
      } else if (activeTab === 'completed') {
        emptyMessage = `No completed ${type === 'all' ? 'items' : `${type}s`}${category ? ` in ${category}` : ''} yet`;
        emptyDescription = "Complete some items to see them here";
        emptyIcon = CheckSquare;
      } else {
        emptyMessage = `No ${type === 'all' ? 'items' : `${type}s`}${category ? ` in ${category}` : ''} in your to-do list`;
        emptyDescription = "Approve items from the review section to add them here";
        emptyIcon = AlertCircle;
      }
      
      return (
        <EmptyState
          icon={emptyIcon}
          title={emptyMessage}
          description={emptyDescription}
        />
      );
    }

    const sortedItems = sortItems(itemsToRender);

    return (
      <div className="space-y-4">
        <BatchOperationsToolbar
          items={sortedItems}
          onBatchApprove={handleBatchApprove}
          onBatchReject={handleBatchReject}
          onBatchDelete={handleBatchDelete}
          onBatchComplete={handleBatchComplete}
        />
        <div className="space-y-3">
          {sortedItems.map((item) => (
            <ExtractedItemWithSelection
              key={item.id}
              item={item}
              onToggleApproval={onToggleApproval}
              onToggleCompletion={onToggleCompletion}
              onEdit={onEdit}
              onDelete={onDelete}
              onReject={onDelete}
              transcriptName={getTranscriptName(item.sourceTranscriptId)}
              showCompletionToggle={showCompletionToggle}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <BatchSelectionProvider>
      <div className="space-y-4">
        {/* Sort Controls */}
        <div className="flex flex-wrap gap-2 pb-4 border-b">
          <span className="text-sm font-medium text-muted-foreground mr-2">Sort by:</span>
          <Button
            variant={sortField === 'priority' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort('priority')}
            className="flex items-center gap-1"
          >
            Priority {getSortIcon('priority')}
          </Button>
          <Button
            variant={sortField === 'title' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort('title')}
            className="flex items-center gap-1"
          >
            Name {getSortIcon('title')}
          </Button>
          <Button
            variant={sortField === 'extractedAt' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort('extractedAt')}
            className="flex items-center gap-1"
          >
            Extracted Date {getSortIcon('extractedAt')}
          </Button>
          <Button
            variant={sortField === 'dueDate' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort('dueDate')}
            className="flex items-center gap-1"
          >
            Due Date {getSortIcon('dueDate')}
          </Button>
          <Badge variant="outline" className="ml-auto">
            {items.length} total
          </Badge>
        </div>

        {/* Conditional Tabs based on showPendingItems */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full ${showPendingItems ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {showPendingItems && (
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Pending Review ({pendingItems.length})
              </TabsTrigger>
            )}
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Active ({activeItems.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Completed ({completedItems.length})
            </TabsTrigger>
          </TabsList>
          
          {showPendingItems && (
            <TabsContent value="pending" className="space-y-4">
              {renderItemsList(pendingItems, false, true)}
            </TabsContent>
          )}
          
          <TabsContent value="active" className="space-y-4">
            {renderItemsList(activeItems, true)}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {renderItemsList(completedItems, false)}
          </TabsContent>
        </Tabs>
      </div>
    </BatchSelectionProvider>
  );
};

export default SortableItemsList;
