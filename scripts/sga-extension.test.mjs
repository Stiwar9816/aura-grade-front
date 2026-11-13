import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const {
	parseGradesFile,
	plan,
	namesMatch,
	findCourseCodes,
	pickCurrentSubject,
	checkCourse,
} = createRequire(import.meta.url)(
	"../extensions/sga-grades/core.js",
);

const file = (grades) =>
	JSON.stringify({
		format: "aura-grade-sga-grades",
		version: 1,
		generatedAt: "2026-11-13T00:00:00.000Z",
		course: { name: "Sistemas", code: "PGINS2301QDOA" },
		assignment: { id: "a", title: "Quiz" },
		grades,
	});
const grade = (document, name, score) => ({
	document,
	name,
	score,
	status: score === null ? "missing" : "published",
});

test("rejects files that are not an AuraGrade export", () => {
	assert.throws(() => parseGradesFile("no json"), /JSON/);
	assert.throws(() => parseGradesFile("{}"), /exportación/);
	assert.throws(
		() => parseGradesFile(file([grade("1", "A", "2.99"), grade("1", "B", "3.0")])),
		/repetido/,
	);
	assert.throws(() => parseGradesFile(file([grade("1", "A", "3,5")])), /no es válida/);
	assert.throws(
		() => parseGradesFile(file([{ document: "1", name: "A", score: "3.0", status: "missing" }])),
		/estado/,
	);
});

test("matches names regardless of order and accents, not different people", () => {
	assert.ok(namesMatch("Gabriela Córdoba González", "Gabriela Cordoba Gonzalez"));
	assert.ok(namesMatch("Quinto Valois Adrian", "Adrian Fernando Quinto Valois"));
	assert.ok(!namesMatch("Ana Perez", "Carlos Mena"));
});

const rows = [
	{ document: "100", name: "Ana Perez", current: "" },
	{ document: "200", name: "Beto Mena", current: "" },
	{ document: "300", name: "Carla Rios", current: "4.0" },
	{ document: "400", name: "Dario Soto", current: "3.1" },
	{ document: "500", name: "Eva Luna", current: "" },
	{ document: "600", name: "Fabio Cruz", current: "" },
];

test("fills only matching, published, in-range, empty fields and never rounds", () => {
	const { parseGradesFile: parse } = { parseGradesFile };
	const data = parse(
		file([
			grade("100", "Ana Perez", "2.99"),
			grade("200", "Beto Mena", null),
			grade("300", "Carla Rios", "4.0"),
			grade("400", "Dario Soto", "3.8"),
			grade("500", "Otra Persona", "5.0"),
			grade("700", "Gina Vera", "4.5"),
		]),
	);
	const result = plan({ rows, grades: data.grades });

	assert.deepEqual(result.fill.map((r) => [r.document, r.value]), [["100", "2.99"]]);
	assert.deepEqual(result.missingGrade.map((r) => r.document), ["200"]);
	assert.deepEqual(result.unchanged.map((r) => r.document), ["300"]);
	assert.deepEqual(result.hasValue.map((r) => r.document), ["400"]);
	assert.deepEqual(result.nameMismatch.map((r) => r.document), ["500"]);
	assert.deepEqual(result.notInAura.map((r) => r.document), ["600"]);
	assert.deepEqual(result.notInSga.map((r) => r.document), ["700"]);
});

test("a grade the SGA already shows with a comma and two decimals counts as unchanged", () => {
	const data = parseGradesFile(file([grade("100", "Ana Perez", "3.4")]));
	const result = plan({
		rows: [{ document: "100", name: "Ana Perez", current: "3,40" }],
		grades: data.grades,
	});
	assert.equal(result.unchanged.length, 1);
	assert.equal(result.fill.length + result.hasValue.length, 0);
});

test("finds SGA course codes in page texts and ignores ordinary words", () => {
	assert.deepEqual(
		findCourseCodes("Curso PGINS2301QDOA - Sistemas", "ACTIVIDAD 2", "/NOTAS/PGINS2301QDOA/000067"),
		["PGINS2301QDOA"],
	);
	assert.deepEqual(findCourseCodes("Actividad 2: QUIZ del 2026", "RA / Alumno"), []);
});

test("the current subject is the single bold one, never a sibling in the tree", () => {
	const tree = [
		{ code: "000068", bold: false },
		{ code: "000067", bold: true },
	];
	assert.equal(pickCurrentSubject(tree), "000067");
	assert.equal(pickCurrentSubject([{ code: "000067", bold: false }]), "000067");
	assert.equal(pickCurrentSubject([tree[0], { code: "000067", bold: false }]), null);
	assert.equal(pickCurrentSubject([{ code: "000067", bold: true }, { code: "000068", bold: true }]), null);
	assert.equal(pickCurrentSubject([]), null);
});

test("cross-checks group and subject of the file against the page", () => {
	const ours = { group: "pgins2301qdoa", subject: "000067" };
	const page = (groups, subject) => ({ groups, subject });
	assert.equal(checkCourse(ours, page(["PGINS2301QDOA"], "000067")).status, "verified");
	// Same group, sibling subject: the case the subject code exists for.
	const sibling = checkCourse(ours, page(["PGINS2301QDOA"], "000068"));
	assert.equal(sibling.status, "mismatch");
	assert.equal(sibling.subjectStatus, "mismatch");
	assert.equal(checkCourse(ours, page(["PGINS2302QDOA"], "000067")).groupStatus, "mismatch");
	// Nothing readable on the page: manual confirmation, not a block.
	assert.equal(checkCourse(ours, page([], null)).status, "unknown");
	assert.equal(checkCourse(ours, page(["PGINS2301QDOA"], null)).status, "unknown");
	// A course without codes in AuraGrade can never be verified.
	assert.equal(checkCourse({ group: "", subject: "" }, page(["PGINS2301QDOA"], "000067")).status, "unknown");
	// A mismatch wins over anything that could not be read.
	assert.equal(checkCourse(ours, page(["PGINS2302QDOA"], null)).status, "mismatch");
});

test("the file carries group and subject; older files without subject still load", () => {
	const withSubject = JSON.parse(file([grade("100", "Ana Perez", "3.0")]));
	withSubject.course.subjectCode = "000067";
	const parsed = parseGradesFile(JSON.stringify(withSubject));
	assert.equal(parsed.courseCode, "PGINS2301QDOA");
	assert.equal(parsed.subjectCode, "000067");
	assert.equal(parseGradesFile(file([grade("100", "Ana Perez", "3.0")])).subjectCode, "");
});

test("overwrite replaces a different existing grade only when asked", () => {
	const data = parseGradesFile(file([grade("400", "Dario Soto", "3.8")]));
	const result = plan({ rows, grades: data.grades, overwrite: true });
	assert.deepEqual(result.fill.map((r) => [r.document, r.value]), [["400", "3.8"]]);
});

test("a score outside the range the SGA accepts is never filled", () => {
	const data = parseGradesFile(file([grade("100", "Ana Perez", "4.5")]));
	const result = plan({ rows, grades: data.grades, min: 0, max: 4 });
	assert.equal(result.fill.length, 0);
	assert.deepEqual(result.outOfRange.map((r) => r.document), ["100"]);
});
