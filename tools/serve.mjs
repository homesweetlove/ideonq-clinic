import http from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { dirname, extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(join(dirname(fileURLToPath(import.meta.url)), '..', 'demo'));
const contentType = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8' };

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; base-uri 'none'; object-src 'none'; form-action 'none'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
  try {
    const url = new URL(req.url, 'http://127.0.0.1');
    const pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    const candidate = await realpath(join(root, pathname.replace(/^\/+/, '')));
    const pathFromRoot = relative(root, candidate);
    if (pathFromRoot.startsWith('..' + sep) || pathFromRoot === '..' || pathFromRoot.startsWith('.') || !contentType[extname(candidate)]) {
      res.writeHead(404); res.end(); return;
    }
    const body = await readFile(candidate);
    res.writeHead(200, { 'Content-Type': contentType[extname(candidate)] });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(404); res.end();
  }
});

server.listen(4173, '127.0.0.1', () => {
  process.stdout.write('IDEONQ Clinic Showcase: http://127.0.0.1:4173\n');
});
