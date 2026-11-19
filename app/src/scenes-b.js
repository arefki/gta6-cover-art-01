// Procedural scene library, part two: swamp, seaplane, ferris wheel, biker,
// art-deco facade and neon street. Same contract as scenes-a.js: an
// original inked illustration drawn from a seeded rng in a rectangle.

import { paintSky, paintSun, paintStripedSun, paintPalm, paintSkyline, paintWater, paintBirds, paintClouds, paintStars, paintGlow } from './draw.js';
import { mixHex } from './palettes.js';

/** Alligator in a misty swamp at dusk. */
export function alligatorSwamp(ctx, rng, p, r, variant) {
  paintSky(ctx, r.x, r.y, r.w, r.h * 0.5, p);
  paintSun(ctx, r.x + r.w * 0.7, r.y + r.h * 0.16, r.w * 0.09, p);
  paintClouds(ctx, rng, r.x, r.y, r.w, r.h * 0.3, p, 2);
  // Cypress trees: dark trunks with drooping canopies.
  for (let i = 0; i < 4; i++) {
    const tx = r.x + r.w * (0.08 + i * 0.26);
    const th = r.h * rng.range(0.3, 0.48);
    const ty = r.y + r.h * 0.52;
    ctx.fillStyle = p.ink;
    ctx.fillRect(tx - r.w * 0.012, ty - th, r.w * 0.024, th);
    ctx.beginPath();
    ctx.ellipse(tx, ty - th, r.w * 0.13, r.h * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = p.ink;
    ctx.lineWidth = Math.max(1, r.w * 0.004);
    for (let j = 0; j < 3; j++) {
      ctx.beginPath();
      ctx.moveTo(tx + r.w * (j - 1) * 0.05, ty - th + r.h * 0.02);
      ctx.quadraticCurveTo(tx + r.w * (j - 1) * 0.06, ty - th + r.h * 0.1, tx + r.w * (j - 1) * 0.05, ty - th + r.h * 0.16);
      ctx.stroke();
    }
  }
  // Swamp water with reeds.
  paintWater(ctx, rng, r.x, r.y + r.h * 0.5, r.w, r.h * 0.5, p, r.x + r.w * 0.7);
  ctx.strokeStyle = p.land;
  ctx.lineWidth = Math.max(1.5, r.w * 0.006);
  for (let i = 0; i < 12; i++) {
    const rx = r.x + rng.range(0.02, 0.98) * r.w;
    const rh = r.h * rng.range(0.06, 0.16);
    const ry = r.y + r.h * rng.range(0.52, 0.62);
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.quadraticCurveTo(rx + r.w * 0.01, ry - rh * 0.7, rx + r.w * 0.02, ry - rh);
    ctx.stroke();
  }
  // Alligator: long low back, eyes and tail above the waterline.
  const ax = r.x + r.w * 0.5;
  const ay = r.y + r.h * 0.68;
  const aw = r.w * 0.58;
  ctx.fillStyle = p.ink;
  ctx.beginPath();
  ctx.ellipse(ax, ay, aw / 2, r.h * 0.055, 0, 0, Math.PI * 2);
  ctx.fill();
  // Snout.
  ctx.beginPath();
  ctx.moveTo(ax + aw * 0.3, ay - r.h * 0.03);
  ctx.quadraticCurveTo(ax + aw * 0.62, ay - r.h * 0.02, ax + aw * 0.62, ay + r.h * 0.02);
  ctx.quadraticCurveTo(ax + aw * 0.3, ay + r.h * 0.05, ax + aw * 0.3, ay - r.h * 0.03);
  ctx.fill();
  // Eyes: two bumps with amber dots.
  for (const ex of [ax + aw * 0.18, ax + aw * 0.32]) {
    ctx.beginPath();
    ctx.arc(ex, ay - r.h * 0.05, r.h * 0.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.sun;
    ctx.beginPath();
    ctx.arc(ex, ay - r.h * 0.055, r.h * 0.008, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.ink;
  }
  // Back ridges.
  ctx.fillStyle = p.ink;
  for (let i = 0; i < 6; i++) {
    const rx = ax - aw * 0.35 + i * aw * 0.13;
    ctx.beginPath();
    ctx.moveTo(rx, ay - r.h * 0.045);
    ctx.lineTo(rx + aw * 0.05, ay - r.h * 0.085);
    ctx.lineTo(rx + aw * 0.09, ay - r.h * 0.045);
    ctx.closePath();
    ctx.fill();
  }
  // Tail curving off to the left.
  ctx.strokeStyle = p.ink;
  ctx.lineWidth = r.h * 0.05;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(ax - aw * 0.45, ay);
  ctx.quadraticCurveTo(ax - aw * 0.7, ay + r.h * 0.02, ax - aw * 0.82, ay - r.h * 0.06);
  ctx.stroke();
  // Ripples around the animal.
  ctx.strokeStyle = p.paper;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = Math.max(1, r.w * 0.004);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(ax, ay + r.h * 0.05, aw * (0.55 + i * 0.14), r.h * (0.03 + i * 0.02), 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** Seaplane crossing the sky above the bay. */
export function seaplane(ctx, rng, p, r, variant) {
  paintSky(ctx, r.x, r.y, r.w, r.h * 0.62, p);
  paintSun(ctx, r.x + r.w * 0.25, r.y + r.h * 0.2, r.w * 0.1, p);
  paintClouds(ctx, rng, r.x, r.y, r.w, r.h * 0.45, p, 3);
  paintBirds(ctx, rng, r.x, r.y, r.w, r.h, p, 3);
  paintWater(ctx, rng, r.x, r.y + r.h * 0.6, r.w, r.h * 0.4, p, r.x + r.w * 0.25);
  // Distant shoreline.
  ctx.fillStyle = p.land;
  ctx.fillRect(r.x, r.y + r.h * 0.58, r.w, r.h * 0.04);
  paintSkyline(ctx, rng, r.x, r.y + r.h * 0.2, r.w, r.h * 0.38, p, { towers: 6, minH: 0.2, maxH: 0.6 });
  // Seaplane silhouette: a long low fuselage, a swept tail, a high wing
  // and two floats, nose pointing right.
  const cx = r.x + r.w * 0.5;
  const cy = r.y + r.h * 0.36;
  const s = r.w * 0.32;
  const ink = p.ink;
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  // Fuselage: a sleek capsule, thin at the tail, full at the nose.
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.62, cy - s * 0.02);
  ctx.quadraticCurveTo(cx - s * 0.3, cy - s * 0.2, cx + s * 0.3, cy - s * 0.2);
  ctx.quadraticCurveTo(cx + s * 0.68, cy - s * 0.18, cx + s * 0.7, cy - s * 0.02);
  ctx.quadraticCurveTo(cx + s * 0.68, cy + s * 0.08, cx + s * 0.3, cy + s * 0.1);
  ctx.quadraticCurveTo(cx - s * 0.3, cy + s * 0.12, cx - s * 0.62, cy + s * 0.04);
  ctx.closePath();
  ctx.fill();
  // Tail fin, swept back and modest so the fuselage stays the subject.
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.58, cy - s * 0.08);
  ctx.lineTo(cx - s * 0.72, cy - s * 0.36);
  ctx.lineTo(cx - s * 0.58, cy - s * 0.32);
  ctx.lineTo(cx - s * 0.42, cy - s * 0.12);
  ctx.closePath();
  ctx.fill();
  // High wing: one long thin bar above the fuselage.
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.28, cy - s * 0.34);
  ctx.lineTo(cx + s * 0.18, cy - s * 0.34);
  ctx.lineTo(cx + s * 0.3, cy - s * 0.24);
  ctx.lineTo(cx - s * 0.16, cy - s * 0.24);
  ctx.closePath();
  ctx.fill();
  // Floats.
  ctx.lineWidth = Math.max(2, s * 0.04);
  for (const fx of [cx - s * 0.1, cx + s * 0.35]) {
    ctx.beginPath();
    ctx.moveTo(fx - s * 0.28, cy + s * 0.28);
    ctx.lineTo(fx + s * 0.28, cy + s * 0.28);
    ctx.lineTo(fx + s * 0.22, cy + s * 0.38);
    ctx.lineTo(fx - s * 0.22, cy + s * 0.38);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(fx, cy + s * 0.1);
    ctx.lineTo(fx, cy + s * 0.28);
    ctx.stroke();
  }
  // Propeller blur: a slim vertical disc at the nose.
  ctx.strokeStyle = p.paper;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = Math.max(1.5, s * 0.025);
  ctx.beginPath();
  ctx.ellipse(cx + s * 0.7, cy - s * 0.06, s * 0.035, s * 0.2, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  // Cockpit window.
  ctx.fillStyle = p.accent2;
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.28, cy - s * 0.2);
  ctx.lineTo(cx + s * 0.48, cy - s * 0.18);
  ctx.lineTo(cx + s * 0.42, cy - s * 0.05);
  ctx.lineTo(cx + s * 0.28, cy - s * 0.06);
  ctx.closePath();
  ctx.fill();
  // Passenger windows: a light strip along the fuselage.
  ctx.fillStyle = p.paper;
  ctx.globalAlpha = 0.85;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(cx - s * 0.05 + i * s * 0.14, cy - s * 0.08, s * 0.035, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Ferris wheel on the waterfront at dusk. */
export function ferrisWheel(ctx, rng, p, r, variant) {
  paintSky(ctx, r.x, r.y, r.w, r.h, p);
  const sunX = r.x + r.w * 0.5;
  paintStripedSun(ctx, sunX, r.y + r.h * 0.3, r.w * 0.15, p);
  paintClouds(ctx, rng, r.x, r.y, r.w, r.h * 0.4, p, 2);
  // Boardwalk.
  ctx.fillStyle = p.land;
  ctx.fillRect(r.x, r.y + r.h * 0.8, r.w, r.h * 0.2);
  ctx.fillStyle = mixHex(p.land, p.accent, 0.3);
  ctx.fillRect(r.x, r.y + r.h * 0.8, r.w, r.h * 0.02);
  // Wheel.
  const cx = r.x + r.w * 0.5;
  const cy = r.y + r.h * 0.42;
  const wr = r.h * 0.34;
  const ink = p.ink;
  ctx.strokeStyle = ink;
  ctx.lineWidth = Math.max(2.5, r.w * 0.01);
  ctx.beginPath();
  ctx.arc(cx, cy, wr, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, wr * 0.72, 0, Math.PI * 2);
  ctx.stroke();
  // Spokes and gondolas.
  const gondolas = 8;
  for (let i = 0; i < gondolas; i++) {
    const a = (i / gondolas) * Math.PI * 2;
    const gx = cx + Math.cos(a) * wr;
    const gy = cy + Math.sin(a) * wr;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(gx, gy);
    ctx.stroke();
    // Gondola cabin, lit in alternating neon.
    ctx.fillStyle = i % 2 === 0 ? p.accent : p.accent2;
    paintGlow(ctx, gx, gy + wr * 0.06, wr * 0.22, i % 2 === 0 ? p.accent : p.accent2, 0.7);
    ctx.beginPath();
    ctx.arc(gx, gy + wr * 0.06, wr * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(gx, gy + wr * 0.06, wr * 0.09, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Hub + support legs.
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(cx, cy, wr * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = Math.max(3, r.w * 0.012);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx - wr * 0.55, r.y + r.h * 0.8);
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + wr * 0.55, r.y + r.h * 0.8);
  ctx.stroke();
  // String lights along the boardwalk.
  for (let i = 0; i < 9; i++) {
    const lx = r.x + r.w * (0.05 + i * 0.11);
    const ly = r.y + r.h * 0.82 + Math.sin(i * 1.3) * r.h * 0.01;
    ctx.fillStyle = i % 3 === 0 ? p.sun : i % 3 === 1 ? p.accent : p.accent2;
    paintGlow(ctx, lx, ly, r.w * 0.02, ctx.fillStyle, 0.8);
    ctx.beginPath();
    ctx.arc(lx, ly, Math.max(1.5, r.w * 0.008), 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Biker pulling a wheelie down a sunset road. */
export function bikerWheelie(ctx, rng, p, r, variant) {
  paintSky(ctx, r.x, r.y, r.w, r.h * 0.6, p);
  const sunX = r.x + r.w * rng.range(0.3, 0.7);
  paintSun(ctx, sunX, r.y + r.h * 0.3, r.w * 0.13, p);
  paintClouds(ctx, rng, r.x, r.y, r.w, r.h * 0.4, p, 2);
  // Distant palms.
  paintPalm(ctx, r.x + r.w * 0.08, r.y + r.h * 0.62, r.h * 0.3, -0.3, p, p.ink);
  paintPalm(ctx, r.x + r.w * 0.92, r.y + r.h * 0.62, r.h * 0.26, 0.3, p, p.ink);
  // Road with perspective.
  const roadY = r.y + r.h * 0.6;
  ctx.fillStyle = p.ink;
  ctx.fillRect(r.x, roadY, r.w, r.y + r.h - roadY);
  ctx.fillStyle = p.sun;
  ctx.globalAlpha = 0.85;
  for (let i = 0; i < 4; i++) {
    const t = i / 4;
    const dy = roadY + (r.y + r.h - roadY) * (0.12 + t * 0.82);
    const dw = r.w * (0.02 + t * 0.05);
    ctx.fillRect(r.x + r.w * 0.5 - dw / 2, dy, dw, r.h * (0.02 + t * 0.05));
  }
  ctx.globalAlpha = 1;
  // Speed lines.
  ctx.strokeStyle = p.paper;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = Math.max(1.5, r.w * 0.005);
  for (let i = 0; i < 6; i++) {
    const ly = r.y + r.h * rng.range(0.15, 0.55);
    const lx = r.x + r.w * rng.range(0.05, 0.4);
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(lx + r.w * rng.range(0.08, 0.2), ly);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // Bike + rider, front wheel lifted. Drawn big: it is the panel's subject.
  const bx = r.x + r.w * 0.5;
  const by = r.y + r.h * 0.76;
  const s = r.w * 0.34;
  const ink = p.ink;
  ctx.strokeStyle = ink;
  ctx.lineWidth = Math.max(2.5, s * 0.05);
  ctx.lineCap = 'round';
  // Rear wheel on the ground, front wheel up in the air.
  const rearX = bx - s * 0.35;
  const rearY = by;
  const frontX = bx + s * 0.35;
  const frontY = by - s * 0.55;
  // Frame.
  ctx.beginPath();
  ctx.moveTo(rearX, rearY);
  ctx.lineTo(bx + s * 0.05, by - s * 0.28);
  ctx.lineTo(frontX, frontY);
  ctx.moveTo(bx + s * 0.05, by - s * 0.28);
  ctx.lineTo(bx - s * 0.05, by - s * 0.05);
  ctx.lineTo(rearX, rearY);
  ctx.stroke();
  // Wheels.
  for (const [wx, wy] of [[rearX, rearY], [frontX, frontY]]) {
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(wx, wy, s * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.paper;
    ctx.beginPath();
    ctx.arc(wx, wy, s * 0.09, 0, Math.PI * 2);
    ctx.fill();
  }
  // Rider leaning back.
  ctx.fillStyle = ink;
  const hipX = bx - s * 0.02;
  const hipY = by - s * 0.42;
  const shoulderX = bx + s * 0.12;
  const shoulderY = by - s * 0.78;
  ctx.beginPath();
  ctx.moveTo(hipX, hipY);
  ctx.lineTo(shoulderX, shoulderY);
  ctx.stroke();
  // Legs to the pegs.
  ctx.beginPath();
  ctx.moveTo(hipX, hipY);
  ctx.lineTo(bx - s * 0.02, by - s * 0.08);
  ctx.stroke();
  // Arms to the bars.
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY);
  ctx.lineTo(frontX - s * 0.05, frontY - s * 0.28);
  ctx.stroke();
  // Helmet.
  ctx.fillStyle = p.accent;
  ctx.beginPath();
  ctx.arc(shoulderX + s * 0.06, shoulderY - s * 0.1, s * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = Math.max(1.5, s * 0.03);
  ctx.stroke();
  // Exhaust smoke puffs.
  ctx.fillStyle = p.paper;
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(rearX - s * (0.25 + i * 0.18), rearY - s * (0.05 + i * 0.08), s * (0.08 + i * 0.04), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Art-deco hotel facade with a neon sign. */
export function artDecoFacade(ctx, rng, p, r, variant) {
  paintSky(ctx, r.x, r.y, r.w, r.h * 0.35, p);
  paintSun(ctx, r.x + r.w * 0.8, r.y + r.h * 0.14, r.w * 0.08, p);
  // Facade.
  const fx = r.x + r.w * 0.08;
  const fw = r.w * 0.84;
  const fy = r.y + r.h * 0.22;
  const fh = r.h * 0.78;
  const base = variant === 1 ? p.accent : p.sun;
  ctx.fillStyle = base;
  ctx.fillRect(fx, fy, fw, fh);
  ctx.strokeStyle = p.ink;
  ctx.lineWidth = Math.max(2.5, r.w * 0.01);
  ctx.strokeRect(fx, fy, fw, fh);
  // Stepped ziggurat top.
  ctx.fillStyle = mixHex(base, p.ink, 0.15);
  ctx.fillRect(fx + fw * 0.18, fy - r.h * 0.08, fw * 0.64, r.h * 0.08);
  ctx.strokeRect(fx + fw * 0.18, fy - r.h * 0.08, fw * 0.64, r.h * 0.08);
  ctx.fillRect(fx + fw * 0.34, fy - r.h * 0.15, fw * 0.32, r.h * 0.07);
  ctx.strokeRect(fx + fw * 0.34, fy - r.h * 0.15, fw * 0.32, r.h * 0.07);
  // Vertical neon sign.
  const sx = fx + fw * 0.44;
  paintGlow(ctx, sx + fw * 0.06, fy + fh * 0.4, fw * 0.2, p.accent2, 0.9);
  ctx.fillStyle = p.ink;
  ctx.fillRect(sx, fy + fh * 0.08, fw * 0.12, fh * 0.62);
  ctx.fillStyle = p.accent2;
  const letters = ['L', 'E', 'O', 'N', 'I', 'D', 'A'];
  ctx.font = `bold ${Math.floor(fh * 0.075)}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < letters.length; i++) {
    ctx.fillText(letters[i], sx + fw * 0.06, fy + fh * (0.13 + i * 0.085));
  }
  // Window grid.
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      const wx = fx + fw * (0.06 + col * 0.19);
      if (col === 2) continue; // sign column
      const wy = fy + fh * (0.1 + row * 0.2);
      ctx.fillStyle = rng.chance(0.55) ? p.paper : p.ink;
      ctx.globalAlpha = rng.chance(0.55) ? 0.95 : 0.85;
      ctx.fillRect(wx, wy, fw * 0.1, fh * 0.1);
    }
  }
  ctx.globalAlpha = 1;
  // Awning stripes at the door.
  const dx = fx + fw * 0.4;
  const dy = fy + fh * 0.86;
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i % 2 === 0 ? p.paper : p.ink;
    ctx.beginPath();
    ctx.moveTo(dx + i * fw * 0.04, dy);
    ctx.lineTo(dx + (i + 1) * fw * 0.04, dy);
    ctx.lineTo(dx + (i + 1) * fw * 0.04 - fw * 0.01, dy + fh * 0.1);
    ctx.lineTo(dx + i * fw * 0.04 - fw * 0.01, dy + fh * 0.1);
    ctx.closePath();
    ctx.fill();
  }
  // Palm at the corner.
  paintPalm(ctx, r.x + r.w * 0.04, r.y + r.h, r.h * 0.34, -0.3, p, p.ink);
}

/** Neon street at night, seen down the block. */
export function neonStreet(ctx, rng, p, r, variant) {
  const g = ctx.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
  g.addColorStop(0, p.sky[0]);
  g.addColorStop(0.55, p.sky[1]);
  g.addColorStop(1, p.sky[2]);
  ctx.fillStyle = g;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  paintStars(ctx, rng, r.x, r.y, r.w, r.h * 0.4, 14, p.paper);
  // Buildings receding to a vanishing point.
  const vx = r.x + r.w * 0.5;
  const vy = r.y + r.h * 0.55;
  const shades = [p.ink, p.land, mixHex(p.land, p.ink, 0.5)];
  for (let i = 0; i < 4; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const depth = Math.floor(i / 2);
    const bw = r.w * (0.3 - depth * 0.09);
    const bh = r.h * (0.62 - depth * 0.16);
    const bx = side < 0 ? r.x + depth * r.w * 0.06 : r.x + r.w - bw - depth * r.w * 0.06;
    ctx.fillStyle = shades[i % 3];
    ctx.beginPath();
    ctx.moveTo(bx, r.y + r.h);
    ctx.lineTo(bx, r.y + r.h - bh);
    ctx.lineTo(side < 0 ? bx + bw * 0.7 : bx + bw * 0.3, vy - r.h * 0.08);
    ctx.lineTo(side < 0 ? bx + bw * 0.7 : bx + bw * 0.3, r.y + r.h);
    ctx.closePath();
    ctx.fill();
    // Windows.
    ctx.fillStyle = p.sun;
    for (let wxi = 0; wxi < 4; wxi++) {
      for (let wyi = 0; wyi < 5; wyi++) {
        if (!rng.chance(0.3)) continue;
        ctx.globalAlpha = rng.range(0.4, 0.9);
        ctx.fillRect(bx + bw * (0.12 + wxi * 0.2), r.y + r.h - bh * 0.9 + wyi * bh * 0.16, bw * 0.09, bh * 0.07);
      }
    }
    ctx.globalAlpha = 1;
  }
  // Neon signs on both sides.
  const signCols = [p.accent, p.accent2, p.sun];
  for (let i = 0; i < 5; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const sx = side < 0 ? r.x + r.w * 0.06 : r.x + r.w * 0.82;
    const sy = r.y + r.h * (0.18 + i * 0.09);
    const sw = r.w * 0.12;
    const col = signCols[i % 3];
    paintGlow(ctx, sx + sw / 2, sy, sw * 0.8, col, 0.85);
    ctx.fillStyle = col;
    ctx.fillRect(sx, sy - r.h * 0.01, sw, r.h * 0.02);
  }
  // Street.
  ctx.fillStyle = p.ink;
  ctx.beginPath();
  ctx.moveTo(r.x, r.y + r.h);
  ctx.lineTo(vx - r.w * 0.06, vy);
  ctx.lineTo(vx + r.w * 0.06, vy);
  ctx.lineTo(r.x + r.w, r.y + r.h);
  ctx.closePath();
  ctx.fill();
  // Wet reflections.
  ctx.globalAlpha = 0.25;
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = signCols[i % 3];
    const rx = r.x + r.w * (0.15 + i * 0.16);
    ctx.fillRect(rx, r.y + r.h * (0.66 + i * 0.05), r.w * 0.05, r.h * 0.2);
  }
  ctx.globalAlpha = 1;
  // A lone palm against the neon.
  paintPalm(ctx, r.x + r.w * 0.12, r.y + r.h * 0.72, r.h * 0.4, -0.25, p, p.ink);
  // Car headlights in the distance.
  paintGlow(ctx, vx - r.w * 0.03, vy + r.h * 0.02, r.w * 0.05, p.paper, 0.9);
  paintGlow(ctx, vx + r.w * 0.03, vy + r.h * 0.02, r.w * 0.05, p.paper, 0.9);
}
