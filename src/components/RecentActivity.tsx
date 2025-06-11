
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CollapsibleSection from './CollapsibleSection';
import ProcessingCard from './ProcessingCard';
import ExtractedItem from './ExtractedItem';
import { ExtractedItem as ExtractedItemType, TranscriptMetadata } from '@/hooks/useUserAppState';
import { CheckSquare, FileText } from 'lucide-react';

interface RecentActivityProps {
  recentTranscripts: Array<{
    id: string;
    name: string;
    status: 'completed';
    extractedItems: number;
    timestamp: string;
    duration: string;
    type: 'meeting' | 'voice-memo' | 'brainstorm';
  }>;
  filteredItems: ExtractedItemType[];
  onViewTranscriptDetails: (id: string) => void;
  onToggleApproval: (id: string) => void;
  onEditItem: (id: string, updates: Partial<ExtractedItemType>) => void;
  onDeleteItem: (id: string) => void;
  getTranscriptName: (id: string) => string;
  setActiveTab: (tab: string) => void;
}

const RecentActivity = ({
  recentTranscripts,
  filteredItems,
  onViewTranscriptDetails,
  onToggleApproval,
  onEditItem,
  onDeleteItem,
  getTranscriptName,
  setActiveTab
}: RecentActivityProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CollapsibleSection title="Recent Transcripts" icon={<FileText className="h-5 w-5 mr-2" />} defaultCollapsed={true}>
        {recentTranscripts.length > 0 ? (
          <div className="space-y-4">
            {recentTranscripts.map((transcript) => (
              <div key={transcript.id} className="space-y-2">
                <ProcessingCard transcript={transcript} />
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onViewTranscriptDetails(transcript.id)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No transcripts processed yet. Upload or record to get started.
          </p>
        )}
      </CollapsibleSection>

      <CollapsibleSection 
        title="Items Needing Review" 
        icon={<CheckSquare className="h-5 w-5 mr-2" />}
        defaultCollapsed={true}
      >
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline">
            {filteredItems.filter(item => !item.approved).length} pending
          </Badge>
        </div>
        {filteredItems.filter(item => !item.approved).length > 0 ? (
          <>
            {filteredItems
              .filter(item => !item.approved)
              .slice(0, 3)
              .map((item) => (
                <ExtractedItem
                  key={item.id}
                  item={item}
                  onToggleApproval={onToggleApproval}
                  onEdit={onEditItem}
                  onDelete={onDeleteItem}
                  transcriptName={getTranscriptName(item.sourceTranscriptId)}
                />
              ))}
            {filteredItems.filter(item => !item.approved).length > 3 && (
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setActiveTab('all')}
              >
                View All {filteredItems.filter(item => !item.approved).length} Items
              </Button>
            )}
          </>
        ) : (
          <p className="text-gray-500 text-center py-4">
            All items have been reviewed!
          </p>
        )}
      </CollapsibleSection>
    </div>
  );
};

export default RecentActivity;
