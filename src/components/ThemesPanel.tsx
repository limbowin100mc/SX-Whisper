import {
  Stack,
  Text,
  Paper,
  Group,
  SimpleGrid,
  UnstyledButton,
  Box,
  Badge,
} from '@mantine/core';
import { 
  IconSun,
  IconMoon,
  IconDeviceDesktop,
  IconCheck,
  IconPalette,
  IconSparkles,
  IconWaveSine,
} from '@tabler/icons-react';
import { AppConfig, ACCENT_COLORS, OVERLAY_COLORS } from '../types';
import '../styles/glass-effects.css';

interface ThemesPanelProps {
  config: AppConfig;
  onConfigChange: (config: AppConfig) => void;
}

export function ThemesPanel({ config, onConfigChange }: ThemesPanelProps) {
  const currentAccent = ACCENT_COLORS.find(c => c.value === config.accentColor) || ACCENT_COLORS[0];

  const themeOptions = [
    { value: 'light', label: 'Light', icon: IconSun, description: 'Bright and clean' },
    { value: 'dark', label: 'Dark', icon: IconMoon, description: 'Easy on the eyes' },
    { value: 'auto', label: 'System', icon: IconDeviceDesktop, description: 'Match your OS' },
  ] as const;

  return (
    <Stack gap="xl">
      {/* Theme Mode Section */}
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
                background: `linear-gradient(135deg, var(--mantine-color-${currentAccent.gradient.from}-filled), var(--mantine-color-${currentAccent.gradient.to}-filled))`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconPalette size={20} color="white" />
            </Box>
            <div>
              <Text fw={600} size="lg" style={{ color: '#fff' }}>Appearance</Text>
              <Text size="sm" c="dimmed">Choose your preferred theme mode</Text>
            </div>
          </Group>

          <SimpleGrid cols={3} spacing="md">
            {themeOptions.map((option) => {
              const isSelected = config.theme === option.value;
              const Icon = option.icon;
              
              return (
                <UnstyledButton
                  key={option.value}
                  onClick={() => onConfigChange({ ...config, theme: option.value })}
                  className={`glass-card ${isSelected ? 'glass-card-active' : ''}`}
                  style={{ width: '100%', padding: '20px', borderRadius: '12px' }}
                >
                  <Stack align="center" gap="sm">
                    <Box
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: isSelected 
                          ? `linear-gradient(135deg, var(--mantine-color-${currentAccent.gradient.from}-filled), var(--mantine-color-${currentAccent.gradient.to}-filled))`
                          : '#1a1a1a',
                        border: isSelected ? 'none' : '1px solid #333',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={24} color={isSelected ? 'white' : '#666'} />
                    </Box>
                    <div style={{ textAlign: 'center' }}>
                      <Text fw={600} size="sm" style={{ color: '#fff' }}>{option.label}</Text>
                      <Text size="xs" c="dimmed">{option.description}</Text>
                    </div>
                    {isSelected && (
                      <Badge 
                        size="sm" 
                        radius="xl"
                        leftSection={<IconCheck size={10} />}
                        style={{
                          background: 'rgba(34, 197, 94, 0.15)',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          color: '#22c55e',
                        }}
                      >
                        Active
                      </Badge>
                    )}
                  </Stack>
                </UnstyledButton>
              );
            })}
          </SimpleGrid>
        </Stack>
      </Paper>

      {/* Accent Color Section */}
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
                background: `linear-gradient(135deg, var(--mantine-color-${currentAccent.gradient.from}-filled), var(--mantine-color-${currentAccent.gradient.to}-filled))`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconSparkles size={20} color="white" />
            </Box>
            <div>
              <Text fw={600} size="lg" style={{ color: '#fff' }}>Accent Color</Text>
              <Text size="sm" c="dimmed">Personalize your interface</Text>
            </div>
          </Group>

          <SimpleGrid cols={4} spacing="md">
            {ACCENT_COLORS.map((color) => {
              const isSelected = config.accentColor === color.value;
              
              return (
                <UnstyledButton
                  key={color.value}
                  onClick={() => onConfigChange({ ...config, accentColor: color.value })}
                  className={`glass-button ${isSelected ? 'glass-button-active' : ''}`}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px' }}
                >
                  <Group gap="sm" justify="center">
                    <Box
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, var(--mantine-color-${color.gradient.from}-filled), var(--mantine-color-${color.gradient.to}-filled))`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isSelected && <IconCheck size={16} color="white" />}
                    </Box>
                    <Text fw={500} size="sm" style={{ color: '#fff' }}>{color.label}</Text>
                  </Group>
                </UnstyledButton>
              );
            })}
          </SimpleGrid>
        </Stack>
      </Paper>

      {/* Overlay Color Section */}
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
                background: OVERLAY_COLORS.find(c => c.value === config.overlayColor)?.gradient || OVERLAY_COLORS[0].gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconWaveSine size={20} color="white" />
            </Box>
            <div>
              <Text fw={600} size="lg" style={{ color: '#fff' }}>Overlay Color</Text>
              <Text size="sm" c="dimmed">Recording indicator waveform color</Text>
            </div>
          </Group>

          <SimpleGrid cols={4} spacing="md">
            {OVERLAY_COLORS.map((color) => {
              const isSelected = config.overlayColor === color.value;
              
              return (
                <UnstyledButton
                  key={color.value}
                  onClick={() => onConfigChange({ ...config, overlayColor: color.value })}
                  className={`glass-button ${isSelected ? 'glass-button-active' : ''}`}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px' }}
                >
                  <Group gap="sm" justify="center">
                    <Box
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: color.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isSelected && <IconCheck size={16} color={color.value === 'white' ? '#333' : 'white'} />}
                    </Box>
                    <Text fw={500} size="sm" style={{ color: '#fff' }}>{color.label}</Text>
                  </Group>
                </UnstyledButton>
              );
            })}
          </SimpleGrid>

          {/* Overlay Preview */}
          <Paper
            p="md"
            radius="lg"
            style={{
              background: 'rgba(10, 10, 10, 0.92)',
              border: '1px solid #333',
            }}
          >
            <Group justify="center" gap="xs">
              <Text size="xs" c="dimmed">Preview:</Text>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'rgba(10, 10, 10, 0.92)',
                  borderRadius: 20,
                  padding: '8px 14px',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 2, height: 18 }}>
                  {[12, 16, 20, 18, 14, 10, 8].map((h, i) => (
                    <Box
                      key={i}
                      style={{
                        width: 3,
                        height: h,
                        borderRadius: 2,
                        background: OVERLAY_COLORS.find(c => c.value === config.overlayColor)?.gradient || OVERLAY_COLORS[0].gradient,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Group>
          </Paper>
        </Stack>
      </Paper>

      {/* Preview Section */}
      <Paper 
        p="xl" 
        radius="lg" 
        style={{
          background: '#151515',
          border: '1px solid #222',
        }}
      >
        <Stack gap="md">
          <Text fw={600} size="lg" style={{ color: '#fff' }}>Preview</Text>
          <Paper 
            p="lg" 
            radius="md" 
            style={{
              background: '#111',
              border: '1px solid #222',
            }}
          >
            <Group justify="space-between" align="center">
              <Group gap="md">
                <Box
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: `linear-gradient(135deg, var(--mantine-color-${currentAccent.gradient.from}-filled), var(--mantine-color-${currentAccent.gradient.to}-filled))`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconPalette size={22} color="white" />
                </Box>
                <div>
                  <Text fw={600} style={{ color: '#fff' }}>Sample Card</Text>
                  <Text size="sm" c="dimmed">This is how your UI will look</Text>
                </div>
              </Group>
              <Badge 
                size="lg" 
                radius="xl"
                style={{
                  background: `linear-gradient(135deg, var(--mantine-color-${currentAccent.gradient.from}-filled), var(--mantine-color-${currentAccent.gradient.to}-filled))`,
                  color: 'white',
                }}
              >
                {currentAccent.label}
              </Badge>
            </Group>
          </Paper>
        </Stack>
      </Paper>
    </Stack>
  );
}
