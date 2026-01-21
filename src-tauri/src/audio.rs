use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::Sample;
use std::sync::{Arc, Mutex, atomic::{AtomicBool, Ordering}};

// Global storage for the stream - must be accessed from the same thread
static STREAM_HOLDER: Mutex<Option<StreamWrapper>> = Mutex::new(None);

// Wrapper to make Stream "Send" - we ensure it's only accessed from one thread
struct StreamWrapper(#[allow(dead_code)] cpal::Stream);
unsafe impl Send for StreamWrapper {}

pub struct AudioRecorder {
    samples: Arc<Mutex<Vec<f32>>>,
    sample_rate: Arc<Mutex<u32>>,
    is_recording: Arc<AtomicBool>,
}

impl AudioRecorder {
    pub fn new() -> Result<Self, String> {
        Ok(Self {
            samples: Arc::new(Mutex::new(Vec::new())),
            sample_rate: Arc::new(Mutex::new(16000)),
            is_recording: Arc::new(AtomicBool::new(false)),
        })
    }

    pub fn start_recording(&self) -> Result<(), String> {
        if self.is_recording.load(Ordering::SeqCst) {
            return Ok(()); // Already recording
        }

        // Clear previous samples
        self.samples.lock().unwrap().clear();

        let host = cpal::default_host();
        let device = host
            .default_input_device()
            .ok_or("No input device available")?;

        let config = device
            .default_input_config()
            .map_err(|e| format!("Failed to get input config: {}", e))?;

        let actual_sample_rate = config.sample_rate().0;
        *self.sample_rate.lock().unwrap() = actual_sample_rate;
        let channels = config.channels() as usize;

        let samples = self.samples.clone();
        let is_recording = self.is_recording.clone();
        is_recording.store(true, Ordering::SeqCst);

        let err_fn = |err| eprintln!("Audio stream error: {}", err);

        let stream = match config.sample_format() {
            cpal::SampleFormat::F32 => {
                device.build_input_stream(
                    &config.into(),
                    move |data: &[f32], _: &cpal::InputCallbackInfo| {
                        if !is_recording.load(Ordering::SeqCst) {
                            return;
                        }
                        if let Ok(mut samples_guard) = samples.try_lock() {
                            for chunk in data.chunks(channels) {
                                let sum: f32 = chunk.iter().sum();
                                samples_guard.push(sum / channels as f32);
                            }
                        }
                    },
                    err_fn,
                    None,
                )
            }
            cpal::SampleFormat::I16 => {
                device.build_input_stream(
                    &config.into(),
                    move |data: &[i16], _: &cpal::InputCallbackInfo| {
                        if !is_recording.load(Ordering::SeqCst) {
                            return;
                        }
                        if let Ok(mut samples_guard) = samples.try_lock() {
                            for chunk in data.chunks(channels) {
                                let sum: f32 = chunk.iter().map(|&s| s.to_float_sample()).sum();
                                samples_guard.push(sum / channels as f32);
                            }
                        }
                    },
                    err_fn,
                    None,
                )
            }
            cpal::SampleFormat::U16 => {
                device.build_input_stream(
                    &config.into(),
                    move |data: &[u16], _: &cpal::InputCallbackInfo| {
                        if !is_recording.load(Ordering::SeqCst) {
                            return;
                        }
                        if let Ok(mut samples_guard) = samples.try_lock() {
                            for chunk in data.chunks(channels) {
                                let sum: f32 = chunk.iter().map(|&s| s.to_float_sample()).sum();
                                samples_guard.push(sum / channels as f32);
                            }
                        }
                    },
                    err_fn,
                    None,
                )
            }
            _ => return Err("Unsupported sample format".to_string()),
        }.map_err(|e| format!("Failed to build stream: {}", e))?;

        stream.play().map_err(|e| format!("Failed to start stream: {}", e))?;

        // Store the stream globally
        *STREAM_HOLDER.lock().unwrap() = Some(StreamWrapper(stream));

        Ok(())
    }

    pub fn stop_recording(&self) -> Result<Vec<u8>, String> {
        // Signal to stop recording
        self.is_recording.store(false, Ordering::SeqCst);
        
        // Drop the stream to stop it
        *STREAM_HOLDER.lock().unwrap() = None;
        
        // Give time for final samples to be collected
        std::thread::sleep(std::time::Duration::from_millis(50));

        let samples = self.samples.lock().unwrap().clone();
        let sample_rate = *self.sample_rate.lock().unwrap();
        
        if samples.is_empty() {
            return Err("No audio recorded".to_string());
        }

        // Check if audio is too short (less than 0.3 seconds)
        let duration_secs = samples.len() as f32 / sample_rate as f32;
        
        if duration_secs < 0.3 {
            return Err("Recording too short".to_string());
        }

        // Check if audio is silent - use a very low threshold
        let rms: f32 = (samples.iter().map(|s| s * s).sum::<f32>() / samples.len() as f32).sqrt();
        
        // Very low threshold - almost any sound should pass
        if rms < 0.0001 {
            return Err("No speech detected".to_string());
        }

        // Resample to 16kHz if needed
        let resampled = if sample_rate != 16000 {
            self.resample(&samples, sample_rate, 16000)
        } else {
            samples
        };

        // Encode to WAV
        self.encode_wav(&resampled, 16000)
    }

    fn resample(&self, samples: &[f32], from_rate: u32, to_rate: u32) -> Vec<f32> {
        let ratio = to_rate as f32 / from_rate as f32;
        let new_len = (samples.len() as f32 * ratio) as usize;
        let mut resampled = Vec::with_capacity(new_len);

        for i in 0..new_len {
            let src_idx = i as f32 / ratio;
            let idx = src_idx as usize;
            let frac = src_idx - idx as f32;

            let sample = if idx + 1 < samples.len() {
                samples[idx] * (1.0 - frac) + samples[idx + 1] * frac
            } else {
                samples[idx.min(samples.len() - 1)]
            };
            resampled.push(sample);
        }

        resampled
    }

    fn encode_wav(&self, samples: &[f32], sample_rate: u32) -> Result<Vec<u8>, String> {
        let spec = hound::WavSpec {
            channels: 1,
            sample_rate,
            bits_per_sample: 16,
            sample_format: hound::SampleFormat::Int,
        };

        let mut cursor = std::io::Cursor::new(Vec::new());
        {
            let mut writer = hound::WavWriter::new(&mut cursor, spec)
                .map_err(|e| format!("Failed to create WAV writer: {}", e))?;

            for &sample in samples {
                let amplitude = (sample * 32767.0).clamp(-32768.0, 32767.0) as i16;
                writer
                    .write_sample(amplitude)
                    .map_err(|e| format!("Failed to write sample: {}", e))?;
            }

            writer
                .finalize()
                .map_err(|e| format!("Failed to finalize WAV: {}", e))?;
        }

        let wav_data = cursor.into_inner();
        Ok(wav_data)
    }
}

unsafe impl Send for AudioRecorder {}
unsafe impl Sync for AudioRecorder {}
