// Dapur Kilat hand-in (Node 22, standard library only).
// Built fresh in this session for best-cooking-game-20261125-0137.
//

// live in screenshots/. This program gathers both into the grader's
// output directory and writes dossier.json there, using the kit's
// dossier builder from vendor/makefun-game.ts.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR set:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const destination = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const gameSource = join(repoRoot, 'game');
const shotsSource = join(repoRoot, 'screenshots');
const gameTarget = join(destination, 'game');
const shotsTarget = join(destination, 'screenshots');

mkdirSync(destination, { recursive: true });
cpSync(gameSource, gameTarget, { recursive: true });
mkdirSync(shotsTarget, { recursive: true });
if (existsSync(shotsSource)) {
  cpSync(shotsSource, shotsTarget, { recursive: true });
}

// Caps mirror the gate so a build that passes here passes there:
// at most 4 screenshots under 256 KiB each, game/ under 993 files
// and 48 MiB, and the dossier text capped at 160 KiB.
const dossierText = buildDossier(destination, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(destination, 'dossier.json'), dossierText);
