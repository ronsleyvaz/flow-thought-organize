
import { useRef } from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StateManagerProps {
  onExport: () => void;
  onImport: (file: File) => void;
  onClear: () => void;
  lastSaved?: string;
}

const StateManager = ({ onExport, onImport, onClear, lastSaved }: StateManagerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset the input so the same file can be selected again
      event.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>State Management</CardTitle>
        {lastSaved && (
          <p className="text-sm text-gray-500">
            Last saved: {new Date(lastSaved).toLocaleString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button onClick={onExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export State
          </Button>
          <Button onClick={handleImportClick} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import State
          </Button>
          <Button onClick={onClear} variant="outline" className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Data
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
        <p className="text-xs text-gray-500">
          Export saves all processed transcripts and extracted items. Import loads a previously saved state.
        </p>
      </CardContent>
    </Card>
  );
};

export default StateManager;
