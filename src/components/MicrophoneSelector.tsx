
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface MicrophoneSelectorProps {
  availableDevices: MediaDeviceInfo[];
  selectedDeviceId: string;
  onDeviceChange: (deviceId: string) => void;
  disabled?: boolean;
}

const MicrophoneSelector = ({ 
  availableDevices, 
  selectedDeviceId, 
  onDeviceChange,
  disabled 
}: MicrophoneSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Microphone Device</Label>
      <Select 
        value={selectedDeviceId} 
        onValueChange={onDeviceChange}
        disabled={disabled}
      >
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
  );
};

export default MicrophoneSelector;
