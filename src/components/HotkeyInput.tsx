import { useState, useCallback, useRef } from 'react';
import { ActionIcon, Group, Text, Paper } from '@mantine/core';
import { IconKeyboard, IconX } from '@tabler/icons-react';
import { invoke } from '@tauri-apps/api/core';

interface HotkeyInputProps {
  value: string;
  onChange: (hotkey: string) => void;
  label?: string;
  description?: string;
  onCaptureStart?: () => void;
  onCaptureEnd?: () => void;
}

// Map browser key names to Tauri-compatible key names
const keyMap: Record<string, string> = {
  ' ': 'Space',
  'Control': 'Control',
  'Shift': 'Shift',
  'Alt': 'Alt',
  'Meta': 'Super',
  'ArrowUp': 'ArrowUp',
  'ArrowDown': 'ArrowDown',
  'ArrowLeft': 'ArrowLeft',
  'ArrowRight': 'ArrowRight', // Changed from Up/Down/Left/Right to Arrow* for better compatibility
  'Escape': 'Escape',
  'Enter': 'Return',
  'Backspace': 'Backspace',
  'Tab': 'Tab',
  'Delete': 'Delete',
  'Insert': 'Insert',
  'Home': 'Home',
  'End': 'End',
  'PageUp': 'PageUp',
  'PageDown': 'PageDown',
  'CapsLock': 'CapsLock',
  'PrintScreen': 'PrintScreen',
  'ScrollLock': 'ScrollLock',
  'Pause': 'Pause',
  'MediaPlayPause': 'MediaPlayPause',
  'MediaTrackNext': 'MediaNextTrack',
  'MediaTrackPrevious': 'MediaPrevTrack',
  'MediaStop': 'MediaStop',
  'F1': 'F1',
  'F2': 'F2',
  'F3': 'F3',
  'F4': 'F4',
  'F5': 'F5',
  'F6': 'F6',
  'F7': 'F7',
  'F8': 'F8',
  'F9': 'F9',
  'F10': 'F10',
  'F11': 'F11',
  'F12': 'F12',
  'F13': 'F13',
  'F14': 'F14',
  'F15': 'F15',
  'F16': 'F16',
  'F17': 'F17',
  'F18': 'F18',
  'F19': 'F19',
  'F20': 'F20',
  // Punctuation and symbols
  '`': '`',
  '-': '-',
  '=': '=',
  '[': '[',
  ']': ']',
  '\\': '\\',
  ';': ';',
  "'": "'",
  ',': ',',
  '.': '.',
  '/': '/',
  // Numpad
  'NumLock': 'NumLock',
  // Special characters (when shift is held, these are the actual key values)
  '~': '`',
  '!': '1',
  '@': '2',
  '#': '3',
  '$': '4',
  '%': '5',
  '^': '6',
  '&': '7',
  '*': '8',
  '(': '9',
  ')': '0',
  '_': '-',
  '+': '=',
  '{': '[',
  '}': ']',
  '|': '\\',
  ':': ';',
  '"': "'",
  '<': ',',
  '>': '.',
  '?': '/',
};

export function HotkeyInput({ value, onChange, label, description, onCaptureStart, onCaptureEnd }: HotkeyInputProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentKeys, setCurrentKeys] = useState<string[]>([]);
  const isCapturingRef = useRef(false);

  const formatKey = (key: string, code: string): string | null => {
    // Check if it's in our map
    if (keyMap[key]) {
      return keyMap[key];
    }

    // Special case for Numpad - prioritize specific code over generic number
    if (code.startsWith('Numpad')) {
      return code;
    }

    // For letter keys, use uppercase
    if (key.length === 1 && key.match(/[a-zA-Z]/)) {
      return key.toUpperCase();
    }

    // For number keys
    if (key.length === 1 && key.match(/[0-9]/)) {
      return key;
    }

    // For special characters, try to use the code
    if (code.startsWith('Key')) {
      return code.replace('Key', '');
    }

    if (code.startsWith('Digit')) {
      return code.replace('Digit', '');
    }

    // Ignore unknown keys
    return null;
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isCapturing) return;

    e.preventDefault();
    e.stopPropagation();

    const modifiers: string[] = [];
    if (e.ctrlKey) modifiers.push('Control');
    if (e.shiftKey) modifiers.push('Shift');
    if (e.altKey) modifiers.push('Alt');
    if (e.metaKey) modifiers.push('Super');

    const key = e.key;
    const code = e.code;

    // Ignore standalone modifier keys
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
      setCurrentKeys(modifiers);
      return;
    }

    // Format the key
    const formattedKey = formatKey(key, code);
    if (!formattedKey) {
      return; // Ignore unrecognized keys
    }

    // Build the hotkey string
    // Filter duplicates (e.g. if Shift is held and we parsed a Shift-modified char)
    const hotkeyParts = [...new Set([...modifiers, formattedKey])];
    const hotkey = hotkeyParts.join('+');

    setCurrentKeys(hotkeyParts);
    isCapturingRef.current = false;
    setIsCapturing(false);
    setCurrentKeys([]);
    onCaptureEnd?.();
    onChange(hotkey);
    // Re-register the new hotkey after a short delay to let the state update
    setTimeout(() => {
      invoke('register_hotkey', { hotkey }).catch(console.error);
    }, 100);
  }, [isCapturing, onChange, onCaptureEnd]);

  const handleKeyUp = useCallback(() => {
    if (!isCapturing) return;
    setCurrentKeys([]);
  }, [isCapturing]);

  const startCapture = async () => {
    // FIRST unregister the hotkey before entering capture mode
    try {
      await invoke('register_hotkey', { hotkey: '' });
    } catch (e) {
      console.error('Failed to unregister hotkey:', e);
    }
    isCapturingRef.current = true;
    setIsCapturing(true);
    setCurrentKeys([]);
    onCaptureStart?.();
  };

  const cancelCapture = () => {
    isCapturingRef.current = false;
    setIsCapturing(false);
    setCurrentKeys([]);
    onCaptureEnd?.();
    // Re-register the previous hotkey when canceling
    if (value) {
      invoke('register_hotkey', { hotkey: value }).catch(console.error);
    }
  };

  const displayValue = isCapturing
    ? (currentKeys.length > 0 ? currentKeys.join(' + ') : 'Press keys...')
    : value || 'Not set';

  // Check if single key (no modifiers)
  const isSingleKey = value && !value.includes('+');

  return (
    <div>
      {label && <Text size="sm" fw={500} mb={4}>{label}</Text>}
      {description && <Text size="xs" c="dimmed" mb={8}>{description}</Text>}

      <Paper
        p="sm"
        withBorder
        style={{
          cursor: 'pointer',
          backgroundColor: isCapturing ? 'var(--mantine-color-violet-light)' : undefined,
          borderColor: isCapturing ? 'var(--mantine-color-violet-filled)' : undefined,
          position: 'relative'
        }}
        onClick={startCapture}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        tabIndex={0}
      >
        <Group justify="space-between">
          <Group gap="xs">
            <IconKeyboard size={18} />
            <Text size="sm" fw={isCapturing ? 600 : 400}>
              {displayValue}
            </Text>
          </Group>
          {isCapturing && (
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                cancelCapture();
              }}
            >
              <IconX size={14} />
            </ActionIcon>
          )}
        </Group>
      </Paper>

      {isSingleKey && !isCapturing && (
        <Text size="xs" c="orange" mt={4}>
          Warning: Single-key shortcuts may block normal typing in other apps.
        </Text>
      )}

      {isCapturing && (
        <Text size="xs" c="dimmed" mt={4}>
          Press any key combination. Single keys are allowed but use with caution.
        </Text>
      )}
    </div>
  );
}
