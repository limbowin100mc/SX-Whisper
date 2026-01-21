import {
  Stack,
  Text,
  Group,
  ActionIcon,
  Button,
  ScrollArea,
  Center,
  Paper,
  Badge,
  Tooltip,
  Box,
} from '@mantine/core';
import { IconCopy, IconTrash, IconHistory, IconCheck, IconDownload } from '@tabler/icons-react';
import { HistoryEntry, AppConfig, ACCENT_COLORS } from '../types';
import { useState } from 'react';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { notifications } from '@mantine/notifications';
import '../styles/glass-effects.css';

interface HistoryPanelProps {
  entries: HistoryEntry[];
  onCopy: (text: string) => void;
  onClear: () => void;
  config: AppConfig;
}

export function HistoryPanel({ entries, onCopy, onClear, config }: HistoryPanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const currentAccent = ACCENT_COLORS.find(c => c.value === config.accentColor) || ACCENT_COLORS[0];

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleCopy = (entry: HistoryEntry) => {
    onCopy(entry.text);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = async () => {
    try {
      const textContent = entries
        .map(e => `[${new Date(e.timestamp).toLocaleString()}] ${e.text}`)
        .join('\n\n');

      const fileName = `sx-whisper_history_${new Date().toISOString().slice(0, 10)}.txt`;

      const filePath = await save({
        defaultPath: fileName,
        filters: [{
          name: 'Text Files',
          extensions: ['txt']
        }]
      });

      if (filePath) {
        await writeTextFile(filePath, textContent);

        notifications.show({
          title: 'Download Complete',
          message: `History saved to ${filePath}`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      }
    } catch (e) {
      console.error('Failed to save file:', e);
      notifications.show({
        title: 'Download Failed',
        message: 'Could not save the history file.',
        color: 'red',
      });
    }
  };

  if (entries.length === 0) {
    return (
      <Paper 
        p="xl" 
        radius="lg" 
        style={{
          background: '#151515',
          border: '1px solid #222',
        }}
      >
        <Center py="xl">
          <Stack align="center" gap="lg">
            <Box
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                background: '#1a1a1a',
                border: '1px solid #333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconHistory size={40} color="#666" />
            </Box>
            <div style={{ textAlign: 'center' }}>
              <Text fw={600} size="lg" style={{ color: '#fff' }}>No transcriptions yet</Text>
              <Text size="sm" c="dimmed" mt={4}>
                Your transcription history will appear here
              </Text>
            </div>
            <Badge
              size="lg"
              radius="xl"
              style={{
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#22c55e',
              }}
            >
              Press your hotkey to start
            </Badge>
          </Stack>
        </Center>
      </Paper>
    );
  }

  return (
    <Stack gap="lg">
      <Paper 
        p="lg" 
        radius="lg" 
        style={{
          background: '#151515',
          border: '1px solid #222',
        }}
      >
        <Group justify="space-between" align="center">
          <Group gap="md">
            <Box
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `linear-gradient(135deg, var(--mantine-color-${currentAccent.gradient.from}-filled), var(--mantine-color-${currentAccent.gradient.to}-filled))`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconHistory size={20} color="white" />
            </Box>
            <div>
              <Text fw={600} size="lg" style={{ color: '#fff' }}>Transcription History</Text>
              <Text size="sm" c="dimmed">
                {entries.length} item{entries.length !== 1 ? 's' : ''} saved
              </Text>
            </div>
          </Group>
          <Group gap="xs">
            <Button
              variant="light"
              color={config.accentColor}
              size="sm"
              leftSection={<IconDownload size={16} />}
              onClick={handleDownload}
              radius="lg"
              className="glass-button-primary"
            >
              Download
            </Button>
            <Button
              variant="subtle"
              color="red"
              size="sm"
              leftSection={<IconTrash size={16} />}
              onClick={onClear}
              radius="lg"
              className="glass-button-danger"
            >
              Clear All
            </Button>
          </Group>
        </Group>
      </Paper>

      <ScrollArea h={400} offsetScrollbars>
        <Stack gap="md">
          {entries.map((entry, index) => (
            <Paper
              key={entry.id}
              p="lg"
              radius="lg"
              style={{
                background: '#151515',
                border: '1px solid #222',
                borderLeft: index === 0
                  ? `4px solid var(--mantine-color-${config.accentColor}-filled)`
                  : '1px solid #222',
                transition: 'all 0.2s ease',
              }}
              className="sx-card-hover"
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" style={{ wordBreak: 'break-word', lineHeight: 1.6, color: '#fff' }}>
                    {entry.text}
                  </Text>
                  <Group gap="xs" mt="md">
                    <Badge 
                      variant="light" 
                      size="sm" 
                      radius="xl"
                      style={{
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        color: '#a0a0a0',
                      }}
                    >
                      {formatTime(entry.timestamp)}
                    </Badge>
                    {index === 0 && (
                      <Badge
                        size="sm"
                        radius="xl"
                        style={{
                          background: 'rgba(34, 197, 94, 0.15)',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          color: '#22c55e',
                        }}
                      >
                        Latest
                      </Badge>
                    )}
                  </Group>
                </div>
                <Tooltip
                  label={copiedId === entry.id ? 'Copied!' : 'Copy to clipboard'}
                  position="left"
                >
                  <ActionIcon
                    variant="light"
                    color={copiedId === entry.id ? config.accentColor : 'gray'}
                    onClick={() => handleCopy(entry)}
                    radius="lg"
                    size="xl"
                    style={{
                      background: copiedId === entry.id 
                        ? 'rgba(34, 197, 94, 0.15)' 
                        : '#1a1a1a',
                      border: copiedId === entry.id 
                        ? '1px solid rgba(34, 197, 94, 0.3)' 
                        : '1px solid #333',
                    }}
                  >
                    {copiedId === entry.id ? <IconCheck size={18} /> : <IconCopy size={18} />}
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Paper>
          ))}
        </Stack>
      </ScrollArea>
    </Stack>
  );
}
