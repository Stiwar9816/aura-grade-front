import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/utils/submissionStage.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS}}).outputText;
const fixture = {exports: {}};
new Function('module', 'exports', code)(fixture, fixture.exports);
const {getSubmissionStage} = fixture.exports;
test('upload is not acknowledged until a submission exists', () => {
 assert.equal(getSubmissionStage(null).step, 1);
 assert.equal(getSubmissionStage(null).complete, false);
});
test('polling cannot advance pending or processing submissions', () => {
 for (const status of ['PENDING', 'IN_PROGRESS']) {
  const first = getSubmissionStage({status});
  for (let i=0; i<30; i++) assert.deepEqual(getSubmissionStage({status}), first);
  assert.equal(first.complete, false);
  assert.equal('percentage' in first, false);
 }
});
test('confirmed draft or ready status completes processing, not publication', () => {
 for (const submission of [{evaluation: {id: 'draft'}}, {status: 'REVIEW_PENDING'}, {status: 'GRADED'}, {status: 'PUBLISHED'}]) {
  assert.equal(getSubmissionStage(submission).complete, true);
  assert.equal(getSubmissionStage(submission).step, 4);
 }
});
test('failure never reports successful completion, even with a stale evaluation', () => {
 assert.equal(getSubmissionStage({status: 'FAILED', evaluation: {id:'old'}}).complete, false);
});
