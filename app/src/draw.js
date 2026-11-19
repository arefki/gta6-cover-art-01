// Shared drawing primitives for the procedural scenes. Every helper draws
// inside a rectangle (x, y, w, h) with the palette's colours and a seeded
// rng, in the flat "inked illustration" style: bold shapes, cel shading,
// thick outlines, halftone shadows.

import { clamp, lerp } from './prng.js';
import { skyGradient, mixHex } from './palettes.js';

/** Fill a rectangle with the palette sky gradient. */
export function paintSky(ctx, x, y, w, h, palette) {
  ctx.fillStyle = skyGradient(ctx, x, y, w, h, palette);
  ctx.fillRect(x, y, w, h);
}

/** A glowing sun disc with a soft halo. */
export function paintSun(ctx, cx, cy, r, palette) {
  const halo = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 2.6);
  halo.addColorStop(0, palette.sun);
  halo.addColorStop(0.45, palette.sun + '55');
  halo.addColorStop(1, palette.sun + '00');
  ctx.fillStyle = halo;
  ctx.fillRect(cx - r * 2.6, cy - r * 2.6, r * 5.2, r * 5.2);
  ctx.fillStyle = palette.sun;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = palette.paper;
  ctx.beginPath();
  ctx.arc(cx - r * 0.28, cy - r * 0.28, r * 0.42, 0, Math.PI * 2);
  ctx.fill();
}

/** A striped retro sun (horizontal cuts), for the skyline scenes. */
export function paintStripedSun(ctx, cx, cy, r, palette) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  const g = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  g.addColorStop(0, palette.sun);
  g.addColorStop(1, palette.accent);
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.fillStyle = palette.sky[0];
  for (let i = 0; i < 5; i++) {
    const yy = cy + r * (0.05 + i * 0.17);
    const hh = r * (0.03 + i * 0.035);
    ctx.fillRect(cx - r, yy, r * 2, hh);
  }
  ctx.restore();
}

/** One palm tree silhouette. s is the tree height in px; lean bends the trunk. */
export function paintPalm(ctx, x, y, s, lean, palette, ink) {
  const trunkW = Math.max(2, s * 0.045);
  ctx.strokeStyle = ink;
  ctx.lineWidth = trunkW;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + lean * s * 0.35, y - s * 0.55, x + lean * s, y - s);
  ctx.stroke();
  const topX = x + lean * s;
  const topY = y - s;
  ctx.fillStyle = ink;
  const fronds = 7;
  for (let i = 0; i < fronds; i++) {
    const a = (-Math.PI * 0.95 + (i / (fronds - 1)) * Math.PI * 1.9) / 1;
    const len = s * (0.42 + (i % 2) * 0.07);
    const droop = s * 0.28;
    const tipX = topX + Math.cos(a) * len;
    const tipY = topY + Math.sin(a) * len * 0.55 + droop * Math.abs(Math.sin(a));
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + Math.cos(a) * len * 0.5,
      topY + Math.sin(a) * len * 0.28 - s * 0.06,
      tipX,
      tipY,
    );
    ctx.quadraticCurveTo(
      topX + Math.cos(a) * len * 0.55,
      topY + Math.sin(a) * len * 0.42 + s * 0.05,
      topX,
      topY,
    );
    ctx.fill();
  }
  // Coconuts.
  ctx.beginPath();
  ctx.arc(topX - trunkW, topY + trunkW, trunkW * 0.7, 0, Math.PI * 2);
  ctx.arc(topX + trunkW * 0.6, topY + trunkW * 1.2, trunkW * 0.7, 0, Math.PI * 2);
  ctx.fill();
}

/** A cluster of palms along the bottom of a rectangle. */
export function paintPalmCluster(ctx, rng, x, y, w, h, palette, count) {
  const ink = palette.ink;
  for (let i = 0; i < count; i++) {
    const px = x + rng.range(w * 0.06, w * 0.94);
    const s = h * rng.range(0.35, 0.72);
    const lean = rng.range(-0.45, 0.45);
    paintPalm(ctx, px, y + h * rng.range(0.86, 1.0), s, lean, palette, ink);
  }
}

/** A city skyline: staggered towers with lit windows, drawn from the bottom. */
export function paintSkyline(ctx, rng, x, y, w, h, palette, opts = {}) {
  const baseY = y + h;
  const towers = opts.towers ?? 9;
  const minH = h * (opts.minH ?? 0.25);
  const maxH = h * (opts.maxH ?? 0.85);
  let cx = x;
  const step = w / towers;
  for (let i = 0; i < towers; i++) {
    const tw = step * rng.range(0.62, 0.95);
    const th = rng.range(minH, maxH);
    const shade = rng.pick([palette.land, palette.ink, mixHex(palette.land, palette.ink, 0.5)]);
    ctx.fillStyle = shade;
    ctx.fillRect(cx, baseY - th, tw, th);
    // Rooftop detail: antenna or water tower.
    if (rng.chance(0.4)) {
      ctx.fillRect(cx + tw * 0.42, baseY - th - h * 0.08, tw * 0.16, h * 0.08);
    }
    if (rng.chance(0.3)) {
      ctx.strokeStyle = shade;
      ctx.lineWidth = Math.max(1, w * 0.004);
      ctx.beginPath();
      ctx.moveTo(cx + tw / 2, baseY - th);
      ctx.lineTo(cx + tw / 2, baseY - th - h * 0.14);
      ctx.stroke();
    }
    // Lit windows.
    const cols = Math.max(1, Math.floor(tw / (w * 0.035)));
    const rows = Math.max(1, Math.floor(th / (h * 0.075)));
    for (let cxi = 0; cxi < cols; cxi++) {
      for (let ryi = 0; ryi < rows; ryi++) {
        if (!rng.chance(0.28)) continue;
        ctx.fillStyle = rng.chance(0.75) ? palette.sun : palette.accent2;
        ctx.globalAlpha = rng.range(0.5, 1);
        ctx.fillRect(
          cx + tw * 0.12 + cxi * ((tw * 0.76) / Math.max(1, cols)),
          baseY - th + th * 0.1 + ryi * ((th * 0.8) / Math.max(1, rows)),
          Math.max(1.5, w * 0.012),
          Math.max(1.5, h * 0.02),
        );
      }
    }
    ctx.globalAlpha = 1;
    cx += step;
  }
}

/** Water with horizontal sun glints. */
export function paintWater(ctx, rng, x, y, w, h, palette, sunX) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, palette.sea);
  g.addColorStop(1, palette.ink);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = palette.sun;
  for (let i = 0; i < 14; i++) {
    const gy = y + rng.range(0.08, 0.95) * h;
    const gw = w * rng.range(0.04, 0.22) * (1 - Math.abs(gy - y) / h);
    const gx = sunX + rng.range(-w * 0.18, w * 0.18);
    ctx.globalAlpha = rng.range(0.15, 0.55);
    ctx.fillRect(clamp(gx - gw / 2, x, x + w - gw), gy, Math.max(2, gw), Math.max(1.5, h * 0.02));
  }
  ctx.globalAlpha = 1;
}

/** A few distant birds: simple two-stroke gulls. */
export function paintBirds(ctx, rng, x, y, w, h, palette, count = 4) {
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = Math.max(1.5, w * 0.006);
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const bx = x + rng.range(w * 0.1, w * 0.9);
    const by = y + rng.range(h * 0.08, h * 0.4);
    const s = w * rng.range(0.02, 0.045);
    ctx.beginPath();
    ctx.moveTo(bx - s, by);
    ctx.quadraticCurveTo(bx - s * 0.4, by - s * 0.7, bx, by);
    ctx.quadraticCurveTo(bx + s * 0.4, by - s * 0.7, bx + s, by);
    ctx.stroke();
  }
}

/** Soft banded clouds in the sky's lightest tone. */
export function paintClouds(ctx, rng, x, y, w, h, palette, count = 3) {
  ctx.fillStyle = palette.paper;
  for (let i = 0; i < count; i++) {
    const cx = x + rng.range(w * 0.08, w * 0.85);
    const cy = y + rng.range(h * 0.06, h * 0.4);
    const cw = w * rng.range(0.18, 0.42);
    const ch = h * rng.range(0.05, 0.1);
    ctx.globalAlpha = rng.range(0.14, 0.3);
    ctx.beginPath();
    ctx.ellipse(cx, cy, cw / 2, ch / 2, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + cw * 0.22, cy - ch * 0.25, cw * 0.28, ch * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Stars for night skies. */
export function paintStars(ctx, rng, x, y, w, h, count = 26, color = '#FFF6EC') {
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const sx = x + rng.range(0, w);
    const sy = y + rng.range(0, h * 0.55);
    const r = rng.range(0.8, 2.2);
    ctx.globalAlpha = rng.range(0.35, 1);
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Halftone dots over a rectangle: denser toward the bottom. */
export function paintHalftone(ctx, rng, x, y, w, h, palette, strength) {
  if (strength <= 0) return;
  const gap = Math.max(5, w * 0.022);
  ctx.fillStyle = palette.ink;
  for (let gy = y; gy < y + h; gy += gap) {
    for (let gx = x + ((Math.round((gy - y) / gap) % 2) * gap) / 2; gx < x + w; gx += gap) {
      const t = (gy - y) / h;
      const r = gap * 0.16 * (0.4 + t * 1.6) * strength;
      if (r < 0.6) continue;
      ctx.globalAlpha = 0.16 + t * 0.3 * strength;
      ctx.beginPath();
      ctx.arc(gx, gy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

/** Film grain: seeded speckle across the whole canvas. */
export function paintGrain(ctx, rng, w, h, amount) {
  if (amount <= 0) return;
  const n = Math.floor(w * h * 0.00012 * amount);
  for (let i = 0; i < n; i++) {
    const gx = rng.range(0, w);
    const gy = rng.range(0, h);
    ctx.globalAlpha = rng.range(0.04, 0.16) * amount;
    ctx.fillStyle = rng.chance(0.5) ? '#ffffff' : '#000000';
    ctx.fillRect(gx, gy, 1.4, 1.4);
  }
  ctx.globalAlpha = 1;
}

/** A vignette: darkened corners, drawn over everything. */
export function paintVignette(ctx, w, h, strength) {
  if (strength <= 0) return;
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${0.42 * strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** Thick ink border around a rectangle, the comic-panel look. */
export function paintInkBorder(ctx, x, y, w, h, palette, lw) {
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = lw;
  ctx.strokeRect(x + lw / 2, y + lw / 2, w - lw, h - lw);
}

/** A soft radial glow, for neon signs and headlights. */
export function paintGlow(ctx, cx, cy, r, color, alpha) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, color);
  g.addColorStop(1, color + '00');
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.globalAlpha = 1;
}

/** Lerp helper re-exported for scenes that need it. */
export { lerp };
