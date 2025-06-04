
import { Mic, Upload, FileText, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onViewChange: (view: string) => void;
  activeView: string;
}

const Header = ({ onViewChange, activeView }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">TranscriptFlow</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant={activeView === 'dashboard' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => onViewChange('dashboard')}
          >
            <Mic className="h-4 w-4 mr-2" />
            Live Recording
          </Button>
          <Button 
            variant={activeView === 'upload' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => onViewChange('upload')}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <Button 
            variant={activeView === 'settings' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => onViewChange('settings')}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
