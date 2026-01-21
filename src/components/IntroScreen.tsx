import { useState, useEffect } from 'react';
import { Box, Title, Button, Stack, Text } from '@mantine/core';
import { IconMicrophone, IconArrowRight } from '@tabler/icons-react';

interface IntroScreenProps {
  onGetStarted: () => void;
}

export function IntroScreen({ onGetStarted }: IntroScreenProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Box
      style={{
        height: '100vh',
        width: '100vw',
        background: '#030303',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Deep Glow - Vignette */}
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, #1a0505 0%, #030303 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* High-Fidelity Audio Visualizer */}
      <Box
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px', // Increased gap slightly
          height: '500px', // Container height
          width: '100%',
          zIndex: 1,
          opacity: 0.6,
        }}
      >
        {[...Array(64)].map((_, i) => {
          // Mirrored index calculations for symmetrical wave
          const center = 32;
          const dist = Math.abs(i - center);
          const normalizedDist = dist / center;

          // Taper height towards edges so it doesn't look like a block
          const scaleFactor = Math.max(0.1, 1 - Math.pow(normalizedDist, 2));

          return (
            <Box
              key={i}
              style={{
                width: '6px',
                // Base height is small, animation scales it up
                height: '40px',
                background: `linear-gradient(to bottom, transparent 0%, #ef4444 40%, #ef4444 60%, transparent 100%)`, // Improved gradient
                borderRadius: '100px',
                // Randomize animation duration for organic feel
                animation: `flow ${1 + Math.random() * 0.5}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.05}s`, // Staggered delay for wave effect
                // Custom property for the animation to read
                '--target-height': `${60 + scaleFactor * 300}px`,
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)',
              } as any}
            />
          );
        })}
      </Box>

      {/* Main Content */}
      <Stack
        align="center"
        gap={40}
        style={{
          zIndex: 10,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
          position: 'relative',
        }}
      >
        {/* Floating Icon Container */}
        <Box
          style={{
            width: 120,
            height: 120,
            borderRadius: '35px',
            background: 'linear-gradient(135deg, #1f1f1f 0%, #111 100%)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `
              0 20px 40px rgba(0, 0, 0, 0.6),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
            position: 'relative',
            marginBottom: '2rem',
          }}
        >
          {/* Inner Red Glow for Icon */}
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '35px',
              background: 'radial-gradient(circle at center, rgba(239,68,68,0.2) 0%, transparent 70%)',
            }}
          />
          <IconMicrophone
            size={56}
            color="#ef4444"
            style={{
              filter: 'drop-shadow(0 0 15px rgba(239, 68, 68, 0.5))',
            }}
          />
        </Box>

        {/* Big Bold Gradient Text */}
        <Title
          order={1}
          style={{
            fontSize: '6rem',
            fontWeight: 900,
            lineHeight: 1,
            // Premium Red-White Gradient
            background: 'linear-gradient(to right bottom, #ffffff 30%, #ef4444 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.04em',
            filter: 'drop-shadow(0 0 40px rgba(239, 68, 68, 0.2))',
            textAlign: 'center',
          }}
        >
          SX Whisper
        </Title>

        {/* Get Started Button - Prominent */}
        <Button
          size="xl"
          radius="xl"
          rightSection={<IconArrowRight size={22} strokeWidth={2.5} />}
          onClick={onGetStarted}
          style={{
            background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
            border: 'none',
            boxShadow: '0 10px 40px rgba(239, 68, 68, 0.4), inset 0 2px 0 rgba(255,255,255,0.2)',
            transition: 'all 0.3s ease',
            fontSize: '1.3rem',
            fontWeight: 700,
            padding: '1.2rem 4rem',
            height: 'auto',
            letterSpacing: '0.02em',
            marginTop: '1rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 20px 50px rgba(239, 68, 68, 0.6), inset 0 2px 0 rgba(255,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 40px rgba(239, 68, 68, 0.4), inset 0 2px 0 rgba(255,255,255,0.2)';
          }}
        >
          Get Started
        </Button>

        {/* Version */}
        <Text
          size="xs"
          c="dimmed"
          style={{
            marginTop: '3rem',
            letterSpacing: '0.2em',
            opacity: 0.5,
            fontWeight: 500,
            textTransform: 'uppercase',
          }}
        >
          Version 0.1.0
        </Text>
      </Stack>

      <style>{`
        @keyframes flow {
          0% { height: 40px; opacity: 0.3; }
          100% { height: var(--target-height); opacity: 0.8; }
        }
      `}</style>
    </Box>
  );
}
