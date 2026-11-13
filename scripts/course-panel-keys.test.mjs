import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * Regression guard. CourseLibrary, CoursePreparation and CourseAssistant are siblings and each is
 * keyed by the selected course. When two siblings got the same key, React kept the replaced
 * CourseLibrary in the page on every course switch, so the library piled up (A + B + C) and kept the
 * previous subject's data. Every keyed panel must have its own prefix.
 */
const PAGES = ["src/pages/teacher/courses.tsx", "src/pages/student/courses.tsx"];
const PANELS = ["CourseLibrary", "CoursePreparation", "CourseAssistant"];

for (const page of PAGES) {
	test(`${page}: each course panel has a distinct key`, () => {
		const source = readFileSync(new URL(`../${page}`, import.meta.url), "utf8");
		const keys = PANELS.map((panel) => {
			const match = new RegExp(`<${panel}\\s+key=\\{\`([^\`]+)\`\\}`).exec(source);
			assert.ok(match, `${panel} must be rendered with an explicit key`);
			return match[1];
		});

		assert.equal(new Set(keys).size, keys.length, `duplicated keys: ${keys.join(" | ")}`);
		// Each key must also change with the course, or the panel would keep the old course's data.
		for (const key of keys)
			assert.ok(key.includes("selectedCourse.id"), `key does not depend on the course: ${key}`);
	});
}
