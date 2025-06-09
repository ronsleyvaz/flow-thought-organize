
import { Mic, Upload, FileText, Settings, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserButton } from '@clerk/clerk-react';

interface HeaderProps {
  onViewChange: (view: string) => void;
  activeView: string;
}

const Header = ({ onViewChange, activeView }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/c64237fb-d234-47ca-9a82-3543c414319b.png" 
              alt="Amplify AI Logo" 
              className="w-8 h-8"
            />
            <div>
              <h1 className="text-xl font-bold text-jet-black font-bebas tracking-wider">TRANSCRIPTFLOW</h1>
              <p className="text-xs text-lead -mt-1">by Amplify AI</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant={activeView === 'dashboard' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => onViewChange('dashboard')}
            className="bg-crimson hover:bg-crimson-600 text-white border-crimson"
          >
            <Mic className="h-4 w-4 mr-2" />
            Live Recording
          </Button>
          <Button 
            variant={activeView === 'upload' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => onViewChange('upload')}
            className="bg-crimson hover:bg-crimson-600 text-white border-crimson"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <Button 
            variant={activeView === 'how-to-use' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => onViewChange('how-to-use')}
            className="bg-crimson hover:bg-crimson-600 text-white border-crimson"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            How to Use
          </Button>
          <Button 
            variant={activeView === 'settings' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => onViewChange('settings')}
            className="bg-lead hover:bg-lead/80 text-white border-lead"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
};

export default Header;
