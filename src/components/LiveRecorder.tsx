
import { useState, useRef } from 'react';
import { Mic, MicOff, Square, Play, Edit, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import React from 'react';

interface LiveRecorderProps {
  onRecordingProcessed: (audioBlob: Blob, fileName: string) => void;
  onTranscribedTextProcessed: (text: string, fileName: string) => void;
}

const LiveRecorder = ({ onRecordingProcessed, onTranscribedTextProcessed }: LiveRecorderProps, ref: React.ForwardedRef<any>) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [microphoneError, setMicrophoneError] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const currentFileNameRef = useRef<string>('');

  const startRecording = async () => {
    try {
      setMicrophoneError(null);
      console.log('Requesting microphone access...');
      
      // Request microphone with more specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log('Microphone access granted');
      console.log('Audio tracks:', stream.getAudioTracks());
      
      // Check if we have audio tracks
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio tracks found in the stream');
      }
      
      console.log('Audio track settings:', audioTracks[0].getSettings());
      
      streamRef.current = stream;
      
      // Check if MediaRecorder is supported with WebM
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : MediaRecorder.isTypeSupported('audio/mp4') 
        ? 'audio/mp4' 
        : 'audio/wav';
      
      console.log('Using MIME type:', mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped, total chunks:', chunksRef.current.length);
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        console.log('Audio blob created:', audioBlob.size, 'bytes');
        setHasRecording(true);
        
        // Stop all tracks to release microphone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            console.log('Stopping track:', track.label);
            track.stop();
          });
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setMicrophoneError('Recording error occurred');
      };

      mediaRecorder.start(1000); // Record in 1-second chunks
      console.log('Recording started');
      
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      setTranscribedText('');
      setShowTranscript(false);
      
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setMicrophoneError('Microphone access denied. Please allow microphone access and try again.');
        } else if (error.name === 'NotFoundError') {
          setMicrophoneError('No microphone found. Please connect a microphone and try again.');
        } else if (error.name === 'NotReadableError') {
          setMicrophoneError('Microphone is already in use by another application.');
        } else {
          setMicrophoneError(`Microphone error: ${error.message}`);
        }
      } else {
        setMicrophoneError('Could not access microphone. Please check permissions and ensure you\'re using HTTPS.');
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const transcribeRecording = async () => {
    setIsTranscribing(true);
    
    try {
      console.log('Starting transcription process...');
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      console.log('Audio blob created for transcription:', audioBlob.size, 'bytes');
      
      if (audioBlob.size === 0) {
        throw new Error('No audio data recorded. Please try recording again.');
      }
      
      const fileName = `recording-${Date.now()}.webm`;
      currentFileNameRef.current = fileName;
      
      console.log('Processing recording...');
      
      // Call the transcription function passed from parent
      onRecordingProcessed(audioBlob, fileName);
      
      setHasRecording(false);
    } catch (error) {
      console.error('Error processing recording:', error);
      alert(`Failed to process recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const processTranscribedText = () => {
    if (transcribedText.trim()) {
      onTranscribedTextProcessed(transcribedText, currentFileNameRef.current);
      setTranscribedText('');
      setShowTranscript(false);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Function to be called from parent when transcription is complete
  const setTranscriptionResult = (text: string) => {
    console.log('Setting transcription result:', text.length, 'characters');
    setTranscribedText(text);
    setShowTranscript(true);
    setIsTranscribing(false);
  };

  // Expose this function to parent component
  React.useImperativeHandle(ref, () => ({
    setTranscriptionResult
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mic className="h-5 w-5 mr-2" />
          Live Recording
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {microphoneError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{microphoneError}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => setMicrophoneError(null)}
            >
              Try Again
            </Button>
          </div>
        )}
        
        {!showTranscript ? (
          <>
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
                  {navigator.mediaDevices && (
                    <p className="text-xs text-gray-500">
                      Make sure to allow microphone access when prompted
                    </p>
                  )}
                </div>
              )}
              
              {hasRecording && !isTranscribing && (
                <div className="space-y-2">
                  <div className="bg-green-100 p-4 rounded-lg">
                    <p className="text-sm text-green-800">
                      Recording complete: {formatTime(recordingTime)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {chunksRef.current.length > 0 ? `${chunksRef.current.length} audio chunks recorded` : 'Ready for transcription'}
                    </p>
                  </div>
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
            
            <div className="flex justify-center space-x-2">
              {!isRecording && !hasRecording && !isTranscribing && (
                <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700" disabled={!!microphoneError}>
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
              
              {hasRecording && !isTranscribing && (
                <div className="space-x-2">
                  <Button onClick={transcribeRecording} className="bg-green-600 hover:bg-green-700">
                    Transcribe & Process
                  </Button>
                  <Button onClick={() => {
                    setHasRecording(false);
                    setRecordingTime(0);
                    chunksRef.current = [];
                  }} variant="outline">
                    Discard
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <h3 className="font-medium">Review & Edit Transcript</h3>
            </div>
            <Textarea
              value={transcribedText}
              onChange={(e) => setTranscribedText(e.target.value)}
              className="min-h-[120px]"
              placeholder="Transcribed text will appear here..."
            />
            <div className="flex justify-between space-x-2">
              <Button 
                onClick={() => {
                  setShowTranscript(false);
                  setTranscribedText('');
                  setRecordingTime(0);
                  chunksRef.current = [];
                  setHasRecording(false);
                }} 
                variant="outline"
              >
                Cancel
              </Button>
              <Button 
                onClick={processTranscribedText}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!transcribedText.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Process Text
              </Button>
            </div>
          </div>
        )}
        
        <Badge variant="outline" className="w-full justify-center text-xs">
          Real-time AI processing & extraction
        </Badge>
      </CardContent>
    </Card>
  );
};

export default React.forwardRef(LiveRecorder);
