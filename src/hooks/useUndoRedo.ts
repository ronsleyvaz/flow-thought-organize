
import { useState, useCallback } from 'react';

export interface UndoableAction {
  id: string;
  type: 'delete' | 'edit' | 'toggle' | 'clear';
  description: string;
  undo: () => void;
  timestamp: number;
}

export const useUndoRedo = () => {
  const [undoStack, setUndoStack] = useState<UndoableAction[]>([]);
  const [redoStack, setRedoStack] = useState<UndoableAction[]>([]);

  const addUndoAction = useCallback((action: Omit<UndoableAction, 'timestamp'>) => {
    const undoAction: UndoableAction = {
      ...action,
      timestamp: Date.now(),
    };
    
    setUndoStack(prev => [...prev.slice(-9), undoAction]); // Keep last 10 actions
    setRedoStack([]); // Clear redo stack when new action is added
  }, []);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return false;
    
    const lastAction = undoStack[undoStack.length - 1];
    lastAction.undo();
    
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [lastAction, ...prev.slice(0, 9)]);
    
    return true;
  }, [undoStack]);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;
  const lastAction = undoStack[undoStack.length - 1];

  return {
    addUndoAction,
    undo,
    canUndo,
    canRedo,
    lastAction,
    undoStack: undoStack.slice(-5), // Show last 5 for UI
  };
};
