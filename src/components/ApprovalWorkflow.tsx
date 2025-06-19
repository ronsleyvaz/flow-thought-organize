
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ExtractedItem } from '@/hooks/useUserAppState';
import { Check, X, AlertCircle, MessageSquare, Clock } from 'lucide-react';
import { useState } from 'react';

interface ApprovalWorkflowProps {
  item: ExtractedItem;
  onApprove: (id: string, feedback?: string) => void;
  onReject: (id: string, reason: string) => void;
  transcriptName: string;
}

const ApprovalWorkflow = ({ item, onApprove, onReject, transcriptName }: ApprovalWorkflowProps) => {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleApprove = () => {
    onApprove(item.id, feedback.trim() || undefined);
    setFeedback('');
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(item.id, rejectReason);
      setRejectReason('');
      setShowRejectForm(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 90) return <Check className="h-3 w-3" />;
    if (confidence >= 70) return <Clock className="h-3 w-3" />;
    return <AlertCircle className="h-3 w-3" />;
  };

  if (item.approved) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Check className="h-4 w-4" />
        <span>Approved</span>
      </div>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            Pending Approval
          </span>
          <Badge 
            variant="outline" 
            className={`text-xs ${getConfidenceColor(item.confidence)}`}
          >
            {getConfidenceIcon(item.confidence)}
            {item.confidence}% confidence
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground">
          Extracted from: {transcriptName}
        </div>

        {!showRejectForm && (
          <div className="space-y-3">
            <Textarea
              placeholder="Add feedback or corrections (optional)..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="text-sm"
              rows={2}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleApprove}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-3 w-3" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRejectForm(true)}
                className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="h-3 w-3" />
                Reject
              </Button>
            </div>
          </div>
        )}

        {showRejectForm && (
          <div className="space-y-3">
            <Textarea
              placeholder="Please provide a reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="text-sm border-red-200"
              rows={2}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="flex items-center gap-1 bg-red-600 hover:bg-red-700"
              >
                <X className="h-3 w-3" />
                Confirm Reject
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectReason('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApprovalWorkflow;
