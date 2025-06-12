
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
  completed: boolean;
  sourceTranscriptId: string;
  extractedAt: string;
}

export interface AppState {
  transcriptMetadata: TranscriptMetadata[];
  extractedItems: ExtractedItem[];
  lastSaved?: string;
  autoSave: boolean;
}

export interface AutoBackup {
  id: string;
  name: string;
  timestamp: string;
  itemCount: number;
  data: AppState;
}
