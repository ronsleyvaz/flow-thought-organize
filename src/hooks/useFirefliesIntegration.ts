
import { useToast } from '@/hooks/use-toast';
import { ExtractedData } from '@/services/openaiService';

interface UseFirefliesIntegrationProps {
  addProcessedTranscript: (metadata: any) => string;
  addExtractedItems: (items: any[]) => void;
}

export const useFirefliesIntegration = ({ addProcessedTranscript, addExtractedItems }: UseFirefliesIntegrationProps) => {
  const { toast } = useToast();

  const handleFirefliesTranscriptProcessed = (extractedData: ExtractedData, transcriptId: string) => {
    console.log('handleFirefliesTranscriptProcessed called with:', extractedData, transcriptId);
    
    // Filter contacts to only include those with email or phone
    const validContacts = (extractedData.contacts || []).filter((contact: any) => {
      const hasEmail = contact.email && contact.email.trim().length > 0;
      const hasPhone = contact.phone && contact.phone.trim().length > 0;
      return hasEmail || hasPhone;
    });

    console.log('Filtered contacts with contact info:', validContacts);

    // Enhanced confidence score generation with more realistic variation
    const getConfidenceScore = (type: string, item: any) => {
      let baseScore = 60 + Math.floor(Math.random() * 30); // 60-90 base range
      
      // Type-specific adjustments
      if (type === 'task') {
        // Tasks with clear assignees and due dates get higher confidence
        if (item.assignee) baseScore += 5;
        if (item.dueDate) baseScore += 5;
        if (item.description && item.description.length > 50) baseScore += 8;
        if (item.priority === 'high') baseScore += 3;
      } else if (type === 'contact') {
        // Contacts with complete info get higher confidence
        if (item.email && item.phone) baseScore += 15;
        else if (item.email || item.phone) baseScore += 8;
        if (item.role && item.company) baseScore += 10;
        if (item.name && item.name.split(' ').length >= 2) baseScore += 5;
      } else if (type === 'event') {
        // Events with specific dates/times get higher confidence
        if (item.date && item.time) baseScore += 12;
        else if (item.date) baseScore += 6;
        if (item.description && item.description.length > 30) baseScore += 5;
      } else if (type === 'idea') {
        // Ideas with detailed descriptions get higher confidence
        if (item.description && item.description.length > 100) baseScore += 10;
        else if (item.description && item.description.length > 50) baseScore += 5;
      }
      
      // Add some randomness for realism
      const randomAdjustment = Math.floor(Math.random() * 11) - 5; // -5 to +5
      baseScore += randomAdjustment;
      
      // Ensure score stays within reasonable bounds
      return Math.min(Math.max(baseScore, 45), 98);
    };

    // Add transcript metadata
    const transcriptMetadataId = addProcessedTranscript({
      name: `Fireflies Transcript ${transcriptId}`,
      duration: 'Unknown',
      type: 'meeting',
      extractedItemCount: 
        (extractedData.tasks?.length || 0) + 
        (extractedData.events?.length || 0) + 
        (extractedData.ideas?.length || 0) + 
        validContacts.length,
      processingConfidence: Math.floor(Math.random() * 15) + 85, // 85-100 range
    });

    console.log('Added transcript metadata with ID:', transcriptMetadataId);

    // Convert and add extracted items with varying confidence scores
    const allItems = [
      ...(extractedData.tasks || []).map((task: any) => ({
        type: 'task' as const,
        title: task.title,
        description: task.description,
        category: 'Business' as const,
        priority: task.priority || 'medium' as const,
        dueDate: task.dueDate,
        assignee: task.assignee,
        confidence: getConfidenceScore('task', task),
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
        confidence: getConfidenceScore('event', event),
        approved: false,
        sourceTranscriptId: transcriptMetadataId,
      })),
      ...(extractedData.ideas || []).map((idea: any) => ({
        type: 'idea' as const,
        title: idea.title,
        description: idea.description,
        category: 'Projects' as const,
        priority: 'medium' as const,
        confidence: getConfidenceScore('idea', idea),
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
        confidence: getConfidenceScore('contact', contact),
        approved: false,
        sourceTranscriptId: transcriptMetadataId,
      }))
    ];

    console.log('Converted items with varied confidence scores:', allItems);

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

  return { handleFirefliesTranscriptProcessed };
};
