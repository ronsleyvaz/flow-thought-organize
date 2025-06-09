
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Clock, Users, TrendingUp } from 'lucide-react';
import ExtractedItem from './ExtractedItem';
import { TranscriptMetadata, ExtractedItem as ExtractedItemType } from '@/hooks/useUserAppState';

interface TranscriptDetailViewProps {
  transcript: TranscriptMetadata;
  extractedItems: ExtractedItemType[];
  onBack: () => void;
  onToggleApproval: (id: string) => void;
  onEdit: (id: string, updates: Partial<ExtractedItemType>) => void;
  onDelete: (id: string) => void;
}

const TranscriptDetailView = ({
  transcript,
  extractedItems,
  onBack,
  onToggleApproval,
  onEdit,
  onDelete
}: TranscriptDetailViewProps) => {
  const getItemsByType = (type: string) => {
    return extractedItems.filter(item => item.type === type);
  };

  const stats = [
    { title: 'Total Items', value: extractedItems.length, icon: FileText },
    { title: 'Tasks', value: getItemsByType('task').length, icon: FileText },
    { title: 'Events', value: getItemsByType('event').length, icon: Clock },
    { title: 'Ideas', value: getItemsByType('idea').length, icon: TrendingUp },
    { title: 'Contacts', value: getItemsByType('contact').length, icon: Users },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Transcripts
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{transcript.name}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
            <span>Processed: {new Date(transcript.processedAt).toLocaleString()}</span>
            <span>Duration: {transcript.duration}</span>
            <Badge variant="outline">{transcript.type}</Badge>
            <Badge variant="outline">{transcript.processingConfidence}% confidence</Badge>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-6 w-6 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Extracted Items */}
      <Card>
        <CardHeader>
          <CardTitle>Extracted Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {extractedItems.length > 0 ? (
            extractedItems.map((item) => (
              <ExtractedItem
                key={item.id}
                item={item}
                onToggleApproval={onToggleApproval}
                onEdit={onEdit}
                onDelete={onDelete}
                transcriptName={transcript.name}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No items extracted from this transcript</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TranscriptDetailView;
