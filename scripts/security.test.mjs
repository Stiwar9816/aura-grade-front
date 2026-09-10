import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import ts from 'typescript';
const __dirname=fileURLToPath(new URL('.',import.meta.url));
const loadDependency=createRequire(import.meta.url);
function load(relative) {
 const source=readFileSync(resolve(__dirname,'../',relative),'utf8').replace(/import "server-only";/g,'');
 const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
 const fixtureModule={exports:{}};
 new Function('require','module','exports',code)(loadDependency,fixtureModule,fixtureModule.exports);
 return fixtureModule.exports;
}
const {readLimitedBody,readLimitedJson}=load('src/lib/server/requestBody.ts');
const {isTrustedMutationRequest}=load('src/lib/server/backend.ts');
const request=(body,headers={})=>new Request('https://aura.example/api/graphql',{method:'POST',body,headers,duplex:'half'});
test('accepts a body exactly at the limit',async()=>assert.equal((await readLimitedBody(request('abcd'),4)).byteLength,4));
test('rejects a declared oversize body',async()=>assert.rejects(readLimitedBody(request('x',{'content-length':'10'}),4),error=>error.status===413));
test('counts streamed bytes even when Content-Length understates the body',async()=>{
 const body=new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode('abc'));controller.enqueue(new TextEncoder().encode('def'));controller.close();}});
 await assert.rejects(readLimitedBody(request(body,{'content-length':'1'}),4),error=>error.status===413);
});
test('rejects malformed JSON',async()=>assert.rejects(readLimitedJson(request('{')),error=>error.status===400));
test('reads JSON without changing content',async()=>assert.deepEqual(await readLimitedJson(request('{"text":"terminal system"}')),{text:'terminal system'}));
test('blocks cross-origin and sibling-site mutations',()=>{
 assert.equal(isTrustedMutationRequest(request('',{origin:'https://evil.example'})),false);
 assert.equal(isTrustedMutationRequest(request('',{'sec-fetch-site':'cross-site'})),false);
 assert.equal(isTrustedMutationRequest(request('',{'sec-fetch-site':'same-site',origin:'https://aura.example'})),false);
 assert.equal(isTrustedMutationRequest(request('',{origin:'https://aura.example','sec-fetch-site':'same-origin'})),true);
});
const {helpFaqs,supportEmail}=load('src/data/help.ts');
test('help publishes the official contact and actual document limits',()=>{
 assert.equal(supportEmail,'soporte@auragrade.co');
 assert.ok(helpFaqs.some(faq=>faq.answer.includes('15 MB')&&faq.answer.includes('100.000')));
 assert.equal(helpFaqs.some(faq=>/94%|menos de 30 segundos/.test(faq.answer)),false);
});

test('rejects null and array JSON payloads',async()=>{for(const body of ['null','[]'])await assert.rejects(readLimitedJson(request(body)),error=>error.status===400);});
