import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const {default: ts} = await import("typescript");
function load(file) {
	const source = fs.readFileSync(path.join(root, file), "utf8");
	const code = ts.transpileModule(source, {
		compilerOptions: {
			target: ts.ScriptTarget.ES2022,
			module: ts.ModuleKind.CommonJS,
		},
	}).outputText;
	const mod = {exports: {}};
	new Function("require", "module", "exports", code)(
		(id) =>
			load(
				id.startsWith("@/")
					? `src/${id.slice(2)}.ts`
					: path.join(path.dirname(file), `${id}.ts`),
			),
		mod,
		mod.exports,
	);
	return mod.exports;
}
const criteria = [
	{id: "a", title: "Análisis", weight: 60, maxPoints: 5},
	{id: "b", title: "Evidencia", weight: 40, maxPoints: 5},
];
const ai = [
	{
		criterionId: "a",
		criterion: "Análisis",
		score: 4,
		observations: "Falta justificar.",
	},
	{
		criterionId: "b",
		criterion: "Evidencia",
		score: 5,
		observations: "Evidencia completa.",
	},
];
test("loads actual AI criterion scores and observations into the displayed evaluation", () => {
	const {mapSubmissionToEvaluation} = load("src/utils/evaluationMapper.ts");
	const result = mapSubmissionToEvaluation({
		extractedText: "Trabajo",
		assignment: {rubric: {criteria, maxTotalScore: 5}},
		evaluation: {totalScore: 4.4, detailedFeedback: ai},
	});
	assert.equal(result.evaluationData.criteria[0].score, 4);
	assert.equal(result.evaluationData.criteria[0].feedback, "Falta justificar.");
});
test("review preserves AI comments and accepts an explicit zero with weighted total", () => {
	const {createCriterionDrafts, buildReviewedEvaluation} = load(
		"src/utils/gradingReview.ts",
	);
	const drafts = createCriterionDrafts(ai, criteria);
	const result = buildReviewedEvaluation(criteria, {
		...drafts,
		a: {...drafts.a, score: "0", feedback: "Sin evidencia de análisis."},
	});
	assert.equal(result.totalScore, 2);
	assert.equal(result.detailedFeedback[0].score, 0);
	assert.equal(
		result.detailedFeedback[0].feedback,
		"Sin evidencia de análisis.",
	);
	assert.equal(result.detailedFeedback[1].feedback, "Evidencia completa.");
});
test("legacy manual feedback and JSON encoded AI feedback remain editable", () => {
	const {createCriterionDrafts} = load("src/utils/gradingReview.ts");
	assert.deepEqual(createCriterionDrafts(JSON.stringify(ai), criteria).a, {
		score: "4",
		feedback: "Falta justificar.",
	});
	assert.deepEqual(
		createCriterionDrafts(
			[{criteriaId: "a", score: 3, feedback: "Manual"}],
			criteria,
		).a,
		{score: "3", feedback: "Manual"},
	);
});
test("incomplete and out-of-range scores cannot be published", () => {
	const {createCriterionDrafts, buildReviewedEvaluation} = load(
		"src/utils/gradingReview.ts",
	);
	const drafts = createCriterionDrafts(ai, criteria);
	for (const score of ["", " ", "6", "-1", "NaN"])
		assert.throws(() =>
			buildReviewedEvaluation(criteria, {...drafts, a: {...drafts.a, score}}),
		);
	assert.throws(() => buildReviewedEvaluation([], {}));
});
