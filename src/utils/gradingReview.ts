import {normalizeGrade, STANDARD_GRADE_MAX} from "./gradeScale";

export type CriterionDraft = {score: string; feedback: string};
type Criterion = {
	id: string;
	title: string;
	weight: number;
	maxPoints?: number;
};

export function createCriterionDrafts(
	value: unknown,
	criteria: Criterion[],
): Record<string, CriterionDraft> {
	let parsed = value;
	if (typeof parsed === "string") {
		try {
			parsed = JSON.parse(parsed);
		} catch {
			parsed = null;
		}
	}
	const records = Array.isArray(parsed) ? parsed : [];
	const keyed =
		parsed && typeof parsed === "object" && !Array.isArray(parsed)
			? (parsed as Record<string, unknown>)
			: {};
	return Object.fromEntries(
		criteria.map((criterion) => {
			const candidate =
				records.find(
					(item) =>
						item &&
						typeof item === "object" &&
						(item.criterionId === criterion.id ||
							item.criteriaId === criterion.id),
				) ??
				records.find(
					(item) =>
						item &&
						typeof item === "object" &&
						(item.criterion === criterion.title ||
							item.name === criterion.title),
				) ??
				keyed[criterion.id] ??
				keyed[criterion.title];
			const item =
				candidate && typeof candidate === "object"
					? (candidate as Record<string, unknown>)
					: {};
			const score = normalizeGrade(
				typeof item.score === "number" ? item.score : undefined,
				criterion.maxPoints,
			);
			const feedback = item.feedback ?? item.observations;
			return [
				criterion.id,
				{
					score: score === undefined ? "" : String(score),
					feedback: typeof feedback === "string" ? feedback : "",
				},
			];
		}),
	);
}

export function buildReviewedEvaluation(
	criteria: Criterion[],
	drafts: Record<string, CriterionDraft>,
) {
	if (!criteria.length) throw new Error("La rúbrica no contiene criterios.");
	const detailedFeedback = criteria.map((criterion) => {
		const draft = drafts[criterion.id];
		if (!draft?.score.trim())
			throw new Error(`Debes calificar el criterio “${criterion.title}”.`);
		const parsedScore = Number(draft.score);
		const score = Number(parsedScore.toFixed(2));
		if (
			!Number.isFinite(parsedScore) ||
			parsedScore < 0 ||
			parsedScore > STANDARD_GRADE_MAX
		)
			throw new Error(
				`La puntuación de “${criterion.title}” debe estar entre 0 y ${STANDARD_GRADE_MAX}.`,
			);
		if (draft.feedback.length > 3000)
			throw new Error(
				`El comentario de “${criterion.title}” no puede superar 3000 caracteres.`,
			);
		const weight = Number(criterion.weight);
		if (!Number.isFinite(weight) || weight <= 0)
			throw new Error(`El peso de “${criterion.title}” es inválido.`);
		return {
			criteriaId: criterion.id,
			name: criterion.title,
			score,
			weight,
			weightedContribution: Number(((score * weight) / 100).toFixed(2)),
			feedback: draft.feedback.trim(),
			suggestion: "",
		};
	});
	if (
		Math.abs(
			detailedFeedback.reduce((sum, item) => sum + item.weight, 0) - 100,
		) > 0.01
	)
		throw new Error("Los pesos de la rúbrica deben sumar 100%.");
	return {
		detailedFeedback,
		totalScore: Number(
			detailedFeedback
				.reduce((sum, item) => sum + (item.score * item.weight) / 100, 0)
				.toFixed(2),
		),
	};
}
