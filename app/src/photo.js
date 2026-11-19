// Photo stylising for the "Cover Star" panels. A user's photo is drawn
// cover-fit into the panel, then graded deterministically: posterize to a
// few levels, map luminance onto the palette's sunset duotone, outline the
// strong edges in ink, and lay halftone dots over the shadows. The result
// is a pure function of (photo pixels, seed, zoom, offsets, palette).

import { hexRgb } from './palettes.js';

/**
 * Draw a photo into a panel rect with the comic stylisation.
 *   ctx    — the cover's 2D context
 *   img    — the loaded photo (HTMLImageElement)
 *   rect   — {x, y, w, h} of the panel
 *   palette— the active palette (for the duotone)
 *   rng    — seeded stream for the halftone jitter
 *   opts   — {zoom, ox, oy, levels, halftone} (ox/oy are -0.5..0.5 fractions)
 */
export function drawStylizedPhoto(ctx, img, rect, palette, rng, opts = {}) {
  const { x, y, w, h } = rect;
  const zoom = opts.zoom ?? 1;
  const ox = opts.ox ?? 0;
  const oy = opts.oy ?? 0;
  const levels = opts.levels ?? 5;
  const halftone = opts.halftone ?? 0.6;
  const off = document.createElement('canvas');
  off.width = Math.max(2, Math.round(w));
  off.height = Math.max(2, Math.round(h));
  const octx = off.getContext('2d');
  // Cover-fit with the user's zoom and pan.
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * zoom;
  const pw = img.naturalWidth * scale;
  const ph = img.naturalHeight * scale;
  const dx = (w - pw) / 2 + ox * w;
  const dy = (h - ph) / 2 + oy * h;
  octx.drawImage(img, dx, dy, pw, ph);

  const data = octx.getImageData(0, 0, off.width, off.height);
  const px = data.data;
  const dark = hexRgb(palette.duotone[0]);
  const light = hexRgb(palette.duotone[1]);
  const steps = levels - 1;
  // Luminance + posterize + duotone in one pass.
  const lum = new Float32Array(off.width * off.height);
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const q = Math.round(l * steps) / steps;
    lum[i / 4] = q;
    // Keep a little of the photo's own hue, graded toward the duotone.
    const mix = 0.62;
    px[i] = Math.round((dark[0] + (light[0] - dark[0]) * q) * mix + r * (1 - mix) * (0.4 + q * 0.6));
    px[i + 1] = Math.round((dark[1] + (light[1] - dark[1]) * q) * mix + g * (1 - mix) * (0.4 + q * 0.6));
    px[i + 2] = Math.round((dark[2] + (light[2] - dark[2]) * q) * mix + b * (1 - mix) * (0.4 + q * 0.6));
  }
  // Ink outline: where luminance jumps between neighbours, darken.
  const W = off.width;
  const H = off.height;
  const edge = new Uint8Array(W * H);
  for (let yy = 1; yy < H - 1; yy++) {
    for (let xx = 1; xx < W - 1; xx++) {
      const c = lum[yy * W + xx];
      const d = Math.max(
        Math.abs(c - lum[yy * W + xx + 1]),
        Math.abs(c - lum[(yy + 1) * W + xx]),
      );
      if (d > 0.24) edge[yy * W + xx] = 1;
    }
  }
  for (let i = 0; i < edge.length; i++) {
    if (!edge[i]) continue;
    const k = i * 4;
    px[k] = Math.round(px[k] * 0.15);
    px[k + 1] = Math.round(px[k + 1] * 0.15);
    px[k + 2] = Math.round(px[k + 2] * 0.15);
  }
  octx.putImageData(data, 0, 0);

  // Halftone dots over the dark half.
  if (halftone > 0) {
    const gap = Math.max(5, w * 0.02);
    octx.fillStyle = palette.ink;
    for (let gy = gap / 2; gy < h; gy += gap) {
      for (let gx = gap / 2 + ((Math.round(gy / gap) % 2) * gap) / 2; gx < w; gx += gap) {
        const lx = Math.min(W - 1, Math.max(0, Math.round(gx)));
        const ly = Math.min(H - 1, Math.max(0, Math.round(gy)));
        const q = lum[ly * W + lx];
        if (q > 0.55) continue;
        const rr = gap * 0.22 * (1 - q) * halftone * 2;
        if (rr < 0.7) continue;
        octx.globalAlpha = 0.35 * halftone;
        octx.beginPath();
        octx.arc(gx, gy, rr, 0, Math.PI * 2);
        octx.fill();
      }
    }
    octx.globalAlpha = 1;
  }

  ctx.drawImage(off, x, y, w, h);
}
