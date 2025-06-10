
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ExtractedItem from './ExtractedItem';
import { ExtractedItem as ExtractedItemType } from '@/hooks/useUserAppState';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface SortableItemsListProps {
  items: ExtractedItemType[];
  onToggleApproval: (id: string) => void;
  onEdit: (id: string, updates: Partial<ExtractedItemType>) => void;
  onDelete: (id: string) => void;
  getTranscriptName: (id: string) => string;
  type?: string;
}

type SortField = 'priority' | 'title' | 'extractedAt' | 'dueDate';
type SortDirection = 'asc' | 'desc';

const SortableItemsList = ({
  items,
  onToggleApproval,
  onEdit,
  onDelete,
  getTranscriptName,
  type = 'all'
}: SortableItemsListProps) => {
  const [sortField, setSortField] = useState<SortField>('extractedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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

  const sortedItems = [...items].sort((a, b) => {
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

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No {type === 'all' ? 'items' : `${type}s`} found</p>
        <p className="text-sm">Process a transcript to see extracted items here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      <div className="flex flex-wrap gap-2 pb-4 border-b">
        <span className="text-sm font-medium text-gray-600 mr-2">Sort by:</span>
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
          {items.length} items
        </Badge>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {sortedItems.map((item) => (
          <ExtractedItem
            key={item.id}
            item={item}
            onToggleApproval={onToggleApproval}
            onEdit={onEdit}
            onDelete={onDelete}
            transcriptName={getTranscriptName(item.sourceTranscriptId)}
          />
        ))}
      </div>
    </div>
  );
};

export default SortableItemsList;
