
import { useState, useRef } from 'react';
import { Mic, MicOff, Square, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LiveRecorderProps {
  onRecordingProcessed: (transcriptionText: string, fileName: string) => void;
}

const LiveRecorder = ({ onRecordingProcessed }: LiveRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setHasRecording(true);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const processRecording = async () => {
    setIsProcessing(true);
    
    try {
      // Create a mock transcription for now since we don't have a transcription service
      // In a real app, you'd send the audio to a transcription service
      const mockTranscription = `Recording from ${new Date().toLocaleString()}: This is a sample transcription. 
      I need to follow up with John about the project deadline next Friday. 
      Also, remember to schedule a meeting with the design team for brainstorming session. 
      New idea: implement dark mode for the application.`;
      
      const fileName = `recording-${Date.now()}.wav`;
      onRecordingProcessed(mockTranscription, fileName);
      
      setHasRecording(false);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error processing recording:', error);
    } finally {
      setIsProcessing(false);
    }
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
          
          {!isRecording && !hasRecording && !isProcessing && (
            <div className="space-y-2">
              <Mic className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-600">Ready to record</p>
            </div>
          )}
          
          {hasRecording && !isProcessing && (
            <div className="space-y-2">
              <div className="bg-green-100 p-4 rounded-lg">
                <p className="text-sm text-green-800">
                  Recording complete: {formatTime(recordingTime)}
                </p>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto"></div>
              <p className="text-sm text-gray-600">Processing recording...</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-center space-x-2">
          {!isRecording && !hasRecording && !isProcessing && (
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
          
          {hasRecording && !isProcessing && (
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
