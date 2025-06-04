
import { useState } from 'react';

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
}

export const useAppState = () => {
  const [appState, setAppState] = useState<AppState>({
    transcriptMetadata: [
      {
        id: '1',
        name: 'Q4 Planning Meeting',
        processedAt: '2024-12-04T10:00:00Z',
        duration: '45 min',
        type: 'meeting',
        extractedItemCount: 12,
        processingConfidence: 92,
      },
      {
        id: '2',
        name: 'Weekend Planning Voice Memo',
        processedAt: '2024-12-04T08:00:00Z',
        duration: '3 min',
        type: 'voice-memo',
        extractedItemCount: 5,
        processingConfidence: 88,
      },
    ],
    extractedItems: [
      {
        id: '1',
        type: 'task',
        title: 'Review Q4 budget proposal with finance team',
        description: 'Schedule meeting to discuss budget allocations for next quarter',
        category: 'Business',
        priority: 'high',
        dueDate: 'Dec 15, 2024',
        assignee: 'Sarah Chen',
        confidence: 95,
        approved: false,
        sourceTranscriptId: '1',
        extractedAt: '2024-12-04T10:00:00Z',
      },
      {
        id: '2',
        type: 'event',
        title: 'Product demo for potential client',
        description: 'Prepare slides and demo environment for Acme Corp meeting',
        category: 'Business',
        priority: 'high',
        dueDate: 'Dec 12, 2024 2:00 PM',
        confidence: 88,
        approved: false,
        sourceTranscriptId: '1',
        extractedAt: '2024-12-04T10:00:00Z',
      },
      {
        id: '3',
        type: 'idea',
        title: 'Integration with Slack for real-time notifications',
        description: 'Allow users to receive extracted items directly in their Slack workspace',
        category: 'Projects',
        priority: 'medium',
        confidence: 76,
        approved: true,
        sourceTranscriptId: '1',
        extractedAt: '2024-12-04T10:00:00Z',
      },
      {
        id: '4',
        type: 'task',
        title: 'Pick up groceries for weekend dinner party',
        description: 'Get ingredients for Italian cuisine theme',
        category: 'Personal',
        priority: 'low',
        dueDate: 'Dec 14, 2024',
        confidence: 92,
        approved: false,
        sourceTranscriptId: '2',
        extractedAt: '2024-12-04T08:00:00Z',
      },
    ],
  });

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
    setAppState({
      transcriptMetadata: [],
      extractedItems: [],
    });
  };

  return {
    appState,
    exportState,
    importState,
    addProcessedTranscript,
    addExtractedItems,
    toggleItemApproval,
    clearAllData,
  };
};
