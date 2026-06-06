import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import './styles/capture-overlay.css';

let selecting = false;
let hasMovedAfterDown = false;
let startX = 0, startY = 0, endX = 0, endY = 0;
let offsetX = 0, offsetY = 0;
let scaleFactor = 1;
let closing = false;

const selection = document.getElementById('selection') as HTMLDivElement;
const info = document.getElementById('info') as HTMLDivElement;
const backdrop = document.getElementById('backdrop') as HTMLDivElement;
const guideH = document.getElementById('guide-h') as HTMLDivElement;
const guideV = document.getElementById('guide-v') as HTMLDivElement;
const win = getCurrentWindow();

// Get window position + scale factor so we map client coords -> physical screen coords
Promise.all([win.outerPosition(), win.scaleFactor()])
  .then(([pos, sf]) => {
    offsetX = pos.x;
    offsetY = pos.y;
    scaleFactor = sf || 1;
  })
  .catch(console.error);

// Close overlay robustly
async function closeOverlay() {
  if (closing) return;
  closing = true;
  try {
    await invoke('close_capture_overlay');
  } catch (e) {
    console.error('close_capture_overlay failed:', e);
    try {
      await win.close();
    } catch (e2) {
      try {
        await win.destroy();
      } catch (e3) {
        console.error('All close attempts failed:', e3);
      }
    }
  }
}

function updateGuides(x: number, y: number) {
  guideH.style.display = 'block';
  guideV.style.display = 'block';
  guideH.style.top = y + 'px';
  guideV.style.left = x + 'px';
}

function hideGuides() {
  guideH.style.display = 'none';
  guideV.style.display = 'none';
}

// Track cursor for guides before selection starts
document.addEventListener('mousemove', (e) => {
  if (!selecting) {
    updateGuides(e.clientX, e.clientY);
    return;
  }

  hasMovedAfterDown = true;
  endX = e.clientX;
  endY = e.clientY;

  const x = Math.min(startX, endX);
  const y = Math.min(startY, endY);
  const w = Math.abs(endX - startX);
  const h = Math.abs(endY - startY);

  selection.style.display = 'block';
  selection.style.left = x + 'px';
  selection.style.top = y + 'px';
  selection.style.width = w + 'px';
  selection.style.height = h + 'px';

  // Place the size badge; keep it inside screen bounds
  info.style.display = 'block';
  info.textContent = `${w} × ${h}`;

  // Prefer placing below-right of cursor; flip if near edges
  const infoRect = info.getBoundingClientRect();
  const pad = 12;
  let ix = endX + pad;
  let iy = endY + pad;
  if (ix + infoRect.width + 4 > window.innerWidth) ix = endX - infoRect.width - pad;
  if (iy + infoRect.height + 4 > window.innerHeight) iy = endY - infoRect.height - pad;
  info.style.left = ix + 'px';
  info.style.top = iy + 'px';
});

document.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return; // only left button
  selecting = true;
  hasMovedAfterDown = false;
  startX = endX = e.clientX;
  startY = endY = e.clientY;
  hideGuides();
});

document.addEventListener('mouseup', async (e) => {
  if (!selecting || e.button !== 0) return;
  selecting = false;

  const clientX1 = Math.min(startX, endX);
  const clientY1 = Math.min(startY, endY);
  const w = Math.abs(endX - startX);
  const h = Math.abs(endY - startY);

  // If selection too small or a simple click, cancel (do NOT capture)
  if (!hasMovedAfterDown || w < 5 || h < 5) {
    await closeOverlay();
    return;
  }

  // Convert CSS pixels -> physical screen coords expected by Rust
  const physX = Math.round(clientX1 * scaleFactor) + offsetX;
  const physY = Math.round(clientY1 * scaleFactor) + offsetY;
  const physW = Math.round(w * scaleFactor);
  const physH = Math.round(h * scaleFactor);

  // Hide every visible overlay element BEFORE capture so neither the blue
  // selection border nor the dimmed backdrop end up in the screenshot.
  selection.style.display = 'none';
  info.style.display = 'none';
  backdrop.style.display = 'none';
  hideGuides();
  document.documentElement.style.background = 'transparent';
  document.body.style.background = 'transparent';

  // Hide the overlay window itself BEFORE capturing so it doesn't appear in the shot
  try {
    await win.hide();
  } catch (err) {
    console.error('Failed to hide overlay before capture:', err);
  }

  // Wait long enough for the compositor to actually flush the hidden frame
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Capture the screenshot
  try {
    await invoke('capture_screenshot', {
      x: physX,
      y: physY,
      width: physW,
      height: physH,
    });
  } catch (err) {
    console.error('Capture failed:', err);
  }

  // Always close the overlay afterwards
  await closeOverlay();
});

// ESC cancels the whole screenshot flow
function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    closeOverlay();
  }
}
document.addEventListener('keydown', handleEscape, true);
window.addEventListener('keydown', handleEscape, true);

// Right-click also cancels
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  closeOverlay();
});

// Make sure the window actually receives keystrokes
win.setFocus().catch(console.error);
window.addEventListener('blur', () => {
  win.setFocus().catch(() => {});
});
document.addEventListener('click', () => {
  win.setFocus().catch(() => {});
});
