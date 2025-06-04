
import { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FileUploaderProps {
  onFileProcessed: (text: string, fileName: string) => void;
}

const FileUploader = ({ onFileProcessed }: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessed, setLastProcessed] = useState<string | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
      event.target.value = '';
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      let text = '';
      
      if (file.type === 'text/plain') {
        // Read text file
        text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });
      } else if (file.type.startsWith('audio/')) {
        // For audio files, we'd normally send to a transcription service
        // For now, we'll simulate with mock transcription
        text = `Audio transcription from ${file.name}: This is a sample transcription of the uploaded audio file. 
        I need to review the quarterly budget with the finance team by next Wednesday. 
        Schedule a client demo for Acme Corp next Friday at 2 PM. 
        New project idea: implement automated reporting dashboard.
        Contact: Sarah Johnson from Marketing, sarah@company.com.`;
      }
      
      onFileProcessed(text, file.name);
      setLastProcessed(file.name);
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && (file.type.startsWith('audio/') || file.type === 'text/plain')) {
      processFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Upload Transcript
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleUploadClick}
        >
          {isProcessing ? (
            <div className="space-y-2">
              <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto"></div>
              <p className="text-sm text-gray-600">Processing transcript...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <FileText className="h-8 w-8 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-600">
                Drop files here or click to upload
              </p>
              <p className="text-xs text-gray-500">
                Supports: MP3, WAV, M4A, TXT files
              </p>
            </div>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav,.m4a,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {lastProcessed && (
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Processed: {lastProcessed}</span>
          </div>
        )}
        
        <div className="flex space-x-2">
          <Button onClick={handleUploadClick} variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Browse Files
          </Button>
          <Badge variant="outline" className="text-xs">
            Auto-extracts tasks, events, ideas & contacts
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploader;
