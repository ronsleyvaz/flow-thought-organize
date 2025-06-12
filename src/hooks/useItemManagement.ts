
import { AppState, TranscriptMetadata, ExtractedItem } from '@/types/appState';

export const useItemManagement = (
  appState: AppState, 
  setAppState: (updater: (prev: AppState) => AppState) => void,
  createAutoBackup: (description: string) => void,
  getInitialState: () => AppState
) => {
  const addProcessedTranscript = (metadata: Omit<TranscriptMetadata, 'id' | 'processedAt'>) => {
    createAutoBackup('before adding transcript');
    const newMetadata: TranscriptMetadata = {
      ...metadata,
      id: Date.now().toString(),
      processedAt: new Date().toISOString(),
    };

    setAppState(prev => ({
      ...prev,
      transcriptMetadata: [newMetadata, ...prev.transcriptMetadata],
    }));

    return newMetadata.id;
  };

  const addExtractedItems = (items: Omit<ExtractedItem, 'id' | 'extractedAt'>[]) => {
    const newItems: ExtractedItem[] = items.map(item => ({
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      extractedAt: new Date().toISOString(),
      completed: false,
    }));

    setAppState(prev => ({
      ...prev,
      extractedItems: [...newItems, ...prev.extractedItems],
    }));
  };

  const toggleItemApproval = (id: string) => {
    setAppState(prev => ({
      ...prev,
      extractedItems: prev.extractedItems.map(item =>
        item.id === id ? { ...item, approved: !item.approved } : item
      ),
    }));
  };

  const toggleItemCompletion = (id: string) => {
    setAppState(prev => ({
      ...prev,
      extractedItems: prev.extractedItems.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    }));
  };

  const editExtractedItem = (id: string, updates: Partial<ExtractedItem>) => {
    setAppState(prev => ({
      ...prev,
      extractedItems: prev.extractedItems.map(item =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  const deleteExtractedItem = (id: string) => {
    setAppState(prev => ({
      ...prev,
      extractedItems: prev.extractedItems.filter(item => item.id !== id),
    }));
  };

  const clearAllData = () => {
    createAutoBackup('before clearing all data');
    setAppState(() => getInitialState());
  };

  return {
    addProcessedTranscript,
    addExtractedItems,
    toggleItemApproval,
    toggleItemCompletion,
    editExtractedItem,
    deleteExtractedItem,
    clearAllData,
  };
};
