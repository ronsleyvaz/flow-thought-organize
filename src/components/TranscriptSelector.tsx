
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText, Loader2 } from 'lucide-react';

interface Transcript {
  id: string;
  title: string;
  transcript_url: string;
  summary: {
    overview: string;
    action_items: string[];
    keywords: string[];
  };
  date: string;
  duration: number;
}

interface TranscriptSelectorProps {
  transcripts: Transcript[];
  onTranscriptsSelected: (selectedTranscripts: Transcript[]) => void;
  onBack: () => void;
  isProcessing: boolean;
}

const TranscriptSelector = ({ transcripts, onTranscriptsSelected, onBack, isProcessing }: TranscriptSelectorProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleTranscriptToggle = (transcriptId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(transcriptId)) {
      newSelected.delete(transcriptId);
    } else {
      newSelected.add(transcriptId);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === transcripts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(transcripts.map(t => t.id)));
    }
  };

  const handleProcess = () => {
    const selectedTranscripts = transcripts.filter(t => selectedIds.has(t.id));
    onTranscriptsSelected(selectedTranscripts);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Select Transcripts to Process</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {selectedIds.size === transcripts.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Button variant="outline" size="sm" onClick={onBack}>
              Back
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {transcripts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recent transcripts found</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transcripts.map((transcript) => (
                <div
                  key={transcript.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedIds.has(transcript.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleTranscriptToggle(transcript.id)}
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={selectedIds.has(transcript.id)}
                      onChange={() => handleTranscriptToggle(transcript.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{transcript.title}</h4>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(transcript.date)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDuration(transcript.duration)}
                        </div>
                      </div>
                      {transcript.summary?.overview && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {transcript.summary.overview}
                        </p>
                      )}
                      {transcript.summary?.keywords && transcript.summary.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {transcript.summary.keywords.slice(0, 3).map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {transcript.summary.keywords.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{transcript.summary.keywords.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                {selectedIds.size} of {transcripts.length} transcripts selected
              </p>
              <Button 
                onClick={handleProcess} 
                disabled={selectedIds.size === 0 || isProcessing}
                className="min-w-32"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Process ${selectedIds.size} Transcript${selectedIds.size !== 1 ? 's' : ''}`
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TranscriptSelector;
