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
    ThemeIcon,
} from '@mantine/core';
import {
    IconKeyboard,
    IconFileText,
    IconClock,
    IconStack2,
    IconBolt,
    IconShieldCheck,
    IconWifi,
    IconMicrophone,
    IconPlayerPlay,
    IconPlayerPause,
} from '@tabler/icons-react';
import { AppConfig, SUPPORTED_LANGUAGES } from '../types';
import { useStats } from '../hooks/useStats';
import '../styles/glass-effects.css';

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
        <Stack gap="xl">
            {/* Hero Status Card */}
            <Paper
                p={0}
                radius="xl"
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
            >
                {/* Status Indicator Bar */}
                <Box
                    style={{
                        height: 4,
                        width: '100%',
                        background: config.isEnabled
                            ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                            : '#333'
                    }}
                />

                <Group justify="space-between" align="stretch" gap={0} wrap="nowrap">
                    {/* Left Side: Status & toggle */}
                    <Box p={30} style={{ flex: 1, position: 'relative' }}>
                        {/* Background Ambient Glow */}
                        {config.isEnabled && (
                            <Box
                                style={{
                                    position: 'absolute',
                                    top: -60,
                                    left: -60,
                                    width: 200,
                                    height: 200,
                                    background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)',
                                    filter: 'blur(40px)',
                                    pointerEvents: 'none',
                                }}
                            />
                        )}

                        <Stack gap="lg" style={{ position: 'relative', zIndex: 1 }}>
                            <Group align="flex-start" justify="space-between">
                                <Group gap="lg">
                                    <ThemeIcon
                                        size={56}
                                        radius="md"
                                        variant="gradient"
                                        gradient={config.isEnabled
                                            ? { from: '#1c1c1c', to: '#111', deg: 145 }
                                            : { from: '#222', to: '#222', deg: 0 }
                                        }
                                        style={{
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            boxShadow: config.isEnabled ? '0 4px 20px rgba(0,0,0,0.3)' : 'none'
                                        }}
                                    >
                                        <IconMicrophone
                                            size={28}
                                            color={config.isEnabled ? "#ef4444" : "#666"}
                                            style={{ filter: config.isEnabled ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.4))' : undefined }}
                                        />
                                    </ThemeIcon>
                                    <div>
                                        <Text size="lg" fw={700} c="white" mb={2}>
                                            {config.isEnabled ? 'System Active' : 'System Paused'}
                                        </Text>
                                        <Text size="sm" c="dimmed">
                                            {config.isEnabled ? 'Ready to transcribe audio' : 'Enable to start transcribing'}
                                        </Text>
                                    </div>
                                </Group>

                                <Switch
                                    checked={config.isEnabled}
                                    onChange={(e) => updateConfig('isEnabled', e.currentTarget.checked)}
                                    size="lg"
                                    color="green"
                                    thumbIcon={
                                        config.isEnabled ? (
                                            <IconPlayerPlay size="0.8rem" color="#16a34a" stroke={3} />
                                        ) : (
                                            <IconPlayerPause size="0.8rem" color="#666" stroke={3} />
                                        )
                                    }
                                />
                            </Group>

                            {config.isEnabled && (
                                <Group gap="xs" mt={4}>
                                    <Badge
                                        size="lg"
                                        variant="dot"
                                        color={isRecording ? 'red' : 'green'}
                                        radius="md"
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                                    >
                                        {isRecording ? 'Recording...' : 'Standby'}
                                    </Badge>
                                    <Badge
                                        size="lg"
                                        variant="outline"
                                        color="gray"
                                        radius="md"
                                        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                                    >
                                        {currentLanguage.flag} {currentLanguage.name}
                                    </Badge>
                                    <Badge
                                        size="lg"
                                        variant="outline"
                                        color="gray"
                                        radius="md"
                                        leftSection={<IconKeyboard size={12} />}
                                        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                                    >
                                        {config.hotkey || 'None'}
                                    </Badge>
                                </Group>
                            )}
                        </Stack>
                    </Box>
                </Group>
            </Paper>

            <SimpleGrid cols={3} spacing="lg">
                <Stack gap="lg">
                    <Title order={4} c="dimmed" size="sm" tt="uppercase" fw={700} style={{ letterSpacing: '0.05em' }}>Activity Stats</Title>
                    <Card
                        radius="lg"
                        p="xl"
                        style={{
                            background: 'linear-gradient(180deg, #151515 0%, #0a0a0a 100%)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            height: '100%',
                        }}
                    >
                        <Stack justify="space-between" h="100%">
                            <Group justify="space-between">
                                <ThemeIcon size="lg" radius="md" variant="light" color="blue" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                                    <IconFileText size={18} />
                                </ThemeIcon>
                                <Badge variant="outline" color="gray" size="sm">Total</Badge>
                            </Group>
                            <div>
                                <Text size="3rem" fw={800} lh={1} c="white" style={{ letterSpacing: '-0.02em' }}>
                                    {stats.wordsTranscribed}
                                </Text>
                                <Text size="sm" c="dimmed" mt={4} fw={500}>Words Transcribed</Text>
                            </div>
                        </Stack>
                    </Card>
                </Stack>

                <Stack gap="lg" style={{ gridColumn: 'span 2' }}>
                    <Title order={4} c="dimmed" size="sm" tt="uppercase" fw={700} style={{ letterSpacing: '0.05em' }}>Session Overview</Title>
                    <SimpleGrid cols={2} spacing="lg">
                        <Card
                            radius="lg"
                            p="xl"
                            style={{
                                background: 'linear-gradient(180deg, #151515 0%, #0a0a0a 100%)',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}
                        >
                            <Stack>
                                <Group justify="space-between">
                                    <ThemeIcon size="lg" radius="md" variant="light" color="orange" style={{ background: 'rgba(249, 115, 22, 0.1)' }}>
                                        <IconClock size={18} />
                                    </ThemeIcon>
                                </Group>
                                <div>
                                    <Text size="2rem" fw={700} c="white">{formatDuration(stats.usageTimeSeconds)}</Text>
                                    <Text size="sm" c="dimmed" fw={500}>Active Time</Text>
                                </div>
                            </Stack>
                        </Card>
                        <Card
                            radius="lg"
                            p="xl"
                            style={{
                                background: 'linear-gradient(180deg, #151515 0%, #0a0a0a 100%)',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}
                        >
                            <Stack>
                                <Group justify="space-between">
                                    <ThemeIcon size="lg" radius="md" variant="light" color="grape" style={{ background: 'rgba(147, 51, 234, 0.1)' }}>
                                        <IconStack2 size={18} />
                                    </ThemeIcon>
                                </Group>
                                <div>
                                    <Text size="2rem" fw={700} c="white">{stats.sessionsCount}</Text>
                                    <Text size="sm" c="dimmed" fw={500}>Total Sessions</Text>
                                </div>
                            </Stack>
                        </Card>
                    </SimpleGrid>
                </Stack>
            </SimpleGrid>

            <Stack gap="lg">
                <Title order={4} c="dimmed" size="sm" tt="uppercase" fw={700} style={{ letterSpacing: '0.05em' }}>System Capabilities</Title>
                <SimpleGrid cols={3} spacing="lg">
                    {[
                        { icon: IconBolt, color: 'yellow', label: 'Ultra Low Latency', sub: '< 500ms response time' },
                        { icon: IconShieldCheck, color: 'green', label: 'Local Encrypted', sub: 'Zero data retention' },
                        { icon: IconWifi, color: 'cyan', label: 'Whisper Powered', sub: '99% accuracy model' }
                    ].map((feature, i) => (
                        <Card
                            key={i}
                            radius="lg"
                            p="md"
                            style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px'
                            }}
                        >
                            <ThemeIcon
                                size="lg"
                                radius="md"
                                variant="light"
                                color={feature.color}
                                style={{ background: `var(--mantine-color-${feature.color}-9)`, opacity: 0.8 }}
                            >
                                <feature.icon size={18} />
                            </ThemeIcon>
                            <div>
                                <Text size="sm" fw={600} c="white">{feature.label}</Text>
                                <Text size="xs" c="dimmed">{feature.sub}</Text>
                            </div>
                        </Card>
                    ))}
                </SimpleGrid>
            </Stack>
        </Stack>
    );
}
