import { useState, useRef, useEffect } from 'react';
import { Mic, Edit, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import React from 'react';
import RecordingSettings from './RecordingSettings';
import RecordingControls from './RecordingControls';
import RecordingStatus from './RecordingStatus';

interface LiveRecorderProps {
  onRecordingProcessed: (audioBlob: Blob, fileName: string) => void;
  onTranscribedTextProcessed: (text: string, fileName: string) => void;
  apiKey?: string;
}

const LiveRecorder = ({ onRecordingProcessed, onTranscribedTextProcessed, apiKey }: LiveRecorderProps, ref: React.ForwardedRef<any>) => {
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
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const currentFileNameRef = useRef<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const hasValidApiKey = apiKey && apiKey.trim().length > 0;

  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        console.log('Available audio input devices:', audioInputs);
        setAvailableDevices(audioInputs);
        if (audioInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(audioInputs[0].deviceId);
        }
      } catch (error) {
        console.error('Error getting devices:', error);
        setMicrophoneError('Unable to access microphone devices');
      }
    };

    if (hasValidApiKey) {
      getDevices();
    }
  }, [hasValidApiKey, selectedDeviceId]);

  const startVolumeMonitoring = (stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateVolume = () => {
        if (analyser && isRecording && !isPaused) {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          const normalizedVolume = Math.min(100, (average / 255) * 100);
          setVolumeLevel(normalizedVolume);
        }
      };
      
      volumeIntervalRef.current = setInterval(updateVolume, 100);
      console.log('Volume monitoring started');
    } catch (error) {
      console.error('Error setting up volume monitoring:', error);
    }
  };

  const stopVolumeMonitoring = () => {
    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setVolumeLevel(0);
    console.log('Volume monitoring stopped');
  };

  const startRecording = async () => {
    if (!hasValidApiKey) {
      setMicrophoneError('OpenAI API key required for transcription');
      return;
    }

    try {
      setMicrophoneError(null);
      console.log('Starting recording with device:', selectedDeviceId);
      
      const constraints = {
        audio: selectedDeviceId ? {
          deviceId: { exact: selectedDeviceId },
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Stream obtained:', stream);
      
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio tracks found');
      }
      
      streamRef.current = stream;
      startVolumeMonitoring(stream);
      
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4'
      ];
      
      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          console.log('Selected MIME type:', mimeType);
          break;
        }
      }
      
      const options = selectedMimeType ? {
        mimeType: selectedMimeType,
        audioBitsPerSecond: 128000
      } : { audioBitsPerSecond: 128000 };
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        console.log('MediaRecorder stopped, chunks:', chunksRef.current.length);
        stopVolumeMonitoring();
        
        if (chunksRef.current.length === 0) {
          setMicrophoneError('No audio data recorded');
          return;
        }
        
        const mimeType = mediaRecorder.mimeType || selectedMimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        console.log('Final blob:', blob.size, 'bytes, type:', blob.type);
        
        if (blob.size === 0) {
          setMicrophoneError('Empty recording - please check microphone');
          return;
        }
        
        setAudioBlob(blob);
        setHasRecording(true);
        
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
        }
        audioUrlRef.current = URL.createObjectURL(blob);
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setMicrophoneError('Recording failed');
        stopVolumeMonitoring();
      };
      
      mediaRecorder.start(1000);
      console.log('Recording started');
      
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
      console.error('Recording error:', error);
      stopVolumeMonitoring();
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setMicrophoneError('Microphone permission denied');
        } else if (error.name === 'NotFoundError') {
          setMicrophoneError('Microphone not found');
        } else if (error.name === 'NotReadableError') {
          setMicrophoneError('Microphone in use by another app');
        } else {
          setMicrophoneError(`Error: ${error.message}`);
        }
      } else {
        setMicrophoneError('Unable to access microphone');
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
    stopVolumeMonitoring();
  };

  const playAudio = async () => {
    if (!audioUrlRef.current || !audioBlob) {
      console.error('No audio URL or blob available for playback');
      setMicrophoneError('No audio available for playback');
      return;
    }
    
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      if (isPlaying) {
        setIsPlaying(false);
        return;
      }
      
      const audio = new Audio(audioUrlRef.current);
      audioRef.current = audio;
      
      audio.onended = () => {
        console.log('Audio playback ended');
        setIsPlaying(false);
      };
      
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
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
      
      await audio.play();
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

    if (!hasValidApiKey) {
      setMicrophoneError('OpenAI API key required for transcription');
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
        {!hasValidApiKey && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              Please configure your OpenAI API key in Settings to use live recording.
            </p>
          </div>
        )}

        {hasValidApiKey && (
          <>
            <RecordingSettings
              isOpen={showSettings}
              onToggle={() => setShowSettings(!showSettings)}
              availableDevices={availableDevices}
              selectedDeviceId={selectedDeviceId}
              onDeviceChange={setSelectedDeviceId}
              volumeLevel={volumeLevel}
              isRecording={isRecording}
              disabled={!hasValidApiKey}
            />
            
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
                <RecordingStatus
                  isRecording={isRecording}
                  isPaused={isPaused}
                  hasRecording={hasRecording}
                  isTranscribing={isTranscribing}
                  recordingTime={recordingTime}
                  audioBlob={audioBlob}
                />
                
                <RecordingControls
                  isRecording={isRecording}
                  isPaused={isPaused}
                  hasRecording={hasRecording}
                  isTranscribing={isTranscribing}
                  isPlaying={isPlaying}
                  microphoneError={microphoneError}
                  audioBlob={audioBlob}
                  onStartRecording={startRecording}
                  onPauseRecording={pauseRecording}
                  onStopRecording={stopRecording}
                  onPlayAudio={playAudio}
                  onDownloadAudio={downloadAudio}
                  onTranscribeRecording={transcribeRecording}
                  onDiscardRecording={discardRecording}
                  disabled={!hasValidApiKey}
                />
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
          </>
        )}
        
        <Badge variant="outline" className="w-full justify-center text-xs">
          Real-time AI processing & extraction
        </Badge>
      </CardContent>
    </Card>
  );
};

export default React.forwardRef(LiveRecorder);
