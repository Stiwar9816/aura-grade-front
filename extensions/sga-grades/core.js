/*
 * Pure logic of the AuraGrade -> SGA extension (no DOM, no network), so it can be unit tested.
 * Loaded in the page as `window.AuraSga` and in Node through `require`.
 */
(function (root, factory) {
	const api = factory();
	if (typeof module === "object" && module.exports) module.exports = api;
	else root.AuraSga = api;
})(typeof self !== "undefined" ? self : this, function () {
	const FORMAT = "aura-grade-sga-grades";
	const DOCUMENT = /^\d{1,20}$/;
	// "5.0", "2.99", "0.0": a decimal point, at most two decimals, never rounded by us.
	const SCORE = /^\d(\.\d{1,2})?$/;

	const tokens = (value) =>
		String(value || "")
			.normalize("NFD")
			.replace(/[̀-ͯ]/g, "")
			.toLowerCase()
			.split(/[^a-z0-9]+/)
			.filter(Boolean);

	/** Same person written in a different order or with accents: most words in common. */
	function namesMatch(a, b) {
		const x = new Set(tokens(a));
		const y = new Set(tokens(b));
		if (!x.size || !y.size) return true;
		let shared = 0;
		for (const word of x) if (y.has(word)) shared += 1;
		return shared / Math.min(x.size, y.size) >= 0.5;
	}

	const toNumber = (value) => Number(String(value).trim().replace(",", "."));

	// SGA course codes look like PGINS2301QDOA: letters, a 4-digit period, letters.
	const COURSE_CODE = /\b[A-Z]{3,8}\d{3,5}[A-Z0-9]{2,6}\b/g;

	/** Distinct course-code-looking words found in the given texts. */
	function findCourseCodes(...texts) {
		const found = new Set();
		for (const text of texts)
			for (const match of String(text || "").matchAll(COURSE_CODE)) found.add(match[0]);
		return [...found];
	}

	/**
	 * Candidates are the "000067 - Name" entries of the course tree, flagged when shown in bold.
	 * The current subject is the single bold one; with no bold entry it is only trusted when the page
	 * lists exactly one subject. Anything else is ambiguous (the tree also lists sibling subjects).
	 */
	function pickCurrentSubject(candidates) {
		const all = [...new Set(candidates.map((item) => item.code))];
		const bold = [...new Set(candidates.filter((item) => item.bold).map((item) => item.code))];
		if (bold.length === 1) return bold[0];
		if (!bold.length && all.length === 1) return all[0];
		return null;
	}

	/**
	 * Cross-check of the course the file belongs to (group + subject) against what the SGA page shows.
	 * Each part is verified (same value on the page), mismatch (the page shows a different one) or
	 * unknown (nothing to compare). Any mismatch blocks; both verified passes; otherwise the teacher
	 * must confirm by hand.
	 */
	function checkCourse({ group, subject }, page) {
		const expectedGroup = String(group || "").trim().toUpperCase();
		const expectedSubject = String(subject || "").trim();
		const groups = page.groups || [];
		const groupStatus = !expectedGroup
			? "unknown"
			: groups.includes(expectedGroup)
				? "verified"
				: groups.length
					? "mismatch"
					: "unknown";
		const subjectStatus =
			!expectedSubject || !page.subject
				? "unknown"
				: page.subject === expectedSubject
					? "verified"
					: "mismatch";
		const status =
			groupStatus === "mismatch" || subjectStatus === "mismatch"
				? "mismatch"
				: groupStatus === "verified" && subjectStatus === "verified"
					? "verified"
					: "unknown";
		return {
			status,
			groupStatus,
			subjectStatus,
			group: expectedGroup,
			subject: expectedSubject,
			page,
		};
	}

	function parseGradesFile(text) {
		let data;
		try {
			data = JSON.parse(text);
		} catch {
			throw new Error("El archivo no es un JSON válido.");
		}
		if (
			!data ||
			data.format !== FORMAT ||
			data.version !== 1 ||
			!Array.isArray(data.grades)
		)
			throw new Error(
				"El archivo no es una exportación de AuraGrade para el SGA.",
			);
		const seen = new Set();
		const grades = data.grades.map((row) => {
			const document = String((row && row.document) || "");
			if (!DOCUMENT.test(document) || seen.has(document))
				throw new Error("El archivo trae un documento inválido o repetido.");
			seen.add(document);
			const published = row.status === "published";
			if (published && !(typeof row.score === "string" && SCORE.test(row.score)))
				throw new Error(`La nota del documento ${document} no es válida.`);
			if (!published && !(row.status === "missing" && row.score === null))
				throw new Error(`El estado del documento ${document} no es válido.`);
			return { document, name: String(row.name || ""), score: row.score };
		});
		const course = data.course || {};
		return {
			assignmentTitle: String((data.assignment && data.assignment.title) || ""),
			courseName: String(course.name || ""),
			// Group (PGINS2301QDOA) and subject (000067): together they identify the SGA course.
			courseCode: String(course.code || ""),
			subjectCode: String(course.subjectCode || ""),
			generatedAt: String(data.generatedAt || ""),
			grades,
		};
	}

	/**
	 * Decides, per row of the SGA page, what happens. Nothing here ever invents or changes a grade:
	 * a field is filled only when the RA matches, the name agrees, the score is published and inside
	 * the range the SGA accepts, and the field is empty (or `overwrite` was asked for).
	 */
	function plan({ rows, grades, min = 0, max = 5, overwrite = false }) {
		const byDocument = new Map(grades.map((grade) => [grade.document, grade]));
		const result = {
			fill: [],
			unchanged: [],
			missingGrade: [],
			notInAura: [],
			nameMismatch: [],
			outOfRange: [],
			hasValue: [],
			notInSga: [],
		};
		const present = new Set();
		for (const row of rows) {
			present.add(row.document);
			const grade = byDocument.get(row.document);
			if (!grade) result.notInAura.push(row);
			else if (grade.score === null) result.missingGrade.push(row);
			else if (!namesMatch(grade.name, row.name))
				result.nameMismatch.push({ ...row, auraName: grade.name });
			else {
				const score = toNumber(grade.score);
				const current = String(row.current || "").trim();
				if (score < min || score > max) result.outOfRange.push({ ...row, score: grade.score });
				else if (current !== "" && toNumber(current) === score) result.unchanged.push(row);
				else if (current !== "" && !overwrite)
					result.hasValue.push({ ...row, score: grade.score });
				else result.fill.push({ ...row, value: grade.score });
			}
		}
		for (const grade of grades)
			if (grade.score !== null && !present.has(grade.document)) result.notInSga.push(grade);
		return result;
	}

	return {
		parseGradesFile,
		plan,
		namesMatch,
		toNumber,
		findCourseCodes,
		pickCurrentSubject,
		checkCourse,
	};
});
