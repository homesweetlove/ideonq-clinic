import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

async function files(dir) {
  return (await Promise.all((await readdir(dir, { withFileTypes: true })).map(async entry => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  }))).flat();
}

test('the public repository contains only approved source and documentation locations', async () => {
  const all = (await files(root)).map(path => relative(root, path).replaceAll('\\', '/'));
  const allowed = [ '.gitignore', 'README.md', 'SECURITY.md', 'LICENSE', 'package.json' ];
  assert.ok(all.every(path => allowed.includes(path) || /^(demo|docs|tests|tools|\.github)\//.test(path)), `unexpected tracked files: ${all}`);
  assert.ok(all.every(path => !/(\.env|\.sqlite|\.db$|\.key$|\.pem$|\.p12$|\.pfx$|\.jks$|\.log$|\.png$|\.jpg$|\.zip$)/i.test(path)));
});

test('demo sources contain no external network calls or hardcoded infrastructure addresses', async () => {
  const demo = await files(join(root, 'demo'));
  for (const path of demo) {
    const source = await readFile(path, 'utf8');
    assert.doesNotMatch(source, /\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\s*\(|https?:\/\//i);
    assert.doesNotMatch(source, /\blocalStorage\b|\bsessionStorage\b|document\.cookie/i);
    assert.doesNotMatch(source, /BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY|\bsk[-_][A-Za-z0-9]{15,}|[a-f0-9]{32,}@/i);
  }
});
