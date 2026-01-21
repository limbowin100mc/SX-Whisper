use arboard::Clipboard;
use enigo::{Enigo, Key, Keyboard, Settings};
use std::thread;
use std::time::Duration;

pub struct TextPaster {
    enigo: Enigo,
}

impl TextPaster {
    pub fn new() -> Result<Self, String> {
        let enigo = Enigo::new(&Settings::default())
            .map_err(|e| format!("Failed to create Enigo: {}", e))?;
        Ok(Self { enigo })
    }

    pub fn paste_text(&mut self, text: &str) -> Result<(), String> {
        let mut clipboard = Clipboard::new()
            .map_err(|e| format!("Failed to access clipboard: {}", e))?;

        // Save original clipboard content
        let original_text = clipboard.get_text().ok();

        // Set new text to clipboard
        clipboard
            .set_text(text)
            .map_err(|e| format!("Failed to set clipboard: {}", e))?;

        // Small delay to ensure clipboard is ready
        thread::sleep(Duration::from_millis(50));

        // Simulate Ctrl+V
        self.enigo
            .key(Key::Control, enigo::Direction::Press)
            .map_err(|e| format!("Failed to press Ctrl: {}", e))?;
        
        self.enigo
            .key(Key::Unicode('v'), enigo::Direction::Click)
            .map_err(|e| format!("Failed to press V: {}", e))?;
        
        self.enigo
            .key(Key::Control, enigo::Direction::Release)
            .map_err(|e| format!("Failed to release Ctrl: {}", e))?;

        // Small delay before restoring clipboard
        thread::sleep(Duration::from_millis(100));

        // Restore original clipboard content
        if let Some(original) = original_text {
            let _ = clipboard.set_text(&original);
        }

        Ok(())
    }
}
