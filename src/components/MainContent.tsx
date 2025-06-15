import Dashboard from '@/components/Dashboard';
import Settings from '@/components/Settings';
import HowToUse from '@/components/HowToUse';
import { AppState, ExtractedItem } from '@/hooks/useUserAppState';
import InputsPage from './InputsPage';
import StateManager from '@/components/StateManager';

interface MainContentProps {
  activeView: string;
  activeCategory: string;
  appState: AppState;
  exportState: () => void;
  importState: (file: File) => void;
  toggleItemApproval: (id: string) => void;
  toggleItemCompletion: (id: string) => void;
  editExtractedItem: (id: string, updates: Partial<ExtractedItem>) => void;
  deleteExtractedItem: (id: string) => void;
  clearAllData: () => void;
  addProcessedTranscript: (metadata: any) => string;
  addExtractedItems: (items: any[]) => void;
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
  onFirefliesTranscriptProcessed: (extractedData: any, transcriptId: string) => void;
  updateAutoSave: (enabled: boolean) => void;
}

const MainContent = ({
  activeView,
  activeCategory,
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
  apiKey,
  onApiKeyChange,
  onFirefliesTranscriptProcessed,
  updateAutoSave,
}: MainContentProps) => {
  switch (activeView) {
    case 'inputs':
      return (
        <InputsPage
          appState={appState}
          apiKey={apiKey}
          onTextProcessed={(text: string, fileName: string) => {
            // Type assertion to match the expected type
            return (MainContent as any).prototype.onTextProcessed(text, fileName);
          }}
          onFileProcessed={(text: string, fileName: string) => {
            // Type assertion to match the expected type
            return (MainContent as any).prototype.onFileProcessed(text, fileName);
          }}
          onAudioProcessed={(audioFile: File, fileName: string) => {
            // Type assertion to match the expected type
            return (MainContent as any).prototype.onAudioProcessed(audioFile, fileName);
          }}
          onRecordingProcessed={(audioBlob: Blob, fileName: string) => {
            // Type assertion to match the expected type
            return (MainContent as any).prototype.onRecordingProcessed(audioBlob, fileName);
          }}
          onTranscribedTextProcessed={(text: string, fileName: string) => {
            // Type assertion to match the expected type
            return (MainContent as any).prototype.onTranscribedTextProcessed(text, fileName);
          }}
          onFirefliesTranscriptProcessed={onFirefliesTranscriptProcessed}
        />
      );
    case 'how-to-use':
      return <HowToUse />;
    case 'settings':
      return (
        <Settings
          onApiKeyChange={onApiKeyChange}
          autoSave={appState.autoSave}
          onAutoSaveChange={updateAutoSave}
          exportState={exportState}
          importState={importState}
          clearAllData={clearAllData}
          lastSaved={appState.lastSaved}
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
          toggleItemCompletion={toggleItemCompletion}
          editExtractedItem={editExtractedItem}
          deleteExtractedItem={deleteExtractedItem}
          clearAllData={clearAllData}
          addProcessedTranscript={addProcessedTranscript}
          addExtractedItems={addExtractedItems}
          apiKey={apiKey}
        />
      );
  }
};

export default MainContent;
