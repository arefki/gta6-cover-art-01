// Leonida Cover Studio — entry program for make.fun gta6-cover-art-01.
// Node 22, standard library only. It hands the entry in: copy the app's
// static files (app/) and the screenshots (screenshots/) from this
// repository into the output directory, then write the dossier the judge
// reads (dossier.json) with the kit's vendored buildDossier library.
//
// The grader runs this twice in a fresh container with no network; both
// runs must write the same bytes. So this program does nothing but copy
// files and build the dossier: no clock, no randomness, no network, no
// image generation. It finishes in well under the 10 second wall budget.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// The gate's caps, from the kit's reference/gate.json. Only text_max_bytes
// changes the dossier's bytes; the rest make this program refuse exactly
// where the scorer would refuse the entry.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

function handIn(repoRoot, outDir) {
  // The grader gives a fresh empty /output each run; never remove the
  // output directory itself — its parent is read-only in the grader and
  // rmSync would throw EACCES/EROFS (exit 1). Just ensure it exists.
  mkdirSync(outDir, { recursive: true });

  // The app: plain static files, served by any static HTTP server.
  cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });

  // The screenshots: 3 or 4 real renders, the first by name the cover.
  const shotsDir = join(outDir, 'screenshots');
  mkdirSync(shotsDir, { recursive: true });
  if (existsSync(join(repoRoot, 'screenshots'))) {
    cpSync(join(repoRoot, 'screenshots'), shotsDir, { recursive: true });
  }

  // The dossier: built by the kit's library, byte for byte what the
  // scorer rebuilds from the same files.
  const dossier = buildDossier(outDir, DOSSIER_CAPS);
  writeFileSync(join(outDir, 'dossier.json'), dossier);
}

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
handIn(repoRoot, outDir);
console.log(`Leonida Cover Studio handed in to ${outDir}`);
