
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Undo2, RotateCcw, Clock } from 'lucide-react';
import { UndoableAction } from '@/hooks/useUndoRedo';

interface UndoRedoPanelProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  lastAction?: UndoableAction;
  recentActions: UndoableAction[];
}

const UndoRedoPanel = ({ 
  canUndo, 
  canRedo, 
  onUndo, 
  lastAction, 
  recentActions 
}: UndoRedoPanelProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center">
          <RotateCcw className="h-4 w-4 mr-2" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button 
            onClick={onUndo} 
            disabled={!canUndo}
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <Undo2 className="h-3 w-3" />
            Undo
          </Button>
          {lastAction && (
            <Badge variant="secondary" className="text-xs">
              {lastAction.description}
            </Badge>
          )}
        </div>
        
        {recentActions.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground mb-2">Recent Actions:</p>
            {recentActions.slice(0, 3).map((action) => (
              <div key={action.id} className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {action.description} ({new Date(action.timestamp).toLocaleTimeString()})
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UndoRedoPanel;
