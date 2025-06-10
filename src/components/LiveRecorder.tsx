import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square, Play, Pause, Edit, Send, Download, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  
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

  // Get available audio input devices
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

    getDevices();
  }, []);

  // Monitor volume levels during recording
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
      console.log('Audio tracks:', stream.getAudioTracks());
      
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio tracks found');
      }
      
      console.log('Audio track settings:', audioTracks[0].getSettings());
      console.log('Audio track constraints:', audioTracks[0].getConstraints());
      
      streamRef.current = stream;
      
      // Start volume monitoring
      startVolumeMonitoring(stream);
      
      // Test different MIME types for better compatibility
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4;codecs=mp4a.40.2',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/wav'
      ];
      
      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          console.log('Selected MIME type:', mimeType);
          break;
        }
      }
      
      if (!selectedMimeType) {
        console.error('No supported MIME types found');
        selectedMimeType = ''; // Let browser choose default
      }
      
      const options = selectedMimeType ? {
        mimeType: selectedMimeType,
        audioBitsPerSecond: 128000
      } : {
        audioBitsPerSecond: 128000
      };
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      console.log('MediaRecorder created with options:', options);
      console.log('MediaRecorder state:', mediaRecorder.state);
      
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
        
        // Stop stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setMicrophoneError('Recording failed');
        stopVolumeMonitoring();
      };
      
      // Start recording with 1-second intervals
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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Mic className="h-5 w-5 mr-2" />
            Live Recording
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeviceSettings(!showDeviceSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showDeviceSettings && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium">Microphone Device</label>
              <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select microphone" />
                </SelectTrigger>
                <SelectContent>
                  {availableDevices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {isRecording && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Input Level</label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-100 ${
                        volumeLevel > 50 ? 'bg-green-500' : 
                        volumeLevel > 20 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(volumeLevel, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs w-8">{Math.round(volumeLevel)}</span>
                </div>
                <p className="text-xs text-gray-600">
                  {volumeLevel > 10 ? 'Audio detected' : 'No audio detected - check microphone'}
                </p>
              </div>
            )}
          </div>
        )}
        
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
