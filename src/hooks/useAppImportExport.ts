
import { AppState } from '@/types/appState';

export const useAppImportExport = (appState: AppState, setAppState: (state: AppState) => void) => {
  const exportState = () => {
    const stateToExport = {
      ...appState,
      lastSaved: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(stateToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `transcriptflow-state-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importState = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedState = JSON.parse(e.target?.result as string);
        setAppState(importedState);
        console.log('State imported successfully');
      } catch (error) {
        console.error('Error importing state:', error);
      }
    };
    reader.readAsText(file);
  };

  return {
    exportState,
    importState,
  };
};
