import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { HistoryEntry } from '../types';

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const entries = await invoke<HistoryEntry[]>('get_history');
        setHistory(entries);
      } catch (e) {
        console.error('Failed to load history:', e);
        // Use localStorage as fallback
        const localHistory = localStorage.getItem('sx-whisper-history');
        if (localHistory) {
          try {
            setHistory(JSON.parse(localHistory));
          } catch {
            // ignore
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();

    // Listen for new transcriptions
    const unlisten = listen<string>('transcription_complete', async () => {
      try {
        const entries = await invoke<HistoryEntry[]>('get_history');
        setHistory(entries);
        localStorage.setItem('sx-whisper-history', JSON.stringify(entries));
      } catch (e) {
        console.error('Failed to refresh history:', e);
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      await invoke('clear_history');
      setHistory([]);
      localStorage.removeItem('sx-whisper-history');
    } catch (e) {
      console.error('Failed to clear history:', e);
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await invoke('copy_to_clipboard', { text });
    } catch (e) {
      console.error('Failed to copy:', e);
      // Fallback to browser API
      await navigator.clipboard.writeText(text);
    }
  }, []);

  return {
    history,
    isLoading,
    clearHistory,
    copyToClipboard,
  };
}
