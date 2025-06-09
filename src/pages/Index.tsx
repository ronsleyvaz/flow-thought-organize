
import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import Settings from '@/components/Settings';
import { useAppState } from '@/hooks/useAppState';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [activeCategory, setActiveCategory] = useState('all');
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const { addProcessedTranscript, addExtractedItems } = useAppState();
  const { toast } = useToast();

  const handleFirefliesTranscriptProcessed = (extractedData: any, transcriptId: string) => {
    console.log('handleFirefliesTranscriptProcessed called with:', extractedData, transcriptId);
    
    // Add transcript metadata
    const transcriptMetadataId = addProcessedTranscript({
      name: `Fireflies Transcript ${transcriptId}`,
      duration: 'Unknown',
      type: 'meeting',
      extractedItemCount: 
        (extractedData.tasks?.length || 0) + 
        (extractedData.events?.length || 0) + 
        (extractedData.ideas?.length || 0) + 
        (extractedData.contacts?.length || 0),
      processingConfidence: 90,
    });

    console.log('Added transcript metadata with ID:', transcriptMetadataId);

    // Convert and add extracted items
    const allItems = [
      ...(extractedData.tasks || []).map((task: any) => ({
        type: 'task' as const,
        title: task.title,
        description: task.description,
        category: 'Business' as const,
        priority: task.priority || 'medium' as const,
        dueDate: task.dueDate,
        assignee: task.assignee,
        confidence: 85,
        approved: false,
        sourceTranscriptId: transcriptMetadataId,
      })),
      ...(extractedData.events || []).map((event: any) => ({
        type: 'event' as const,
        title: event.title,
        description: event.description,
        category: 'Business' as const,
        priority: 'medium' as const,
        dueDate: event.date && event.time ? `${event.date} ${event.time}` : event.date,
        confidence: 85,
        approved: false,
        sourceTranscriptId: transcriptMetadataId,
      })),
      ...(extractedData.ideas || []).map((idea: any) => ({
        type: 'idea' as const,
        title: idea.title,
        description: idea.description,
        category: 'Projects' as const,
        priority: 'medium' as const,
        confidence: 80,
        approved: false,
        sourceTranscriptId: transcriptMetadataId,
      })),
      ...(extractedData.contacts || []).map((contact: any) => ({
        type: 'contact' as const,
        title: contact.name,
        description: `${contact.role || ''} ${contact.company || ''}`.trim() || 
                    `${contact.email || ''} ${contact.phone || ''}`.trim(),
        category: 'Business' as const,
        priority: 'low' as const,
        confidence: 90,
        approved: false,
        sourceTranscriptId: transcriptMetadataId,
      }))
    ];

    console.log('Converted items:', allItems);

    if (allItems.length > 0) {
      addExtractedItems(allItems);
      console.log('Added extracted items to state');
      toast({
        title: "Fireflies Transcript Processed",
        description: `Extracted ${allItems.length} items from transcript`,
      });
    } else {
      console.log('No items to add');
      toast({
        title: "Transcript Processed",
        description: "No extractable items found in transcript",
        variant: "destructive",
      });
    }
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'settings':
        return (
          <Settings 
            onApiKeyChange={setApiKey} 
            onFirefliesTranscriptProcessed={handleFirefliesTranscriptProcessed}
          />
        );
      default:
        return (
          <Dashboard 
            activeCategory={activeCategory === 'all' ? undefined : activeCategory}
            activeView={activeView}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        onViewChange={setActiveView}
        activeView={activeView}
      />
      <div className="flex">
        <Sidebar 
          activeView={activeView}
          activeCategory={activeCategory}
          onViewChange={setActiveView}
          onCategoryChange={setActiveCategory}
        />
        <main className="flex-1">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
