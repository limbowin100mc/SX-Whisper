use reqwest::multipart;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
struct TranscriptionResponse {
    text: String,
}

pub struct TranscriptionService {
    client: reqwest::Client,
    api_key: String,
}

impl TranscriptionService {
    pub fn new(api_key: String) -> Self {
        Self {
            client: reqwest::Client::new(),
            api_key,
        }
    }

    #[allow(dead_code)]
    pub fn set_api_key(&mut self, api_key: String) {
        self.api_key = api_key;
    }

    pub async fn transcribe(&self, audio_data: Vec<u8>, language: Option<String>) -> Result<String, String> {
        if self.api_key.is_empty() {
            return Err("API key not configured".to_string());
        }

        let part = multipart::Part::bytes(audio_data)
            .file_name("audio.wav")
            .mime_str("audio/wav")
            .map_err(|e| format!("Failed to create multipart: {}", e))?;

        let mut form = multipart::Form::new()
            .part("file", part)
            .text("model", "whisper-large-v3-turbo")
            .text("response_format", "json");

        // Only add language if it's not "auto" - Whisper will auto-detect if not specified
        if let Some(lang) = language {
            if lang != "auto" && !lang.is_empty() {
                form = form.text("language", lang);
            }
        }

        let response = self
            .client
            .post("https://api.groq.com/openai/v1/audio/transcriptions")
            .header("Authorization", format!("Bearer {}", self.api_key))
            .multipart(form)
            .send()
            .await
            .map_err(|e| format!("Network error: {}", e))?;

        let status = response.status();
        
        if status == 401 {
            return Err("Invalid API key".to_string());
        }
        
        if status == 429 {
            return Err("Rate limited - please wait".to_string());
        }

        if !status.is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(format!("API error ({}): {}", status, error_text));
        }

        let result: TranscriptionResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        Ok(result.text)
    }
}

/// Apply text formatting to transcribed text
pub fn format_text(text: &str, format: &str) -> String {
    match format {
        "capitalize" => capitalize_sentences(text),
        "lowercase" => text.to_lowercase(),
        "uppercase" => text.to_uppercase(),
        "title" => to_title_case(text),
        _ => text.to_string(), // "none" or unknown
    }
}

fn capitalize_sentences(text: &str) -> String {
    let mut result = String::new();
    let mut capitalize_next = true;
    
    for c in text.chars() {
        if capitalize_next && c.is_alphabetic() {
            result.push(c.to_uppercase().next().unwrap_or(c));
            capitalize_next = false;
        } else {
            result.push(c);
        }
        
        // Capitalize after sentence-ending punctuation
        if c == '.' || c == '!' || c == '?' {
            capitalize_next = true;
        }
    }
    
    result
}

fn to_title_case(text: &str) -> String {
    text.split_whitespace()
        .map(|word| {
            let mut chars = word.chars();
            match chars.next() {
                None => String::new(),
                Some(first) => {
                    first.to_uppercase().collect::<String>() + chars.as_str().to_lowercase().as_str()
                }
            }
        })
        .collect::<Vec<_>>()
        .join(" ")
}

/// Apply word replacements to text
pub fn apply_replacements(text: &str, replacements: &[(String, String)]) -> String {
    let mut result = text.to_string();
    
    for (trigger, replacement) in replacements {
        // Case-insensitive replacement
        let pattern = regex::RegexBuilder::new(&regex::escape(trigger))
            .case_insensitive(true)
            .build();
        
        if let Ok(re) = pattern {
            result = re.replace_all(&result, replacement.as_str()).to_string();
        }
    }
    
    result
}
