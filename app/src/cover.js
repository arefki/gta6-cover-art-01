// The cover renderer: turns a state (seed, preset, palette, title, photos)
// into a finished cover on a canvas. Three presets share the same seeded
// scene library; the collage is the classic nine-panel comic grid, key art
// is one big scene with the duo and a huge title, wallpaper is a wide
// golden-hour skyline. All randomness comes from the seed.

import { makeRng } from './prng.js';
import { paletteById, skyGradient } from './palettes.js';
import { paintSky, paintSun, paintPalm, paintGrain, paintVignette, paintHalftone, paintInkBorder, paintGlow } from './draw.js';
import {
  helicopterSky, duoPortrait, drawDuoFigures, skylineSunset, beachPalms, speedboatFlamingo, supercarNeon,
} from './scenes-a.js';
import {
  alligatorSwamp, seaplane, ferrisWheel, bikerWheelie, artDecoFacade, neonStreet,
} from './scenes-b.js';
import { drawStylizedPhoto } from './photo.js';

/** The three export sizes, in pixels. */
export const EXPORT_SIZES = {
  square: { label: 'Square · 1080 × 1080', w: 1080, h: 1080 },
  portrait: { label: 'Portrait · 1080 × 1350', w: 1080, h: 1350 },
  landscape: { label: 'Landscape · 1920 × 1080', w: 1920, h: 1080 },
};

/** The scene library: id, label, draw function, variant count. */
export const SCENE_LIBRARY = [
  { id: 'helicopter', label: 'Helicopter', fn: helicopterSky, variants: 3 },
  { id: 'duo', label: 'Cover Duo', fn: duoPortrait, variants: 3 },
  { id: 'skyline', label: 'Skyline Sunset', fn: skylineSunset, variants: 3 },
  { id: 'beach', label: 'Beach Palms', fn: beachPalms, variants: 3 },
  { id: 'speedboat', label: 'Speedboat + Flamingo', fn: speedboatFlamingo, variants: 3 },
  { id: 'supercar', label: 'Neon Supercar', fn: supercarNeon, variants: 2 },
  { id: 'swamp', label: 'Alligator Swamp', fn: alligatorSwamp, variants: 3 },
  { id: 'seaplane', label: 'Seaplane', fn: seaplane, variants: 3 },
  { id: 'ferris', label: 'Ferris Wheel', fn: ferrisWheel, variants: 3 },
  { id: 'biker', label: 'Biker Wheelie', fn: bikerWheelie, variants: 3 },
  { id: 'artdeco', label: 'Art-Deco Facade', fn: artDecoFacade, variants: 2 },
  { id: 'neonstreet', label: 'Neon Street', fn: neonStreet, variants: 3 },
];

export const PRESETS = [
  { id: 'collage', label: 'Classic Collage', hint: 'Nine-panel comic grid' },
  { id: 'keyart', label: 'Key Art Poster', hint: 'One scene, duo, big title' },
  { id: 'wallpaper', label: 'Wallpaper', hint: 'Wide golden-hour skyline' },
];

/** Scene ids that may fill the six free collage panels (not helicopter/duo). */
const FILLER_SCENES = SCENE_LIBRARY.filter((s) => s.id !== 'helicopter' && s.id !== 'duo');

/** Find a photo assigned to a panel index, or null. */
function photoForPanel(state, panelIndex) {
  for (const photo of state.photos) {
    if (photo.panels.includes(panelIndex)) return photo;
  }
  return null;
}

/** Fit an Anton title into a width, returning the font size used. */
function fitTitleFont(ctx, text, maxWidth, startSize) {
  let size = startSize;
  ctx.font = `${size}px Anton, sans-serif`;
  while (ctx.measureText(text).width > maxWidth && size > 12) {
    size -= 2;
    ctx.font = `${size}px Anton, sans-serif`;
  }
  return size;
}

/**
 * The title block: the cover's big lettering. Sunset-gradient fill, thick
 * ink outline, small palm silhouettes growing from the foot of the letters,
 * a script subtitle and the studio name. Drawn inside `rect`.
 */
export function drawTitleBlock(ctx, rect, palette, state, rng, opts = {}) {
  const { x, y, w, h } = rect;
  // Backdrop: a deep sky gradient so the letters always read. Posters pass
  // backdrop: false and draw the letters straight onto their own band.
  if (opts.backdrop !== false) {
    ctx.fillStyle = skyGradient(ctx, x, y, w, h, palette);
    ctx.fillRect(x, y, w, h);
    paintGlow(ctx, x + w * 0.5, y + h * 0.42, w * 0.55, palette.sun, 0.55);
  }
  // No palm silhouettes here: in a small title cell their fronds cross the
  // subtitle. The glow behind the letters is the decoration.
  void rng;

  const title = (state.title || 'NEON BAY VI').trim().toUpperCase();
  const pad = w * 0.06;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Two lines when the title is long: split on the last space.
  let lines = [title];
  if (title.length > 13 && title.includes(' ')) {
    const cut = title.lastIndexOf(' ');
    lines = [title.slice(0, cut), title.slice(cut + 1)];
  }
  const blockH = h * 0.52;
  const lineH = blockH / lines.length;
  // Bright letters over the dark sky: paper white at the top, sunset amber
  // in the middle, hot pink at the foot — they must pop at thumbnail size.
  const grad = ctx.createLinearGradient(x, y + h * 0.18, x, y + h * 0.62);
  grad.addColorStop(0, palette.paper);
  grad.addColorStop(0.5, palette.sun);
  grad.addColorStop(1, palette.accent);
  lines.forEach((line, i) => {
    const cy = y + h * 0.24 + i * lineH;
    const size = fitTitleFont(ctx, line, w - pad * 2, Math.min(lineH * 0.92, w * 0.2));
    ctx.lineJoin = 'round';
    ctx.strokeStyle = palette.ink;
    ctx.lineWidth = Math.max(3, size * 0.09);
    ctx.strokeText(line, x + w / 2, cy);
    ctx.fillStyle = grad;
    ctx.fillText(line, x + w / 2, cy);
    // Thin paper highlight on the top edge of the letters.
    ctx.strokeStyle = palette.paper;
    ctx.lineWidth = Math.max(1, size * 0.012);
    ctx.globalAlpha = 0.5;
    ctx.strokeText(line, x + w / 2, cy - size * 0.02);
    ctx.globalAlpha = 1;
  });
  // Script subtitle.
  const sub = (state.subtitle || '').trim();
  if (sub) {
    const subSize = Math.max(14, h * 0.075);
    ctx.font = `${subSize}px Pacifico, cursive`;
    ctx.fillStyle = palette.accent2;
    ctx.shadowColor = palette.ink;
    ctx.shadowBlur = subSize * 0.3;
    ctx.fillText(sub, x + w / 2, y + h * 0.68);
    ctx.shadowBlur = 0;
  }
  // Studio name, letterspaced small caps.
  const studio = (state.studio || 'LEONIDA COVER STUDIO').trim().toUpperCase();
  const stSize = Math.max(10, h * 0.038);
  ctx.font = `bold ${stSize}px sans-serif`;
  ctx.fillStyle = palette.paper;
  ctx.globalAlpha = 0.9;
  ctx.fillText(studio.split('').join(' '), x + w / 2, y + h * 0.9);
  ctx.globalAlpha = 1;
}

/** The nine-panel collage: helicopter top-left, duo hero, title in the middle. */
function renderCollage(ctx, W, H, state, palette, rng) {
  const gutter = Math.max(6, Math.round(W * 0.011));
  const cw = (W - gutter * 4) / 3;
  const ch = (H - gutter * 4) / 3;
  // Backdrop ink: gutters show through as the thick black panel lines.
  ctx.fillStyle = palette.ink;
  ctx.fillRect(0, 0, W, H);
  const plan = rng.shuffle(FILLER_SCENES);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const idx = row * 3 + col;
      const rect = {
        x: gutter + col * (cw + gutter),
        y: gutter + row * (ch + gutter),
        w: cw,
        h: ch,
      };
      if (idx === 4) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(rect.x, rect.y, rect.w, rect.h);
        ctx.clip();
        drawTitleBlock(ctx, rect, palette, state, rng.fork('title'));
        ctx.restore();
        continue;
      }
      // Clip every scene to its panel: a palm's fronds must never cross a
      // gutter into the neighbouring panel's lettering.
      ctx.save();
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.w, rect.h);
      ctx.clip();
      const photo = photoForPanel(state, idx);
      if (photo) {
        drawStylizedPhoto(ctx, photo.img, rect, palette, rng.fork(`photo${idx}`), {
          zoom: photo.zoom, ox: photo.ox, oy: photo.oy, halftone: state.halftone,
        });
        ctx.restore();
        paintInkBorder(ctx, rect.x, rect.y, rect.w, rect.h, palette, Math.max(2, gutter * 0.3));
        continue;
      }
      const sceneRng = rng.fork(`panel${idx}`);
      if (idx === 0) {
        helicopterSky(ctx, sceneRng, palette, rect, sceneRng.int(0, 2));
      } else if (idx === 1) {
        duoPortrait(ctx, sceneRng, palette, rect, sceneRng.int(0, 2));
      } else {
        const scene = plan[(idx - 2 + plan.length) % plan.length];
        scene.fn(ctx, sceneRng, palette, rect, sceneRng.int(0, scene.variants - 1));
      }
      ctx.restore();
      if (state.ink) paintInkBorder(ctx, rect.x, rect.y, rect.w, rect.h, palette, Math.max(2, gutter * 0.3));
    }
  }
  // "Cover Star" ribbon on the hero panel when a photo fills it.
  if (photoForPanel(state, 1)) {
    const rect = { x: gutter + cw + gutter, y: gutter, w: cw, h: ch };
    const label = 'COVER STAR';
    ctx.font = `bold ${Math.max(12, W * 0.016)}px Anton, sans-serif`;
    const tw = ctx.measureText(label).width;
    const bw = tw + W * 0.03;
    const bh = Math.max(18, H * 0.032);
    ctx.fillStyle = palette.accent;
    ctx.fillRect(rect.x + rect.w - bw - W * 0.015, rect.y + rect.h - bh - H * 0.012, bw, bh);
    ctx.fillStyle = palette.paper;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, rect.x + rect.w - bw / 2 - W * 0.015, rect.y + rect.h - bh / 2 - H * 0.012);
  }
}

/** Key Art Poster: one big scene, the duo large at the foot, huge title. */
function renderKeyArt(ctx, W, H, state, palette, rng) {
  // Open scenes only: nothing with a big foreground object in the middle
  // that would fight the duo and the title band.
  const openScenes = FILLER_SCENES.filter((s) =>
    ['skyline', 'speedboat', 'ferris', 'seaplane'].includes(s.id));
  const scene = rng.pick(openScenes);
  const rect = { x: 0, y: 0, w: W, h: H };
  scene.fn(ctx, rng.fork('keyscene'), palette, rect, rng.int(0, scene.variants - 1));
  const photo = state.photos[0];
  if (photo) {
    // The photo becomes the poster figure: a stylised portrait strip.
    const pr = { x: W * 0.06, y: H * 0.34, w: W * 0.34, h: H * 0.34 };
    drawStylizedPhoto(ctx, photo.img, pr, palette, rng.fork('keyphoto'), {
      zoom: photo.zoom, ox: photo.ox, oy: photo.oy, halftone: state.halftone,
    });
    paintInkBorder(ctx, pr.x, pr.y, pr.w, pr.h, palette, Math.max(4, W * 0.006));
  } else {
    // A quay strip for the duo to stand on, at the skyline's water edge.
    if (scene.id === 'skyline') {
      ctx.fillStyle = palette.land;
      ctx.fillRect(0, H * 0.6, W, H * 0.08);
    }
    // The duo stands directly on the scene, unframed, like a poster.
    drawDuoFigures(ctx, palette, W * 0.05, H * 0.24, W * 0.5, H * 0.42);
  }
  // Bottom title band: dark fade, letters drawn straight onto it.
  const band = { x: 0, y: H * 0.68, w: W, h: H * 0.32 };
  const g = ctx.createLinearGradient(0, band.y, 0, band.y + band.h);
  g.addColorStop(0, palette.ink + '00');
  g.addColorStop(0.35, palette.ink + 'CC');
  g.addColorStop(1, palette.ink);
  ctx.fillStyle = g;
  ctx.fillRect(band.x, band.y, band.w, band.h);
  drawTitleBlock(ctx, { x: W * 0.05, y: band.y + band.h * 0.06, w: W * 0.9, h: band.h * 0.88 }, palette, state, rng.fork('keytitle'), { backdrop: false });
}

/** Wallpaper: a wide skyline at golden hour, title small and quiet. */
function renderWallpaper(ctx, W, H, state, palette, rng) {
  const rect = { x: 0, y: 0, w: W, h: H };
  skylineSunset(ctx, rng.fork('wallscene'), palette, rect, rng.int(0, 2));
  // Sun glow behind the title.
  paintGlow(ctx, W * 0.22, H * 0.3, W * 0.2, palette.sun, 0.5);
  const title = (state.title || 'NEON BAY VI').trim().toUpperCase();
  const size = fitTitleFont(ctx, title, W * 0.55, H * 0.16);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = Math.max(3, size * 0.08);
  ctx.strokeText(title, W * 0.05, H * 0.3);
  const grad = ctx.createLinearGradient(0, H * 0.14, 0, H * 0.3);
  const stops = palette.sky;
  for (let i = 0; i < stops.length; i++) grad.addColorStop(i / (stops.length - 1), stops[i]);
  ctx.fillStyle = grad;
  ctx.fillText(title, W * 0.05, H * 0.3);
  const sub = (state.subtitle || '').trim();
  if (sub) {
    ctx.font = `${Math.max(16, H * 0.05)}px Pacifico, cursive`;
    ctx.fillStyle = palette.paper;
    ctx.shadowColor = palette.ink;
    ctx.shadowBlur = 8;
    ctx.fillText(sub, W * 0.05, H * 0.3 + H * 0.075);
    ctx.shadowBlur = 0;
  }
  const studio = (state.studio || 'LEONIDA COVER STUDIO').trim().toUpperCase();
  ctx.font = `bold ${Math.max(11, H * 0.022)}px sans-serif`;
  ctx.fillStyle = palette.paper;
  ctx.globalAlpha = 0.85;
  ctx.fillText(studio, W * 0.05, H * 0.94);
  ctx.globalAlpha = 1;
  // Foreground palms at the right edge.
  paintPalm(ctx, W * 0.9, H, H * 0.55, 0.3, palette, palette.ink);
  paintPalm(ctx, W * 0.97, H, H * 0.42, -0.2, palette, palette.ink);
}

/**
 * Render the cover onto `canvas` at the state's size. The canvas is resized
 * to the export dimensions, so the preview is the export at full resolution.
 */
export function renderCover(canvas, state) {
  const size = EXPORT_SIZES[state.size] ?? EXPORT_SIZES.square;
  const W = size.w;
  const H = size.h;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const palette = paletteById(state.palette);
  const rng = makeRng(state.seed);
  if (state.preset === 'keyart') renderKeyArt(ctx, W, H, state, palette, rng);
  else if (state.preset === 'wallpaper') renderWallpaper(ctx, W, H, state, palette, rng);
  else renderCollage(ctx, W, H, state, palette, rng);
  // Finishing passes: halftone shadows, grain, vignette.
  paintHalftone(ctx, rng.fork('halftone'), 0, 0, W, H, palette, state.halftone * 0.5);
  paintGrain(ctx, rng.fork('grain'), W, H, state.grain);
  paintVignette(ctx, W, H, 0.5);
  return { w: W, h: H };
}

/** The panel plan for the current seed: scene label per collage panel. */
export function panelPlan(state) {
  const rng = makeRng(state.seed);
  const plan = rng.shuffle(FILLER_SCENES);
  const out = [];
  for (let i = 0; i < 9; i++) {
    if (i === 0) out.push('Helicopter');
    else if (i === 1) out.push('Cover Duo');
    else if (i === 4) out.push('Title block');
    else out.push(plan[(i - 2 + plan.length) % plan.length].label);
  }
  return out;
}
