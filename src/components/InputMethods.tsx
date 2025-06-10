
import { FileText, Upload, Mic } from 'lucide-react';
import TextInput from './TextInput';
import FileUploader from './FileUploader';
import LiveRecorder from './LiveRecorder';
import CollapsibleSection from './CollapsibleSection';

interface InputMethodsProps {
  onTextProcessed: (text: string, fileName: string) => void;
  onFileProcessed: (text: string, fileName: string) => void;
  onAudioProcessed: (audioFile: File, fileName: string) => void;
  onRecordingProcessed: (audioBlob: Blob, fileName: string) => void;
  onTranscribedTextProcessed: (text: string, fileName: string) => void;
  apiKey: string;
  liveRecorderRef: React.RefObject<any>;
}

const InputMethods = ({
  onTextProcessed,
  onFileProcessed,
  onAudioProcessed,
  onRecordingProcessed,
  onTranscribedTextProcessed,
  apiKey,
  liveRecorderRef
}: InputMethodsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <CollapsibleSection title="Direct Input" icon={<FileText className="h-5 w-5 mr-2" />}>
        <TextInput onTextProcessed={onTextProcessed} />
      </CollapsibleSection>
      
      <CollapsibleSection title="Upload Transcript" icon={<Upload className="h-5 w-5 mr-2" />}>
        <FileUploader 
          onFileProcessed={onFileProcessed} 
          onAudioProcessed={onAudioProcessed}
        />
      </CollapsibleSection>
      
      <CollapsibleSection title="Live Recording" icon={<Mic className="h-5 w-5 mr-2" />}>
        <LiveRecorder 
          ref={liveRecorderRef}
          onRecordingProcessed={onRecordingProcessed}
          onTranscribedTextProcessed={onTranscribedTextProcessed}
          apiKey={apiKey}
        />
      </CollapsibleSection>
    </div>
  );
};

export default InputMethods;
