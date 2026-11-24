#!/usr/bin/env node
// Build: stamp the site with the commit, hash the assets, emit a manifest.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const commit = process.env.GITHUB_SHA ?? 'local';
const short = commit.slice(0, 7);
const outDir = 'dist';

mkdirSync(outDir, { recursive: true });

function hash(content) {
  return createHash('sha256').update(content).digest('hex').slice(0, 12);
}

// 1) copy + fingerprint assets so browsers cache them immutably
const assetsDir = 'site/assets';
const manifest = {};
for (const file of readdirSync(assetsDir)) {
  const body = readFileSync(join(assetsDir, file));
  const digest = hash(body);
  const dot = file.lastIndexOf('.');
  const name = `assets/${file.slice(0, dot)}.${digest}${file.slice(dot)}`;
  mkdirSync(join(outDir, 'assets'), { recursive: true });
  writeFileSync(join(outDir, name), body);
  manifest[`assets/${file}`] = name;
}

// 2) rewrite the page against the fingerprinted asset names
let html = readFileSync('site/index.html', 'utf8');
for (const [from, to] of Object.entries(manifest)) {
  html = html.split(from).join(to);
}

// 3) terminal fence: no absolute http asset references, no TODO placeholders
if (/src="http:/.test(html)) {
  console.error('build: mixed-content asset reference found');
  process.exit(1);
}
if (/TODO|FIXME/.test(html)) {
  console.error('build: placeholder text left in the page');
  process.exit(1);
}

// 4) stamp the commit into the page, so a deployed site can be traced to a build
html = html.replace('</head>', `  <meta name="build-commit" content="${commit}">\n</head>`);

writeFileSync(join(outDir, 'index.html'), html);
writeFileSync(join(outDir, 'build-info.json'), JSON.stringify({ commit, builtAt: new Date().toISOString(), assets: manifest }, null, 2));

console.log(`build: ${short} -> ${outDir}/index.html`);
console.log(`build: fingerprinted ${Object.keys(manifest).length} asset(s)`);
