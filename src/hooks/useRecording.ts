import { useState, useEffect, useCallback } from 'react';
import { listen } from '@tauri-apps/api/event';

export function useRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [lastTranscription, setLastTranscription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unlistenRecording = listen<boolean>('recording_state', (event) => {
      setIsRecording(event.payload);
    });

    const unlistenTranscription = listen<string>('transcription_complete', (event) => {
      setLastTranscription(event.payload);
      setError(null);
    });

    const unlistenError = listen<string>('error', (event) => {
      setError(event.payload);
      setIsRecording(false);
    });

    return () => {
      unlistenRecording.then((fn) => fn());
      unlistenTranscription.then((fn) => fn());
      unlistenError.then((fn) => fn());
    };
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const clearLastTranscription = useCallback(() => setLastTranscription(null), []);

  return {
    isRecording,
    lastTranscription,
    error,
    clearError,
    clearLastTranscription,
  };
}
