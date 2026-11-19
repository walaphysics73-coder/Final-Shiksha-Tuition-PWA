'use client';

import { useState, useEffect } from 'react';

export interface TuitionSettings {
  tuitionName: string;
  teacherName: string;
  upiId: string;
  pin: string;
}

export const DEFAULT_PIN = '1234';

const DEFAULT_SETTINGS: TuitionSettings = {
  tuitionName: 'Shiksha Tuition',
  teacherName: '',
  upiId: '',
  pin: DEFAULT_PIN,
};

export function useAppSettings() {
  const [settings, setSettings] = useState<TuitionSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const syncFromStorage = () => {
    try {
      const raw = localStorage.getItem('tuition_app_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
          pin: parsed.pin && parsed.pin.length === 4 ? parsed.pin : DEFAULT_PIN,
        });
      }
      const sessionUnlocked = sessionStorage.getItem('tuition_app_unlocked');
      setIsUnlocked(sessionUnlocked === 'true');
    } catch (e) {
      console.error(e);
    }
    setIsLoaded(true);
  };

  useEffect(() => {
    syncFromStorage();
    window.addEventListener('tuition-settings-updated', syncFromStorage);
    window.addEventListener('tuition-auth-changed', syncFromStorage);
    return () => {
      window.removeEventListener('tuition-settings-updated', syncFromStorage);
      window.removeEventListener('tuition-auth-changed', syncFromStorage);
    };
  }, []);

  const saveSettings = (updated: TuitionSettings) => {
    setSettings(updated);
    localStorage.setItem('tuition_app_settings', JSON.stringify(updated));
    window.dispatchEvent(new Event('tuition-settings-updated'));
  };

  const unlockApp = () => {
    setIsUnlocked(true);
    sessionStorage.setItem('tuition_app_unlocked', 'true');
    window.dispatchEvent(new Event('tuition-auth-changed'));
  };

  const lockApp = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('tuition_app_unlocked');
    window.dispatchEvent(new Event('tuition-auth-changed'));
  };

  return {
    settings,
    saveSettings,
    isLoaded,
    isUnlocked,
    unlockApp,
    lockApp,
  };
}