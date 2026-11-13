import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const { outputText } = ts.transpileModule(
	readFileSync(new URL("../src/utils/courseGroups.ts", import.meta.url), "utf8"),
	{ compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
);
const loaded = { exports: {} };
new Function("module", "exports", outputText)(loaded, loaded.exports);
const { groupCoursesByCode } = loaded.exports;

const course = (id, name, code, subject) => ({
	id,
	course_name: name,
	code_course: code,
	sga_subject_code: subject,
});

test("courses that share an SGA group end up in one group", () => {
	const groups = groupCoursesByCode([
		course("1", "Proyecto de Grado", "PGINS2301QDOA", "000068"),
		course("2", "Cálculo", "PGINS2302QDOA", "000010"),
		course("3", "Sistemas Inteligentes", "PGINS2301QDOA", "000067"),
	]);

	assert.deepEqual(
		groups.map((group) => [group.code, group.courses.map((item) => item.id)]),
		[
			["PGINS2301QDOA", ["3", "1"]],
			["PGINS2302QDOA", ["2"]],
		],
	);
});

test("groups keep first-appearance order and the code is compared trimmed and upper-cased", () => {
	const groups = groupCoursesByCode([
		course("1", "B", "PGINS2501QDOB", "000002"),
		course("2", "A", "PGINS2301QDOA", "000001"),
		course("3", "C", " pgins2501qdob ", "000001"),
	]);

	assert.deepEqual(
		groups.map((group) => group.code),
		["PGINS2501QDOB", "PGINS2301QDOA"],
	);
	assert.deepEqual(
		groups[0].courses.map((item) => item.id),
		["3", "1"],
	);
});

test("inside a group, courses without a subject code go last, then by name", () => {
	const [group] = groupCoursesByCode([
		course("1", "Zeta", "PGINS2301QDOA", null),
		course("2", "Beta", "PGINS2301QDOA", "000067"),
		course("3", "Alfa", "PGINS2301QDOA", undefined),
		course("4", "Alfa dos", "PGINS2301QDOA", "000067"),
	]);

	assert.deepEqual(
		group.courses.map((item) => item.id),
		["4", "2", "3", "1"],
	);
});

test("does not mutate the input list", () => {
	const input = [
		course("1", "B", "PGINS2301QDOA", "000068"),
		course("2", "A", "PGINS2301QDOA", "000067"),
	];
	groupCoursesByCode(input);
	assert.deepEqual(
		input.map((item) => item.id),
		["1", "2"],
	);
});
