import { useEffect, useRef, useState } from 'react';
import {
  Title,
  Stack,
  Text,
  Group,
  Notification,
  useMantineColorScheme,
  Badge,
  Box,
  UnstyledButton,
  ScrollArea,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconSettings,
  IconHistory,
  IconInfoCircle,
  IconX,
  IconCheck,
  IconPalette,
  IconChevronRight,
  IconHome,
  IconMenu2,
  IconKeyboard,
  IconMicrophone,
} from '@tabler/icons-react';
import { HomePanel } from './components/HomePanel';
import { SettingsPanel } from './components/SettingsPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { ThemesPanel } from './components/ThemesPanel';
import { AboutPanel } from './components/AboutPanel';
import { IntroScreen } from './components/IntroScreen';
import { useConfig } from './hooks/useConfig';
import { useRecording } from './hooks/useRecording';
import { useHistory } from './hooks/useHistory';
import './styles/glass-effects.css';

interface NavLinkProps {
  icon: typeof IconSettings;
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
  count?: number;
  collapsed?: boolean;
}

function NavLink({ icon: Icon, label, active, onClick, count, collapsed }: NavLinkProps) {
  return (
    <Tooltip label={label} position="right" disabled={!collapsed} withArrow>
      <UnstyledButton
        onClick={onClick}
        className={`glass-button ${active ? 'glass-button-active' : ''} glass-stagger-${Math.min(count || 1, 10)}`}
        style={{
          width: '100%',
          padding: '12px',
          paddingLeft: collapsed ? '12px' : '16px',
          borderRadius: '10px',
          color: active ? 'white' : 'var(--mantine-color-dimmed)',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginBottom: '4px',
        }}
      >
        <Group gap="sm" wrap="nowrap" style={{ width: '100%' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            transition: 'transform 0.25s ease'
          }}>
            <Icon size={20} stroke={1.5} />
          </div>

          <Text
            size="sm"
            fw={500}
            style={{
              opacity: collapsed ? 0 : 1,
              width: collapsed ? 0 : 'auto',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              transition: 'all 0.25s ease',
              marginLeft: collapsed ? -10 : 0
            }}
          >
            {label}
          </Text>

          <Group
            gap="xs"
            style={{
              marginLeft: 'auto',
              opacity: collapsed ? 0 : 1,
              width: collapsed ? 0 : 'auto',
              overflow: 'hidden',
              transition: 'all 0.25s ease'
            }}
          >
            {count !== undefined && count > 0 && (
              <Badge
                size="sm"
                variant="light"
                color={active ? 'white' : 'gray'}
                style={{ opacity: active ? 1 : 0.7 }}
              >
                {count}
              </Badge>
            )}
            {active && <IconChevronRight size={14} style={{ opacity: 0.5 }} />}
          </Group>
        </Group>
      </UnstyledButton>
    </Tooltip>
  );
}

function App() {
  const { config, setConfig, registerHotkey, error: configError, clearError: clearConfigError } = useConfig();
  const { isRecording, lastTranscription, error: recordingError, clearError: clearRecordingError, clearLastTranscription } = useRecording();
  const { history, clearHistory, copyToClipboard } = useHistory();
  const { setColorScheme } = useMantineColorScheme();
  const isCapturingHotkeyRef = useRef(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [showIntro, setShowIntro] = useState(true); // Always show intro on app start

  const handleGetStarted = () => {
    setShowIntro(false);
  };

  useEffect(() => {
    setColorScheme(config.theme);
  }, [config.theme, setColorScheme]);

  useEffect(() => {
    if (config.hotkey && config.isEnabled && !isCapturingHotkeyRef.current) {
      registerHotkey(config.hotkey);
    }
  }, [config.hotkey, config.isEnabled, registerHotkey]);

  const handleHotkeyCapture = (capturing: boolean) => {
    isCapturingHotkeyRef.current = capturing;
  };

  const error = configError || recordingError;
  const clearError = () => {
    clearConfigError();
    clearRecordingError();
  };

  const isHotkeyConflict = error && (error.includes('already registered') || error.includes('Failed to register'));

  const navItems = [
    { value: 'dashboard', label: 'Home', icon: IconHome },
    { value: 'settings', label: 'Settings', icon: IconSettings },
    { value: 'history', label: 'History', icon: IconHistory, count: history.length },
    { value: 'themes', label: 'Themes', icon: IconPalette },
    { value: 'about', label: 'About', icon: IconInfoCircle },
  ];

  // Show intro screen on first launch
  if (showIntro) {
    return <IntroScreen onGetStarted={handleGetStarted} />;
  }

  return (
    <Box
      style={{
        height: '100vh',
        display: 'flex',
        background: '#0a0a0a',
        overflow: 'hidden'
      }}
    >
      {/* Sidebar */}
      <Box
        h="100%"
        p="md"
        style={{
          width: collapsed ? 80 : 280,
          minWidth: collapsed ? 80 : 280,
          borderRight: '1px solid #222',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
          transition: 'width 0.25s ease, min-width 0.25s ease',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          background: '#111',
        }}
      >
        {/* App Header */}
        <Stack gap="xs" mb={30} px={collapsed ? 0 : 8} align="center">
          <Group gap="md" wrap="nowrap" justify={collapsed ? 'center' : 'flex-start'} w="100%">
            {!collapsed && (
              <Box
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
                  border: '1px solid #333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                <IconMicrophone size={24} color="#ef4444" style={{ filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))' }} />
              </Box>
            )}

            {collapsed && (
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                onClick={() => setCollapsed(!collapsed)}
              >
                <IconMenu2 />
              </ActionIcon>
            )}

            {!collapsed && (
              <div style={{ flex: 1 }}>
                <Group justify="space-between">
                  <Title order={3} fw={700} style={{ lineHeight: 1.2, whiteSpace: 'nowrap', color: '#fff' }}>SX Whisper</Title>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={() => setCollapsed(!collapsed)}
                  >
                    <IconMenu2 size={16} />
                  </ActionIcon>
                </Group>
                <Text size="xs" c="dimmed">v0.1.0</Text>
              </div>
            )}
          </Group>

          {!collapsed && (
            <Badge
              size="lg"
              variant={config.isEnabled ? 'light' : 'outline'}
              color={config.isEnabled ? config.accentColor : 'gray'}
              radius="xl"
              fullWidth
              py="md"
              style={{
                background: config.isEnabled ? 'rgba(34, 197, 94, 0.15)' : undefined,
                borderColor: config.isEnabled ? 'rgba(34, 197, 94, 0.3)' : undefined,
              }}
            >
              {config.isEnabled ? (isRecording ? '🔴 Recording' : '✓ Ready') : 'Disabled'}
            </Badge>
          )}
        </Stack>

        {/* Navigation */}
        <Stack gap="xs" style={{ flex: 1 }}>
          {!collapsed && (
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" px={12} mb={4} style={{ whiteSpace: 'nowrap', opacity: collapsed ? 0 : 1, transition: 'opacity 0.2s', letterSpacing: '0.05em' }}>
              Menu
            </Text>
          )}
          {navItems.map((item) => (
            <NavLink
              key={item.value}
              {...item}
              active={activeTab === item.value}
              onClick={() => setActiveTab(item.value)}
              color={config.accentColor}
              collapsed={collapsed}
            />
          ))}
        </Stack>

        {/* Footer Credit */}
        <Box px={collapsed ? 0 : 12} mt="auto">
          <Text
            size="xs"
            c="dimmed"
            ta="center"
            style={{
              fontSize: 12,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              opacity: collapsed ? 0 : 1,
              transition: 'all 0.25s ease',
              height: collapsed ? 0 : 'auto',
            }}
          >
            Made by sxseth
          </Text>
        </Box>
      </Box>

      {/* Main Content */}
      <Box style={{ flex: 1, position: 'relative', height: '100%', background: '#0a0a0a' }}>
        <ScrollArea h="100%" type="scroll">
          <Box p="xl" maw={900} mx="auto">
            <Stack gap="xl">
              {/* Notifications */}
              {error && (
                <Notification
                  color={isHotkeyConflict ? "orange" : "red"}
                  title={isHotkeyConflict ? "Hotkey Configuration" : "Error"}
                  onClose={clearError}
                  icon={isHotkeyConflict ? <IconKeyboard size={18} /> : <IconX size={18} />}
                  radius="lg"
                  withBorder
                  style={{ background: '#151515', borderColor: '#333' }}
                >
                  {isHotkeyConflict
                    ? "The configured hotkey is unavailable. Please check Settings."
                    : error}
                </Notification>
              )}

              {lastTranscription && (
                <Notification
                  color="green"
                  title="Transcribed & Pasted"
                  onClose={clearLastTranscription}
                  icon={<IconCheck size={18} />}
                  radius="lg"
                  withBorder
                  style={{ background: '#151515', borderColor: '#333' }}
                >
                  {lastTranscription.length > 80
                    ? lastTranscription.substring(0, 80) + '...'
                    : lastTranscription}
                </Notification>
              )}

              {/* Content Panel */}
              <Box style={{ animation: 'fadeIn 0.3s ease' }}>

                {/* Header for Panel */}
                <Stack gap={4} mb="xl">
                  <Title order={2} style={{ color: '#fff' }}>
                    {navItems.find(n => n.value === activeTab)?.label}
                  </Title>
                  <Text c="dimmed" size="sm">
                    {activeTab === 'dashboard' && 'Welcome to your voice dashboard'}
                    {activeTab === 'settings' && 'Manage your application preferences'}
                    {activeTab === 'history' && 'View your recent transcriptions'}
                    {activeTab === 'themes' && 'Customize the look and feel'}
                    {activeTab === 'about' && 'Learn more about SX Whisper'}
                  </Text>
                </Stack>

                {activeTab === 'dashboard' && (
                  <HomePanel
                    config={config}
                    onConfigChange={setConfig}
                    isRecording={isRecording}
                  />
                )}

                {activeTab === 'settings' && (
                  <SettingsPanel
                    config={config}
                    onConfigChange={setConfig}
                    onHotkeyCapture={handleHotkeyCapture}
                  />
                )}

                {activeTab === 'history' && (
                  <HistoryPanel
                    entries={history}
                    onCopy={copyToClipboard}
                    onClear={clearHistory}
                    config={config}
                  />
                )}

                {activeTab === 'themes' && (
                  <ThemesPanel
                    config={config}
                    onConfigChange={setConfig}
                  />
                )}

                {activeTab === 'about' && (
                  <AboutPanel config={config} />
                )}
              </Box>
            </Stack>
          </Box>
        </ScrollArea>
      </Box>
    </Box>
  );
}

export default App;
