// Seeded randomness for Leonida Cover Studio. Every choice the cover makes
// (scene picks, variants, positions, grain) flows through one of these
// generators, so one seed string always rebuilds the same cover. Nothing in
// the render path uses Math.random, Date.now or performance.now.

/** FNV-1a hash of a string into an unsigned 32-bit integer. */
export function hashSeed(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: a small fast PRNG with a 32-bit state. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A friendly wrapper around a seeded stream. `makeRng("neon-bay-7")` gives an
 * object whose methods all draw from the same stream in call order, so the
 * cover is a pure function of the seed string.
 */
export function makeRng(seedText) {
  const next = mulberry32(hashSeed(String(seedText)));
  return {
    /** A float in [0, 1). */
    next() {
      return next();
    },
    /** A float in [min, max). */
    range(min, max) {
      return min + next() * (max - min);
    },
    /** An integer in [min, max] inclusive. */
    int(min, max) {
      return min + Math.floor(next() * (max - min + 1));
    },
    /** One element of a non-empty array, uniformly. */
    pick(list) {
      return list[Math.floor(next() * list.length)];
    },
    /** True with probability p (0..1). */
    chance(p) {
      return next() < p;
    },
    /** A new array with the elements shuffled (Fisher-Yates on the stream). */
    shuffle(list) {
      const out = list.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        const tmp = out[i];
        out[i] = out[j];
        out[j] = tmp;
      }
      return out;
    },
    /** A child stream derived from this one, for a panel that needs its own. */
    fork(label) {
      return makeRng(`${seedText}::${label}`);
    },
  };
}

/** Clamp a number into [min, max]. */
export function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

/** Linear interpolation between a and b. */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}
