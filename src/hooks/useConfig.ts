import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { AppConfig, DEFAULT_CONFIG } from '../types';

export function useConfig() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load config on mount - prioritize localStorage and sync to Rust backend
  useEffect(() => {
    const loadConfig = async () => {
      try {
        // First, try to load from localStorage (this persists across app restarts)
        const localConfig = localStorage.getItem('sx-whisper-config');
        let loadedConfig = DEFAULT_CONFIG;
        
        if (localConfig) {
          try {
            loadedConfig = { ...DEFAULT_CONFIG, ...JSON.parse(localConfig) };
          } catch {
            // ignore parse errors
          }
        }
        
        setConfig(loadedConfig);
        
        // Sync the loaded config to Rust backend
        await invoke('set_config', { config: loadedConfig });
      } catch (e) {
        console.error('Failed to load/sync config:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  const updateConfig = useCallback(async (newConfig: AppConfig) => {
    setConfig(newConfig);
    try {
      await invoke('set_config', { config: newConfig });
      localStorage.setItem('sx-whisper-config', JSON.stringify(newConfig));
    } catch (e) {
      console.error('Failed to save config:', e);
      setError('Failed to save configuration');
    }
  }, []);

  const registerHotkey = useCallback(async (hotkey: string) => {
    try {
      await invoke('register_hotkey', { hotkey });
      setError(null);
    } catch (e) {
      console.error('Failed to register hotkey:', e);
      setError(`Failed to register hotkey: ${e}`);
    }
  }, []);

  return {
    config,
    setConfig: updateConfig,
    registerHotkey,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
