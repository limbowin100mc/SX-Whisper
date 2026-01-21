mod audio;
mod config;
mod paster;
mod transcription;

use audio::AudioRecorder;
use config::{AppConfig, HistoryEntry};
use paster::TextPaster;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use std::time::Instant;
use tauri::{
    Emitter, Manager, PhysicalPosition, WebviewUrl, WebviewWindow, WebviewWindowBuilder,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};
use transcription::{TranscriptionService, format_text, apply_replacements};

const DATA_FILENAME: &str = "sx_whisper_data.json";

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct AppStats {
    words_transcribed: usize,
    usage_time_seconds: u64,
    sessions_count: usize,
}

#[derive(Debug, Serialize, Deserialize, Default)]
struct PersistentData {
    history: Vec<HistoryEntry>,
    stats: AppStats,
}

struct AppState {
    config: Mutex<AppConfig>,
    history: Mutex<Vec<HistoryEntry>>,
    stats: Mutex<AppStats>,
    recorder: Mutex<AudioRecorder>,
    recording_start: Mutex<Option<Instant>>,
}

impl AppState {
    fn new(recorder: AudioRecorder) -> Self {
        Self {
            config: Mutex::new(AppConfig::default()),
            history: Mutex::new(Vec::new()),
            stats: Mutex::new(AppStats::default()),
            recorder: Mutex::new(recorder),
            recording_start: Mutex::new(None),
        }
    }
}

fn get_data_path(app: &tauri::AppHandle) -> Option<PathBuf> {
    app.path()
        .app_data_dir()
        .ok()
        .map(|d| d.join(DATA_FILENAME))
}

fn save_data(app: &tauri::AppHandle) {
    let state = app.state::<AppState>();
    let history = state.history.lock().unwrap();
    let stats = state.stats.lock().unwrap();

    let data = PersistentData {
        history: history.clone(),
        stats: stats.clone(),
    };

    if let Some(path) = get_data_path(app) {
        if let Some(parent) = path.parent() {
            let _ = fs::create_dir_all(parent);
        }
        if let Ok(json) = serde_json::to_string_pretty(&data) {
            let _ = fs::write(path, json);
        }
    }
}

fn load_data(app: &tauri::AppHandle) {
    if let Some(path) = get_data_path(app) {
        if let Ok(content) = fs::read_to_string(path) {
            if let Ok(data) = serde_json::from_str::<PersistentData>(&content) {
                let state = app.state::<AppState>();
                *state.history.lock().unwrap() = data.history;
                *state.stats.lock().unwrap() = data.stats;
            }
        }
    }
}

fn position_overlay(window: &WebviewWindow) {
    let monitor = if let Ok(cursor) = window.cursor_position() {
        window.available_monitors()
            .unwrap_or_default()
            .into_iter()
            .find(|m| {
                let pos = m.position();
                let size = m.size();
                cursor.x >= pos.x as f64
                    && cursor.x < (pos.x as f64 + size.width as f64)
                    && cursor.y >= pos.y as f64
                    && cursor.y < (pos.y as f64 + size.height as f64)
            })
    } else {
        None
    };

    let target_monitor = monitor.or_else(|| window.primary_monitor().ok().flatten());

    if let Some(monitor) = target_monitor {
        let screen_size = monitor.size();
        let screen_pos = monitor.position();
        let scale_factor = monitor.scale_factor();

        let x = screen_pos.x + (screen_size.width as i32 - 120) / 2;
        let y = screen_pos.y + screen_size.height as i32 - (100.0 * scale_factor) as i32;
        let _ = window.set_position(PhysicalPosition::new(x, y));
    }
}

fn show_overlay(app: &tauri::AppHandle) {
    if let Some(overlay) = app.get_webview_window("overlay") {
        position_overlay(&overlay);
        let _ = overlay.show();
        return;
    }

    let url = if cfg!(debug_assertions) {
        WebviewUrl::External("http://localhost:1420/overlay.html".parse().unwrap())
    } else {
        WebviewUrl::App("overlay.html".into())
    };

    let overlay = WebviewWindowBuilder::new(app, "overlay", url)
        .title("")
        .inner_size(120.0, 60.0)
        .decorations(false)
        .transparent(true)
        .always_on_top(true)
        .skip_taskbar(true)
        .resizable(false)
        .shadow(false)
        .visible(false)
        .focused(false)
        .build();

    if let Ok(overlay) = overlay {
        position_overlay(&overlay);
        let _ = overlay.show();
    }
}

fn hide_overlay(app: &tauri::AppHandle) {
    if let Some(overlay) = app.get_webview_window("overlay") {
        let _ = overlay.hide();
    }
}

fn show_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
        let _ = window.unminimize();
    }
}

#[allow(dead_code)]
fn hide_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.hide();
    }
}

#[tauri::command]
fn get_config(state: tauri::State<AppState>) -> AppConfig {
    state.config.lock().unwrap().clone()
}

#[tauri::command]
fn set_config(state: tauri::State<AppState>, config: AppConfig) {
    *state.config.lock().unwrap() = config;
}

#[tauri::command]
fn get_history(state: tauri::State<AppState>) -> Vec<HistoryEntry> {
    state.history.lock().unwrap().clone()
}

#[tauri::command]
fn get_stats(state: tauri::State<AppState>) -> AppStats {
    state.stats.lock().unwrap().clone()
}

#[tauri::command]
fn clear_history(app: tauri::AppHandle, state: tauri::State<AppState>) {
    state.history.lock().unwrap().clear();
    save_data(&app);
}

#[tauri::command]
fn add_history_entry(app: tauri::AppHandle, state: tauri::State<AppState>, text: String) -> HistoryEntry {
    let entry = HistoryEntry::new(text);
    let mut history = state.history.lock().unwrap();
    history.insert(0, entry.clone());
    if history.len() > 100 {
        history.truncate(100);
    }
    drop(history);
    save_data(&app);
    entry
}

#[tauri::command]
fn copy_to_clipboard(text: String) -> Result<(), String> {
    let mut clipboard =
        arboard::Clipboard::new().map_err(|e| format!("Failed to access clipboard: {}", e))?;
    clipboard
        .set_text(&text)
        .map_err(|e| format!("Failed to copy: {}", e))?;
    Ok(())
}

fn start_recording_internal(app: &tauri::AppHandle) -> Result<(), String> {
    let state = app.state::<AppState>();
    let mut recording_start = state.recording_start.lock().unwrap();
    
    if recording_start.is_some() {
        return Ok(());
    }

    let recorder = state.recorder.lock().unwrap();
    recorder.start_recording()?;
    *recording_start = Some(Instant::now());

    Ok(())
}

async fn stop_and_transcribe_internal(app: &tauri::AppHandle) -> Result<String, String> {
    let state = app.state::<AppState>();

    let (audio_data, duration) = {
        let recorder = state.recorder.lock().unwrap();
        let mut recording_start = state.recording_start.lock().unwrap();

        if recording_start.is_none() {
            return Err("Not recording".to_string());
        }

        let start_time = recording_start.take().unwrap();
        let duration = start_time.elapsed();
        let data = recorder.stop_recording()?;
        (data, duration)
    };

    let (api_key, language, text_format, replacements) = {
        let config = state.config.lock().unwrap();
        let replacements: Vec<(String, String)> = config.word_replacements
            .iter()
            .filter(|r| r.enabled)
            .map(|r| (r.trigger.clone(), r.replacement.clone()))
            .collect();
        (
            config.api_key.clone(),
            config.language.clone(),
            config.text_format.clone(),
            replacements,
        )
    };

    if api_key.is_empty() {
        return Err("API key not configured".to_string());
    }

    let service = TranscriptionService::new(api_key);
    
    // Pass language to transcription (None for auto-detect)
    let lang_option = if language == "auto" { None } else { Some(language) };
    let mut text = service.transcribe(audio_data, lang_option).await?;

    // Apply text formatting
    text = format_text(&text, &text_format);
    
    // Apply word replacements
    if !replacements.is_empty() {
        text = apply_replacements(&text, &replacements);
    }

    let mut paster = TextPaster::new()?;
    if let Err(e) = paster.paste_text(&text) {
        println!("Failed to paste text: {}", e);
    }

    {
        let mut history = state.history.lock().unwrap();
        let mut stats = state.stats.lock().unwrap();
        
        stats.usage_time_seconds += duration.as_secs();
        let word_count = text.split_whitespace().count();
        stats.words_transcribed += word_count;
        
        let entry = HistoryEntry::new(text.clone());
        history.insert(0, entry);
        if history.len() > 100 {
            history.truncate(100);
        }
    }

    save_data(app);

    Ok(text)
}

#[tauri::command]
fn start_recording(app: tauri::AppHandle) -> Result<(), String> {
    start_recording_internal(&app)
}

#[tauri::command]
async fn stop_recording_and_transcribe(app: tauri::AppHandle) -> Result<String, String> {
    let result = stop_and_transcribe_internal(&app).await;
    if let Ok(ref text) = result {
        let _ = app.emit("transcription_complete", text);
    }
    result
}

#[tauri::command]
fn get_recording_state(state: tauri::State<AppState>) -> bool {
    state.recording_start.lock().unwrap().is_some()
}

#[tauri::command]
async fn register_hotkey(app: tauri::AppHandle, hotkey: String) -> Result<(), String> {
    let _ = app.global_shortcut().unregister_all();

    if hotkey.is_empty() {
        return Ok(());
    }

    let shortcut: Shortcut = hotkey
        .parse()
        .map_err(|e| format!("Invalid hotkey format: {}", e))?;

    app.global_shortcut()
        .on_shortcut(shortcut, move |app, _shortcut, event| {
            let state = app.state::<AppState>();
            let config = state.config.lock().unwrap();

            if !config.is_enabled {
                return;
            }
            drop(config);

            match event.state() {
                ShortcutState::Pressed => {
                    show_overlay(app);
                    let _ = app.emit("recording_state", true);
                    if let Err(e) = start_recording_internal(app) {
                        let _ = app.emit("error", e);
                        hide_overlay(app);
                    }
                }
                ShortcutState::Released => {
                    hide_overlay(app);
                    let _ = app.emit("recording_state", false);
                    let app_clone = app.clone();
                    tauri::async_runtime::spawn(async move {
                        match stop_and_transcribe_internal(&app_clone).await {
                            Ok(text) => {
                                let _ = app_clone.emit("transcription_complete", text);
                            }
                            Err(e) => {
                                let _ = app_clone.emit("error", e);
                            }
                        }
                    });
                }
            }
        })
        .map_err(|e| format!("Failed to register hotkey: {}", e))?;

    Ok(())
}

fn setup_system_tray(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    // Create menu items
    let open_item = MenuItem::with_id(app, "open", "Open SX Whisper", true, None::<&str>)?;
    let separator = MenuItem::with_id(app, "sep", "─────────────", false, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

    // Create menu
    let menu = Menu::with_items(app, &[&open_item, &separator, &quit_item])?;

    // Build tray icon
    let _tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .show_menu_on_left_click(false)
        .tooltip("SX Whisper")
        .on_menu_event(|app, event| {
            match event.id.as_ref() {
                "open" => {
                    show_main_window(app);
                }
                "quit" => {
                    // Actually quit the app
                    app.exit(0);
                }
                _ => {}
            }
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                show_main_window(app);
            }
        })
        .build(app)?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let recorder = AudioRecorder::new().expect("Failed to create audio recorder");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(AppState::new(recorder))
        .invoke_handler(tauri::generate_handler![
            get_config,
            set_config,
            get_history,
            get_stats,
            clear_history,
            add_history_entry,
            copy_to_clipboard,
            start_recording,
            stop_recording_and_transcribe,
            get_recording_state,
            register_hotkey,
        ])
        .on_window_event(|window, event| {
            // Handle window close - hide to tray instead of quitting
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == "main" {
                    // Prevent the window from closing
                    api.prevent_close();
                    // Hide the window instead
                    let _ = window.hide();
                }
            }
        })
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                if let Some(window) = app.get_webview_window("main") {
                    window.open_devtools();
                }
            }
            
            // Setup system tray
            if let Err(e) = setup_system_tray(app) {
                eprintln!("Failed to setup system tray: {}", e);
            }
            
            // Load persistent data
            load_data(app.handle());
            
            // Increment session count on app start
            {
                let state = app.state::<AppState>();
                let mut stats = state.stats.lock().unwrap();
                stats.sessions_count += 1;
            }
            save_data(app.handle());
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
