# 🎙️ SX Whisper

**Push-to-talk voice transcription for your desktop**

SX Whisper is a powerful desktop application that lets you transcribe speech to text instantly using a global hotkey. Hold down your configured key, speak naturally, and watch your words appear wherever your cursor is.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **🎯 Global Hotkey**: Press and hold a customizable hotkey (default: `Ctrl+Shift+Space`) to record
- **⚡ Instant Transcription**: Powered by Groq's Whisper API for fast, accurate transcription
- **🌍 100+ Languages**: Auto-detect or choose from 50+ supported languages
- **📋 Auto-Paste**: Transcribed text is automatically pasted where your cursor is
- **🎨 Beautiful UI**: Modern, dark-themed interface with customizable accent colors
- **📊 History & Stats**: Track your transcriptions and usage statistics
- **🔄 Text Formatting**: Capitalize, lowercase, uppercase, or title case
- **✏️ Word Replacements**: Create custom word/phrase replacements
- **🎭 Visual Overlay**: See a recording indicator while you speak
- **🌙 System Tray**: Runs quietly in the background
- **🔒 Privacy-Focused**: Your API key stays on your device

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Rust** (latest stable version)
- **Groq API Key** (free at [console.groq.com](https://console.groq.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/limbowin100mc/SX-Whisper.git
   cd SX-Whisper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run tauri dev
   ```

4. **Build for production**
   ```bash
   npm run tauri build
   ```

## 🎮 How to Use

1. **Launch SX Whisper** - The app will start in your system tray
2. **Configure API Key** - Go to Settings and enter your Groq API key
3. **Set Your Hotkey** - Choose your preferred recording hotkey (default: `Ctrl+Shift+Space`)
4. **Start Recording** - Hold down the hotkey and speak
5. **Release to Transcribe** - Let go of the key to transcribe and auto-paste

## ⚙️ Configuration

### Settings Panel

- **API Key**: Your Groq API key for transcription
- **Hotkey**: Customize your recording shortcut
- **Language**: Choose from 50+ languages or use auto-detect
- **Text Format**: Apply formatting to transcribed text
  - As Spoken (no changes)
  - Capitalize Sentences
  - lowercase
  - UPPERCASE
  - Title Case
- **Word Replacements**: Create custom text replacements
- **Enable/Disable**: Toggle the app on/off

### Themes Panel

- **Theme**: Light, Dark, or Auto (follows system)
- **Accent Color**: Choose from 7 color schemes
  - Green, Violet, Blue, Teal, Pink, Orange, Cyan
- **Overlay Color**: Customize the recording indicator

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Mantine UI** - Component library
- **Vite** - Build tool

### Backend
- **Tauri 2.0** - Desktop framework
- **Rust** - Backend logic
- **cpal** - Cross-platform audio recording
- **hound** - WAV encoding
- **reqwest** - HTTP client for API calls
- **arboard** - Clipboard management
- **enigo** - Keyboard simulation

### API
- **Groq Whisper API** - Speech-to-text transcription
- **Model**: whisper-large-v3-turbo

## 📁 Project Structure

```
sx-whisper/
├── src/                      # React frontend
│   ├── components/          # UI components
│   │   ├── HomePanel.tsx
│   │   ├── SettingsPanel.tsx
│   │   ├── HistoryPanel.tsx
│   │   ├── ThemesPanel.tsx
│   │   └── AboutPanel.tsx
│   ├── hooks/               # React hooks
│   │   ├── useConfig.ts
│   │   ├── useRecording.ts
│   │   ├── useHistory.ts
│   │   └── useStats.ts
│   ├── App.tsx              # Main app component
│   ├── types.ts             # TypeScript types
│   └── styles.css           # Global styles
├── src-tauri/               # Rust backend
│   ├── src/
│   │   ├── main.rs          # Entry point
│   │   ├── lib.rs           # Core logic
│   │   ├── audio.rs         # Audio recording
│   │   ├── transcription.rs # API integration
│   │   ├── paster.rs        # Text pasting
│   │   └── config.rs        # Configuration
│   ├── Cargo.toml           # Rust dependencies
│   └── tauri.conf.json      # Tauri configuration
├── public/                  # Static assets
│   ├── overlay.html         # Recording overlay
│   └── app-icon.png
└── package.json             # Node dependencies
```

## 🌍 Supported Languages

Auto-detect or choose from 50+ languages including:

**Popular**: English, Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese, Arabic, Hindi

**European**: Dutch, Swedish, Norwegian, Danish, Finnish, Greek, Czech, Romanian, Hungarian, Ukrainian, Polish, and more

**Asian**: Turkish, Vietnamese, Thai, Indonesian, Malay, Filipino, Hebrew, Persian, Bengali, Tamil, Telugu, and more

**African**: Swahili, Afrikaans

## 📊 Features in Detail

### Audio Recording
- Records from default microphone
- Automatic resampling to 16kHz
- Mono channel conversion
- WAV format encoding
- Silence detection

### Transcription
- Groq Whisper API integration
- Fast turnaround (1-3 seconds)
- High accuracy (97%+)
- Language auto-detection
- Error handling and retry logic

### Text Processing
- Auto-formatting options
- Custom word replacements
- Filler word removal (via API)
- Context-aware editing

### User Interface
- Collapsible sidebar navigation
- Real-time recording status
- Transcription history
- Usage statistics
- Notification system
- Dark/Light themes

## 🔐 Privacy & Security

- **Local Storage**: API key and settings stored locally
- **No Data Collection**: We don't collect or store your transcriptions
- **Secure API**: HTTPS communication with Groq
- **Open Source**: Full transparency - review the code yourself

## 🐛 Troubleshooting

### Hotkey Not Working
- Check if another app is using the same hotkey
- Try a different key combination
- Restart the application

### No Audio Detected
- Check microphone permissions
- Ensure default microphone is set correctly
- Test microphone in system settings

### Transcription Errors
- Verify API key is correct
- Check internet connection
- Ensure audio is clear and not too short (>0.3 seconds)

### App Won't Start
- Update to latest Node.js and Rust
- Delete `node_modules` and reinstall
- Check system requirements

## 🚧 Roadmap

- [ ] iOS keyboard extension
- [ ] Android support
- [ ] Custom model support
- [ ] Offline mode (local Whisper)
- [ ] Multi-language mixing
- [ ] Voice commands
- [ ] Cloud sync
- [ ] Team features

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**sxseth**
- GitHub: [@limbowin100mc](https://github.com/limbowin100mc)
- Email: sxsethlimbob@outlook.com

## 🙏 Acknowledgments

- [Groq](https://groq.com) - For the amazing Whisper API
- [Tauri](https://tauri.app) - For the excellent desktop framework
- [OpenAI](https://openai.com) - For the original Whisper model
- [Mantine](https://mantine.dev) - For the beautiful UI components

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on [GitHub](https://github.com/limbowin100mc/SX-Whisper/issues)
- Email: sxsethlimbob@outlook.com

---

**Made with ❤️ by sxseth**

⭐ Star this repo if you find it useful!
