
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CollapsibleSection from './CollapsibleSection';
import ProcessingCard from './ProcessingCard';
import ExtractedItem from './ExtractedItem';
import EmptyState from './EmptyState';
import { ExtractedItem as ExtractedItemType, TranscriptMetadata } from '@/hooks/useUserAppState';
import { CheckSquare, FileText, Upload, Mic } from 'lucide-react';

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
  const pendingItems = filteredItems.filter(item => !item.approved);

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
                    className="transition-all duration-200 hover:bg-accent"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No transcripts yet"
            description="Start by uploading a transcript file or recording audio to extract actionable items."
            actionLabel="Upload File"
            secondaryActionLabel="Start Recording"
          />
        )}
      </CollapsibleSection>

      <CollapsibleSection 
        title="Items Needing Review" 
        icon={<CheckSquare className="h-5 w-5 mr-2" />}
        defaultCollapsed={true}
      >
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {pendingItems.length} pending
          </Badge>
        </div>
        {pendingItems.length > 0 ? (
          <>
            <div className="space-y-3">
              {pendingItems
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
            </div>
            {pendingItems.length > 3 && (
              <Button 
                variant="outline" 
                className="w-full mt-4 transition-all duration-200 hover:bg-accent"
                onClick={() => setActiveTab('all')}
              >
                View All {pendingItems.length} Items
              </Button>
            )}
          </>
        ) : (
          <EmptyState
            icon={CheckSquare}
            title="All caught up!"
            description="Great job! All your extracted items have been reviewed and approved."
            actionLabel="View All Items"
            onAction={() => setActiveTab('all')}
          />
        )}
      </CollapsibleSection>
    </div>
  );
};

export default RecentActivity;
