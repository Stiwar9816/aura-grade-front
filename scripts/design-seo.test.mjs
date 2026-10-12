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
