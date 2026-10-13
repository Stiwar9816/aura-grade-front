import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/lib/site.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS}}).outputText;
const fixture = {exports: {}};
new Function('module', 'exports', code)(fixture, fixture.exports);
const {normalizeSiteOrigin, publicPages} = fixture.exports;
test('SEO never invents an origin when it is unconfigured or invalid', () => {
 for (const input of [undefined, '', 'not-a-url', 'javascript:alert(1)', 'https://name:secret@example.com']) assert.equal(normalizeSiteOrigin(input), undefined);
});
test('SEO canonical origin excludes query, hash and path', () => {
 assert.equal(normalizeSiteOrigin('https://campus.example/path?private=1#section'), 'https://campus.example');
});
test('sitemap source contains only public information, never account or academic paths', () => {
 assert.deepEqual(Object.keys(publicPages).sort(), ['/', '/help', '/privacy', '/terms']);
 for (const page of Object.values(publicPages)) { assert.ok(page.title); assert.ok(page.description.length > 40); }
});

test('sitemap uses the supplied origin and includes accessible public image URLs', () => {
 const entries = fixture.exports.buildSitemap('https://campus.example');
 assert.equal(entries.length, 4);
 for (const entry of entries) {
  assert.equal(new URL(entry.url).origin, 'https://campus.example');
  assert.equal(entry.images.length, 1);
  assert.match(entry.images[0], /^https:\/\/campus\.example\/seo\/[^/]+\.png$/);
 }
 assert.deepEqual(fixture.exports.buildSitemap(''), []);
});

test('every public page has a real 1200 by 630 PNG preview and descriptive alternative text', () => {
 for (const page of Object.values(publicPages)) {
  const bytes = readFileSync(new URL(`../public${page.image}`, import.meta.url));
  assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
  assert.equal(bytes.readUInt32BE(16), 1200);
  assert.equal(bytes.readUInt32BE(20), 630);
  assert.ok(page.imageAlt.length > 40);
 }
});
