import {
  Stack,
  Text,
  Paper,
  Group,
  Badge,
  List,
  Anchor,
  SimpleGrid,
  Box,
} from '@mantine/core';
import { 
  IconMicrophone,
  IconExternalLink,
  IconKeyboard,
  IconKey,
  IconVolume,
  IconClipboard,
  IconBolt,
  IconHeart,
  IconRocket,
  IconShieldCheck,
} from '@tabler/icons-react';
import { AppConfig, ACCENT_COLORS } from '../types';

interface AboutPanelProps {
  config: AppConfig;
}

export function AboutPanel({ config }: AboutPanelProps) {
  const currentAccent = ACCENT_COLORS.find(c => c.value === config.accentColor) || ACCENT_COLORS[0];

  const features = [
    { icon: IconBolt, label: 'Lightning Fast', description: 'Powered by Groq' },
    { icon: IconShieldCheck, label: 'Privacy First', description: 'Local processing' },
    { icon: IconRocket, label: 'Easy Setup', description: 'Ready in minutes' },
  ];

  return (
    <Stack gap="xl">
      {/* Hero Section */}
      <Paper 
        p="xl" 
        radius="lg" 
        style={{
          background: '#151515',
          border: '1px solid #222',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background gradient */}
        <Box
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />
        
        <Stack align="center" gap="lg" style={{ position: 'relative', zIndex: 1 }}>
          <Box
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: `linear-gradient(135deg, var(--mantine-color-${currentAccent.gradient.from}-filled), var(--mantine-color-${currentAccent.gradient.to}-filled))`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 30px rgba(34, 197, 94, 0.3)',
            }}
          >
            <IconMicrophone size={40} color="white" />
          </Box>
          <div style={{ textAlign: 'center' }}>
            <Text fw={700} size="xl" style={{ color: '#fff' }}>SX Whisper</Text>
            <Text size="sm" c="dimmed" mt={4}>
              Voice to Text • Powered by Groq
            </Text>

          </div>
        </Stack>
      </Paper>

      {/* Features Grid */}
      <SimpleGrid cols={3} spacing="md">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Paper 
              key={feature.label} 
              p="lg" 
              radius="lg" 
              style={{
                background: '#151515',
                border: '1px solid #222',
                transition: 'all 0.25s ease',
              }}
              className="sx-card-hover"
            >
              <Stack align="center" gap="sm">
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
                  <Icon size={22} color="#22c55e" />
                </Box>
                <div style={{ textAlign: 'center' }}>
                  <Text fw={600} size="sm" style={{ color: '#fff' }}>{feature.label}</Text>
                  <Text size="xs" c="dimmed">{feature.description}</Text>
                </div>
              </Stack>
            </Paper>
          );
        })}
      </SimpleGrid>

      {/* How to Use */}
      <Paper 
        p="xl" 
        radius="lg" 
        style={{
          background: '#151515',
          border: '1px solid #222',
        }}
      >
        <Stack gap="lg">
          <Text fw={600} size="lg" style={{ color: '#fff' }}>How to Use</Text>
          <List spacing="md" size="sm">
            <List.Item icon={
              <Box
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconKey size={14} color="#22c55e" />
              </Box>
            }>
              <Text fw={500} style={{ color: '#fff' }}>Set your API key</Text>
              <Text size="xs" c="dimmed">Get a free key at console.groq.com</Text>
            </List.Item>
            <List.Item icon={
              <Box
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconKeyboard size={14} color="#22c55e" />
              </Box>
            }>
              <Text fw={500} style={{ color: '#fff' }}>Configure your hotkey</Text>
              <Text size="xs" c="dimmed">e.g., Ctrl+Shift+Space</Text>
            </List.Item>
            <List.Item icon={
              <Box
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconVolume size={14} color="#22c55e" />
              </Box>
            }>
              <Text fw={500} style={{ color: '#fff' }}>Hold and speak</Text>
              <Text size="xs" c="dimmed">Press your hotkey and talk clearly</Text>
            </List.Item>
            <List.Item icon={
              <Box
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconClipboard size={14} color="#22c55e" />
              </Box>
            }>
              <Text fw={500} style={{ color: '#fff' }}>Auto-paste</Text>
              <Text size="xs" c="dimmed">Text appears where your cursor is</Text>
            </List.Item>
          </List>
        </Stack>
      </Paper>

      {/* Free Tier Info */}
      <Paper 
        p="xl" 
        radius="lg" 
        style={{
          background: '#151515',
          border: '1px solid #222',
        }}
      >
        <Stack gap="md">
          <Text fw={600} size="lg" style={{ color: '#fff' }}>Free Tier Limits</Text>
          <Group gap="sm">
            <Badge 
              size="lg" 
              radius="xl"
              style={{
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#22c55e',
              }}
            >
              2,000 requests/day
            </Badge>
            <Badge 
              size="lg" 
              radius="xl"
              style={{
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#22c55e',
              }}
            >
              8 hours audio/day
            </Badge>
            <Badge 
              size="lg" 
              radius="xl"
              style={{
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#22c55e',
              }}
            >
              20 requests/min
            </Badge>
          </Group>
        </Stack>
      </Paper>

      {/* Footer Links */}
      <Paper 
        p="lg" 
        radius="lg" 
        style={{
          background: '#111',
          border: '1px solid #222',
        }}
      >
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconHeart size={14} color="#ec4899" />
            <Text size="sm" c="dimmed">Made with love</Text>
          </Group>
          <Group gap="md">
            <Anchor 
              href="https://console.groq.com" 
              target="_blank" 
              size="sm"
              c="dimmed"
              style={{ textDecoration: 'none' }}
            >
              <Group gap={4}>
                <IconExternalLink size={14} />
                Groq Console
              </Group>
            </Anchor>
          </Group>
        </Group>
      </Paper>
    </Stack>
  );
}
