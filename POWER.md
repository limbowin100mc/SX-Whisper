# SX Whisper - Voice-to-Text Transcription Power

A powerful desktop application for real-time voice transcription using Whisper AI, built with Tauri and React.

## Overview

SX Whisper is a cross-platform desktop application that provides fast, accurate voice-to-text transcription. It features a modern glass-morphism UI, global hotkey support, and automatic text pasting capabilities.

## Features

- **Real-time Voice Transcription**: Record audio and get instant transcription using Whisper AI
- **Global Hotkeys**: Trigger recording from anywhere with customizable keyboard shortcuts
- **Auto-paste**: Automatically paste transcribed text into your active application
- **History Management**: Keep track of all your transcriptions with timestamps
- **Custom Themes**: Multiple glass-effect themes to personalize your experience
- **Word Replacement**: Configure custom word replacements for better accuracy
- **Statistics**: Track your usage with detailed statistics
- **System Tray Integration**: Minimize to tray for quick access

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Mantine UI** - Modern component library
- **Vite** - Fast build tool
- **Tabler Icons** - Beautiful icon set

### Backend
- **Tauri 2.0** - Rust-based desktop framework
- **Rust** - High-performance backend
- Audio recording with native OS integration
- File system operations
- Global shortcut handling

## Project Structure

```
sx-whisper/
├── src/                          # React frontend
│   ├── components/              # UI components
│   │   ├── HomePanel.tsx       # Main recording interface
│   │   ├── HistoryPanel.tsx    # Transcription history
│   │   ├── SettingsPanel.tsx   # App settings
│   │   ├── ThemesPanel.tsx     # Theme customization
│   │   ├── AboutPanel.tsx      # About information
│   │   └── IntroScreen.tsx     # Welcome screen
│   ├── hooks/                   # React hooks
│   │   ├── useRecording.ts     # Recording logic
│   │   ├── useHistory.ts       # History management
│   │   ├── useConfig.ts        # Configuration
│   │   └── useStats.ts         # Statistics
│   ├── App.tsx                  # Main app component
│   └── main.tsx                 # Entry point
├── src-tauri/                   # Rust backend
│   ├── src/
│   │   ├── main.rs             # Tauri entry point
│   │   ├── lib.rs              # Library exports
│   │   ├── audio.rs            # Audio recording
│   │   ├── transcription.rs    # Whisper integration
│   │   ├── config.rs           # Configuration management
│   │   └── paster.rs           # Auto-paste functionality
│   ├── Cargo.toml              # Rust dependencies
│   └── tauri.conf.json         # Tauri configuration
└── package.json                 # Node dependencies

```

## Development

### Prerequisites
- Node.js 18+
- Rust 1.70+
- npm or yarn

### Setup
```bash
cd sx-whisper
npm install
```

### Run Development Server
```bash
npm run tauri dev
```

### Build Production
```bash
npm run tauri build
```

The built installers will be in:
- `src-tauri/target/release/bundle/nsis/SX Whisper_0.1.0_x64-setup.exe` (NSIS installer)
- `src-tauri/target/release/bundle/msi/SX Whisper_0.1.0_x64_en-US.msi` (MSI installer)

## Configuration

The app stores configuration in:
- **Windows**: `%APPDATA%\com.sxset.sx-whisper\`
- **macOS**: `~/Library/Application Support/com.sxset.sx-whisper/`
- **Linux**: `~/.config/com.sxset.sx-whisper/`

### Settings Include:
- API keys for transcription services
- Global hotkey bindings
- Word replacement rules
- Theme preferences
- Auto-paste settings

## Key Components

### Recording Flow
1. User triggers recording via hotkey or UI button
2. Audio is captured using native OS APIs
3. Audio file is saved temporarily
4. File is sent to Whisper API for transcription
5. Transcribed text is displayed and optionally auto-pasted
6. Recording is saved to history

### Tauri Commands
- `start_recording()` - Begin audio capture
- `stop_recording()` - End capture and return file path
- `transcribe_audio(path)` - Send audio to Whisper API
- `paste_text(text)` - Auto-paste to active window
- `save_config(config)` - Persist settings
- `load_config()` - Load saved settings

## Building for Distribution

### Windows
```bash
npm run tauri build
```
Creates both NSIS (.exe) and MSI installers

### macOS
```bash
npm run tauri build -- --target universal-apple-darwin
```
Creates .dmg and .app bundle

### Linux
```bash
npm run tauri build
```
Creates .deb and .AppImage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Version

Current Version: 0.1.0

## Keywords

voice-to-text, transcription, whisper, tauri, rust, react, desktop-app, speech-recognition, audio-recording
