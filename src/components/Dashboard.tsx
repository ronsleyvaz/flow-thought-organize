
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProcessingCard from './ProcessingCard';
import ExtractedItem from './ExtractedItem';
import StateManager from './StateManager';
import { useAppState } from '@/hooks/useAppState';
import { CheckSquare, Calendar, Lightbulb, User, FileText, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const {
    appState,
    exportState,
    importState,
    toggleItemApproval,
    clearAllData,
  } = useAppState();

  const { transcriptMetadata, extractedItems } = appState;

  const stats = [
    { title: 'Total Items', value: extractedItems.length, icon: CheckSquare, color: 'text-blue-600' },
    { title: 'Approved', value: extractedItems.filter(item => item.approved).length, icon: CheckSquare, color: 'text-green-600' },
    { title: 'High Priority', value: extractedItems.filter(item => item.priority === 'high').length, icon: TrendingUp, color: 'text-red-600' },
    { title: 'Transcripts Processed', value: transcriptMetadata.length, icon: FileText, color: 'text-purple-600' },
  ];

  // Convert metadata to format expected by ProcessingCard
  const recentTranscripts = transcriptMetadata.slice(0, 3).map(metadata => ({
    id: metadata.id,
    name: metadata.name,
    status: 'completed' as const,
    extractedItems: metadata.extractedItemCount,
    timestamp: new Date(metadata.processedAt).toLocaleString(),
    duration: metadata.duration,
    type: metadata.type,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* State Management */}
      <StateManager
        onExport={exportState}
        onImport={importState}
        onClear={clearAllData}
        lastSaved={appState.lastSaved}
      />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transcripts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Recent Transcripts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTranscripts.length > 0 ? (
              recentTranscripts.map((transcript) => (
                <ProcessingCard key={transcript.id} transcript={transcript} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No transcripts processed yet. Upload or record to get started.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Extracted Items Needing Review */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <CheckSquare className="h-5 w-5 mr-2" />
                Items Needing Review
              </CardTitle>
              <Badge variant="outline">
                {extractedItems.filter(item => !item.approved).length} pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {extractedItems.filter(item => !item.approved).length > 0 ? (
              <>
                {extractedItems
                  .filter(item => !item.approved)
                  .slice(0, 3)
                  .map((item) => (
                    <ExtractedItem
                      key={item.id}
                      item={item}
                      onToggleApproval={toggleItemApproval}
                    />
                  ))}
                {extractedItems.filter(item => !item.approved).length > 3 && (
                  <Button variant="outline" className="w-full mt-4">
                    View All {extractedItems.filter(item => !item.approved).length} Items
                  </Button>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-center py-4">
                All items have been reviewed!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Upload Transcript
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Sync Calendar
            </Button>
            <Button variant="outline">
              <Lightbulb className="h-4 w-4 mr-2" />
              Export Ideas
            </Button>
            <Button variant="outline">
              <User className="h-4 w-4 mr-2" />
              Manage Contacts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
