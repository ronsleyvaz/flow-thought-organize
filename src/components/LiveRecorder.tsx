import { useState, useRef } from 'react';
import { Mic, MicOff, Square, Play, Pause, Edit, Send, Download } from 'lucide-react';
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const currentFileNameRef = useRef<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const startRecording = async () => {
    try {
      setMicrophoneError(null);
      console.log('Requesting microphone access...');
      
      // Request microphone with standard constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log('Microphone access granted, stream:', stream);
      console.log('Audio tracks:', stream.getAudioTracks());
      
      // Verify audio track is active
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio tracks found in stream');
      }
      
      console.log('Audio track settings:', audioTracks[0].getSettings());
      streamRef.current = stream;
      
      // Try different MIME types in order of preference
      let mimeType = '';
      const supportedTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus'
      ];
      
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          console.log('Selected MIME type:', mimeType);
          break;
        }
      }
      
      if (!mimeType) {
        throw new Error('No supported audio format found');
      }
      
      // Create MediaRecorder with appropriate settings
      const options: MediaRecorderOptions = { 
        mimeType,
        audioBitsPerSecond: 128000
      };
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available event:', event.data.size, 'bytes, type:', event.data.type);
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log('Total chunks so far:', chunksRef.current.length);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped, processing chunks...');
        console.log('Final chunks count:', chunksRef.current.length);
        console.log('Chunk sizes:', chunksRef.current.map(chunk => chunk.size));
        
        if (chunksRef.current.length === 0) {
          console.error('No audio chunks recorded');
          setMicrophoneError('No audio data was recorded. Please try again.');
          return;
        }
        
        const blob = new Blob(chunksRef.current, { type: mimeType });
        console.log('Audio blob created:', {
          size: blob.size,
          type: blob.type,
          totalChunks: chunksRef.current.length
        });
        
        if (blob.size === 0) {
          console.error('Empty audio blob created');
          setMicrophoneError('Recording failed - no audio data captured. Please check microphone permissions.');
          return;
        }
        
        setAudioBlob(blob);
        setHasRecording(true);
        
        // Create audio URL for playback
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
        }
        audioUrlRef.current = URL.createObjectURL(blob);
        console.log('Audio URL created:', audioUrlRef.current);
        
        // Stop all tracks to release microphone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            console.log('Stopping track:', track.label, track.readyState);
            track.stop();
          });
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setMicrophoneError('Recording error occurred');
      };

      mediaRecorder.onstart = () => {
        console.log('MediaRecorder started successfully');
      };

      // Start recording with larger intervals to avoid fragmentation
      mediaRecorder.start(1000); // Collect data every 1 second instead of 100ms
      console.log('Recording started with state:', mediaRecorder.state);
      
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      setTranscribedText('');
      setShowTranscript(false);
      setAudioBlob(null);
      setHasRecording(false);
      
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
        console.log('Recording resumed');
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        console.log('Recording paused');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    console.log('Stop recording called');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log('Stopping MediaRecorder, current state:', mediaRecorderRef.current.state);
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping stream track:', track.label);
        track.stop();
      });
    }
    setIsRecording(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const playAudio = async () => {
    console.log('Play audio called, audioUrlRef.current:', audioUrlRef.current);
    console.log('Audio blob size:', audioBlob?.size);
    
    if (!audioUrlRef.current || !audioBlob) {
      console.error('No audio URL or blob available for playback');
      setMicrophoneError('No audio available for playback');
      return;
    }
    
    try {
      // Clean up previous audio instance
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      if (isPlaying) {
        setIsPlaying(false);
        return;
      }
      
      console.log('Creating new Audio element');
      const audio = new Audio(audioUrlRef.current);
      audioRef.current = audio;
      
      // Set up event listeners
      audio.onloadedmetadata = () => {
        console.log('Audio metadata loaded, duration:', audio.duration);
        if (audio.duration === Infinity || isNaN(audio.duration)) {
          console.warn('Invalid audio duration detected');
        }
      };
      
      audio.oncanplay = () => {
        console.log('Audio can play');
      };
      
      audio.onended = () => {
        console.log('Audio playback ended');
        setIsPlaying(false);
      };
      
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        console.error('Audio error details:', audio.error);
        setIsPlaying(false);
        setMicrophoneError('Audio playback failed');
      };

      audio.onplay = () => {
        console.log('Audio started playing');
        setIsPlaying(true);
      };

      audio.onpause = () => {
        console.log('Audio paused');
        setIsPlaying(false);
      };
      
      console.log('Starting audio playback');
      await audio.play();
      console.log('Audio play() called successfully');
    } catch (error) {
      console.error('Error during audio playback:', error);
      setIsPlaying(false);
      setMicrophoneError('Failed to play audio');
    }
  };

  const downloadAudio = () => {
    if (audioUrlRef.current && audioBlob) {
      const fileName = `recording-${Date.now()}.webm`;
      const link = document.createElement('a');
      link.href = audioUrlRef.current;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('Audio download initiated:', fileName);
    }
  };

  const transcribeRecording = async () => {
    if (!audioBlob) {
      console.error('No audio blob available for transcription');
      return;
    }

    setIsTranscribing(true);
    
    try {
      console.log('Starting transcription process...');
      console.log('Audio blob for transcription:', audioBlob.size, 'bytes');
      
      if (audioBlob.size === 0) {
        throw new Error('No audio data recorded. Please try recording again.');
      }
      
      const fileName = `recording-${Date.now()}.webm`;
      currentFileNameRef.current = fileName;
      
      console.log('Processing recording with filename:', fileName);
      
      onRecordingProcessed(audioBlob, fileName);
    } catch (error) {
      console.error('Error processing recording:', error);
      alert(`Failed to process recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsTranscribing(false);
    }
  };

  const processTranscribedText = () => {
    if (transcribedText.trim()) {
      onTranscribedTextProcessed(transcribedText, currentFileNameRef.current);
      setTranscribedText('');
      setShowTranscript(false);
      setRecordingTime(0);
      setHasRecording(false);
      setAudioBlob(null);
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current = null;
      }
    }
  };

  const discardRecording = () => {
    setHasRecording(false);
    setRecordingTime(0);
    setAudioBlob(null);
    setTranscribedText('');
    setShowTranscript(false);
    chunksRef.current = [];
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const setTranscriptionResult = (text: string) => {
    console.log('Setting transcription result:', text.length, 'characters');
    setTranscribedText(text);
    setShowTranscript(true);
    setIsTranscribing(false);
  };

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
                  <p className="text-xs text-gray-500">
                    Make sure to allow microphone access when prompted
                  </p>
                </div>
              )}
              
              {hasRecording && !isTranscribing && (
                <div className="space-y-3">
                  <div className="bg-green-100 p-4 rounded-lg">
                    <p className="text-sm text-green-800">
                      Recording complete: {formatTime(recordingTime)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {audioBlob ? `Audio ready (${(audioBlob.size / 1024).toFixed(1)} KB)` : 'Audio processing...'}
                    </p>
                  </div>
                  
                  {audioBlob && (
                    <div className="flex justify-center space-x-2">
                      <Button
                        onClick={playAudio}
                        variant="outline"
                        size="sm"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        {isPlaying ? 'Stop' : 'Play'}
                      </Button>
                      <Button
                        onClick={downloadAudio}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  )}
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
                  <Button onClick={discardRecording} variant="outline">
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
                  setHasRecording(false);
                  setAudioBlob(null);
                  if (audioUrlRef.current) {
                    URL.revokeObjectURL(audioUrlRef.current);
                    audioUrlRef.current = null;
                  }
                  if (audioRef.current) {
                    audioRef.current = null;
                  }
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
