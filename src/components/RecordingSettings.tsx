
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import MicrophoneSelector from './MicrophoneSelector';
import VolumeMonitor from './VolumeMonitor';

interface RecordingSettingsProps {
  isOpen: boolean;
  onToggle: () => void;
  availableDevices: MediaDeviceInfo[];
  selectedDeviceId: string;
  onDeviceChange: (deviceId: string) => void;
  volumeLevel: number;
  isRecording: boolean;
  disabled?: boolean;
}

const RecordingSettings = ({
  isOpen,
  onToggle,
  availableDevices,
  selectedDeviceId,
  onDeviceChange,
  volumeLevel,
  isRecording,
  disabled
}: RecordingSettingsProps) => {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-between">
          <div className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Recording Settings
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg mt-2">
          <MicrophoneSelector
            availableDevices={availableDevices}
            selectedDeviceId={selectedDeviceId}
            onDeviceChange={onDeviceChange}
            disabled={disabled}
          />
          <VolumeMonitor volumeLevel={volumeLevel} isRecording={isRecording} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default RecordingSettings;
