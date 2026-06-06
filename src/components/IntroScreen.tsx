import { useState, useEffect } from 'react';
import { Box, Title, Button, Stack, Text } from '@mantine/core';
import { IconMicrophone, IconArrowRight } from '@tabler/icons-react';

interface IntroScreenProps {
  onGetStarted: () => void;
}

export function IntroScreen({ onGetStarted }: IntroScreenProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Add a slight delay for entry animations to pop
    setTimeout(() => setMounted(true), 100);
  }, []);

  // Generate bars for audio visualizer
  const BARS_COUNT = 72;
  const bars = Array.from({ length: BARS_COUNT }).map((_, i) => {
    // Symmetrical mountain-like wave height
    const center = BARS_COUNT / 2;
    const dist = Math.abs(i - center);
    const normalizedDist = dist / center;
    // Tapering height factor
    const scaleFactor = Math.max(0.05, 1 - Math.pow(normalizedDist, 1.5));
    // Random elements to simulate different frequency peaks
    const randomPeak = Math.random() * 0.4 + 0.6; // 0.6 to 1.0
    const delay = (Math.abs(i - center) * 0.05) + (Math.random() * 0.2);

    // We'll alternate between 2 animation durations so the wave looks organic
    const duration = 0.8 + Math.random() * 0.5;

    return {
      index: i,
      maxHeight: `${(30 + scaleFactor * 250) * randomPeak}px`,
      delay: `${delay}s`,
      duration: `${duration}s`,
      isCenter: dist < 12
    };
  });

  return (
    <Box
      style={{
        height: '100vh',
        width: '100vw',
        background: '#050505',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Deep Ambient Background */}
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, #2e0808 0%, #050505 60%)',
          pointerEvents: 'none',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 2s ease-in',
        }}
      />

      {/* Floating Particles (Dust/Sparks) */}
      {[...Array(20)].map((_, i) => (
        <Box
          key={`particle-${i}`}
          style={{
            position: 'absolute',
            width: `${Math.random() * 4 + 1}px`,
            height: `${Math.random() * 4 + 1}px`,
            background: '#ff4d4d',
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            boxShadow: '0 0 10px #ff4d4d',
            opacity: Math.random() * 0.5 + 0.1,
            animation: `float-particle ${5 + Math.random() * 10}s linear infinite`,
            pointerEvents: 'none',
          } as React.CSSProperties}
        />
      ))}

      {/* Cinematic Audio Visualizer */}
      <Box
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          width: '100%',
          zIndex: 1,
          opacity: mounted ? 0.7 : 0,
          transition: 'opacity 1.5s ease-in 0.5s',
        }}
      >
        {bars.map((bar) => (
          <Box
            key={bar.index}
            style={{
              width: bar.isCenter ? '5px' : '4px',
              height: '10px',
              borderRadius: '20px',
              // Premium gradient for the bars
              background: bar.isCenter
                ? 'linear-gradient(180deg, #ff1a1a 0%, #cc0000 100%)'
                : 'linear-gradient(180deg, rgba(255,50,50,0.8) 0%, rgba(150,0,0,0.3) 100%)',
              boxShadow: bar.isCenter ? '0 0 15px rgba(255, 26, 26, 0.5)' : 'none',
              animation: `organic-wave ${bar.duration} ease-in-out infinite alternate`,
              animationDelay: bar.delay,
              '--max-height': bar.maxHeight,
              transformOrigin: 'center',
              willChange: 'height, opacity',
            } as any}
          />
        ))}
      </Box>

      {/* Centerpiece / Main Content */}
      <Stack
        align="center"
        gap={0}
        style={{
          zIndex: 10,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
          transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
        }}
      >
        {/* Icon Wrapper */}
        <Box style={{ position: 'relative', width: 140, height: 140, marginBottom: '2rem' }}>
          {/* Premium Glassmorphism Icon Container */}
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '40px',
              background: 'linear-gradient(145deg, rgba(30,30,30,0.9) 0%, rgba(10,10,10,0.95) 100%)',
              border: '1px solid rgba(255, 60, 60, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 25px 50px rgba(0,0,0,0.8), inset 0 2px 20px rgba(255,100,100,0.05)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Center Red Glow inside the button */}
            <Box
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '40px',
                background: 'radial-gradient(circle at center, rgba(239,68,68,0.25) 0%, transparent 70%)',
              }}
            />
            <IconMicrophone
              size={64}
              color="#ff3333"
              stroke={1.5}
              style={{
                filter: 'drop-shadow(0 0 20px rgba(255, 51, 51, 0.8))',
                transform: 'translateY(-2px)',
              }}
            />
          </Box>
        </Box>

        {/* Dynamic Typography */}
        <Stack align="center" gap={10} mb={40}>
          <Box style={{ position: 'relative' }}>
            <Title
              order={1}
              style={{
                fontSize: '6.5rem',
                fontWeight: 900,
                lineHeight: 1,
                // Animated Shimmer Gradient
                background: 'linear-gradient(-45deg, #ffffff 30%, #ff6b6b 50%, #ffffff 70%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.05em',
                filter: 'drop-shadow(0 10px 30px rgba(255, 0, 0, 0.15))',
                textAlign: 'center',
                animation: 'shimmer 4s linear infinite',
              }}
            >
              SX Whisper
            </Title>

          </Box>
          <Text size="xl" c="dimmed" style={{ letterSpacing: '0.02em', opacity: 0.8 }}>
            Next-Generation Audio AI
          </Text>
        </Stack>

        {/* Next-Level Get Started Button */}
        <Box style={{ position: 'relative' }}>
          {/* Button Outer Glow */}
          <Box
            style={{
              position: 'absolute',
              inset: '-5px',
              background: 'linear-gradient(90deg, #ff0000, #ff4d4d, #990000, #ff0000)',
              backgroundSize: '300% 300%',
              borderRadius: '40px',
              filter: 'blur(15px)',
              zIndex: 0,
              opacity: 0.6,
              animation: 'shimmer 3s ease infinite',
            }}
          />
          <Button
            size="xl"
            radius="xl"
            rightSection={
              <Box className="arrow-icon">
                <IconArrowRight size={24} strokeWidth={2.5} />
              </Box>
            }
            onClick={onGetStarted}
            style={{
              background: 'linear-gradient(90deg, #e60000 0%, #ff3333 100%)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 15px 35px rgba(230, 0, 0, 0.4), inset 0 2px 0 rgba(255,255,255,0.2)',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              fontSize: '1.4rem',
              fontWeight: 800,
              padding: '1.4rem 4.5rem',
              height: 'auto',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#ffffff',
              position: 'relative',
              zIndex: 1,
              overflow: 'hidden',
            }}
            className="get-started-btn"
          >
            {/* Shine effect inside button */}
            <Box className="btn-shine" />
            <Text component="span" style={{ position: 'relative', zIndex: 2 }}>
              Get Started
            </Text>
          </Button>
        </Box>
      </Stack>

      {/* Global & Scoped Styles */}
      <style>{`
        @keyframes organic-wave {
          0% { height: 10px; opacity: 0.15; }
          100% { height: var(--max-height); opacity: 0.9; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; filter: blur(5px); transform: scale(1); }
          50% { opacity: 1; filter: blur(8px); transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float-particle {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-200px) rotate(360deg); opacity: 0; }
        }
        .pulse-ring {
          position: absolute;
          inset: 0;
          border-radius: 40px;
          border: 2px solid #ff3333;
          opacity: 0;
          animation: ring-pulse 4.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        @keyframes ring-pulse {
          0% { transform: scale(0.9); opacity: 0.8; border-width: 2px; }
          70% { transform: scale(2.2); opacity: 0; border-width: 1px; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        
        /* Button specific styles */
        .get-started-btn:hover {
          transform: translateY(-5px) scale(1.03);
          box-shadow: 0 25px 50px rgba(255, 0, 0, 0.5), inset 0 2px 0 rgba(255,255,255,0.4);
          background: linear-gradient(90deg, #ff1a1a 0%, #ff4d4d 100%) !important;
        }
        .get-started-btn:active {
          transform: translateY(2px) scale(0.98);
        }
        .get-started-btn .arrow-icon {
          transition: transform 0.3s ease;
        }
        .get-started-btn:hover .arrow-icon {
          transform: translateX(6px);
        }
        
        .btn-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.3) 50%,
            rgba(255,255,255,0) 100%
          );
          transform: skewX(-20deg);
          animation: shine-sweep 6s infinite;
        }
        @keyframes shine-sweep {
          0%, 80% { left: -100%; }
          100% { left: 200%; }
        }
      `}</style>
    </Box>
  );
}
