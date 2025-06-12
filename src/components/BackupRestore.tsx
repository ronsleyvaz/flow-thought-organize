
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, Save, RotateCcw, Calendar } from 'lucide-react';
import { AppState } from '@/hooks/useUserAppState';

interface BackupRestoreProps {
  appState: AppState;
  onImport: (file: File) => void;
  onExport: () => void;
  onCreateBackup: () => void;
  autoBackups: Array<{
    id: string;
    name: string;
    timestamp: string;
    itemCount: number;
  }>;
  onRestoreBackup: (backupId: string) => void;
}

const BackupRestore = ({ 
  appState, 
  onImport, 
  onExport, 
  onCreateBackup,
  autoBackups,
  onRestoreBackup 
}: BackupRestoreProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const { toast } = useToast();

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json') {
        toast({
          title: "Invalid File Type",
          description: "Please select a JSON file.",
          variant: "destructive",
        });
        return;
      }
      
      onImport(file);
      event.target.value = '';
    }
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      onCreateBackup();
      toast({
        title: "Backup Created",
        description: "Your data has been backed up successfully.",
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const totalItems = appState.extractedItems.length;
  const approvedItems = appState.extractedItems.filter(item => item.approved).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Save className="h-5 w-5 mr-2" />
          Backup & Restore
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant="outline">
            {totalItems} total items
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {approvedItems} approved
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Manual Actions */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Manual Actions</p>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleCreateBackup} 
              variant="outline" 
              size="sm"
              disabled={isCreatingBackup}
            >
              <Save className="h-4 w-4 mr-2" />
              Create Backup
            </Button>
            <Button onClick={onExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button onClick={handleImportClick} variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
          </div>
        </div>

        {/* Auto Backups */}
        {autoBackups.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Recent Auto-Backups</p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {autoBackups.slice(0, 5).map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium">{backup.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(backup.timestamp).toLocaleString()} • {backup.itemCount} items
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => onRestoreBackup(backup.id)}
                    variant="ghost" 
                    size="sm"
                    className="h-6 px-2"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <p className="text-xs text-muted-foreground">
          Backups include all transcripts, extracted items, and settings. Auto-backups are created before major changes.
        </p>
      </CardContent>
    </Card>
  );
};

export default BackupRestore;
