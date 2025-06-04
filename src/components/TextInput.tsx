
import { useState } from 'react';
import { FileText, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface TextInputProps {
  onTextProcessed: (text: string, fileName: string) => void;
}

const TextInput = ({ onTextProcessed }: TextInputProps) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = () => {
    if (inputText.trim()) {
      setIsProcessing(true);
      const fileName = `thoughts-${Date.now()}`;
      onTextProcessed(inputText, fileName);
      setInputText('');
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Direct Input
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter your thoughts, meeting notes, or ideas here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="min-h-[120px]"
        />
        
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-xs">
            Type your thoughts directly for instant processing
          </Badge>
          <Button 
            onClick={handleProcess} 
            disabled={!inputText.trim() || isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Process Text'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TextInput;
