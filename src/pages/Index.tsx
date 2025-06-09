import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import Settings from '@/components/Settings';
import AuthWrapper from '@/components/AuthWrapper';
import { useUserAppState } from '@/hooks/useUserAppState';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [activeCategory, setActiveCategory] = useState('all');
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
    updateAutoSave,
    isLoaded,
  } = useUserAppState();
  
  const { toast } = useToast();

  const handleFirefliesTranscriptProcessed = (extractedData: any, transcriptId: string) => {
    console.log('handleFirefliesTranscriptProcessed called with:', extractedData, transcriptId);
    
    // Filter contacts to only include those with email or phone
    const validContacts = (extractedData.contacts || []).filter((contact: any) => {
      const hasEmail = contact.email && contact.email.trim().length > 0;
      const hasPhone = contact.phone && contact.phone.trim().length > 0;
      return hasEmail || hasPhone;
    });

    console.log('Filtered contacts with contact info:', validContacts);

    // Add transcript metadata
    const transcriptMetadataId = addProcessedTranscript({
      name: `Fireflies Transcript ${transcriptId}`,
      duration: 'Unknown',
      type: 'meeting',
      extractedItemCount: 
        (extractedData.tasks?.length || 0) + 
        (extractedData.events?.length || 0) + 
        (extractedData.ideas?.length || 0) + 
        validContacts.length, // Use filtered contacts count
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
      // Only add contacts that have email or phone
      ...validContacts.map((contact: any) => ({
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
            autoSave={appState.autoSave}
            onAutoSaveChange={updateAutoSave}
          />
        );
      default:
        return (
          <Dashboard 
            activeCategory={activeCategory === 'all' ? undefined : activeCategory}
            activeView={activeView}
            appState={appState}
            exportState={exportState}
            importState={importState}
            toggleItemApproval={toggleItemApproval}
            editExtractedItem={editExtractedItem}
            deleteExtractedItem={deleteExtractedItem}
            clearAllData={clearAllData}
            addProcessedTranscript={addProcessedTranscript}
            addExtractedItems={addExtractedItems}
          />
        );
    }
  };

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading TranscriptFlow...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthWrapper>
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
            appState={appState}
          />
          <main className="flex-1">
            {renderMainContent()}
          </main>
        </div>
      </div>
    </AuthWrapper>
  );
};

export default Index;
