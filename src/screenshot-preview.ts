import { invoke, convertFileSrc } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import './styles/screenshot-preview.css';

const win = getCurrentWindow();

// DOM refs ----------------------------------------------------------
const preview = document.getElementById('preview') as HTMLImageElement;
const copyBtn = document.getElementById('copy-btn') as HTMLButtonElement;
const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
const closeBtn = document.getElementById('close-btn') as HTMLButtonElement;
const card = document.getElementById('card') as HTMLDivElement;
const progress = document.getElementById('progress') as HTMLDivElement;

// Runtime state -----------------------------------------------------
let filePath = '';
let fileName = 'screenshot.png';

interface PendingPreview {
  path: string;
  filename: string;
}

// ------- Auto-dismiss after 4s unless user interacts -------
let dismissTimer: number | null = null;
let userInteracted = false;

function scheduleDismiss(delay = 4000) {
  clearDismiss();
  progress.classList.remove('paused');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      progress.classList.add('running');
    });
  });
  dismissTimer = window.setTimeout(() => {
    closePreview();
  }, delay);
}

function clearDismiss() {
  if (dismissTimer !== null) {
    window.clearTimeout(dismissTimer);
    dismissTimer = null;
  }
  progress.classList.add('paused');
  progress.classList.remove('running');
  // freeze progress at its current computed transform
  const cs = getComputedStyle(progress);
  if (cs.transform && cs.transform !== 'none') {
    progress.style.transform = cs.transform;
  }
}

async function closePreview() {
  clearDismiss();
  card.classList.add('fading');
  // Best-effort: clear the pending slot so a stale preview can't reappear
  invoke('clear_pending_preview').catch(() => {});
  await new Promise((r) => setTimeout(r, 220));
  try {
    await win.close();
  } catch {
    try {
      await win.destroy();
    } catch {
      /* noop */
    }
  }
}

function onUserInteract() {
  if (userInteracted) return;
  userInteracted = true;
  clearDismiss();
}

card.addEventListener('mouseenter', onUserInteract);
card.addEventListener('mousedown', onUserInteract);
card.addEventListener('touchstart', onUserInteract, { passive: true });

// ------- Buttons -------
copyBtn.addEventListener('click', async (e) => {
  e.stopPropagation();
  onUserInteract();
  if (!filePath) return;
  copyBtn.disabled = true;
  const originalText = copyBtn.textContent;
  try {
    await invoke('copy_image_to_clipboard', { path: filePath });
    copyBtn.textContent = '✓ Copied';
    copyBtn.classList.add('copied');
    setTimeout(() => {
      closePreview();
    }, 650);
  } catch (err) {
    console.error('copy_image_to_clipboard failed:', err);
    copyBtn.textContent = 'Copy failed';
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.disabled = false;
    }, 1200);
  }
});

saveBtn.addEventListener('click', async (e) => {
  e.stopPropagation();
  onUserInteract();
  if (!filePath) return;
  try {
    await invoke('reveal_in_folder', { path: filePath });
  } catch (err) {
    console.error('reveal_in_folder failed:', err);
  }
});

closeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  closePreview();
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    closePreview();
  }
});

// ------- Drag the image out of the app -------
preview.addEventListener('dragstart', async (e) => {
  onUserInteract();
  if (!filePath) return;
  e.preventDefault();
  try {
    await invoke('start_file_drag', { path: filePath, filename: fileName });
  } catch (err) {
    console.error('start_file_drag failed:', err);
  }
});

// ------- Bootstrap -------
// Pull the screenshot path/filename from the Rust side. We do this instead of
// reading URL query params so Windows paths (with `\` and `:`) can never break
// the window URL or cause the webview to hang during navigation.
async function bootstrap() {
  try {
    const pending = await invoke<PendingPreview | null>('get_pending_preview');
    if (pending && pending.path) {
      filePath = pending.path;
      fileName = pending.filename || 'screenshot.png';
      // convertFileSrc gives us an asset:// URL the webview can render
      preview.src = convertFileSrc(filePath);
    } else {
      // No pending preview — close the empty window.
      console.warn('No pending preview found, closing window.');
      closePreview();
      return;
    }
  } catch (err) {
    console.error('get_pending_preview failed:', err);
    closePreview();
    return;
  }

  // If the image fails to load (path issue, asset protocol misconfig, etc.)
  // make sure we don't sit there forever showing a blank window.
  preview.addEventListener('error', () => {
    console.error('Failed to render screenshot preview image:', filePath);
  });

  // Kick off auto-dismiss timer once the image has had a chance to start loading
  requestAnimationFrame(() => scheduleDismiss(4000));

  // Tell Rust the preview window is ready (best-effort)
  invoke('screenshot_preview_ready').catch(() => {});
}

bootstrap();
