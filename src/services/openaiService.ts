
export interface ExtractedData {
  tasks: Array<{
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    assignee?: string;
  }>;
  events: Array<{
    title: string;
    description?: string;
    date?: string;
    time?: string;
  }>;
  ideas: Array<{
    title: string;
    description?: string;
  }>;
  contacts: Array<{
    name: string;
    role?: string;
    company?: string;
    email?: string;
    phone?: string;
  }>;
}

// Re-export the services for backward compatibility
export { transcribeAudio } from './transcriptionService';
export { extractItemsFromText } from './extractionService';
