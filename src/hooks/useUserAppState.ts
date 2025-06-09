
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

export interface TranscriptMetadata {
  id: string;
  name: string;
  processedAt: string;
  duration: string;
  type: 'meeting' | 'voice-memo' | 'brainstorm';
  extractedItemCount: number;
  processingConfidence: number;
}

export interface ExtractedItem {
  id: string;
  type: 'task' | 'event' | 'idea' | 'contact';
  title: string;
  description?: string;
  category: 'Business' | 'Personal' | 'Home' | 'Projects';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignee?: string;
  confidence: number;
  approved: boolean;
  sourceTranscriptId: string;
  extractedAt: string;
}

export interface AppState {
  transcriptMetadata: TranscriptMetadata[];
  extractedItems: ExtractedItem[];
  lastSaved?: string;
  autoSave: boolean;
}

const getInitialState = (): AppState => ({
  transcriptMetadata: [],
  extractedItems: [],
  autoSave: true,
});

export const useUserAppState = () => {
  const { user, isLoaded } = useUser();
  const [appState, setAppState] = useState<AppState>(getInitialState());

  // Get user-specific storage key
  const getStorageKey = () => user ? `transcriptflow-${user.id}` : null;
  const getAutoSaveKey = () => user ? `transcriptflow-autosave-${user.id}` : null;

  // Load user's state when user is loaded
  useEffect(() => {
    if (isLoaded && user) {
      const storageKey = getStorageKey();
      const autoSaveKey = getAutoSaveKey();
      
      if (storageKey) {
        const savedState = localStorage.getItem(storageKey);
        const savedAutoSave = localStorage.getItem(autoSaveKey);
        
        if (savedState) {
          try {
            const parsedState = JSON.parse(savedState);
            setAppState({
              ...parsedState,
              autoSave: savedAutoSave ? JSON.parse(savedAutoSave) : true,
            });
          } catch (error) {
            console.error('Error loading saved state:', error);
            setAppState(getInitialState());
          }
        } else {
          setAppState(getInitialState());
        }
      }
    } else if (isLoaded && !user) {
      // User is not logged in, reset to initial state
      setAppState(getInitialState());
    }
  }, [isLoaded, user]);

  // Auto-save functionality
  useEffect(() => {
    if (isLoaded && user && appState.autoSave) {
      const storageKey = getStorageKey();
      if (storageKey) {
        const stateToSave = {
          ...appState,
          lastSaved: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(stateToSave));
      }
    }
  }, [appState, isLoaded, user]);

  const updateAutoSave = (enabled: boolean) => {
    const autoSaveKey = getAutoSaveKey();
    if (autoSaveKey) {
      localStorage.setItem(autoSaveKey, JSON.stringify(enabled));
    }
    setAppState(prev => ({ ...prev, autoSave: enabled }));
  };

  const exportState = () => {
    const stateToExport = {
      ...appState,
      lastSaved: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(stateToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `transcriptflow-state-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importState = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedState = JSON.parse(e.target?.result as string);
        setAppState(importedState);
        console.log('State imported successfully');
      } catch (error) {
        console.error('Error importing state:', error);
      }
    };
    reader.readAsText(file);
  };

  const addProcessedTranscript = (metadata: Omit<TranscriptMetadata, 'id' | 'processedAt'>) => {
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

  const clearAllData = () => {
    setAppState(getInitialState());
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

  return {
    appState,
    exportState,
    importState,
    addProcessedTranscript,
    addExtractedItems,
    toggleItemApproval,
    editExtractedItem,
    deleteExtractedItem,
    clearAllData,
    updateAutoSave,
    isLoaded,
    user,
  };
};
