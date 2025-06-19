
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BatchSelectionContextType {
  selectedItems: Set<string>;
  toggleItemSelection: (id: string) => void;
  selectAllItems: (itemIds: string[]) => void;
  clearSelection: () => void;
  isItemSelected: (id: string) => boolean;
  selectedCount: number;
}

const BatchSelectionContext = createContext<BatchSelectionContextType | undefined>(undefined);

export const useBatchSelection = () => {
  const context = useContext(BatchSelectionContext);
  if (!context) {
    throw new Error('useBatchSelection must be used within a BatchSelectionProvider');
  }
  return context;
};

interface BatchSelectionProviderProps {
  children: ReactNode;
}

export const BatchSelectionProvider = ({ children }: BatchSelectionProviderProps) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAllItems = (itemIds: string[]) => {
    setSelectedItems(new Set(itemIds));
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const isItemSelected = (id: string) => {
    return selectedItems.has(id);
  };

  const selectedCount = selectedItems.size;

  return (
    <BatchSelectionContext.Provider
      value={{
        selectedItems,
        toggleItemSelection,
        selectAllItems,
        clearSelection,
        isItemSelected,
        selectedCount,
      }}
    >
      {children}
    </BatchSelectionContext.Provider>
  );
};
