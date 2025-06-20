import { useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import ProcessingCard from './ProcessingCard';
import TranscriptDetailView from './TranscriptDetailView';
import CollapsibleSection from './CollapsibleSection';
import SortableItemsList from './SortableItemsList';
import StatsOverview from './StatsOverview';
import RecentActivity from './RecentActivity';
import ProcessingIndicator from './dashboard/ProcessingIndicator';
import ApiKeyWarning from './dashboard/ApiKeyWarning';
import TodoListSection from './dashboard/TodoListSection';
import { AppState, ExtractedItem as ExtractedItemType, TranscriptMetadata } from '@/hooks/useUserAppState';
import { extractItemsFromText, transcribeAudio } from '@/services/openaiService';
import { BatchSelectionProvider } from '@/contexts/BatchSelectionContext';

interface DashboardProps {
  activeCategory?: string;
  activeView?: string;
  appState: AppState;
  exportState: () => void;
  importState: (file: File) => void;
  toggleItemApproval: (id: string) => void;
  toggleItemCompletion?: (id: string) => void;
  editExtractedItem: (id: string, updates: Partial<ExtractedItemType>) => void;
  deleteExtractedItem: (id: string) => void;
  clearAllData: () => void;
  addProcessedTranscript: (metadata: Omit<TranscriptMetadata, 'id' | 'processedAt'>) => string;
  addExtractedItems: (items: Omit<ExtractedItemType, 'id' | 'extractedAt'>[]) => void;
  apiKey: string;
}

const Dashboard = ({ 
  activeCategory, 
  activeView, 
  appState,
  exportState,
  importState,
  toggleItemApproval,
  toggleItemCompletion,
  editExtractedItem,
  deleteExtractedItem,
  clearAllData,
  addProcessedTranscript,
  addExtractedItems,
  apiKey
}: DashboardProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTranscript, setSelectedTranscript] = useState<string | null>(null);
  const liveRecorderRef = useRef<any>(null);
  
  const { transcriptMetadata, extractedItems } = appState;

  // Separate pending and approved items
  const pendingItems = extractedItems.filter(item => !item.approved);
  const approvedItems = extractedItems.filter(item => item.approved);

  // Filter approved items by category for to-do list
  const filteredApprovedItems = activeCategory && activeCategory !== 'all' 
    ? approvedItems.filter(item => item.category === activeCategory)
    : approvedItems;

  const getApprovedItemsByType = (type: string) => {
    if (type === 'all') return filteredApprovedItems;
    return filteredApprovedItems.filter(item => item.type === type);
  };

  // Handle transcript view details
  const handleViewTranscriptDetails = (transcriptId: string) => {
    setSelectedTranscript(transcriptId);
  };

  // Get items for a specific transcript
  const getItemsForTranscript = (transcriptId: string) => {
    return extractedItems.filter(item => item.sourceTranscriptId === transcriptId);
  };

  // Get transcript by ID
  const getTranscriptById = (transcriptId: string) => {
    return transcriptMetadata.find(t => t.id === transcriptId);
  };

  // Get transcript name
  const getTranscriptName = (transcriptId: string) => {
    const transcript = transcriptMetadata.find(t => t.id === transcriptId);
    return transcript ? transcript.name : 'Unknown Transcript';
  };

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
        // Show the transcribed text to the user for editing
        if (liveRecorderRef.current) {
          liveRecorderRef.current.setTranscriptionResult(transcribedText);
        }
      } else {
        alert('No text could be transcribed from the recording. Please try recording again with better audio quality.');
        setIsProcessing(false);
      }
      
    } catch (error) {
      console.error('Error processing recorded audio with OpenAI:', error);
      alert('Error transcribing recorded audio. Please check your API key and try again.');
      setIsProcessing(false);
    }
  };

  const processTranscribedTextWithOpenAI = async (text: string, fileName: string) => {
    if (!apiKey) {
      alert('Please configure your OpenAI API key in Settings first.');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('Processing transcribed text:', text.substring(0, 100) + '...');
      const extractedData = await extractItemsFromText(text, apiKey);
      console.log('Extracted data:', extractedData);
      
      await addItemsFromExtractedData(extractedData, fileName, 'live-recording');
    } catch (error) {
      console.error('Error processing transcribed text with OpenAI:', error);
      alert('Error processing transcribed text. Please check your API key and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const addItemsFromExtractedData = async (extractedData: any, fileName: string, sourceType: string) => {
    // Filter contacts to only include those with email or phone
    const validContacts = (extractedData.contacts || []).filter((contact: any) => {
      const hasEmail = contact.email && contact.email.trim().length > 0;
      const hasPhone = contact.phone && contact.phone.trim().length > 0;
      return hasEmail || hasPhone;
    });

    console.log('Filtered contacts with contact info:', validContacts);

    // Calculate total items using filtered contacts
    const totalItems = (extractedData.tasks?.length || 0) + 
                      (extractedData.events?.length || 0) + 
                      (extractedData.ideas?.length || 0) + 
                      validContacts.length;
    
    // Add transcript metadata
    const transcriptId = addProcessedTranscript({
      name: fileName.replace(/\.[^/.]+$/, ""),
      duration: sourceType === 'text' ? "N/A" : "Unknown",
      type: sourceType === 'live-recording' ? 'voice-memo' : 'meeting',
      extractedItemCount: totalItems,
      processingConfidence: 85,
    });

    // Convert extracted data to our format
    const extractedItemsData = [
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
        completed: false,
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
        completed: false,
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
        completed: false,
        sourceTranscriptId: transcriptId,
      })),
      // Only add contacts that have email or phone
      ...validContacts.map((contact: any) => ({
        type: 'contact' as const,
        title: contact.name,
        description: `${contact.role || ''} ${contact.company ? `at ${contact.company}` : ''} ${contact.email || ''} ${contact.phone || ''}`.trim(),
        category: 'Business' as const,
        priority: 'low' as const,
        confidence: 85,
        approved: false,
        completed: false,
        sourceTranscriptId: transcriptId,
      }))
    ];

    console.log('Adding extracted items:', extractedItemsData);
    addExtractedItems(extractedItemsData);
  };

  const recentTranscripts = transcriptMetadata.slice(0, 3).map(metadata => ({
    id: metadata.id,
    name: metadata.name,
    status: 'completed' as const,
    extractedItems: metadata.extractedItemCount,
    timestamp: new Date(metadata.processedAt).toLocaleString(),
    duration: metadata.duration,
    type: metadata.type,
  }));

  // If viewing transcript details, show detail view
  if (selectedTranscript) {
    const transcript = getTranscriptById(selectedTranscript);
    if (transcript) {
      const transcriptItems = getItemsForTranscript(selectedTranscript);
      return (
        <TranscriptDetailView
          transcript={transcript}
          extractedItems={transcriptItems}
          onBack={() => setSelectedTranscript(null)}
          onToggleApproval={toggleItemApproval}
          onEdit={editExtractedItem}
          onDelete={deleteExtractedItem}
        />
      );
    }
  }

  const handleShowAllItems = () => {
    // This function can be used to navigate to the all items view
  };

  // Handle specific views with sorting and category filtering - only show approved items
  if (activeView === 'task' || activeView === 'event' || activeView === 'idea' || activeView === 'contact') {
    const items = getApprovedItemsByType(activeView);
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold capitalize">{activeView}s</h1>
          {activeCategory && activeCategory !== 'all' && (
            <Badge variant="outline" className="text-sm">
              {activeCategory} Category
            </Badge>
          )}
        </div>
        <SortableItemsList
          items={items}
          onToggleApproval={toggleItemApproval}
          onToggleCompletion={toggleItemCompletion}
          onEdit={editExtractedItem}
          onDelete={deleteExtractedItem}
          getTranscriptName={getTranscriptName}
          type={activeView}
          category={activeCategory}
          showPendingItems={false}
        />
      </div>
    );
  }

  if (activeView === 'transcripts') {
    return (
      <div className="p-6 space-y-6">
        <CollapsibleSection title="Recent Transcripts" icon={<FileText className="h-5 w-5 mr-2" />}>
          {recentTranscripts.length > 0 ? (
            <div className="space-y-4">
              {recentTranscripts.map((transcript) => (
                <div key={transcript.id} className="space-y-2">
                  <ProcessingCard transcript={transcript} />
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewTranscriptDetails(transcript.id)}
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
      </div>
    );
  }

  // Default dashboard view
  return (
    <BatchSelectionProvider>
      <div className="p-6 space-y-6">
        <ApiKeyWarning apiKey={apiKey} />
        <ProcessingIndicator isProcessing={isProcessing} />
        
        <StatsOverview
          filteredItems={extractedItems}
          transcriptMetadata={transcriptMetadata}
        />

        <TodoListSection
          filteredApprovedItems={filteredApprovedItems}
          activeCategory={activeCategory}
          onToggleApproval={toggleItemApproval}
          onToggleCompletion={toggleItemCompletion}
          onEdit={editExtractedItem}
          onDelete={deleteExtractedItem}
          getTranscriptName={getTranscriptName}
        />

        <RecentActivity
          recentTranscripts={recentTranscripts}
          pendingItems={pendingItems}
          approvedItems={filteredApprovedItems}
          onViewTranscriptDetails={handleViewTranscriptDetails}
          onToggleApproval={toggleItemApproval}
          onToggleCompletion={toggleItemCompletion}
          onEditItem={editExtractedItem}
          onDeleteItem={deleteExtractedItem}
          getTranscriptName={getTranscriptName}
          setActiveTab={() => {}}
          onShowAllItems={handleShowAllItems}
        />
      </div>
    </BatchSelectionProvider>
  );
};

export default Dashboard;
