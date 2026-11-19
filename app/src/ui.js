// The editor UI: seed controls, presets, palettes, photo slots, title
// fields, sliders, export buttons and the seed gallery. All state lives in
// one object; every control change re-renders the cover from that state.

import { renderCover, EXPORT_SIZES, PRESETS, panelPlan } from './cover.js';
import { PALETTES, PALETTE_ORDER } from './palettes.js';
import { hashSeed } from './prng.js';

/** Curated seeds for the gallery strip: one click loads a whole look. */
export const STAFF_PICKS = [
  { seed: 'neon-bay-7', label: 'Neon Bay', preset: 'collage', palette: 'vice-sunset' },
  { seed: 'palm-305', label: 'Palm 305', preset: 'collage', palette: 'golden-hour' },
  { seed: 'flamingo-88', label: 'Flamingo 88', preset: 'keyart', palette: 'vice-sunset' },
  { seed: 'midnight-neon', label: 'Midnight Neon', preset: 'collage', palette: 'neon-night' },
  { seed: 'swamp-king', label: 'Swamp King', preset: 'collage', palette: 'pastel-dawn' },
  { seed: 'boardwalk-9', label: 'Boardwalk 9', preset: 'keyart', palette: 'golden-hour' },
  { seed: 'ink-city', label: 'Ink City', preset: 'collage', palette: 'mono-ink' },
  { seed: 'golden-hour', label: 'Golden Hour', preset: 'wallpaper', palette: 'golden-hour' },
];

/** The editor's starting state. */
export function defaultState() {
  return {
    seed: 'neon-bay-7',
    preset: 'collage',
    palette: 'vice-sunset',
    size: 'square',
    title: 'NEON BAY VI',
    subtitle: 'welcome back to Leonida',
    studio: 'LEONIDA COVER STUDIO',
    grain: 0.7,
    halftone: 0.6,
    ink: true,
    photos: [],
  };
}

/** Panel slot labels for the photo assignment checkboxes. */
const PANEL_LABELS = ['Heli', 'Hero', 'P2', 'P3', 'Title', 'P5', 'P6', 'P7', 'P8'];

function el(id) {
  return document.getElementById(id);
}

/** Load an image file object into an <img>, resolving when it can draw. */
export function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('could not read that image'));
    img.src = url;
  });
}

/** Load a same-folder sample photo by name. */
export function loadSamplePhoto(name) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`sample ${name} did not load`));
    img.src = `samples/${name}.jpg`;
  });
}

/**
 * Wire the whole editor. Returns handles the screenshot mode uses:
 * { state, render, addPhoto, exportPng }.
 */
export function initUI(canvas, state) {
  const status = el('status');
  let renderTimer = 0;

  function render() {
    renderCover(canvas, state);
    el('seedValue').textContent = state.seed;
    el('panelPlan').textContent = panelPlan(state).join(' · ');
    window.__coverReady = true;
  }

  function renderSoon() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 60);
  }

  function setStatus(text) {
    status.textContent = text;
  }

  // ---- Seed controls ----
  function setSeed(seed) {
    state.seed = String(seed).trim() || 'neon-bay-7';
    el('seedInput').value = state.seed;
    render();
  }
  el('seedPrev').addEventListener('click', () => {
    const n = Number(state.seed.replace(/\D/g, '')) || 0;
    setSeed(state.seed.replace(/\d+/, '') + Math.max(0, n - 1) || 'neon-bay-1');
  });
  el('seedNext').addEventListener('click', () => {
    const n = Number(state.seed.replace(/\D/g, '')) || 0;
    setSeed(state.seed.replace(/\d+/, '') + (n + 1) || 'neon-bay-2');
  });
  let randomCount = 0;
  el('seedRandom').addEventListener('click', () => {
    // A "random" seed without Math.random: hash the current seed plus a
    // counter, so even this button stays out of the unseeded-random rule.
    randomCount++;
    const words = ['neon', 'palm', 'vice', 'flamingo', 'sunset', 'gator', 'boardwalk', 'turbo'];
    const n = (hashSeed(state.seed) + randomCount * 2654435761) >>> 0;
    setSeed(`${words[n % words.length]}-${100 + (n % 900)}`);
  });
  el('seedGo').addEventListener('click', () => setSeed(el('seedInput').value));
  el('seedInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') setSeed(el('seedInput').value);
  });
  el('seedRegen').addEventListener('click', () => render());

  // ---- Presets ----
  const presetBox = el('presets');
  for (const p of PRESETS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'preset-btn';
    b.dataset.preset = p.id;
    b.innerHTML = `<strong>${p.label}</strong><span>${p.hint}</span>`;
    b.addEventListener('click', () => {
      state.preset = p.id;
      // Each layout has a natural home size: posters are tall, wallpapers wide.
      if (p.id === 'wallpaper') state.size = 'landscape';
      if (p.id === 'keyart') state.size = 'portrait';
      syncPresetButtons();
      syncSizeButtons();
      render();
    });
    presetBox.appendChild(b);
  }
  function syncPresetButtons() {
    for (const b of presetBox.querySelectorAll('.preset-btn')) {
      b.classList.toggle('active', b.dataset.preset === state.preset);
    }
  }

  // ---- Palettes ----
  const paletteBox = el('palettes');
  for (const id of PALETTE_ORDER) {
    const p = PALETTES[id];
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch';
    b.dataset.palette = id;
    b.title = p.label;
    b.style.background = `linear-gradient(135deg, ${p.sky[0]} 0%, ${p.sky[1]} 35%, ${p.sky[2]} 70%, ${p.sky[3]} 100%)`;
    b.innerHTML = `<span>${p.label}</span>`;
    b.addEventListener('click', () => {
      state.palette = id;
      syncPaletteButtons();
      render();
    });
    paletteBox.appendChild(b);
  }
  function syncPaletteButtons() {
    for (const b of paletteBox.querySelectorAll('.swatch')) {
      b.classList.toggle('active', b.dataset.palette === state.palette);
    }
  }

  // ---- Size ----
  const sizeBox = el('sizes');
  for (const [id, s] of Object.entries(EXPORT_SIZES)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'size-btn';
    b.dataset.size = id;
    b.textContent = s.label;
    b.addEventListener('click', () => {
      state.size = id;
      syncSizeButtons();
      render();
    });
    sizeBox.appendChild(b);
  }
  function syncSizeButtons() {
    for (const b of sizeBox.querySelectorAll('.size-btn')) {
      b.classList.toggle('active', b.dataset.size === state.size);
    }
  }

  // ---- Title fields ----
  el('titleInput').addEventListener('input', (e) => {
    state.title = e.target.value;
    renderSoon();
  });
  el('subtitleInput').addEventListener('input', (e) => {
    state.subtitle = e.target.value;
    renderSoon();
  });
  el('studioInput').addEventListener('input', (e) => {
    state.studio = e.target.value;
    renderSoon();
  });

  // ---- Sliders + ink toggle ----
  el('grainRange').addEventListener('input', (e) => {
    state.grain = Number(e.target.value);
    el('grainValue').textContent = state.grain.toFixed(1);
    renderSoon();
  });
  el('halftoneRange').addEventListener('input', (e) => {
    state.halftone = Number(e.target.value);
    el('halftoneValue').textContent = state.halftone.toFixed(1);
    renderSoon();
  });
  el('inkToggle').addEventListener('change', (e) => {
    state.ink = e.target.checked;
    render();
  });

  // ---- Photos ----
  const photoList = el('photoList');
  function refreshPhotoList() {
    photoList.innerHTML = '';
    if (state.photos.length === 0) {
      photoList.innerHTML = '<p class="empty-note">No photo yet — the hero panel draws the cover duo. Add a photo to make yourself the Cover Star.</p>';
      return;
    }
    state.photos.forEach((photo, i) => {
      const card = document.createElement('div');
      card.className = 'photo-card';
      const head = document.createElement('div');
      head.className = 'photo-head';
      head.innerHTML = `<strong>Photo ${i + 1}</strong><span>${photo.name}</span>`;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'mini-btn';
      remove.textContent = 'Remove';
      remove.addEventListener('click', () => {
        state.photos.splice(i, 1);
        refreshPhotoList();
        render();
      });
      head.appendChild(remove);
      card.appendChild(head);
      // Panel checkboxes.
      const panels = document.createElement('div');
      panels.className = 'panel-picks';
      panels.innerHTML = '<span class="mini-label">Fill panels:</span>';
      for (let p = 0; p < 9; p++) {
        if (p === 4) continue; // the title block never takes a photo
        const lab = document.createElement('label');
        lab.className = 'panel-pick';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = photo.panels.includes(p);
        cb.addEventListener('change', () => {
          photo.panels = photo.panels.includes(p)
            ? photo.panels.filter((q) => q !== p)
            : [...photo.panels, p];
          render();
        });
        lab.appendChild(cb);
        lab.appendChild(document.createTextNode(PANEL_LABELS[p]));
        panels.appendChild(lab);
      }
      card.appendChild(panels);
      // Crop sliders.
      card.appendChild(sliderRow(`Zoom ${i}`, 0.5, 2.5, 0.05, photo.zoom, (v) => { photo.zoom = v; }));
      card.appendChild(sliderRow(`Pan X ${i}`, -0.5, 0.5, 0.01, photo.ox, (v) => { photo.ox = v; }));
      card.appendChild(sliderRow(`Pan Y ${i}`, -0.5, 0.5, 0.01, photo.oy, (v) => { photo.oy = v; }));
      photoList.appendChild(card);
    });
  }

  function sliderRow(label, min, max, step, value, onChange) {
    const row = document.createElement('label');
    row.className = 'slider-row';
    row.innerHTML = `<span>${label}</span>`;
    const input = document.createElement('input');
    input.type = 'range';
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(value);
    input.addEventListener('input', () => {
      onChange(Number(input.value));
      renderSoon();
    });
    row.appendChild(input);
    return row;
  }

  async function addPhoto(img, name) {
    state.photos.push({
      img,
      name: name || `photo-${state.photos.length + 1}`,
      panels: state.photos.length === 0 ? [1] : [],
      zoom: 1,
      ox: 0,
      oy: 0,
    });
    refreshPhotoList();
    render();
  }

  el('photoInput').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    for (const file of files.slice(0, 3)) {
      try {
        const img = await loadImageFile(file);
        await addPhoto(img, file.name);
        setStatus(`Loaded ${file.name} — it now fills the hero panel.`);
      } catch (err) {
        setStatus(String(err.message || err));
      }
    }
    e.target.value = '';
  });
  el('sampleBoulevard').addEventListener('click', async () => {
    const img = await loadSamplePhoto('boulevard');
    await addPhoto(img, 'boulevard.jpg (sample)');
    setStatus('Sample photo loaded as Cover Star.');
  });
  el('samplePier').addEventListener('click', async () => {
    const img = await loadSamplePhoto('pier');
    await addPhoto(img, 'pier.jpg (sample)');
    setStatus('Sample photo loaded as Cover Star.');
  });

  // ---- Export ----
  async function exportPng(sizeId) {
    const size = EXPORT_SIZES[sizeId] ?? EXPORT_SIZES.square;
    const off = document.createElement('canvas');
    const saved = state.size;
    state.size = sizeId;
    renderCover(off, state);
    state.size = saved;
    render();
    return new Promise((resolve, reject) => {
      off.toBlob((blob) => {
        if (!blob) return reject(new Error('export failed'));
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `leonida-cover-${state.seed}-${size.w}x${size.h}.png`;
        a.click();
        setStatus(`Exported ${size.w} × ${size.h} PNG.`);
        resolve(blob);
      }, 'image/png');
    });
  }
  el('exportSquare').addEventListener('click', () => exportPng('square'));
  el('exportPortrait').addEventListener('click', () => exportPng('portrait'));
  el('exportLandscape').addEventListener('click', () => exportPng('landscape'));

  // ---- Gallery ----
  const gallery = el('gallery');
  for (const pick of STAFF_PICKS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick';
    const p = PALETTES[pick.palette];
    b.style.background = `linear-gradient(160deg, ${p.sky[0]}, ${p.sky[2]} 60%, ${p.sky[3]})`;
    b.innerHTML = `<strong>${pick.label}</strong><span>${pick.seed} · ${pick.preset}</span>`;
    b.addEventListener('click', () => {
      state.seed = pick.seed;
      state.preset = pick.preset;
      state.palette = pick.palette;
      el('seedInput').value = pick.seed;
      syncPresetButtons();
      syncPaletteButtons();
      render();
    });
    gallery.appendChild(b);
  }

  // ---- First paint ----
  el('seedInput').value = state.seed;
  el('titleInput').value = state.title;
  el('subtitleInput').value = state.subtitle;
  el('studioInput').value = state.studio;
  el('grainRange').value = String(state.grain);
  el('halftoneRange').value = String(state.halftone);
  el('inkToggle').checked = state.ink;
  syncPresetButtons();
  syncPaletteButtons();
  syncSizeButtons();
  refreshPhotoList();
  render();

  return { state, render, addPhoto, exportPng, setSeed, setStatus };
}
