
import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';
import LoadingScreen from '@/components/LoadingScreen';
import AuthWrapper from '@/components/AuthWrapper';
import { useUserAppState } from '@/hooks/useUserAppState';
import { useFirefliesIntegration } from '@/hooks/useFirefliesIntegration';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [activeCategory, setActiveCategory] = useState('all');
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  
  const {
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
    updateAutoSave,
    isLoaded,
  } = useUserAppState();

  const { handleFirefliesTranscriptProcessed } = useFirefliesIntegration({
    addProcessedTranscript,
    addExtractedItems,
  });

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return <LoadingScreen />;
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
            <MainContent
              activeView={activeView}
              activeCategory={activeCategory}
              appState={appState}
              exportState={exportState}
              importState={importState}
              toggleItemApproval={toggleItemApproval}
              toggleItemCompletion={toggleItemCompletion}
              editExtractedItem={editExtractedItem}
              deleteExtractedItem={deleteExtractedItem}
              clearAllData={clearAllData}
              addProcessedTranscript={addProcessedTranscript}
              addExtractedItems={addExtractedItems}
              apiKey={apiKey}
              onApiKeyChange={setApiKey}
              onFirefliesTranscriptProcessed={handleFirefliesTranscriptProcessed}
              updateAutoSave={updateAutoSave}
            />
          </main>
        </div>
      </div>
    </AuthWrapper>
  );
};

export default Index;
