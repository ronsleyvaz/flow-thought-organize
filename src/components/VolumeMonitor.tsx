
import React from 'react';
import { Label } from '@/components/ui/label';

interface VolumeMonitorProps {
  volumeLevel: number;
  isRecording: boolean;
}

const VolumeMonitor = ({ volumeLevel, isRecording }: VolumeMonitorProps) => {
  if (!isRecording) return null;

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Input Level</Label>
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
  );
};

export default VolumeMonitor;
