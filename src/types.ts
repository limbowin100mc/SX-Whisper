export interface WordReplacement {
  id: string;
  trigger: string;
  replacement: string;
  enabled: boolean;
}

export interface AppConfig {
  hotkey: string;
  apiKey: string;
  isEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  accentColor: 'green' | 'violet' | 'blue' | 'teal' | 'pink' | 'orange' | 'cyan';
  language: string;
  textFormat: 'none' | 'capitalize' | 'lowercase' | 'uppercase' | 'title';
  wordReplacements: WordReplacement[];
  overlayColor: 'purple' | 'green' | 'red' | 'blue' | 'white' | 'cyan' | 'orange' | 'pink';
  screenshotHotkey: string;
  screenshotSaveDirectory: string;
}

export interface HistoryEntry {
  id: string;
  text: string;
  timestamp: number;
}

export interface AppStats {
  wordsTranscribed: number;
  usageTimeSeconds: number;
  sessionsCount: number;
}

export interface MonitorInfo {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  scaleFactor: number;
}

export interface CaptureSelection {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const DEFAULT_CONFIG: AppConfig = {
  hotkey: 'Control+Shift+Space',
  apiKey: '',
  isEnabled: true,
  theme: 'dark',
  accentColor: 'green',
  language: 'auto',
  textFormat: 'none',
  wordReplacements: [],
  overlayColor: 'purple',
  screenshotHotkey: 'Control+Shift+S',
  screenshotSaveDirectory: '',
};

export const ACCENT_COLORS = [
  { value: 'green', label: 'Green', gradient: { from: 'green', to: 'lime' } },
  { value: 'violet', label: 'Violet', gradient: { from: 'violet', to: 'grape' } },
  { value: 'blue', label: 'Blue', gradient: { from: 'blue', to: 'cyan' } },
  { value: 'teal', label: 'Teal', gradient: { from: 'teal', to: 'lime' } },
  { value: 'pink', label: 'Pink', gradient: { from: 'pink', to: 'grape' } },
  { value: 'orange', label: 'Orange', gradient: { from: 'orange', to: 'yellow' } },
  { value: 'cyan', label: 'Cyan', gradient: { from: 'cyan', to: 'blue' } },
] as const;

// Whisper large-v3 supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'auto', name: 'Auto Detect', flag: '🌐' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'el', name: 'Greek', flag: '🇬🇷' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'fa', name: 'Persian', flag: '🇮🇷' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'cy', name: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { code: 'is', name: 'Icelandic', flag: '🇮🇸' },
  { code: 'lv', name: 'Latvian', flag: '🇱🇻' },
  { code: 'lt', name: 'Lithuanian', flag: '🇱🇹' },
  { code: 'et', name: 'Estonian', flag: '🇪🇪' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenian', flag: '🇸🇮' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
  { code: 'sr', name: 'Serbian', flag: '🇷🇸' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
  { code: 'mk', name: 'Macedonian', flag: '🇲🇰' },
  { code: 'ca', name: 'Catalan', flag: '🇪🇸' },
  { code: 'gl', name: 'Galician', flag: '🇪🇸' },
  { code: 'eu', name: 'Basque', flag: '🇪🇸' },
] as const;

// Group languages by region for better organization
export const LANGUAGE_GROUPS = {
  popular: ['auto', 'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
  european: ['nl', 'sv', 'no', 'da', 'fi', 'el', 'cs', 'ro', 'hu', 'uk', 'pl', 'is', 'lv', 'lt', 'et', 'sk', 'sl', 'hr', 'sr', 'bg', 'mk', 'ca', 'gl', 'eu', 'cy'],
  asian: ['ar', 'hi', 'tr', 'vi', 'th', 'id', 'ms', 'tl', 'he', 'fa', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur'],
  african: ['sw', 'af'],
};

export const TEXT_FORMATS = [
  { value: 'none', label: 'As Spoken', description: 'No formatting changes' },
  { value: 'capitalize', label: 'Capitalize Sentences', description: 'First letter of each sentence uppercase' },
  { value: 'lowercase', label: 'lowercase', description: 'All text in lowercase' },
  { value: 'uppercase', label: 'UPPERCASE', description: 'All text in uppercase' },
  { value: 'title', label: 'Title Case', description: 'Each Word Capitalized' },
] as const;

export const OVERLAY_COLORS = [
  { value: 'purple', label: 'Purple', gradient: 'linear-gradient(to top, #8b5cf6, #c4b5fd)', color: '#8b5cf6' },
  { value: 'green', label: 'Green', gradient: 'linear-gradient(to top, #22c55e, #86efac)', color: '#22c55e' },
  { value: 'red', label: 'Red', gradient: 'linear-gradient(to top, #ef4444, #fca5a5)', color: '#ef4444' },
  { value: 'blue', label: 'Blue', gradient: 'linear-gradient(to top, #3b82f6, #93c5fd)', color: '#3b82f6' },
  { value: 'white', label: 'White', gradient: 'linear-gradient(to top, #e5e5e5, #ffffff)', color: '#ffffff' },
  { value: 'cyan', label: 'Cyan', gradient: 'linear-gradient(to top, #06b6d4, #67e8f9)', color: '#06b6d4' },
  { value: 'orange', label: 'Orange', gradient: 'linear-gradient(to top, #f97316, #fdba74)', color: '#f97316' },
  { value: 'pink', label: 'Pink', gradient: 'linear-gradient(to top, #ec4899, #f9a8d4)', color: '#ec4899' },
] as const;
