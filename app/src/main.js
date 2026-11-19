// Bootstrap for Leonida Cover Studio. Wires the editor, waits for the
// vendored fonts, then paints the first cover. A `?shot=` query sets up a
// fixed scene for screenshots instead of the interactive editor:
//   ?shot=cover&seed=..&preset=..&size=..   cover alone, full-bleed
//   ?shot=editor&photo=boulevard            editor with a photo loaded
//   ?shot=keyart                            Key Art Poster preset
//   ?shot=gallery                           seed gallery strip in view
// window.__shotReady is set once the scene has painted, so a screenshot
// script can wait for it.

import { defaultState, initUI, loadSamplePhoto } from './ui.js';

const canvas = document.getElementById('cover');
const state = defaultState();
const ui = initUI(canvas, state);

// The cover is only trustworthy once Anton + Pacifico have loaded; paint
// again when the font faces arrive so the title never falls back to sans.
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => ui.render());
}
if (document.fonts && document.fonts.load) {
  Promise.all([
    document.fonts.load('100px Anton'),
    document.fonts.load('40px Pacifico'),
  ]).then(() => ui.render()).catch(() => ui.render());
}

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  document.body.classList.add(`shot-${shot}`);
  applyShot(shot, query).catch((err) => {
    document.getElementById('status').textContent = String(err.message || err);
    window.__shotReady = true;
  });
}

async function applyShot(name, q) {
  const seed = q.get('seed');
  if (seed) ui.setSeed(seed);
  // The shot name itself picks the preset: keyart shows the poster layout.
  if (name === 'keyart') state.preset = 'keyart';
  if (name === 'wallpaper') state.preset = 'wallpaper';
  const preset = q.get('preset');
  if (preset && ['collage', 'keyart', 'wallpaper'].includes(preset)) {
    state.preset = preset;
  }
  const palette = q.get('palette');
  if (palette) state.palette = palette;
  const size = q.get('size');
  if (size && ['square', 'portrait', 'landscape'].includes(size)) {
    state.size = size;
  }
  const title = q.get('title');
  if (title) {
    state.title = title;
    const input = document.getElementById('titleInput');
    if (input) input.value = title;
  }
  const photo = q.get('photo');
  if (photo) {
    const img = await loadSamplePhoto(photo);
    await ui.addPhoto(img, `${photo}.jpg (sample)`);
  }
  // Re-sync the control buttons after the query overrides.
  document.querySelectorAll('.preset-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.preset === state.preset);
  });
  document.querySelectorAll('.swatch').forEach((b) => {
    b.classList.toggle('active', b.dataset.palette === state.palette);
  });
  document.querySelectorAll('.size-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.size === state.size);
  });
  ui.render();
  // Two frames so the canvas paint lands before the screenshot.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}

// Handles for screenshot scripts and the console.
window.__leonida = ui;
