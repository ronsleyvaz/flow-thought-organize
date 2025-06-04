
import { useState, useRef } from 'react';
import { Mic, MicOff, Square, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LiveRecorderProps {
  onRecordingProcessed: (file: File) => void;
}

const LiveRecorder = ({ onRecordingProcessed }: LiveRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setRecordingTime(0);
    
    intervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const pauseRecording = () => {
    setIsPaused(!isPaused);
    if (isPaused && intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    setHasRecording(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const processRecording = () => {
    // Create a mock audio file for processing
    const mockFile = new File([''], `recording-${Date.now()}.wav`, { type: 'audio/wav' });
    onRecordingProcessed(mockFile);
    setHasRecording(false);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mic className="h-5 w-5 mr-2" />
          Live Recording
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
          
          {!isRecording && !hasRecording && (
            <div className="space-y-2">
              <Mic className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-600">Ready to record</p>
            </div>
          )}
          
          {hasRecording && (
            <div className="space-y-2">
              <div className="bg-green-100 p-4 rounded-lg">
                <p className="text-sm text-green-800">
                  Recording complete: {formatTime(recordingTime)}
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-center space-x-2">
          {!isRecording && !hasRecording && (
            <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700">
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          )}
          
          {isRecording && (
            <>
              <Button onClick={pauseRecording} variant="outline">
                {isPaused ? <Play className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              <Button onClick={stopRecording} variant="outline">
                <Square className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {hasRecording && (
            <div className="space-x-2">
              <Button onClick={processRecording} className="bg-green-600 hover:bg-green-700">
                Process Recording
              </Button>
              <Button onClick={() => setHasRecording(false)} variant="outline">
                Discard
              </Button>
            </div>
          )}
        </div>
        
        <Badge variant="outline" className="w-full justify-center text-xs">
          Real-time AI processing & extraction
        </Badge>
      </CardContent>
    </Card>
  );
};

export default LiveRecorder;
