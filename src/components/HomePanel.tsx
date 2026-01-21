import {
    Paper,
    Group,
    Text,
    Switch,
    Badge,
    Stack,
    Title,
    Card,
    SimpleGrid,
    Box,
} from '@mantine/core';
import {
    IconKeyboard,
    IconFileText,
    IconClock,
    IconStack2,
    IconBolt,
    IconShieldCheck,
    IconWifi,
    IconCheck,
    IconX,
    IconMicrophone,
} from '@tabler/icons-react';
import { AppConfig, SUPPORTED_LANGUAGES } from '../types';
import { useStats } from '../hooks/useStats';

interface HomePanelProps {
    config: AppConfig;
    onConfigChange: (config: AppConfig) => void;
    isRecording?: boolean;
}

function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
}

export function HomePanel({ config, onConfigChange, isRecording }: HomePanelProps) {
    const currentLanguage = SUPPORTED_LANGUAGES.find(l => l.code === config.language) || SUPPORTED_LANGUAGES[0];
    const stats = useStats();

    const updateConfig = <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
        onConfigChange({ ...config, [key]: value });
    };

    return (
        <Stack gap="lg">
            {/* Hero Status Card */}
            <Paper
                p={30}
                radius="lg"
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#151515',
                    border: '1px solid #222',
                }}
            >
                {/* Background gradient orb */}
                {config.isEnabled && (
                    <Box
                        style={{
                            position: 'absolute',
                            top: -100,
                            right: -100,
                            width: 300,
                            height: 300,
                            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)',
                            filter: 'blur(40px)',
                            pointerEvents: 'none',
                        }}
                    />
                )}
                
                <Group justify="space-between" align="center" style={{ position: 'relative', zIndex: 1 }}>
                    <Group gap="xl">
                        <Box
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: 16,
                                background: config.isEnabled 
                                    ? 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)'
                                    : '#222',
                                border: '1px solid #333',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: config.isEnabled 
                                    ? '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' 
                                    : undefined,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <IconMicrophone 
                                size={40} 
                                color={config.isEnabled ? "#ef4444" : "#666"} 
                                style={{ 
                                    filter: config.isEnabled ? 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.6))' : undefined 
                                }} 
                            />
                        </Box>

                        <Stack gap={4}>
                            <Title order={2} fw={700} style={{ color: '#fff' }}>
                                {config.isEnabled ? (isRecording ? 'Listening...' : 'Ready to Whisper') : 'System Paused'}
                            </Title>
                            <Text c="dimmed" size="lg">
                                {config.isEnabled
                                    ? 'Use your hotkey to start transcribing'
                                    : 'Enable Push-to-Talk to start'}
                            </Text>

                            {config.isEnabled && (
                                <Group gap={8} mt={8}>
                                    <Badge 
                                        variant="light" 
                                        color={config.accentColor} 
                                        size="lg"
                                        radius="xl"
                                        style={{
                                            background: 'rgba(34, 197, 94, 0.15)',
                                            border: '1px solid rgba(34, 197, 94, 0.3)',
                                        }}
                                    >
                                        <Group gap={6}>
                                            <Box
                                                style={{
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: '50%',
                                                    background: '#22c55e',
                                                    animation: 'pulse 2s ease-in-out infinite',
                                                }}
                                            />
                                            Running
                                        </Group>
                                    </Badge>
                                    <Badge 
                                        variant="outline" 
                                        color="gray" 
                                        size="lg" 
                                        radius="xl"
                                        style={{ borderColor: '#333' }}
                                    >
                                        {currentLanguage.flag} {currentLanguage.name}
                                    </Badge>
                                    {config.hotkey && (
                                        <Badge 
                                            variant="outline" 
                                            color="gray" 
                                            size="lg" 
                                            radius="xl"
                                            leftSection={<IconKeyboard size={14} />}
                                            style={{ borderColor: '#333' }}
                                        >
                                            {config.hotkey}
                                        </Badge>
                                    )}
                                </Group>
                            )}
                        </Stack>
                    </Group>

                    <Switch
                        checked={config.isEnabled}
                        onChange={(e) => updateConfig('isEnabled', e.currentTarget.checked)}
                        size="xl"
                        color={config.accentColor}
                        thumbIcon={
                            config.isEnabled ? (
                                <IconCheck size="0.8rem" color="#22c55e" stroke={3} />
                            ) : (
                                <IconX size="0.8rem" color="#666" stroke={3} />
                            )
                        }
                    />
                </Group>
            </Paper>

            {/* Stats Grid */}
            <Stack gap="md">
                <Text size="sm" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
                    Your Activity
                </Text>
                <SimpleGrid cols={3} spacing="md">
                    <Card 
                        radius="lg" 
                        padding="xl" 
                        style={{ 
                            textAlign: 'center',
                            background: '#151515',
                            border: '1px solid #222',
                            transition: 'all 0.25s ease',
                        }}
                        className="sx-card-hover"
                    >
                        <Stack align="center" gap="xs">
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
                                <IconFileText size={20} color="#22c55e" />
                            </Box>
                            <Text size="2.5rem" fw={700} lh={1} style={{ color: '#fff' }}>
                                {stats.wordsTranscribed}
                            </Text>
                            <Text size="sm" c="dimmed" fw={500}>Words Transcribed</Text>
                        </Stack>
                    </Card>

                    <Card 
                        radius="lg" 
                        padding="xl" 
                        style={{ 
                            textAlign: 'center',
                            background: '#151515',
                            border: '1px solid #222',
                            transition: 'all 0.25s ease',
                        }}
                        className="sx-card-hover"
                    >
                        <Stack align="center" gap="xs">
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
                                <IconClock size={20} color="#22c55e" />
                            </Box>
                            <Text size="2.5rem" fw={700} lh={1} style={{ color: '#fff' }}>
                                {formatDuration(stats.usageTimeSeconds)}
                            </Text>
                            <Text size="sm" c="dimmed" fw={500}>Usage Time</Text>
                        </Stack>
                    </Card>

                    <Card 
                        radius="lg" 
                        padding="xl" 
                        style={{ 
                            textAlign: 'center',
                            background: '#151515',
                            border: '1px solid #222',
                            transition: 'all 0.25s ease',
                        }}
                        className="sx-card-hover"
                    >
                        <Stack align="center" gap="xs">
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
                                <IconStack2 size={20} color="#22c55e" />
                            </Box>
                            <Text size="2.5rem" fw={700} lh={1} style={{ color: '#fff' }}>
                                {stats.sessionsCount}
                            </Text>
                            <Text size="sm" c="dimmed" fw={500}>Sessions</Text>
                        </Stack>
                    </Card>
                </SimpleGrid>
            </Stack>

            {/* Features Grid */}
            <Stack gap="md">
                <Text size="sm" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
                    Features
                </Text>
                <SimpleGrid cols={3} spacing="md">
                    <Card 
                        radius="lg" 
                        padding="lg" 
                        style={{ 
                            background: '#151515',
                            border: '1px solid #222',
                            transition: 'all 0.25s ease',
                        }}
                        className="sx-card-hover"
                    >
                        <Stack gap="sm">
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
                                <IconBolt size={20} color="#22c55e" />
                            </Box>
                            <Text fw={600} size="sm" style={{ color: '#fff' }}>Lightning Fast</Text>
                            <Text size="xs" c="dimmed">Sub-second latency powered by Groq</Text>
                        </Stack>
                    </Card>

                    <Card 
                        radius="lg" 
                        padding="lg" 
                        style={{ 
                            background: '#151515',
                            border: '1px solid #222',
                            transition: 'all 0.25s ease',
                        }}
                        className="sx-card-hover"
                    >
                        <Stack gap="sm">
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
                                <IconShieldCheck size={20} color="#22c55e" />
                            </Box>
                            <Text fw={600} size="sm" style={{ color: '#fff' }}>Privacy First</Text>
                            <Text size="xs" c="dimmed">Your data stays on your machine</Text>
                        </Stack>
                    </Card>

                    <Card 
                        radius="lg" 
                        padding="lg" 
                        style={{ 
                            background: '#151515',
                            border: '1px solid #222',
                            transition: 'all 0.25s ease',
                        }}
                        className="sx-card-hover"
                    >
                        <Stack gap="sm">
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
                                <IconWifi size={20} color="#22c55e" />
                            </Box>
                            <Text fw={600} size="sm" style={{ color: '#fff' }}>99% Accuracy</Text>
                            <Text size="xs" c="dimmed">Powered by Whisper AI</Text>
                        </Stack>
                    </Card>
                </SimpleGrid>
            </Stack>

            {/* Quick Start Hint */}
            <Card 
                radius="lg" 
                p="lg" 
                style={{
                    background: '#111',
                    border: '1px solid #222',
                }}
            >
                <Group>
                    <Box
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: 'rgba(34, 197, 94, 0.15)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <IconKeyboard size={20} color="#22c55e" />
                    </Box>
                    <div>
                        <Text fw={600} size="sm" style={{ color: '#fff' }}>Quick Tip</Text>
                        <Text size="xs" c="dimmed">
                            Hold <b style={{ color: '#22c55e' }}>{config.hotkey}</b> to record. Release to transcribe.
                        </Text>
                    </div>
                </Group>
            </Card>
        </Stack>
    );
}
