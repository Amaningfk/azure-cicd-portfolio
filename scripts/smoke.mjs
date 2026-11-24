#!/usr/bin/env node
// Smoke test: serve dist/ and assert the things a client would notice if broken.
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const port = Number(process.env.PORT ?? 8080);
const root = 'dist';

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

const server = createServer((req, res) => {
  const path = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const file = join(root, path);
  if (!existsSync(file)) {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});

function check(name, condition) {
  if (!condition) {
    console.error(`FAIL  ${name}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS  ${name}`);
  }
}

server.listen(port, async () => {
  const base = `http://127.0.0.1:${port}`;
  try {
    const page = await fetch(`${base}/`);
    check('page responds 200', page.status === 200);
    const html = await page.text();
    check('page has a title', /<title>[^<]{5,}<\/title>/.test(html));
    check('page declares a viewport', /name="viewport"/.test(html));
    check('page carries the build stamp', /build-info|assets\//.test(html));

    const asset = html.match(/href="(assets\/[^"]+\.css)"/);
    check('page links a fingerprinted stylesheet', Boolean(asset));
    if (asset) {
      const sheet = await fetch(`${base}/${asset[1]}`);
      check('stylesheet resolves', sheet.status === 200);
    }

    const missing = await fetch(`${base}/does-not-exist`);
    check('missing path returns 404', missing.status === 404);

    const info = await fetch(`${base}/build-info.json`);
    check('build info is published', info.status === 200);
    const meta = await info.json();
    check('build info carries the commit', Boolean(meta.commit));
  } finally {
    server.close();
  }
});
