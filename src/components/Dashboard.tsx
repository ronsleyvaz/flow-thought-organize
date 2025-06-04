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
import Settings from './Settings';
import { useAppState } from '@/hooks/useAppState';
import { extractItemsFromText, transcribeAudio } from '@/services/openaiService';
import { CheckSquare, Calendar, Lightbulb, User, FileText, TrendingUp } from 'lucide-react';

interface DashboardProps {
  activeCategory?: string;
  activeView?: string;
}

const Dashboard = ({ activeCategory, activeView }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  
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

  const filteredItems = activeCategory && activeCategory !== 'all' 
    ? extractedItems.filter(item => item.category.toLowerCase() === activeCategory.toLowerCase())
    : extractedItems;

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

  const processTextWithOpenAI = async (text: string, fileName: string) => {
    if (!apiKey) {
      alert('Please configure your OpenAI API key in Settings first.');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('Processing text:', text.substring(0, 100) + '...');
      const extractedData = await extractItemsFromText(text, apiKey);
      console.log('Extracted data:', extractedData);
      
      await addItemsFromExtractedData(extractedData, fileName, 'text');
    } catch (error) {
      console.error('Error processing with OpenAI:', error);
      alert('Error processing transcript. Please check your API key and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processAudioFileWithOpenAI = async (audioFile: File, fileName: string) => {
    if (!apiKey) {
      alert('Please configure your OpenAI API key in Settings first.');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('Transcribing audio file with Whisper:', fileName);
      
      // First transcribe the audio
      const transcribedText = await transcribeAudio(audioFile, apiKey);
      console.log('Transcribed text:', transcribedText);
      
      if (transcribedText && transcribedText.trim().length > 0) {
        // Then extract items from the transcribed text
        const extractedData = await extractItemsFromText(transcribedText, apiKey);
        console.log('Extracted data:', extractedData);
        
        await addItemsFromExtractedData(extractedData, fileName, 'audio-file');
      } else {
        alert('No text could be transcribed from the audio file. Please check the audio quality.');
      }
      
    } catch (error) {
      console.error('Error processing audio file with OpenAI:', error);
      alert('Error transcribing audio file. Please check your API key and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processAudioRecordingWithOpenAI = async (audioBlob: Blob, fileName: string) => {
    if (!apiKey) {
      alert('Please configure your OpenAI API key in Settings first.');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('Transcribing recorded audio with Whisper...');
      
      // Convert blob to file for Whisper API
      const audioFile = new File([audioBlob], fileName, { type: audioBlob.type });
      
      // First transcribe the audio
      const transcribedText = await transcribeAudio(audioFile, apiKey);
      console.log('Transcribed text:', transcribedText);
      
      if (transcribedText && transcribedText.trim().length > 0) {
        // Then extract items from the transcribed text
        const extractedData = await extractItemsFromText(transcribedText, apiKey);
        console.log('Extracted data:', extractedData);
        
        await addItemsFromExtractedData(extractedData, fileName, 'live-recording');
      } else {
        alert('No text could be transcribed from the recording. Please try recording again with better audio quality.');
      }
      
    } catch (error) {
      console.error('Error processing recorded audio with OpenAI:', error);
      alert('Error transcribing recorded audio. Please check your API key and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const addItemsFromExtractedData = async (extractedData: any, fileName: string, sourceType: string) => {
    // Calculate total items
    const totalItems = (extractedData.tasks?.length || 0) + 
                      (extractedData.events?.length || 0) + 
                      (extractedData.ideas?.length || 0) + 
                      (extractedData.contacts?.length || 0);
    
    // Add transcript metadata
    const transcriptId = addProcessedTranscript({
      name: fileName.replace(/\.[^/.]+$/, ""),
      duration: sourceType === 'text' ? "N/A" : "Unknown",
      type: sourceType === 'live-recording' ? 'voice-memo' : 'meeting',
      extractedItemCount: totalItems,
      processingConfidence: 85,
    });

    // Convert extracted data to our format
    const extractedItems = [
      ...(extractedData.tasks || []).map((task: any) => ({
        type: 'task' as const,
        title: task.title,
        description: task.description,
        category: 'Business' as const,
        priority: task.priority,
        dueDate: task.dueDate,
        assignee: task.assignee,
        confidence: 85,
        approved: false,
        sourceTranscriptId: transcriptId,
      })),
      ...(extractedData.events || []).map((event: any) => ({
        type: 'event' as const,
        title: event.title,
        description: event.description,
        category: 'Business' as const,
        priority: 'medium' as const,
        dueDate: event.date,
        confidence: 85,
        approved: false,
        sourceTranscriptId: transcriptId,
      })),
      ...(extractedData.ideas || []).map((idea: any) => ({
        type: 'idea' as const,
        title: idea.title,
        description: idea.description,
        category: 'Projects' as const,
        priority: 'medium' as const,
        confidence: 85,
        approved: false,
        sourceTranscriptId: transcriptId,
      })),
      ...(extractedData.contacts || []).map((contact: any) => ({
        type: 'contact' as const,
        title: contact.name,
        description: `${contact.role || ''} ${contact.company ? `at ${contact.company}` : ''} ${contact.email || ''} ${contact.phone || ''}`.trim(),
        category: 'Business' as const,
        priority: 'low' as const,
        confidence: 85,
        approved: false,
        sourceTranscriptId: transcriptId,
      }))
    ];

    console.log('Adding extracted items:', extractedItems);
    addExtractedItems(extractedItems);
  };

  if (activeView === 'settings') {
    return <Settings onApiKeyChange={setApiKey} />;
  }

  if (activeView === 'transcripts') {
    return (
      <div className="p-6 space-y-6">
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
      </div>
    );
  }

  if (activeView === 'task' || activeView === 'event' || activeView === 'idea' || activeView === 'contact') {
    const items = getItemsByType(activeView);
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center capitalize">
              {activeView === 'task' && <CheckSquare className="h-5 w-5 mr-2" />}
              {activeView === 'event' && <Calendar className="h-5 w-5 mr-2" />}
              {activeView === 'idea' && <Lightbulb className="h-5 w-5 mr-2" />}
              {activeView === 'contact' && <User className="h-5 w-5 mr-2" />}
              {activeView}s
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.length > 0 ? (
              items.map((item) => (
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
                <p>No {activeView}s found</p>
                <p className="text-sm">Process a transcript to see extracted items here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default dashboard view
  return (
    <div className="p-6 space-y-6">
      {/* API Key Warning */}
      {!apiKey && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-yellow-800 text-sm">
              Please configure your OpenAI API key in Settings to enable transcript processing.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-4 w-4 border-b-2 border-blue-600 rounded-full"></div>
              <p className="text-blue-800 text-sm">Processing with OpenAI...</p>
            </div>
          </CardContent>
        </Card>
      )}

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
        <FileUploader 
          onFileProcessed={processTextWithOpenAI} 
          onAudioProcessed={processAudioFileWithOpenAI}
        />
        <LiveRecorder onRecordingProcessed={processAudioRecordingWithOpenAI} />
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
