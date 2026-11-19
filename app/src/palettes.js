// Sunset palettes for Leonida Cover Studio. Each palette is one grade for the
// whole cover: sky stops (top to bottom), sun, sea, land, neon accents, the
// ink used for panel lines, and the two-colour duotone a photo is graded with.

export const PALETTES = {
  'vice-sunset': {
    label: 'Vice Sunset',
    sky: ['#1B2A6B', '#7B2FBE', '#FF2E88', '#FF7A18'],
    sun: '#FFC46B',
    sea: '#0B3B5C',
    land: '#2A1030',
    accent: '#FF2E88',
    accent2: '#19E3D6',
    ink: '#0A0A12',
    paper: '#FFF6EC',
    duotone: ['#1B1035', '#FFB347'],
  },
  'neon-night': {
    label: 'Neon Night',
    sky: ['#070718', '#2A0A4A', '#7B0F5E', '#C2185B'],
    sun: '#FF6EC7',
    sea: '#04122B',
    land: '#12041F',
    accent: '#FF2E88',
    accent2: '#19E3D6',
    ink: '#05050C',
    paper: '#FFF6EC',
    duotone: ['#0A0618', '#FF7AD9'],
  },
  'golden-hour': {
    label: 'Golden Hour',
    sky: ['#274690', '#B4503A', '#F07F2E', '#FFC46B'],
    sun: '#FFE9A8',
    sea: '#1D4E6B',
    land: '#3A1F16',
    accent: '#FF7A18',
    accent2: '#FFC46B',
    ink: '#140D08',
    paper: '#FFF8EC',
    duotone: ['#2A1A10', '#FFD98A'],
  },
  'pastel-dawn': {
    label: 'Pastel Dawn',
    sky: ['#7FA8D9', '#C9A0DC', '#FF9EC7', '#FFD3A3'],
    sun: '#FFF3C4',
    sea: '#5E8FB0',
    land: '#4A3550',
    accent: '#FF6FA5',
    accent2: '#5FD8CE',
    ink: '#241B2E',
    paper: '#FFFBF2',
    duotone: ['#3A2E4A', '#FFC2D9'],
  },
  'mono-ink': {
    label: 'Mono Ink',
    sky: ['#111118', '#3A3A46', '#8A8A96', '#E8E4DA'],
    sun: '#F5F0E4',
    sea: '#1E1E26',
    land: '#0C0C10',
    accent: '#E8E4DA',
    accent2: '#9A9AA8',
    ink: '#050508',
    paper: '#F5F0E4',
    duotone: ['#0C0C10', '#EDE8DA'],
  },
};

export const PALETTE_ORDER = [
  'vice-sunset',
  'neon-night',
  'golden-hour',
  'pastel-dawn',
  'mono-ink',
];

/** Look a palette up by id, falling back to Vice Sunset. */
export function paletteById(id) {
  return PALETTES[id] ?? PALETTES['vice-sunset'];
}

/** A vertical sky gradient for a rectangle, in the palette's stops. */
export function skyGradient(ctx, x, y, w, h, palette) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  const stops = palette.sky;
  for (let i = 0; i < stops.length; i++) {
    g.addColorStop(i / (stops.length - 1), stops[i]);
  }
  return g;
}

/** Parse a #rrggbb colour into [r, g, b]. */
export function hexRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Mix two #rrggbb colours by t (0 = a, 1 = b). */
export function mixHex(a, b, t) {
  const ca = hexRgb(a);
  const cb = hexRgb(b);
  const r = Math.round(ca[0] + (cb[0] - ca[0]) * t);
  const g = Math.round(ca[1] + (cb[1] - ca[1]) * t);
  const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t);
  return `rgb(${r},${g},${bl})`;
}
