# gta6-cover-art-01-entry

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/arefki/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/arefki/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Leonida Cover Studio** — turn your photo and a caption into original GTA-style cover art, exported as a PNG. A seeded nine-panel comic grid with a Vice City sunset grade: a helicopter always top-left, an original duo as the hero, a procedural scene library (skyline, beach, speedboat + flamingo, neon supercar, alligator swamp, seaplane, ferris wheel, biker, art-deco facade, neon street), bold gradient lettering, and your own photo stylised into the Cover Star panel. Three layouts (Classic Collage, Key Art Poster, Wallpaper), five sunset palettes, and PNG export in 1080×1080, 1080×1350 and 1920×1080.

## Run it

```sh
cd app && python3 -m http.server 8080
# open http://localhost:8080
```

No build step, no network request at runtime: every script, font and sample photo is a file under `app/`. Photos are read on your own machine and never uploaded. The same seed always rebuilds the same cover.

## How it works

- `app/src/prng.js` — one seeded PRNG (mulberry32 over an FNV-1a hash); all randomness in the render path comes from the seed.
- `app/src/scenes-a.js`, `app/src/scenes-b.js` — twelve procedural scenes, each drawn from canvas primitives with 2–4 variants.
- `app/src/photo.js` — photo stylising: posterize + sunset duotone + ink edge outline + halftone.
- `app/src/cover.js` — the three presets, the title block, and the finishing grain/halftone/vignette passes.
- `app/src/ui.js` — seed controls, presets, palettes, photo slots with per-panel assignment and crop, export.
- `app/fonts/` — Anton and Pacifico, both under the SIL Open Font License (license texts beside them).

Everything in the cover is original art drawn by code. No Rockstar Games logo, wordmark, official artwork, character or font is used anywhere; the default title "NEON BAY VI" is an invented place name.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, stdlib only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored library.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
