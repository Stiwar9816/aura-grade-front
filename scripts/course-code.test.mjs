import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const { outputText } = ts.transpileModule(
	readFileSync(new URL("../src/utils/courseCode.ts", import.meta.url), "utf8"),
	{ compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
);
const loaded = { exports: {} };
new Function("module", "exports", outputText)(loaded, loaded.exports);
const {
	isValidCourseCode,
	normalizeCourseCode,
	COURSE_CODE_MAX_LENGTH,
	isValidSubjectCode,
	normalizeSubjectCode,
} = loaded.exports;

test("accepts the SGA course code format, in any case and with stray spaces", () => {
	for (const code of [
		"PGINS2301QDOA",
		"PGINS2301QDOB",
		"PGINS1901QDOA",
		"pgins2301qdoa",
		"  PGINS2301QDOA ",
	])
		assert.equal(isValidCourseCode(code), true, code);
});

test("rejects anything that is not the SGA format", () => {
	for (const code of [
		"",
		"MATH202",
		"NEST101",
		"PGINS-2301-QDOA",
		"PGINS 2301QDOA",
		"PGINS2301",
		"2301PGINSQDOA",
		"PGINS23015QDOA",
		"PGINS2301QDOA!",
		"PG2301QDOA",
	])
		assert.equal(isValidCourseCode(code), false, code);
});

test("accepts every group code of the SGA group list", () => {
	for (const code of [
		"PGINS2201QDOA",
		"PGINS2202QDOA",
		"PGINS2302QDOA",
		"PGINS2401QDOA",
		"PGINS2501QDOB",
		"PGINS2602QDOB",
	])
		assert.equal(isValidCourseCode(code), true, code);
});

test("the subject code is exactly 6 digits", () => {
	for (const code of ["000067", "000068", " 000067 "])
		assert.equal(isValidSubjectCode(code), true, code);
	for (const code of ["", "67", "0000067", "00006A", "000 067", "PGINS2301QDOA"])
		assert.equal(isValidSubjectCode(code), false, code);
});

test("typing or pasting into the subject field keeps digits only, at most 6", () => {
	assert.equal(normalizeSubjectCode("000067 - Sistemas Inteligentes"), "000067");
	assert.equal(normalizeSubjectCode("00-00 67"), "000067");
	assert.equal(normalizeSubjectCode("12345678"), "123456");
	assert.equal(normalizeSubjectCode("abc"), "");
});

test("normalizes to the stored form and fits the input length limit", () => {
	assert.equal(normalizeCourseCode("  pgins2301qdoa "), "PGINS2301QDOA");
	assert.ok("PGINS2301QDOA".length <= COURSE_CODE_MAX_LENGTH);
	assert.ok("ABCDEFGH2301ABCDEF".length <= COURSE_CODE_MAX_LENGTH);
});
