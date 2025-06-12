
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { AppState, AutoBackup } from '@/types/appState';

const getInitialState = (): AppState => ({
  transcriptMetadata: [],
  extractedItems: [],
  autoSave: true,
});

export const useAppStorage = () => {
  const { user, isLoaded } = useUser();
  const [appState, setAppState] = useState<AppState>(getInitialState());

  // Get user-specific storage keys
  const getStorageKey = () => user ? `transcriptflow-${user.id}` : null;
  const getAutoSaveKey = () => user ? `transcriptflow-autosave-${user.id}` : null;

  // Load user's state when user is loaded
  useEffect(() => {
    if (isLoaded && user) {
      const storageKey = getStorageKey();
      const autoSaveKey = getAutoSaveKey();
      
      if (storageKey) {
        const savedState = localStorage.getItem(storageKey);
        const savedAutoSave = localStorage.getItem(autoSaveKey);
        
        if (savedState) {
          try {
            const parsedState = JSON.parse(savedState);
            setAppState({
              ...parsedState,
              autoSave: savedAutoSave ? JSON.parse(savedAutoSave) : true,
            });
          } catch (error) {
            console.error('Error loading saved state:', error);
            setAppState(getInitialState());
          }
        } else {
          setAppState(getInitialState());
        }
      }
    } else if (isLoaded && !user) {
      // User is not logged in, reset to initial state
      setAppState(getInitialState());
    }
  }, [isLoaded, user]);

  // Auto-save functionality
  useEffect(() => {
    if (isLoaded && user && appState.autoSave) {
      const storageKey = getStorageKey();
      if (storageKey) {
        const stateToSave = {
          ...appState,
          lastSaved: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(stateToSave));
      }
    }
  }, [appState, isLoaded, user]);

  const updateAutoSave = (enabled: boolean) => {
    const autoSaveKey = getAutoSaveKey();
    if (autoSaveKey) {
      localStorage.setItem(autoSaveKey, JSON.stringify(enabled));
    }
    setAppState(prev => ({ ...prev, autoSave: enabled }));
  };

  return {
    appState,
    setAppState,
    updateAutoSave,
    isLoaded,
    user,
    getInitialState,
  };
};
