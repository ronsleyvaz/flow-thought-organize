
import React from 'react';
import { Mic } from 'lucide-react';

interface RecordingStatusProps {
  isRecording: boolean;
  isPaused: boolean;
  hasRecording: boolean;
  isTranscribing: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
}

const RecordingStatus = ({
  isRecording,
  isPaused,
  hasRecording,
  isTranscribing,
  recordingTime,
  audioBlob
}: RecordingStatusProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center space-y-4">
      {isRecording && (
        <div className="space-y-2">
          <div className={`h-4 w-4 rounded-full mx-auto ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}></div>
          <p className="text-2xl font-mono">{formatTime(recordingTime)}</p>
          <p className="text-sm text-gray-600">
            {isPaused ? 'Recording paused' : 'Recording in progress...'}
          </p>
        </div>
      )}
      
      {!isRecording && !hasRecording && !isTranscribing && (
        <div className="space-y-2">
          <Mic className="h-12 w-12 text-gray-400 mx-auto" />
          <p className="text-sm text-gray-600">Ready to record</p>
          <p className="text-xs text-gray-500">
            Make sure to allow microphone access when prompted
          </p>
        </div>
      )}
      
      {hasRecording && !isTranscribing && (
        <div className="bg-green-100 p-4 rounded-lg">
          <p className="text-sm text-green-800">
            Recording complete: {formatTime(recordingTime)}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {audioBlob ? `Audio ready (${(audioBlob.size / 1024).toFixed(1)} KB)` : 'Audio processing...'}
          </p>
        </div>
      )}

      {isTranscribing && (
        <div className="space-y-2">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto"></div>
          <p className="text-sm text-gray-600">Transcribing audio...</p>
          <p className="text-xs text-gray-500">This may take a moment</p>
        </div>
      )}
    </div>
  );
};

export default RecordingStatus;
