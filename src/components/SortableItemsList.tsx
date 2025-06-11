import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExtractedItem from './ExtractedItem';
import EmptyState from './EmptyState';
import { ExtractedItem as ExtractedItemType } from '@/hooks/useUserAppState';
import { ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Clock } from 'lucide-react';

interface SortableItemsListProps {
  items: ExtractedItemType[];
  onToggleApproval: (id: string) => void;
  onToggleCompletion?: (id: string) => void;
  onEdit: (id: string, updates: Partial<ExtractedItemType>) => void;
  onDelete: (id: string) => void;
  getTranscriptName: (id: string) => string;
  type?: string;
  category?: string;
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
  category
}: SortableItemsListProps) => {
  const [sortField, setSortField] = useState<SortField>('extractedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [activeTab, setActiveTab] = useState('active');

  // Filter items based on completion status
  const activeItems = items.filter(item => !item.completed);
  const completedItems = items.filter(item => item.completed);

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

  const renderItemsList = (itemsToRender: ExtractedItemType[], showCompletionToggle: boolean = false) => {
    if (itemsToRender.length === 0) {
      const emptyMessage = activeTab === 'completed' 
        ? `No completed ${type === 'all' ? 'items' : `${type}s`}${category ? ` in ${category}` : ''} yet`
        : `No ${type === 'all' ? 'items' : `${type}s`}${category ? ` in ${category}` : ''} found`;
      
      return (
        <EmptyState
          icon={activeTab === 'completed' ? CheckSquare : Clock}
          title={emptyMessage}
          description={activeTab === 'completed' 
            ? "Complete some items to see them here" 
            : "Process a transcript to see extracted items here"
          }
        />
      );
    }

    const sortedItems = sortItems(itemsToRender);

    return (
      <div className="space-y-3">
        {sortedItems.map((item) => (
          <ExtractedItem
            key={item.id}
            item={item}
            onToggleApproval={onToggleApproval}
            onToggleCompletion={onToggleCompletion}
            onEdit={onEdit}
            onDelete={onDelete}
            transcriptName={getTranscriptName(item.sourceTranscriptId)}
            showCompletionToggle={showCompletionToggle}
          />
        ))}
      </div>
    );
  };

  return (
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

      {/* Active/Completed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Active ({activeItems.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Completed ({completedItems.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          {renderItemsList(activeItems, true)}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {renderItemsList(completedItems, false)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SortableItemsList;
