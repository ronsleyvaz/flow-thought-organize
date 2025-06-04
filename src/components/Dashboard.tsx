
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProcessingCard from './ProcessingCard';
import ExtractedItem from './ExtractedItem';
import StateManager from './StateManager';
import FileUploader from './FileUploader';
import LiveRecorder from './LiveRecorder';
import { useAppState } from '@/hooks/useAppState';
import { CheckSquare, Calendar, Lightbulb, User, FileText, TrendingUp } from 'lucide-react';

interface DashboardProps {
  activeCategory?: string;
  activeView?: string;
}

const Dashboard = ({ activeCategory, activeView }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState(activeView || 'all');
  const {
    appState,
    exportState,
    importState,
    toggleItemApproval,
    editExtractedItem,
    deleteExtractedItem,
    clearAllData,
    addProcessedTranscript,
    addExtractedItems,
  } = useAppState();

  const { transcriptMetadata, extractedItems } = appState;

  // Filter items by category if specified
  const filteredItems = activeCategory && activeCategory !== 'all' 
    ? extractedItems.filter(item => item.category.toLowerCase() === activeCategory.toLowerCase())
    : extractedItems;

  // Filter items by type for tabs
  const getItemsByType = (type: string) => {
    const baseItems = filteredItems;
    if (type === 'all') return baseItems;
    return baseItems.filter(item => item.type === type);
  };

  const stats = [
    { title: 'Total Items', value: filteredItems.length, icon: CheckSquare, color: 'text-blue-600' },
    { title: 'Approved', value: filteredItems.filter(item => item.approved).length, icon: CheckSquare, color: 'text-green-600' },
    { title: 'High Priority', value: filteredItems.filter(item => item.priority === 'high').length, icon: TrendingUp, color: 'text-red-600' },
    { title: 'Transcripts Processed', value: transcriptMetadata.length, icon: FileText, color: 'text-purple-600' },
  ];

  const recentTranscripts = transcriptMetadata.slice(0, 3).map(metadata => ({
    id: metadata.id,
    name: metadata.name,
    status: 'completed' as const,
    extractedItems: metadata.extractedItemCount,
    timestamp: new Date(metadata.processedAt).toLocaleString(),
    duration: metadata.duration,
    type: metadata.type,
  }));

  // Handle file processing
  const handleFileProcessed = (file: File) => {
    // Simulate processing and extract sample items
    const transcriptId = addProcessedTranscript({
      name: file.name.replace(/\.[^/.]+$/, ""),
      duration: "Unknown",
      type: 'meeting',
      extractedItemCount: 3,
      processingConfidence: 85,
    });

    // Add some sample extracted items
    const sampleItems = [
      {
        type: 'task' as const,
        title: `Follow up on discussion from ${file.name}`,
        description: 'Schedule meeting to discuss next steps',
        category: 'Business' as const,
        priority: 'high' as const,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        confidence: 88,
        approved: false,
        sourceTranscriptId: transcriptId,
      },
      {
        type: 'idea' as const,
        title: `New concept from ${file.name}`,
        description: 'Explore this innovative approach further',
        category: 'Projects' as const,
        priority: 'medium' as const,
        confidence: 76,
        approved: false,
        sourceTranscriptId: transcriptId,
      }
    ];

    addExtractedItems(sampleItems);
  };

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

      {/* Input Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FileUploader onFileProcessed={handleFileProcessed} />
        <LiveRecorder onRecordingProcessed={handleFileProcessed} />
      </div>

      {/* State Management */}
      <StateManager
        onExport={exportState}
        onImport={importState}
        onClear={clearAllData}
        lastSaved={appState.lastSaved}
      />

      {/* Main Content Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Extracted Items</CardTitle>
        </CardHeader>
        <CardContent>
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
                {getItemsByType(type).length > 0 ? (
                  getItemsByType(type).map((item) => (
                    <ExtractedItem
                      key={item.id}
                      item={item}
                      onToggleApproval={toggleItemApproval}
                      onEdit={editExtractedItem}
                      onDelete={deleteExtractedItem}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No {type === 'all' ? 'items' : `${type}s`} found</p>
                    <p className="text-sm">Process a transcript to see extracted items here</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <CheckSquare className="h-5 w-5 mr-2" />
                Items Needing Review
              </CardTitle>
              <Badge variant="outline">
                {filteredItems.filter(item => !item.approved).length} pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredItems.filter(item => !item.approved).length > 0 ? (
              <>
                {filteredItems
                  .filter(item => !item.approved)
                  .slice(0, 3)
                  .map((item) => (
                    <ExtractedItem
                      key={item.id}
                      item={item}
                      onToggleApproval={toggleItemApproval}
                      onEdit={editExtractedItem}
                      onDelete={deleteExtractedItem}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
