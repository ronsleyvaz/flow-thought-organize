
import InputMethods from './InputMethods';
import FirefliesIntegration from './FirefliesIntegration';
import { AppState } from '@/hooks/useUserAppState';

interface InputsPageProps {
  appState: AppState;
  apiKey: string;
  onTextProcessed: (text: string, fileName: string) => void;
  onFileProcessed: (text: string, fileName: string) => void;
  onAudioProcessed: (audioFile: File, fileName: string) => void;
  onRecordingProcessed: (audioBlob: Blob, fileName: string) => void;
  onTranscribedTextProcessed: (text: string, fileName: string) => void;
  onFirefliesTranscriptProcessed: (extractedData: any, transcriptId: string) => void;
}

const InputsPage = ({
  appState,
  apiKey,
  onTextProcessed,
  onFileProcessed,
  onAudioProcessed,
  onRecordingProcessed,
  onTranscribedTextProcessed,
  onFirefliesTranscriptProcessed,
}: InputsPageProps) => {
  // Pass a ref to LiveRecorder - you may want to lift this up if required for other integration.
  const liveRecorderRef = React.useRef<any>(null);

  return (
    <div className="p-6 space-y-6">
      <InputMethods
        onTextProcessed={onTextProcessed}
        onFileProcessed={onFileProcessed}
        onAudioProcessed={onAudioProcessed}
        onRecordingProcessed={onRecordingProcessed}
        onTranscribedTextProcessed={onTranscribedTextProcessed}
        apiKey={apiKey}
        liveRecorderRef={liveRecorderRef}
      />
      <FirefliesIntegration
        appState={appState}
        apiKey={apiKey}
        onFirefliesTranscriptProcessed={onFirefliesTranscriptProcessed}
      />
    </div>
  );
};

export default InputsPage;
