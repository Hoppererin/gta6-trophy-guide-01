// Leonida Platinum — the entry program for the GTA 6 trophy guide bounty.
//
// It hands in the guide this repository holds: it copies app/ (the static
// offline guide and tracker) and screenshots/ (four captures of the running
// app) into the output directory, then writes /output/dossier.json with
// buildDossier from vendor/makefun-frontend.ts, the kit's own dossier
// library. Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.

import { buildDossier } from './vendor/makefun-frontend.ts';
import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
};

function copyTree(name) {
  const from = join(rootDir, name);
  const to = join(outDir, name);
  if (!existsSync(from)) throw new Error('missing ' + name + '/ in the repository');
  cpSync(from, to, { recursive: true });
  const entries = readdirSync(to).length;
  return entries;
}

function main() {
  mkdirSync(outDir, { recursive: true });
  const appEntries = copyTree('app');
  const shotEntries = copyTree('screenshots');
  const dossier = buildDossier(outDir, caps);
  writeFileSync(join(outDir, 'dossier.json'), dossier);
  const dossierBytes = statSync(join(outDir, 'dossier.json')).size;
  console.log('Leonida Platinum handed in:');
  console.log('  output: ' + outDir);
  console.log('  app entries copied: ' + appEntries);
  console.log('  screenshots copied: ' + shotEntries);
  console.log('  dossier.json: ' + dossierBytes + ' bytes');
}

main();
