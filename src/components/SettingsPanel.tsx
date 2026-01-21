import { useState } from 'react';
import {
  Stack,
  Text,
  Paper,
  Group,
  PasswordInput,
  Badge,
  Box,
  Select,
  TextInput,
  Button,
  ActionIcon,
  Table,
  Switch,
  Tooltip,
  ScrollArea,
  SimpleGrid,
  UnstyledButton,
  Collapse,
  Divider,
} from '@mantine/core';
import {
  IconKey,
  IconKeyboard,
  IconExternalLink,
  IconLanguage,
  IconTextSize,
  IconReplace,
  IconPlus,
  IconTrash,
  IconEdit,
  IconCheck,
  IconX,
  IconSearch,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';
import { HotkeyInput } from './HotkeyInput';
import { AppConfig, SUPPORTED_LANGUAGES, LANGUAGE_GROUPS, TEXT_FORMATS, WordReplacement } from '../types';

interface SettingsPanelProps {
  config: AppConfig;
  onConfigChange: (config: AppConfig) => void;
  onHotkeyCapture?: (capturing: boolean) => void;
}

export function SettingsPanel({ config, onConfigChange, onHotkeyCapture }: SettingsPanelProps) {
  const [newTrigger, setNewTrigger] = useState('');
  const [newReplacement, setNewReplacement] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTrigger, setEditTrigger] = useState('');
  const [editReplacement, setEditReplacement] = useState('');
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');

  const updateConfig = <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
    const newConfig = { ...config, [key]: value };
    onConfigChange(newConfig);
  };

  const addReplacement = () => {
    if (!newTrigger.trim() || !newReplacement.trim()) return;
    
    const replacement: WordReplacement = {
      id: crypto.randomUUID(),
      trigger: newTrigger.trim(),
      replacement: newReplacement.trim(),
      enabled: true,
    };
    
    updateConfig('wordReplacements', [...config.wordReplacements, replacement]);
    setNewTrigger('');
    setNewReplacement('');
  };

  const deleteReplacement = (id: string) => {
    updateConfig('wordReplacements', config.wordReplacements.filter(r => r.id !== id));
  };

  const toggleReplacement = (id: string) => {
    updateConfig('wordReplacements', config.wordReplacements.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const startEditing = (r: WordReplacement) => {
    setEditingId(r.id);
    setEditTrigger(r.trigger);
    setEditReplacement(r.replacement);
  };

  const saveEdit = () => {
    if (!editTrigger.trim() || !editReplacement.trim() || !editingId) return;
    
    updateConfig('wordReplacements', config.wordReplacements.map(r => 
      r.id === editingId ? { ...r, trigger: editTrigger.trim(), replacement: editReplacement.trim() } : r
    ));
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const currentLanguage = SUPPORTED_LANGUAGES.find(l => l.code === config.language) || SUPPORTED_LANGUAGES[0];

  const formatOptions = TEXT_FORMATS.map(fmt => ({
    value: fmt.value,
    label: fmt.label,
  }));

  // Filter languages based on search
  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(languageSearch.toLowerCase())
  );

  // Get popular languages for quick selection
  const popularLanguages = SUPPORTED_LANGUAGES.filter(l => 
    LANGUAGE_GROUPS.popular.includes(l.code)
  );

  const selectLanguage = (code: string) => {
    updateConfig('language', code);
    setLanguageSearch('');
  };

  return (
    <Stack gap="xl">
      {/* Hotkey Section */}
      <Paper 
        p="xl" 
        radius="lg" 
        style={{
          background: '#151515',
          border: '1px solid #222',
        }}
      >
        <Stack gap="lg">
          <Group gap="sm">
            <Box
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #111 0%, #151515 100%)',
                border: '1px solid #222',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconKeyboard size={20} color="#22c55e" />
            </Box>
            <div>
              <Text fw={600} size="lg" style={{ color: '#fff' }}>Hotkey Configuration</Text>
              <Text size="sm" c="dimmed">Set your push-to-talk shortcut</Text>
            </div>
          </Group>
          <HotkeyInput
            value={config.hotkey}
            onChange={(hotkey) => updateConfig('hotkey', hotkey)}
            label="Push-to-Talk Hotkey"
            description="Hold this key combination to record your voice"
            onCaptureStart={() => onHotkeyCapture?.(true)}
            onCaptureEnd={() => onHotkeyCapture?.(false)}
          />
        </Stack>
      </Paper>

      {/* Language Section - Redesigned */}
      <Paper 
        p="xl" 
        radius="lg" 
        style={{
          background: '#151515',
          border: '1px solid #222',
        }}
      >
        <Stack gap="lg">
          <Group gap="sm">
            <Box
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #111 0%, #151515 100%)',
                border: '1px solid #222',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconLanguage size={20} color="#22c55e" />
            </Box>
            <div>
              <Text fw={600} size="lg" style={{ color: '#fff' }}>Language</Text>
              <Text size="sm" c="dimmed">Choose transcription language</Text>
            </div>
          </Group>

          {/* Current Language Display */}
          <Paper
            p="lg"
            radius="lg"
            style={{
              background: '#111',
              border: '1px solid #333',
            }}
          >
            <Group justify="space-between">
              <Group gap="md">
                <Text size="2rem">{currentLanguage.flag}</Text>
                <div>
                  <Text fw={600} style={{ color: '#fff' }}>{currentLanguage.name}</Text>
                  <Text size="xs" c="dimmed">
                    {currentLanguage.code === 'auto' 
                      ? 'Automatically detects your language' 
                      : 'Currently selected language'}
                  </Text>
                </div>
              </Group>
              <Badge 
                size="lg" 
                radius="xl"
                style={{
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  color: '#22c55e',
                }}
              >
                {currentLanguage.code === 'auto' ? 'Auto' : 'Selected'}
              </Badge>
            </Group>
          </Paper>

          {/* Quick Language Selection */}
          <div>
            <Text size="xs" fw={600} c="dimmed" mb="sm">Popular Languages</Text>
            <SimpleGrid cols={5} spacing="xs">
              {popularLanguages.slice(0, 10).map((lang) => (
                <UnstyledButton
                  key={lang.code}
                  onClick={() => selectLanguage(lang.code)}
                >
                  <Paper
                    p="sm"
                    radius="md"
                    style={{
                      background: config.language === lang.code ? 'rgba(34, 197, 94, 0.15)' : '#111',
                      border: config.language === lang.code 
                        ? '2px solid #22c55e' 
                        : '1px solid #333',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'center',
                    }}
                  >
                    <Text size="xl" mb={2}>{lang.flag}</Text>
                    <Text size="xs" c={config.language === lang.code ? '#22c55e' : 'dimmed'} fw={500}>
                      {lang.name.length > 8 ? lang.name.slice(0, 7) + '.' : lang.name}
                    </Text>
                  </Paper>
                </UnstyledButton>
              ))}
            </SimpleGrid>
          </div>

          {/* Expand/Collapse All Languages */}
          <Button
            variant="subtle"
            color="gray"
            onClick={() => setShowAllLanguages(!showAllLanguages)}
            fullWidth
            rightSection={showAllLanguages ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          >
            {showAllLanguages ? 'Hide all languages' : 'View all 57 languages'}
          </Button>

          {/* All Languages - Collapsible */}
          <Collapse in={showAllLanguages}>
            <Stack gap="md">
              <Divider color="#333" />
              
              {/* Search */}
              <TextInput
                placeholder="Search languages..."
                leftSection={<IconSearch size={16} />}
                value={languageSearch}
                onChange={(e) => setLanguageSearch(e.currentTarget.value)}
                radius="lg"
                styles={{
                  input: {
                    background: '#111',
                    border: '1px solid #333',
                  },
                }}
              />

              {/* All Languages Grid */}
              <ScrollArea h={350} offsetScrollbars>
                <SimpleGrid cols={3} spacing="sm">
                  {filteredLanguages.map((lang) => (
                    <UnstyledButton
                      key={lang.code}
                      onClick={() => selectLanguage(lang.code)}
                      style={{ width: '100%' }}
                    >
                      <Paper
                        p="md"
                        radius="md"
                        style={{
                          background: config.language === lang.code ? 'rgba(34, 197, 94, 0.15)' : '#111',
                          border: config.language === lang.code 
                            ? '2px solid #22c55e' 
                            : '1px solid #333',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Group gap="sm" wrap="nowrap">
                          <Text size="xl">{lang.flag}</Text>
                          <Text 
                            size="sm" 
                            fw={500} 
                            style={{ 
                              color: config.language === lang.code ? '#22c55e' : '#fff',
                              flex: 1,
                            }}
                          >
                            {lang.name}
                          </Text>
                          {config.language === lang.code && (
                            <IconCheck size={16} color="#22c55e" />
                          )}
                        </Group>
                      </Paper>
                    </UnstyledButton>
                  ))}
                </SimpleGrid>
              </ScrollArea>
            </Stack>
          </Collapse>
        </Stack>
      </Paper>

      {/* Text Formatting Section */}
      <Paper 
        p="xl" 
        radius="lg" 
        style={{
          background: '#151515',
          border: '1px solid #222',
        }}
      >
        <Stack gap="lg">
          <Group gap="sm">
            <Box
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #111 0%, #151515 100%)',
                border: '1px solid #222',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconTextSize size={20} color="#22c55e" />
            </Box>
            <div>
              <Text fw={600} size="lg" style={{ color: '#fff' }}>Text Formatting</Text>
              <Text size="sm" c="dimmed">How to format transcribed text</Text>
            </div>
          </Group>

          <Select
            label="Text Format"
            description="Apply formatting to transcribed text"
            data={formatOptions}
            value={config.textFormat}
            onChange={(value) => updateConfig('textFormat', (value || 'none') as AppConfig['textFormat'])}
            radius="lg"
            size="md"
            styles={{
              input: {
                background: '#111',
                border: '1px solid #333',
              },
              dropdown: {
                background: '#1a1a1a',
                border: '1px solid #333',
              },
            }}
          />

          <Paper
            p="md"
            radius="lg"
            style={{
              background: '#111',
              border: '1px solid #222',
            }}
          >
            <Text size="sm" c="dimmed">
              Preview: {TEXT_FORMATS.find(f => f.value === config.textFormat)?.description}
            </Text>
          </Paper>
        </Stack>
      </Paper>

      {/* Custom Words Section */}
      <Paper 
        p="xl" 
        radius="lg" 
        style={{
          background: '#151515',
          border: '1px solid #222',
        }}
      >
        <Stack gap="lg">
          <Group justify="space-between">
            <Group gap="sm">
              <Box
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #111 0%, #151515 100%)',
                  border: '1px solid #222',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconReplace size={20} color="#22c55e" />
              </Box>
              <div>
                <Text fw={600} size="lg" style={{ color: '#fff' }}>Custom Words</Text>
                <Text size="sm" c="dimmed">Replace phrases with shortcuts</Text>
              </div>
            </Group>
            <Badge 
              size="lg" 
              radius="xl"
              style={{
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#22c55e',
              }}
            >
              {config.wordReplacements.length} rules
            </Badge>
          </Group>

          {/* Add new replacement */}
          <Paper
            p="md"
            radius="lg"
            style={{
              background: '#111',
              border: '1px solid #222',
            }}
          >
            <Group align="flex-end">
              <TextInput
                label="When I say..."
                placeholder="oh my god"
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.currentTarget.value)}
                style={{ flex: 1 }}
                radius="lg"
                styles={{
                  input: {
                    background: '#1a1a1a',
                    border: '1px solid #333',
                  },
                }}
              />
              <TextInput
                label="Replace with..."
                placeholder="omg"
                value={newReplacement}
                onChange={(e) => setNewReplacement(e.currentTarget.value)}
                style={{ flex: 1 }}
                radius="lg"
                styles={{
                  input: {
                    background: '#1a1a1a',
                    border: '1px solid #333',
                  },
                }}
              />
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={addReplacement}
                disabled={!newTrigger.trim() || !newReplacement.trim()}
                radius="lg"
                style={{
                  background: '#22c55e',
                }}
              >
                Add
              </Button>
            </Group>
          </Paper>

          {/* Replacements list */}
          {config.wordReplacements.length > 0 && (
            <ScrollArea h={250}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ color: '#a0a0a0' }}>Trigger</Table.Th>
                    <Table.Th style={{ color: '#a0a0a0' }}>Replacement</Table.Th>
                    <Table.Th style={{ color: '#a0a0a0', width: 80 }}>Enabled</Table.Th>
                    <Table.Th style={{ color: '#a0a0a0', width: 100 }}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {config.wordReplacements.map((r) => (
                    <Table.Tr key={r.id}>
                      <Table.Td>
                        {editingId === r.id ? (
                          <TextInput
                            value={editTrigger}
                            onChange={(e) => setEditTrigger(e.currentTarget.value)}
                            size="xs"
                            radius="md"
                            styles={{
                              input: {
                                background: '#1a1a1a',
                                border: '1px solid #333',
                              },
                            }}
                          />
                        ) : (
                          <Text size="sm" style={{ color: r.enabled ? '#fff' : '#666' }}>
                            "{r.trigger}"
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        {editingId === r.id ? (
                          <TextInput
                            value={editReplacement}
                            onChange={(e) => setEditReplacement(e.currentTarget.value)}
                            size="xs"
                            radius="md"
                            styles={{
                              input: {
                                background: '#1a1a1a',
                                border: '1px solid #333',
                              },
                            }}
                          />
                        ) : (
                          <Badge 
                            variant="light" 
                            radius="md"
                            style={{
                              background: r.enabled ? 'rgba(34, 197, 94, 0.15)' : '#1a1a1a',
                              border: r.enabled ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid #333',
                              color: r.enabled ? '#22c55e' : '#666',
                            }}
                          >
                            {r.replacement}
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Switch
                          checked={r.enabled}
                          onChange={() => toggleReplacement(r.id)}
                          size="sm"
                          color="green"
                        />
                      </Table.Td>
                      <Table.Td>
                        {editingId === r.id ? (
                          <Group gap={4}>
                            <Tooltip label="Save">
                              <ActionIcon 
                                variant="light" 
                                color="green" 
                                size="sm"
                                onClick={saveEdit}
                              >
                                <IconCheck size={14} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Cancel">
                              <ActionIcon 
                                variant="light" 
                                color="gray" 
                                size="sm"
                                onClick={cancelEdit}
                              >
                                <IconX size={14} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        ) : (
                          <Group gap={4}>
                            <Tooltip label="Edit">
                              <ActionIcon 
                                variant="light" 
                                color="gray" 
                                size="sm"
                                onClick={() => startEditing(r)}
                              >
                                <IconEdit size={14} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Delete">
                              <ActionIcon 
                                variant="light" 
                                color="red" 
                                size="sm"
                                onClick={() => deleteReplacement(r.id)}
                              >
                                <IconTrash size={14} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          )}

          {config.wordReplacements.length === 0 && (
            <Paper
              p="lg"
              radius="lg"
              style={{
                background: '#111',
                border: '1px solid #222',
                textAlign: 'center',
              }}
            >
              <Text size="sm" c="dimmed">
                No custom words yet. Add some above!
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Example: "oh my god" → "omg"
              </Text>
            </Paper>
          )}
        </Stack>
      </Paper>

      {/* API Key Section */}
      <Paper 
        p="xl" 
        radius="lg" 
        style={{
          background: '#151515',
          border: '1px solid #222',
        }}
      >
        <Stack gap="lg">
          <Group justify="space-between">
            <Group gap="sm">
              <Box
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #111 0%, #151515 100%)',
                  border: '1px solid #222',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconKey size={20} color="#22c55e" />
              </Box>
              <div>
                <Text fw={600} size="lg" style={{ color: '#fff' }}>API Configuration</Text>
                <Text size="sm" c="dimmed">Connect to Groq for transcription</Text>
              </div>
            </Group>
            {config.apiKey && (
              <Badge 
                variant="light" 
                color="green" 
                size="lg" 
                radius="xl"
                style={{
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                ✓ Configured
              </Badge>
            )}
          </Group>

          <PasswordInput
            label="Groq API Key"
            description="Your Groq API key for Whisper transcription"
            placeholder="gsk_..."
            value={config.apiKey}
            onChange={(e) => updateConfig('apiKey', e.currentTarget.value)}
            leftSection={<IconKey size={16} />}
            radius="lg"
            size="md"
            styles={{
              input: {
                fontFamily: 'monospace',
                background: '#111',
                border: '1px solid #333',
              },
            }}
          />

          {!config.apiKey && (
            <Paper
              p="md"
              radius="lg"
              style={{
                background: 'rgba(234, 179, 8, 0.1)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
              }}
            >
              <Group gap="xs">
                <Text size="sm" style={{ color: '#eab308' }}>
                  ⚠️ API key required to use transcription.
                </Text>
                <Text
                  component="a"
                  href="https://console.groq.com"
                  target="_blank"
                  size="sm"
                  fw={500}
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 4,
                    color: '#22c55e',
                    textDecoration: 'none',
                  }}
                >
                  Get one free <IconExternalLink size={12} />
                </Text>
              </Group>
            </Paper>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
