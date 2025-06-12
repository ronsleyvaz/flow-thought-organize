
import { useAppStorage } from './useAppStorage';
import { useAppBackups } from './useAppBackups';
import { useAppImportExport } from './useAppImportExport';
import { useItemManagement } from './useItemManagement';

export * from '@/types/appState';

export const useUserAppState = () => {
  const {
    appState,
    setAppState,
    updateAutoSave,
    isLoaded,
    user,
    getInitialState,
  } = useAppStorage();

  const {
    autoBackups,
    createAutoBackup,
    restoreFromBackup,
  } = useAppBackups(appState, setAppState);

  const {
    exportState,
    importState,
  } = useAppImportExport(appState, setAppState);

  const {
    addProcessedTranscript,
    addExtractedItems,
    toggleItemApproval,
    toggleItemCompletion,
    editExtractedItem,
    deleteExtractedItem,
    clearAllData,
  } = useItemManagement(appState, setAppState, createAutoBackup, getInitialState);

  return {
    appState,
    exportState,
    importState,
    addProcessedTranscript,
    addExtractedItems,
    toggleItemApproval,
    toggleItemCompletion,
    editExtractedItem,
    deleteExtractedItem,
    clearAllData,
    updateAutoSave,
    createAutoBackup,
    restoreFromBackup,
    autoBackups,
    isLoaded,
    user,
  };
};
