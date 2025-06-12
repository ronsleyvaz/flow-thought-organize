
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

export interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  error?: string;
}

interface ProcessingProgressProps {
  steps: ProcessingStep[];
  currentStep?: string;
  overallProgress: number;
  isProcessing: boolean;
}

const ProcessingProgress = ({ 
  steps, 
  currentStep, 
  overallProgress, 
  isProcessing 
}: ProcessingProgressProps) => {
  const getStepIcon = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepBadge = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Done</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Error</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Processing Progress
          </CardTitle>
          {isProcessing && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          )}
        </div>
        <Progress value={overallProgress} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {Math.round(overallProgress)}% complete
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStepIcon(step)}
              <span className="text-sm">{step.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              {step.progress !== undefined && step.status === 'processing' && (
                <span className="text-xs text-muted-foreground">
                  {step.progress}%
                </span>
              )}
              {getStepBadge(step)}
            </div>
          </div>
        ))}
        
        {steps.some(step => step.status === 'error') && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-800 font-medium">Processing Errors:</p>
            {steps
              .filter(step => step.status === 'error')
              .map(step => (
                <p key={step.id} className="text-xs text-red-700 mt-1">
                  {step.name}: {step.error}
                </p>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProcessingProgress;
