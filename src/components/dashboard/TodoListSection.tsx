
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { List } from 'lucide-react';
import CollapsibleSection from '../CollapsibleSection';
import SortableItemsList from '../SortableItemsList';
import { ExtractedItem } from '@/types/appState';

interface TodoListSectionProps {
  filteredApprovedItems: ExtractedItem[];
  activeCategory?: string;
  onToggleApproval: (id: string) => void;
  onToggleCompletion?: (id: string) => void;
  onEdit: (id: string, updates: Partial<ExtractedItem>) => void;
  onDelete: (id: string) => void;
  getTranscriptName: (id: string) => string;
}

const TodoListSection = ({
  filteredApprovedItems,
  activeCategory,
  onToggleApproval,
  onToggleCompletion,
  onEdit,
  onDelete,
  getTranscriptName,
}: TodoListSectionProps) => {
  const [activeTab, setActiveTab] = useState('all');

  const getApprovedItemsByType = (type: string) => {
    if (type === 'all') return filteredApprovedItems;
    return filteredApprovedItems.filter(item => item.type === type);
  };

  return (
    <CollapsibleSection 
      title="To-Do List" 
      icon={<List className="h-5 w-5 mr-2" />} 
      defaultCollapsed={false}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="task">Tasks</TabsTrigger>
          <TabsTrigger value="event">Events</TabsTrigger>
          <TabsTrigger value="idea">Ideas</TabsTrigger>
          <TabsTrigger value="contact">Contacts</TabsTrigger>
        </TabsList>
        
        {['all', 'task', 'event', 'idea', 'contact'].map((type) => (
          <TabsContent key={type} value={type} className="space-y-4">
            <SortableItemsList
              items={getApprovedItemsByType(type)}
              onToggleApproval={onToggleApproval}
              onToggleCompletion={onToggleCompletion}
              onEdit={onEdit}
              onDelete={onDelete}
              getTranscriptName={getTranscriptName}
              type={type}
              category={activeCategory}
              showPendingItems={false}
            />
          </TabsContent>
        ))}
      </Tabs>
    </CollapsibleSection>
  );
};

export default TodoListSection;
