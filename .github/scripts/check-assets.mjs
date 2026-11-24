import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const page = 'site/index.html';
const html = readFileSync(page, 'utf8');
const refs = [...html.matchAll(/(?:src|href)="([^"#?:]+)"/g)]
  .map((m) => m[1])
  .filter((p) => !p.startsWith('/') && !p.startsWith('http'));

const missing = refs.filter((p) => !existsSync(resolve(dirname(page), p)));

if (missing.length) {
  console.error('Missing assets referenced by the page:');
  for (const m of missing) console.error(' -', m);
  process.exit(1);
}

console.log('All ' + refs.length + ' referenced assets exist.');
