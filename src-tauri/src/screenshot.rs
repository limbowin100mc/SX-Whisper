// Screenshot capture module
// Provides functionality for capturing screenshots and saving them to disk

use std::path::PathBuf;
use serde::{Deserialize, Serialize};

/// Manages screenshot capture operations and file storage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScreenshotManager {
    pub save_directory: PathBuf,
}

/// Represents a region of the screen to capture
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CaptureRegion {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub monitor_id: usize,
}

/// Information about a monitor/display
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitorInfo {
    pub id: usize,
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub scale_factor: f64,
}

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScreenshotMetadata {
    pub path: String,
    pub timestamp: i64,
    pub width: u32,
    pub height: u32,
}

/// Error types for screenshot operations
#[allow(dead_code)]
#[derive(Debug)]
pub enum ScreenshotError {
    CaptureError(String),
    SaveError(String),
    DirectoryError(String),
}

impl std::fmt::Display for ScreenshotError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ScreenshotError::CaptureError(msg) => write!(f, "Screenshot capture failed: {}", msg),
            ScreenshotError::SaveError(msg) => write!(f, "Screenshot save failed: {}", msg),
            ScreenshotError::DirectoryError(msg) => write!(f, "Directory error: {}", msg),
        }
    }
}

impl std::error::Error for ScreenshotError {}

/// Get the default screenshots directory path
#[allow(dead_code)]
pub fn get_screenshots_dir() -> Result<PathBuf, ScreenshotError> {
    dirs::picture_dir()
        .map(|p| p.join("SX Whisper Screenshots"))
        .ok_or_else(|| ScreenshotError::DirectoryError("Could not determine pictures directory".to_string()))
}

// Tauri Commands

/// Capture a screenshot of the specified region and save it to disk
/// Returns the filename of the saved screenshot
#[tauri::command]
pub fn capture_screenshot(
    app: tauri::AppHandle,
    state: tauri::State<crate::AppState>,
    x: i32,
    y: i32,
    width: u32,
    height: u32,
) -> Result<String, String> {
    use tauri::{Emitter, Manager};

    // Get the screenshot manager from state
    let manager = {
        let manager_guard = state.screenshot_manager.lock().unwrap();
        manager_guard
            .as_ref()
            .ok_or_else(|| "Screenshot manager not initialized".to_string())?
            .clone()
    };

    // Determine which monitor contains the capture region
    let monitors = ScreenshotManager::get_monitors()?;
    let monitor_id = monitors
        .iter()
        .position(|m| {
            x >= m.x
                && x < m.x + m.width as i32
                && y >= m.y
                && y < m.y + m.height as i32
        })
        .unwrap_or(0);

    // Translate global screen coords -> coords relative to the chosen monitor
    let monitor = &monitors[monitor_id];
    let relative_x = x - monitor.x;
    let relative_y = y - monitor.y;

    // Create capture region (relative to monitor, which is what `screenshots` expects)
    let region = CaptureRegion {
        x: relative_x,
        y: relative_y,
        width,
        height,
        monitor_id,
    };

    // Capture and save (this is the critical operation)
    let file_path = manager.capture_region(region)?;

    let filename = file_path
        .file_name()
        .and_then(|name| name.to_str())
        .map(|s| s.to_string())
        .ok_or_else(|| "Failed to get filename".to_string())?;

    let full_path = file_path.to_string_lossy().to_string();

    // Always make sure the capture overlay window is gone
    if let Some(overlay) = app.get_webview_window("capture-overlay") {
        let _ = overlay.close();
    }

    // Notify frontend that a screenshot was saved
    let _ = app.emit(
        "screenshot_complete",
        serde_json::json!({
            "path": full_path,
            "filename": filename,
            "width": width,
            "height": height,
        }),
    );

    // Stash the pending preview data in shared state so the preview window
    // can read it via `get_pending_preview` on mount. This avoids embedding
    // the file path (with backslashes, colons, etc.) into the window URL,
    // which can break URL parsing on Windows.
    {
        let mut pending = state.pending_preview.lock().unwrap();
        *pending = Some(crate::PendingPreview {
            path: full_path.clone(),
            filename: filename.clone(),
        });
    }

    // Launch the preview window on the main thread (required for webview
    // creation on Windows) and make it non-blocking so we don't hold up the
    // capture_screenshot IPC response. The screenshot file is already saved
    // at this point, so even if the preview fails the user still has their file.
    let app_handle = app.clone();
    let _ = app.run_on_main_thread(move || {
        if let Err(e) = show_screenshot_preview_window(&app_handle) {
            eprintln!("Failed to show screenshot preview window: {}", e);
        }
    });

    Ok(filename)
}

/// Create (or focus) a floating preview window in the bottom-right corner.
/// Window is frameless, always-on-top, skips the taskbar, and auto-dismisses
/// itself after 4s (handled on the frontend).
///
/// The preview's path/filename comes from `AppState::pending_preview`, not the URL,
/// so the window URL stays simple and reliable across dev + prod.
fn show_screenshot_preview_window(app: &tauri::AppHandle) -> Result<(), String> {
    use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

    // If an existing preview is still on screen, close it so a new one can take its place
    if let Some(existing) = app.get_webview_window("screenshot-preview") {
        let _ = existing.close();
    }

    // Simple, query-free URL — works reliably in dev (Vite) and prod (embedded).
    let url = if cfg!(debug_assertions) {
        WebviewUrl::External(
            "http://localhost:1420/screenshot-preview.html"
                .parse()
                .map_err(|e| format!("Invalid preview URL: {}", e))?,
        )
    } else {
        WebviewUrl::App("screenshot-preview.html".into())
    };

    // Work out bottom-right position of the primary monitor
    let monitors = ScreenshotManager::get_monitors()?;
    let primary = monitors
        .first()
        .ok_or_else(|| "No monitors detected".to_string())?;

    let preview_w: u32 = 360;
    let preview_h: u32 = 240;
    let margin: i32 = 24;

    let pos_x = primary.x + primary.width as i32 - preview_w as i32 - margin;
    let pos_y = primary.y + primary.height as i32 - preview_h as i32 - margin - 48; // lift above taskbar

    // Build the window with position set at creation time (set_position post-build
    // is unreliable on Windows and was leaving the preview in the top-left corner).
    let _window = WebviewWindowBuilder::new(app, "screenshot-preview", url)
        .title("Screenshot Preview")
        .inner_size(preview_w as f64, preview_h as f64)
        .position(pos_x as f64, pos_y as f64)
        .decorations(false)
        .transparent(true)
        .always_on_top(true)
        .skip_taskbar(true)
        .resizable(false)
        .focused(false)
        .visible(true)
        .build()
        .map_err(|e| format!("Failed to create preview window: {}", e))?;

    Ok(())
}

/// Put the given image file onto the system clipboard as an image.
/// This lets the user paste it into terminals, chat apps, editors, etc.
#[tauri::command]
pub fn copy_image_to_clipboard(path: String) -> Result<(), String> {
    use arboard::{Clipboard, ImageData};

    let img = image::open(&path).map_err(|e| format!("Failed to open image: {}", e))?;
    let rgba = img.to_rgba8();
    let (w, h) = rgba.dimensions();
    let bytes = rgba.into_raw();

    let mut clipboard =
        Clipboard::new().map_err(|e| format!("Failed to access clipboard: {}", e))?;

    clipboard
        .set_image(ImageData {
            width: w as usize,
            height: h as usize,
            bytes: std::borrow::Cow::Owned(bytes),
        })
        .map_err(|e| format!("Failed to set clipboard image: {}", e))?;

    Ok(())
}

/// When the user drags the screenshot out of the preview window we fall back to
/// putting the image on the clipboard so they can paste it wherever they want
/// (including terminals and chat apps that accept image paste).
#[tauri::command]
pub fn start_file_drag(path: String, _filename: String) -> Result<(), String> {
    copy_image_to_clipboard(path)
}

/// Reveal the screenshot file in the host OS file explorer.
#[tauri::command]
pub fn reveal_in_folder(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .args(["/select,", &path])
            .spawn()
            .map_err(|e| format!("Failed to open explorer: {}", e))?;
        Ok(())
    }

    #[cfg(not(target_os = "windows"))]
    {
        let p = std::path::PathBuf::from(&path);
        let parent = p
            .parent()
            .ok_or_else(|| "Could not resolve parent folder".to_string())?;
        std::process::Command::new("xdg-open")
            .arg(parent)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
        Ok(())
    }
}

/// Stub acknowledgement — called by the preview when its UI has mounted.
#[tauri::command]
pub fn screenshot_preview_ready() -> Result<(), String> {
    Ok(())
}

/// Called by the preview window on mount to fetch the screenshot it should display.
/// Returns `None` if no preview is pending (window opened directly, etc.).
#[tauri::command]
pub fn get_pending_preview(
    state: tauri::State<crate::AppState>,
) -> Result<Option<crate::PendingPreview>, String> {
    let pending = state.pending_preview.lock().unwrap();
    Ok(pending.clone())
}

/// Called by the preview window when it has finished consuming the pending data
/// (or when it dismisses). Clears the slot so a stale preview can't accidentally
/// re-load the same screenshot if the window is reopened later.
#[tauri::command]
pub fn clear_pending_preview(state: tauri::State<crate::AppState>) -> Result<(), String> {
    let mut pending = state.pending_preview.lock().unwrap();
    *pending = None;
    Ok(())
}

/// Get information about all connected monitors
#[tauri::command]
pub fn get_monitors() -> Result<Vec<MonitorInfo>, String> {
    ScreenshotManager::get_monitors()
}

/// Capture full screen to a temporary file and return the file path
/// This is used for the screenshot overlay background
#[tauri::command]
pub fn capture_screen_for_overlay() -> Result<String, String> {
    use std::env;
    
    // Get all monitors
    let monitors = ScreenshotManager::get_monitors()?;
    
    if monitors.is_empty() {
        return Err("No monitors detected".to_string());
    }
    
    // Calculate bounding box of all monitors
    let mut min_x = i32::MAX;
    let mut min_y = i32::MAX;
    let mut max_x = i32::MIN;
    let mut max_y = i32::MIN;
    
    for monitor in &monitors {
        min_x = min_x.min(monitor.x);
        min_y = min_y.min(monitor.y);
        max_x = max_x.max(monitor.x + monitor.width as i32);
        max_y = max_y.max(monitor.y + monitor.height as i32);
    }
    
    // Get all screens
    let screens = screenshots::Screen::all()
        .map_err(|e| format!("Failed to get screens: {}", e))?;
    
    if screens.is_empty() {
        return Err("No screens available".to_string());
    }
    
    // Capture the first screen (primary monitor)
    let screen = &screens[0];
    let image = screen
        .capture()
        .map_err(|e| format!("Failed to capture screen: {}", e))?;
    
    // Save to temp directory
    let temp_dir = env::temp_dir();
    let temp_file = temp_dir.join("sx_whisper_overlay_temp.png");
    
    image
        .save(&temp_file)
        .map_err(|e| format!("Failed to save temp screenshot: {}", e))?;
    
    // Return the file path as a string
    temp_file
        .to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "Failed to convert path to string".to_string())
}

/// Open the screenshots folder in the system file explorer
#[tauri::command]
pub fn open_screenshots_folder(state: tauri::State<crate::AppState>) -> Result<(), String> {
    let save_directory = {
        let config = state.config.lock().unwrap();
        config.screenshot_save_directory.clone()
    };

    // Ensure the directory exists
    let path = PathBuf::from(&save_directory);
    std::fs::create_dir_all(&path)
        .map_err(|e| format!("Failed to create directory: {}", e))?;

    // Open the directory using the opener plugin
    // Note: The actual opening will be done via tauri_plugin_opener in the frontend
    Ok(())
}

/// Register a global hotkey for screenshot capture
#[tauri::command]
pub fn register_screenshot_hotkey(
    app: tauri::AppHandle,
    hotkey: String,
) -> Result<(), String> {
    use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut};

    // Unregister any existing screenshot hotkey
    // Note: We need to track the previous hotkey to unregister it
    // For now, we'll just try to register the new one

    if hotkey.is_empty() {
        return Ok(());
    }

    let shortcut: Shortcut = hotkey
        .parse()
        .map_err(|e| format!("Invalid hotkey format: {}", e))?;

    // Register the hotkey
    app.global_shortcut()
        .register(shortcut)
        .map_err(|e| format!("Failed to register screenshot hotkey: {}", e))?;

    // TODO: Add hotkey handler to show capture overlay window
    // This will be implemented in the main lib.rs file

    Ok(())
}

impl ScreenshotManager {
    /// Create a new ScreenshotManager with the specified save directory
    pub fn new(save_directory: PathBuf) -> Self {
        Self { save_directory }
    }

    /// Generate a filename for a screenshot using the current timestamp
    /// Format: screenshot_YYYY-MM-DD_HH-MM-SS.png
    pub fn generate_filename() -> String {
        let now = chrono::Local::now();
        now.format("screenshot_%Y-%m-%d_%H-%M-%S.png").to_string()
    }

    /// Ensure the save directory exists, creating it if necessary
    pub fn ensure_directory_exists(&self) -> Result<(), String> {
        std::fs::create_dir_all(&self.save_directory)
            .map_err(|e| format!("Failed to create directory: {}", e))
    }

    /// Get information about all connected monitors
    pub fn get_monitors() -> Result<Vec<MonitorInfo>, String> {
        let screens = screenshots::Screen::all()
            .map_err(|e| format!("Failed to get monitors: {}", e))?;

        let monitors = screens
            .into_iter()
            .enumerate()
            .map(|(id, screen)| {
                let display_info = screen.display_info;
                MonitorInfo {
                    id,
                    x: display_info.x,
                    y: display_info.y,
                    width: display_info.width,
                    height: display_info.height,
                    scale_factor: display_info.scale_factor as f64,
                }
            })
            .collect();

        Ok(monitors)
    }

    /// Capture a screen region and save it to disk
    /// Returns the path to the saved screenshot file
    pub fn capture_region(&self, region: CaptureRegion) -> Result<PathBuf, String> {
        // Ensure the save directory exists
        self.ensure_directory_exists()?;

        // Get all screens
        let screens = screenshots::Screen::all()
            .map_err(|e| format!("Failed to get screens: {}", e))?;

        // Validate monitor_id
        if region.monitor_id >= screens.len() {
            return Err(format!(
                "Invalid monitor_id: {} (only {} monitors available)",
                region.monitor_id,
                screens.len()
            ));
        }

        // Get the target screen
        let screen = &screens[region.monitor_id];

        // Capture the screen region
        let image = screen
            .capture_area(region.x, region.y, region.width, region.height)
            .map_err(|e| format!("Failed to capture screen region: {}", e))?;

        // Convert to image crate format
        // The screenshots crate returns an ImageBuffer<Rgba<u8>, Vec<u8>> which is already compatible
        let img_buffer = image;

        // Generate filename and full path
        let filename = Self::generate_filename();
        let file_path = self.save_directory.join(&filename);

        // Save as PNG
        img_buffer
            .save(&file_path)
            .map_err(|e| format!("Failed to save screenshot: {}", e))?;

        Ok(file_path)
    }
}
