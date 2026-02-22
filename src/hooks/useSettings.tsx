'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { SettingsData, UsualSuspect } from '@/lib/types';
import { DEFAULT_USUAL_SUSPECTS } from '@/lib/constants';
import {
  normalizeSettingsData,
  loadSettingsData,
  saveSettingsData,
  openSettingsFileForImport,
  saveSettingsDataAs,
} from '@/lib/storage/settings-store';
import { useToast } from './useToast';

type SettingsPanel = 'hub' | 'profile' | 'suspects' | 'gameDefaults' | null;

interface SettingsContextValue {
  settings: SettingsData;
  settingsModalOpen: boolean;
  activePanel: SettingsPanel;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  setActivePanel: (panel: SettingsPanel) => void;
  updateProfile: (profile: SettingsData['profile']) => Promise<boolean>;
  updateUsualSuspects: (suspects: UsualSuspect[]) => Promise<boolean>;
  updateGameSettings: (gs: SettingsData['gameSettings']) => Promise<boolean>;
  importSettings: () => Promise<boolean>;
  exportSettings: () => Promise<boolean>;
  reload: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const defaultSettings: SettingsData = {
  profile: { name: '', revtag: '' },
  usualSuspects: DEFAULT_USUAL_SUSPECTS,
  gameSettings: { currency: 'EUR', defaultBuyIn: '30', settlementMode: 'banker' },
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<SettingsPanel>(null);
  const { showToast } = useToast();

  const loadAndSetSettings = useCallback(async () => {
    try {
      const raw = await loadSettingsData();
      setSettings(normalizeSettingsData(raw, DEFAULT_USUAL_SUSPECTS));
    } catch {
      setSettings(normalizeSettingsData(null, DEFAULT_USUAL_SUSPECTS));
    }
  }, []);

  useEffect(() => {
    loadAndSetSettings();
  }, [loadAndSetSettings]);

  const openSettingsModal = useCallback(() => {
    setActivePanel('hub');
    setSettingsModalOpen(true);
  }, []);

  const closeSettingsModal = useCallback(() => {
    setSettingsModalOpen(false);
    setActivePanel(null);
  }, []);

  const updateProfile = useCallback(
    async (profile: SettingsData['profile']): Promise<boolean> => {
      try {
        const updated = { ...settings, profile };
        await saveSettingsData(updated);
        setSettings(updated);
        showToast('Profile saved');
        return true;
      } catch {
        showToast('Unable to save profile');
        return false;
      }
    },
    [settings, showToast]
  );

  const updateUsualSuspects = useCallback(
    async (usualSuspects: UsualSuspect[]): Promise<boolean> => {
      try {
        const updated = { ...settings, usualSuspects };
        await saveSettingsData(updated);
        setSettings(updated);
        showToast('Usual suspects saved');
        return true;
      } catch {
        showToast('Unable to save usual suspects');
        return false;
      }
    },
    [settings, showToast]
  );

  const updateGameSettings = useCallback(
    async (gameSettings: SettingsData['gameSettings']): Promise<boolean> => {
      try {
        const updated = { ...settings, gameSettings };
        await saveSettingsData(updated);
        setSettings(updated);
        showToast('Game settings saved');
        return true;
      } catch {
        showToast('Unable to save game settings');
        return false;
      }
    },
    [settings, showToast]
  );

  const importSettingsFn = useCallback(async (): Promise<boolean> => {
    try {
      const raw = await openSettingsFileForImport();
      if (!raw) return false;
      const normalized = normalizeSettingsData(raw, DEFAULT_USUAL_SUSPECTS);
      await saveSettingsData(normalized);
      setSettings(normalized);
      showToast('Settings imported');
      return true;
    } catch {
      showToast('Unable to import settings');
      return false;
    }
  }, [showToast]);

  const exportSettingsFn = useCallback(async (): Promise<boolean> => {
    try {
      await saveSettingsDataAs(settings);
      showToast('Settings exported');
      return true;
    } catch (e) {
      const err = e as Error;
      if (err?.message === 'FilePickerUnavailable') {
        showToast('File picker not supported in this browser');
      } else {
        showToast('Unable to export settings');
      }
      return false;
    }
  }, [settings, showToast]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        settingsModalOpen,
        activePanel,
        openSettingsModal,
        closeSettingsModal,
        setActivePanel,
        updateProfile,
        updateUsualSuspects,
        updateGameSettings,
        importSettings: importSettingsFn,
        exportSettings: exportSettingsFn,
        reload: loadAndSetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
