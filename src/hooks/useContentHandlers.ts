
import { AppState } from '@/types/appState';

export const useContentHandlers = (
  addProcessedTranscript: (metadata: any) => string,
  addExtractedItems: (items: any[]) => void,
  apiKey: string
) => {
  const handleTextProcessed = (text: string, fileName: string) => {
    console.log('Processing text:', { text: text.substring(0, 100), fileName });
    // Add your text processing logic here
    const transcriptId = addProcessedTranscript({
      name: fileName,
      duration: 'N/A',
      type: 'voice-memo' as const,
      extractedItemCount: 0,
      processingConfidence: 0,
    });
    return transcriptId;
  };

  const handleFileProcessed = (text: string, fileName: string) => {
    console.log('Processing file:', { fileName });
    const transcriptId = addProcessedTranscript({
      name: fileName,
      duration: 'N/A',
      type: 'meeting' as const,
      extractedItemCount: 0,
      processingConfidence: 0,
    });
    return transcriptId;
  };

  const handleAudioProcessed = (audioFile: File, fileName: string) => {
    console.log('Processing audio:', { fileName, size: audioFile.size });
    const transcriptId = addProcessedTranscript({
      name: fileName,
      duration: 'N/A',
      type: 'voice-memo' as const,
      extractedItemCount: 0,
      processingConfidence: 0,
    });
    return transcriptId;
  };

  const handleRecordingProcessed = (audioBlob: Blob, fileName: string) => {
    console.log('Processing recording:', { fileName, size: audioBlob.size });
    const transcriptId = addProcessedTranscript({
      name: fileName,
      duration: 'N/A',
      type: 'voice-memo' as const,
      extractedItemCount: 0,
      processingConfidence: 0,
    });
    return transcriptId;
  };

  const handleTranscribedTextProcessed = (text: string, fileName: string) => {
    console.log('Processing transcribed text:', { text: text.substring(0, 100), fileName });
    const transcriptId = addProcessedTranscript({
      name: fileName,
      duration: 'N/A',
      type: 'meeting' as const,
      extractedItemCount: 0,
      processingConfidence: 0,
    });
    return transcriptId;
  };

  return {
    handleTextProcessed,
    handleFileProcessed,
    handleAudioProcessed,
    handleRecordingProcessed,
    handleTranscribedTextProcessed,
  };
};
