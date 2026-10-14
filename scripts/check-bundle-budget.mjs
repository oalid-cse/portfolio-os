import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const LIMIT_KB = 120;
const pages = [{ route: '/', file: '.next/server/app/index.html' }];
let failed = false;

for (const { route, file } of pages) {
  const html = readFileSync(file, 'utf8');
  const srcs = new Set(
    [...html.matchAll(/<script(?![^>]*noModule)[^>]*\ssrc="(\/_next\/static\/[^"]+)"/g)].map((m) => m[1]),
  );
  let total = 0;
  for (const src of srcs) {
    const path = `.next/static/${decodeURIComponent(src.split('?')[0].replace('/_next/static/', ''))}`;
    total += gzipSync(readFileSync(path)).length;
  }
  const kb = total / 1000;
  const ok = kb <= LIMIT_KB;
  console.log(`${route}: ${kb.toFixed(1)} kB gzip first-load JS (${srcs.size} scripts, limit ${LIMIT_KB} kB) ${ok ? 'OK' : 'FAIL'}`);
  if (!ok) {
    console.error(`Budget exceeded for ${route}: ${kb.toFixed(1)} kB > ${LIMIT_KB} kB`);
    failed = true;
  }
}
process.exit(failed ? 1 : 0);
