
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { AppState, AutoBackup } from '@/types/appState';

export const useAppBackups = (appState: AppState, setAppState: (state: AppState) => void) => {
  const { user } = useUser();
  const [autoBackups, setAutoBackups] = useState<AutoBackup[]>([]);

  // Load existing backups on mount
  useEffect(() => {
    if (user) {
      const savedBackups = localStorage.getItem(`transcriptflow-backups-${user.id}`);
      if (savedBackups) {
        try {
          setAutoBackups(JSON.parse(savedBackups));
        } catch (error) {
          console.error('Error loading backups:', error);
        }
      }
    }
  }, [user]);

  const createAutoBackup = (description: string) => {
    if (!user) return;
    
    const backup: AutoBackup = {
      id: Date.now().toString(),
      name: `Auto-backup: ${description}`,
      timestamp: new Date().toISOString(),
      itemCount: appState.extractedItems.length,
      data: { ...appState }
    };
    
    setAutoBackups(prev => {
      const newBackups = [backup, ...prev.slice(0, 9)]; // Keep last 10 backups
      localStorage.setItem(`transcriptflow-backups-${user.id}`, JSON.stringify(newBackups));
      return newBackups;
    });
  };

  const restoreFromBackup = (backupId: string) => {
    const backup = autoBackups.find(b => b.id === backupId);
    if (backup) {
      setAppState(backup.data);
    }
  };

  return {
    autoBackups,
    createAutoBackup,
    restoreFromBackup,
  };
};
