
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useBatchSelection } from '@/contexts/BatchSelectionContext';
import { ExtractedItem } from '@/hooks/useUserAppState';
import { Check, X, Trash2, CheckSquare, Square } from 'lucide-react';
import { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';

interface BatchOperationsToolbarProps {
  items: ExtractedItem[];
  onBatchApprove: (ids: string[]) => void;
  onBatchReject: (ids: string[]) => void;
  onBatchDelete: (ids: string[]) => void;
  onBatchComplete: (ids: string[]) => void;
}

const BatchOperationsToolbar = ({
  items,
  onBatchApprove,
  onBatchReject,
  onBatchDelete,
  onBatchComplete,
}: BatchOperationsToolbarProps) => {
  const { selectedItems, clearSelection, selectedCount, selectAllItems } = useBatchSelection();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (selectedCount === 0) return null;

  const selectedItemsArray = Array.from(selectedItems);
  const selectedItemObjects = items.filter(item => selectedItems.has(item.id));
  
  const pendingItems = selectedItemObjects.filter(item => !item.approved);
  const approvedItems = selectedItemObjects.filter(item => item.approved && !item.completed);

  const handleSelectAll = () => {
    const visibleItemIds = items.map(item => item.id);
    selectAllItems(visibleItemIds);
  };

  const handleBatchApprove = () => {
    onBatchApprove(selectedItemsArray);
    clearSelection();
  };

  const handleBatchReject = () => {
    onBatchReject(selectedItemsArray);
    clearSelection();
  };

  const handleBatchComplete = () => {
    onBatchComplete(selectedItemsArray);
    clearSelection();
  };

  const handleBatchDelete = () => {
    onBatchDelete(selectedItemsArray);
    clearSelection();
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Card className="mb-4 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-blue-100 text-blue-700">
                {selectedCount} selected
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex items-center gap-1"
              >
                <CheckSquare className="h-4 w-4" />
                Select All ({items.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                className="flex items-center gap-1"
              >
                <Square className="h-4 w-4" />
                Clear Selection
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {pendingItems.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBatchApprove}
                    className="flex items-center gap-1 text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <Check className="h-4 w-4" />
                    Approve ({pendingItems.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBatchReject}
                    className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                    Reject ({pendingItems.length})
                  </Button>
                </>
              )}

              {approvedItems.length > 0 && (
                <>
                  <Separator orientation="vertical" className="h-6" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBatchComplete}
                    className="flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <CheckSquare className="h-4 w-4" />
                    Complete ({approvedItems.length})
                  </Button>
                </>
              )}

              <Separator orientation="vertical" className="h-6" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete ({selectedCount})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Selected Items"
        description={`Are you sure you want to delete ${selectedCount} selected items? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleBatchDelete}
        variant="destructive"
      />
    </>
  );
};

export default BatchOperationsToolbar;
