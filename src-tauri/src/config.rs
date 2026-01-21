use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WordReplacement {
    pub id: String,
    pub trigger: String,
    pub replacement: String,
    pub enabled: bool,
}

impl WordReplacement {
    pub fn new(trigger: String, replacement: String) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            trigger,
            replacement,
            enabled: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppConfig {
    pub hotkey: String,
    pub api_key: String,
    pub is_enabled: bool,
    pub theme: String,
    pub accent_color: String,
    // Language settings
    pub language: String, // "auto" or language code like "en", "es", etc.
    // Text formatting
    pub text_format: String, // "none", "capitalize", "lowercase", "uppercase", "title"
    // Custom word replacements
    pub word_replacements: Vec<WordReplacement>,
    // Overlay color
    pub overlay_color: String, // "purple", "green", "red", "blue", "white", "cyan", "orange", "pink"
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            hotkey: "Control+Shift+Space".to_string(),
            api_key: String::new(),
            is_enabled: true,
            theme: "dark".to_string(),
            accent_color: "green".to_string(),
            language: "auto".to_string(),
            text_format: "none".to_string(),
            word_replacements: Vec::new(),
            overlay_color: "purple".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub id: String,
    pub text: String,
    pub timestamp: i64,
}

impl HistoryEntry {
    pub fn new(text: String) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            text,
            timestamp: chrono::Utc::now().timestamp_millis(),
        }
    }
}
