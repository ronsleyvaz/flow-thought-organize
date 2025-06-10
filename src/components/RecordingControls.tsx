
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square, Play, Pause, Download } from 'lucide-react';

interface RecordingControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  hasRecording: boolean;
  isTranscribing: boolean;
  isPlaying: boolean;
  microphoneError: string | null;
  audioBlob: Blob | null;
  onStartRecording: () => void;
  onPauseRecording: () => void;
  onStopRecording: () => void;
  onPlayAudio: () => void;
  onDownloadAudio: () => void;
  onTranscribeRecording: () => void;
  onDiscardRecording: () => void;
  disabled?: boolean;
}

const RecordingControls = ({
  isRecording,
  isPaused,
  hasRecording,
  isTranscribing,
  isPlaying,
  microphoneError,
  audioBlob,
  onStartRecording,
  onPauseRecording,
  onStopRecording,
  onPlayAudio,
  onDownloadAudio,
  onTranscribeRecording,
  onDiscardRecording,
  disabled
}: RecordingControlsProps) => {
  return (
    <div className="flex justify-center space-x-2">
      {!isRecording && !hasRecording && !isTranscribing && (
        <Button 
          onClick={onStartRecording} 
          className="bg-red-600 hover:bg-red-700" 
          disabled={!!microphoneError || disabled}
        >
          <Mic className="h-4 w-4 mr-2" />
          Start Recording
        </Button>
      )}
      
      {isRecording && (
        <>
          <Button onClick={onPauseRecording} variant="outline" disabled={disabled}>
            {isPaused ? <Play className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          <Button onClick={onStopRecording} variant="outline" disabled={disabled}>
            <Square className="h-4 w-4" />
          </Button>
        </>
      )}
      
      {hasRecording && !isTranscribing && (
        <>
          {audioBlob && (
            <div className="flex space-x-2">
              <Button onClick={onPlayAudio} variant="outline" size="sm">
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Stop' : 'Play'}
              </Button>
              <Button onClick={onDownloadAudio} variant="outline" size="sm">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          )}
          <Button 
            onClick={onTranscribeRecording} 
            className="bg-green-600 hover:bg-green-700"
            disabled={disabled}
          >
            Transcribe & Process
          </Button>
          <Button onClick={onDiscardRecording} variant="outline">
            Discard
          </Button>
        </>
      )}
    </div>
  );
};

export default RecordingControls;
