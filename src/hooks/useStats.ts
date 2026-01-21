import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { AppStats } from '../types';

export function useStats() {
    const [stats, setStats] = useState<AppStats>({
        wordsTranscribed: 0,
        usageTimeSeconds: 0,
        sessionsCount: 0,
    });

    const loadStats = async () => {
        try {
            const currentStats = await invoke<AppStats>('get_stats');
            setStats(currentStats);
        } catch (e) {
            console.error('Failed to load stats:', e);
        }
    };

    useEffect(() => {
        loadStats();

        const unlisten = listen('transcription_complete', () => {
            loadStats();
        });

        return () => {
            unlisten.then(fn => fn());
        };
    }, []);

    return stats;
}
