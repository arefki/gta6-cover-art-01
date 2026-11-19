// Procedural scene library, part one. Each scene is an original inked
// illustration drawn from a seeded rng inside a rectangle (x, y, w, h).
// No scene copies official artwork: the helicopter, the duo, the cars and
// the animals are all drawn here from primitives.

import { paintSky, paintSun, paintStripedSun, paintPalm, paintPalmCluster, paintSkyline, paintWater, paintBirds, paintClouds, paintStars, paintGlow, paintInkBorder } from './draw.js';
import { mixHex } from './palettes.js';

/** The helicopter, always in the top-left panel by tradition. */
export function helicopterSky(ctx, rng, p, r, variant) {
  paintSky(ctx, r.x, r.y, r.w, r.h, p);
  const sunX = r.x + r.w * rng.range(0.6, 0.8);
  const sunY = r.y + r.h * rng.range(0.2, 0.35);
  paintSun(ctx, sunX, sunY, r.w * 0.11, p);
  paintClouds(ctx, rng, r.x, r.y, r.w, r.h, p, 3);
  paintBirds(ctx, rng, r.x, r.y, r.w, r.h, p, 3);
  // Distant skyline along the bottom.
  const baseY = r.y + r.h;
  ctx.fillStyle = p.land;
  const bw = r.w / 7;
  for (let i = 0; i < 7; i++) {
    const bh = r.h * rng.range(0.08, 0.2);
    ctx.fillRect(r.x + i * bw, baseY - bh, bw * 0.8, bh);
  }
  // Helicopter silhouette, centre-left, nose pointing right.
  const cx = r.x + r.w * 0.44;
  const cy = r.y + r.h * 0.44;
  const s = r.w * 0.3;
  const ink = p.ink;
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  // Tail boom and fin.
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.1, cy - s * 0.12);
  ctx.lineTo(cx - s * 0.95, cy - s * 0.28);
  ctx.lineTo(cx - s * 0.95, cy - s * 0.08);
  ctx.lineTo(cx - s * 0.1, cy + s * 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.95, cy - s * 0.28);
  ctx.lineTo(cx - s * 1.05, cy - s * 0.62);
  ctx.lineTo(cx - s * 0.88, cy - s * 0.55);
  ctx.closePath();
  ctx.fill();
  // Tail rotor.
  ctx.lineWidth = Math.max(2, s * 0.03);
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.98, cy - s * 0.42);
  ctx.lineTo(cx - s * 0.98, cy - s * 0.05);
  ctx.stroke();
  // Body: rounded cabin.
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.28, cy - s * 0.18);
  ctx.quadraticCurveTo(cx + s * 0.1, cy - s * 0.34, cx + s * 0.42, cy - s * 0.18);
  ctx.quadraticCurveTo(cx + s * 0.62, cy - s * 0.02, cx + s * 0.5, cy + s * 0.14);
  ctx.quadraticCurveTo(cx + s * 0.2, cy + s * 0.3, cx - s * 0.28, cy + s * 0.2);
  ctx.closePath();
  ctx.fill();
  // Cockpit glass: a sunset-lit window.
  ctx.fillStyle = p.accent2;
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.18, cy - s * 0.16);
  ctx.quadraticCurveTo(cx + s * 0.38, cy - s * 0.14, cx + s * 0.44, cy - s * 0.02);
  ctx.lineTo(cx + s * 0.3, cy + s * 0.02);
  ctx.lineTo(cx + s * 0.16, cy - s * 0.02);
  ctx.closePath();
  ctx.fill();
  // Main rotor: long blurred bar with a mast.
  ctx.fillStyle = ink;
  ctx.fillRect(cx - s * 0.95, cy - s * 0.42, s * 1.9, Math.max(2.5, s * 0.035));
  ctx.fillRect(cx - s * 0.06, cy - s * 0.42, s * 0.12, s * 0.12);
  // Skids.
  ctx.strokeStyle = ink;
  ctx.lineWidth = Math.max(2, s * 0.035);
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.3, cy + s * 0.3);
  ctx.lineTo(cx - s * 0.22, cy + s * 0.44);
  ctx.lineTo(cx + s * 0.48, cy + s * 0.44);
  ctx.lineTo(cx + s * 0.4, cy + s * 0.3);
  ctx.stroke();
  // Rotor wash: motion lines under the blades.
  ctx.strokeStyle = p.paper;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = Math.max(1, s * 0.02);
  for (let i = 0; i < 4; i++) {
    const lx = cx - s * 0.8 + i * s * 0.5;
    ctx.beginPath();
    ctx.moveTo(lx, cy - s * 0.52);
    ctx.lineTo(lx + s * 0.06, cy - s * 0.58);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** Two original characters standing together: the cover's duo panel. */
export function duoPortrait(ctx, rng, p, r, variant) {
  paintSky(ctx, r.x, r.y, r.w, r.h, p);
  const sunX = r.x + r.w * 0.5;
  const sunY = r.y + r.h * 0.34;
  paintStripedSun(ctx, sunX, sunY, r.w * 0.26, p);
  paintPalmCluster(ctx, rng, r.x, r.y, r.w, r.h, p, 2);
  // Ground.
  ctx.fillStyle = p.land;
  ctx.fillRect(r.x, r.y + r.h * 0.78, r.w, r.h * 0.22);
  ctx.fillStyle = mixHex(p.land, p.ink, 0.4);
  ctx.fillRect(r.x, r.y + r.h * 0.78, r.w, r.h * 0.03);
  drawDuoFigures(ctx, p, r.x, r.y + r.h * 0.52, r.w, r.h * 0.28);
}

/**
 * Just the two figures, on a transparent background — for the Key Art
 * poster, where they stand directly on the scene. `rect` frames the pair:
 * `h` is the figures' height and they stand on its bottom edge.
 */
export function drawDuoFigures(ctx, p, x, y, w, h) {
  const gy = y + h;
  const ink = p.ink;
  // Figure A (left): tall, cap, jacket.
  drawFigure(ctx, x + w * 0.34, gy, h * 0.98, ink, p, {
    cap: true, jacket: 'A', skin: p.accent, shirt: p.paper,
  });
  // Figure B (right): shorter, hair tied back, open shirt, hand on hip.
  drawFigure(ctx, x + w * 0.66, gy, h * 0.88, ink, p, {
    cap: false, jacket: 'B', skin: p.accent2, shirt: p.sun,
  });
  // Shared shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(x + w * 0.5, gy + h * 0.02, w * 0.32, h * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** One stylised standing figure, drawn from primitives. */
function drawFigure(ctx, cx, groundY, h, ink, p, opts) {
  const headR = h * 0.11;
  const headY = groundY - h + headR;
  const shoulderY = groundY - h * 0.82;
  const hipY = groundY - h * 0.42;
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  // Legs.
  ctx.lineWidth = h * 0.075;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - h * 0.06, hipY);
  ctx.lineTo(cx - h * 0.09, groundY);
  ctx.moveTo(cx + h * 0.06, hipY);
  ctx.lineTo(cx + h * 0.1, groundY);
  ctx.stroke();
  // Torso: jacket.
  ctx.beginPath();
  ctx.moveTo(cx - h * 0.2, shoulderY);
  ctx.quadraticCurveTo(cx, shoulderY - h * 0.05, cx + h * 0.2, shoulderY);
  ctx.lineTo(cx + h * 0.17, hipY);
  ctx.lineTo(cx - h * 0.17, hipY);
  ctx.closePath();
  ctx.fill();
  // Shirt slash down the middle.
  ctx.fillStyle = opts.shirt;
  ctx.beginPath();
  ctx.moveTo(cx - h * 0.05, shoulderY);
  ctx.lineTo(cx + h * 0.05, shoulderY);
  ctx.lineTo(cx + h * 0.04, hipY);
  ctx.lineTo(cx - h * 0.04, hipY);
  ctx.closePath();
  ctx.fill();
  // Arms.
  ctx.strokeStyle = ink;
  ctx.lineWidth = h * 0.06;
  ctx.beginPath();
  ctx.moveTo(cx - h * 0.19, shoulderY + h * 0.06);
  ctx.lineTo(cx - h * 0.24, hipY - h * 0.05);
  ctx.moveTo(cx + h * 0.19, shoulderY + h * 0.06);
  if (opts.jacket === 'B') {
    ctx.lineTo(cx + h * 0.3, hipY - h * 0.16); // hand on hip
  } else {
    ctx.lineTo(cx + h * 0.22, hipY - h * 0.04);
  }
  ctx.stroke();
  // Head.
  ctx.fillStyle = opts.skin;
  ctx.beginPath();
  ctx.arc(cx, headY, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = Math.max(1.5, h * 0.02);
  ctx.stroke();
  // Shades: a dark bar across the eyes — the face stays a clean silhouette.
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.roundRect(cx - headR * 0.78, headY - headR * 0.3, headR * 1.56, headR * 0.42, headR * 0.2);
  ctx.fill();
  ctx.fillStyle = p.paper;
  ctx.globalAlpha = 0.7;
  ctx.fillRect(cx - headR * 0.5, headY - headR * 0.22, headR * 0.28, headR * 0.1);
  ctx.globalAlpha = 1;
  // Hair / cap.
  ctx.fillStyle = ink;
  if (opts.cap) {
    ctx.beginPath();
    ctx.arc(cx, headY - headR * 0.25, headR * 1.02, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx - headR * 0.2, headY - headR * 0.9, headR * 1.5, headR * 0.35);
  } else {
    ctx.beginPath();
    ctx.arc(cx, headY - headR * 0.3, headR * 0.95, Math.PI * 0.95, Math.PI * 2.05);
    ctx.fill();
    // Tied-back hair.
    ctx.beginPath();
    ctx.moveTo(cx + headR * 0.7, headY - headR * 0.2);
    ctx.quadraticCurveTo(cx + headR * 1.5, headY + headR * 0.4, cx + headR * 0.9, headY + headR * 1.1);
    ctx.quadraticCurveTo(cx + headR * 0.5, headY + headR * 0.3, cx + headR * 0.7, headY - headR * 0.2);
    ctx.fill();
  }
}

/** Golden-hour skyline over water, the wide postcard shot. */
export function skylineSunset(ctx, rng, p, r, variant) {
  paintSky(ctx, r.x, r.y, r.w, r.h, p);
  const sunX = r.x + r.w * rng.range(0.3, 0.7);
  const sunY = r.y + r.h * rng.range(0.3, 0.45);
  if (variant === 1) paintStripedSun(ctx, sunX, sunY, r.w * 0.16, p);
  else paintSun(ctx, sunX, sunY, r.w * 0.13, p);
  paintClouds(ctx, rng, r.x, r.y, r.w, r.h * 0.5, p, 2);
  paintBirds(ctx, rng, r.x, r.y, r.w, r.h, p, 3);
  const horizon = r.y + r.h * 0.62;
  paintSkyline(ctx, rng, r.x, r.y, r.w, horizon - r.y, p, { towers: 10, minH: 0.3, maxH: 0.95 });
  paintWater(ctx, rng, r.x, horizon, r.w, r.y + r.h - horizon, p, sunX);
  // Foreground palm silhouettes.
  paintPalm(ctx, r.x + r.w * 0.08, r.y + r.h, r.h * 0.42, -0.3, p, p.ink);
  if (variant === 2) paintPalm(ctx, r.x + r.w * 0.93, r.y + r.h, r.h * 0.36, 0.35, p, p.ink);
}

/** Beach with palms, sea and a striped umbrella. */
export function beachPalms(ctx, rng, p, r, variant) {
  paintSky(ctx, r.x, r.y, r.w, r.h * 0.55, p);
  const sunX = r.x + r.w * rng.range(0.2, 0.8);
  paintSun(ctx, sunX, r.y + r.h * 0.18, r.w * 0.1, p);
  paintClouds(ctx, rng, r.x, r.y, r.w, r.h * 0.4, p, 2);
  paintWater(ctx, rng, r.x, r.y + r.h * 0.42, r.w, r.h * 0.2, p, sunX);
  // Sand.
  const sandY = r.y + r.h * 0.62;
  const g = ctx.createLinearGradient(r.x, sandY, r.x, r.y + r.h);
  g.addColorStop(0, p.sun);
  g.addColorStop(1, mixHex(p.sun, p.accent, 0.35));
  ctx.fillStyle = g;
  ctx.fillRect(r.x, sandY, r.w, r.y + r.h - sandY);
  // Palms.
  paintPalm(ctx, r.x + r.w * 0.14, r.y + r.h * 0.95, r.h * 0.55, -0.35, p, p.ink);
  paintPalm(ctx, r.x + r.w * 0.88, r.y + r.h * 0.98, r.h * 0.48, 0.3, p, p.ink);
  // Umbrella.
  const ux = r.x + r.w * 0.58;
  const uy = r.y + r.h * 0.72;
  ctx.strokeStyle = p.ink;
  ctx.lineWidth = Math.max(2, r.w * 0.008);
  ctx.beginPath();
  ctx.moveTo(ux, uy);
  ctx.lineTo(ux, uy + r.h * 0.2);
  ctx.stroke();
  const uw = r.w * 0.34;
  for (let i = 0; i < 6; i++) {
    const a0 = Math.PI + (i / 6) * Math.PI;
    const a1 = Math.PI + ((i + 1) / 6) * Math.PI;
    ctx.fillStyle = i % 2 === 0 ? p.accent : p.paper;
    ctx.beginPath();
    ctx.moveTo(ux, uy);
    ctx.arc(ux, uy, uw / 2, a0, a1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  // Footprints in the sand.
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(r.x + r.w * (0.3 + i * 0.07), r.y + r.h * (0.86 + (i % 2) * 0.03), r.w * 0.012, r.h * 0.012, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Speedboat on blue water with a pink flamingo overhead. */
export function speedboatFlamingo(ctx, rng, p, r, variant) {
  paintSky(ctx, r.x, r.y, r.w, r.h * 0.5, p);
  paintClouds(ctx, rng, r.x, r.y, r.w, r.h * 0.35, p, 2);
  // Flamingo flying across the sky.
  const fx = r.x + r.w * rng.range(0.55, 0.75);
  const fy = r.y + r.h * rng.range(0.12, 0.28);
  const fs = r.w * 0.09;
  ctx.fillStyle = p.accent;
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = Math.max(2, fs * 0.12);
  // Body + neck.
  ctx.beginPath();
  ctx.ellipse(fx, fy, fs * 0.9, fs * 0.32, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(fx + fs * 0.7, fy - fs * 0.1);
  ctx.quadraticCurveTo(fx + fs * 1.4, fy - fs * 0.55, fx + fs * 1.35, fy - fs * 0.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(fx + fs * 1.35, fy - fs * 0.95, fs * 0.16, 0, Math.PI * 2);
  ctx.fill();
  // Wings.
  ctx.beginPath();
  ctx.moveTo(fx - fs * 0.2, fy - fs * 0.1);
  ctx.quadraticCurveTo(fx - fs * 0.1, fy - fs * 0.95, fx + fs * 0.5, fy - fs * 0.75);
  ctx.quadraticCurveTo(fx + fs * 0.1, fy - fs * 0.2, fx - fs * 0.2, fy - fs * 0.1);
  ctx.fill();
  // Legs trailing.
  ctx.beginPath();
  ctx.moveTo(fx - fs * 0.8, fy + fs * 0.1);
  ctx.lineTo(fx - fs * 1.5, fy + fs * 0.35);
  ctx.stroke();
  // Sea.
  paintWater(ctx, rng, r.x, r.y + r.h * 0.45, r.w, r.h * 0.55, p, r.x + r.w * 0.5);
  // Speedboat.
  const bx = r.x + r.w * 0.5;
  const by = r.y + r.h * 0.62;
  const bw = r.w * 0.62;
  const bh = r.h * 0.16;
  ctx.fillStyle = p.paper;
  ctx.strokeStyle = p.ink;
  ctx.lineWidth = Math.max(2, r.w * 0.008);
  ctx.beginPath();
  ctx.moveTo(bx - bw / 2, by);
  ctx.lineTo(bx + bw / 2, by - bh * 0.4);
  ctx.lineTo(bx + bw / 2, by + bh * 0.5);
  ctx.lineTo(bx - bw * 0.32, by + bh * 0.9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Hull stripe.
  ctx.fillStyle = p.accent;
  ctx.beginPath();
  ctx.moveTo(bx - bw * 0.42, by + bh * 0.28);
  ctx.lineTo(bx + bw * 0.48, by + bh * 0.05);
  ctx.lineTo(bx + bw * 0.48, by + bh * 0.28);
  ctx.lineTo(bx - bw * 0.38, by + bh * 0.5);
  ctx.closePath();
  ctx.fill();
  // Windshield + driver.
  ctx.fillStyle = p.accent2;
  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.08, by - bh * 0.35);
  ctx.lineTo(bx + bw * 0.3, by - bh * 0.35);
  ctx.lineTo(bx + bw * 0.3, by - bh * 0.05);
  ctx.lineTo(bx + bw * 0.08, by - bh * 0.05);
  ctx.closePath();
  ctx.fill();
  // Wake.
  ctx.strokeStyle = p.paper;
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = Math.max(1.5, r.w * 0.006);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(bx - bw * 0.5, by + bh * (0.7 + i * 0.35));
    ctx.quadraticCurveTo(bx - bw * 0.2, by + bh * (1.1 + i * 0.4), bx + bw * 0.1, by + bh * (0.9 + i * 0.4));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** Neon supercar on a wet night street. */
export function supercarNeon(ctx, rng, p, r, variant) {
  // Night sky.
  const g = ctx.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
  g.addColorStop(0, p.sky[0]);
  g.addColorStop(0.6, p.sky[1]);
  g.addColorStop(1, p.sky[2]);
  ctx.fillStyle = g;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  paintStars(ctx, rng, r.x, r.y, r.w, r.h, 18, p.paper);
  // Buildings with neon signs.
  const baseY = r.y + r.h * 0.72;
  ctx.fillStyle = p.ink;
  for (let i = 0; i < 5; i++) {
    const bw = r.w * 0.2;
    const bh = r.h * rng.range(0.3, 0.55);
    ctx.fillRect(r.x + i * bw, baseY - bh, bw * 0.92, bh);
  }
  // Neon sign bars.
  const signs = [p.accent, p.accent2, p.sun, p.accent];
  for (let i = 0; i < 4; i++) {
    const sx = r.x + r.w * (0.06 + i * 0.24);
    const sy = r.y + r.h * rng.range(0.16, 0.4);
    const sw = r.w * rng.range(0.1, 0.17);
    paintGlow(ctx, sx + sw / 2, sy, sw * 0.9, signs[i], 0.8);
    ctx.fillStyle = signs[i];
    ctx.fillRect(sx, sy - r.h * 0.012, sw, r.h * 0.024);
    ctx.fillRect(sx + sw * 0.15, sy + r.h * 0.02, sw * 0.7, r.h * 0.014);
  }
  // Wet road.
  const roadY = baseY;
  const rg = ctx.createLinearGradient(r.x, roadY, r.x, r.y + r.h);
  rg.addColorStop(0, mixHex(p.ink, p.accent, 0.25));
  rg.addColorStop(1, p.ink);
  ctx.fillStyle = rg;
  ctx.fillRect(r.x, roadY, r.w, r.y + r.h - roadY);
  // Reflections of the signs on the road.
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = signs[i];
    const sx = r.x + r.w * (0.06 + i * 0.24);
    ctx.fillRect(sx, roadY + r.h * 0.04, r.w * 0.12, r.h * 0.16);
  }
  ctx.globalAlpha = 1;
  // Supercar: low wedge profile.
  const cx = r.x + r.w * 0.5;
  const cy = r.y + r.h * 0.82;
  const cw = r.w * 0.72;
  const ch = r.h * 0.2;
  const body = variant === 1 ? p.accent : p.sun;
  ctx.fillStyle = body;
  ctx.strokeStyle = p.ink;
  ctx.lineWidth = Math.max(2, r.w * 0.008);
  ctx.beginPath();
  ctx.moveTo(cx - cw / 2, cy);
  ctx.lineTo(cx - cw * 0.38, cy - ch * 0.42);
  ctx.lineTo(cx - cw * 0.18, cy - ch * 0.72);
  ctx.lineTo(cx + cw * 0.16, cy - ch * 0.78);
  ctx.lineTo(cx + cw * 0.34, cy - ch * 0.42);
  ctx.lineTo(cx + cw / 2, cy - ch * 0.18);
  ctx.lineTo(cx + cw * 0.46, cy);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Cabin glass.
  ctx.fillStyle = p.ink;
  ctx.beginPath();
  ctx.moveTo(cx - cw * 0.16, cy - ch * 0.62);
  ctx.lineTo(cx + cw * 0.13, cy - ch * 0.68);
  ctx.lineTo(cx + cw * 0.28, cy - ch * 0.4);
  ctx.lineTo(cx - cw * 0.14, cy - ch * 0.4);
  ctx.closePath();
  ctx.fill();
  // Scissor door, open upward.
  ctx.strokeStyle = p.ink;
  ctx.lineWidth = Math.max(2, r.w * 0.007);
  ctx.beginPath();
  ctx.moveTo(cx + cw * 0.05, cy - ch * 0.4);
  ctx.lineTo(cx + cw * 0.12, cy - ch * 1.05);
  ctx.lineTo(cx + cw * 0.3, cy - ch * 0.98);
  ctx.lineTo(cx + cw * 0.28, cy - ch * 0.4);
  ctx.closePath();
  ctx.fillStyle = body;
  ctx.fill();
  ctx.stroke();
  // Wheels.
  for (const wx of [cx - cw * 0.3, cx + cw * 0.3]) {
    ctx.fillStyle = p.ink;
    ctx.beginPath();
    ctx.arc(wx, cy + ch * 0.02, ch * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.paper;
    ctx.beginPath();
    ctx.arc(wx, cy + ch * 0.02, ch * 0.14, 0, Math.PI * 2);
    ctx.fill();
  }
  // Headlight beam + glow.
  paintGlow(ctx, cx + cw * 0.48, cy - ch * 0.1, r.w * 0.14, p.sun, 0.9);
  ctx.fillStyle = p.paper;
  ctx.beginPath();
  ctx.moveTo(cx + cw * 0.44, cy - ch * 0.18);
  ctx.lineTo(cx + cw * 0.62, cy - ch * 0.28);
  ctx.lineTo(cx + cw * 0.62, cy + ch * 0.05);
  ctx.lineTo(cx + cw * 0.44, cy - ch * 0.02);
  ctx.closePath();
  ctx.globalAlpha = 0.5;
  ctx.fill();
  ctx.globalAlpha = 1;
}
