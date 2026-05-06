export const STANDARD_GRADE_MAX = 5;
export const PASSING_GRADE = 3;

export const clampGrade = (grade: number) =>
	Math.min(STANDARD_GRADE_MAX, Math.max(0, grade));

export const inferMaxScore = (score?: number | null, maxScore?: number | null) => {
	if (typeof maxScore === "number" && maxScore > 0) return maxScore;
	if (typeof score !== "number") return STANDARD_GRADE_MAX;
	if (score <= STANDARD_GRADE_MAX) return STANDARD_GRADE_MAX;
	if (score <= 10) return 10;
	return 100;
};

export const normalizeGrade = (
	score?: number | null,
	maxScore?: number | null,
) => {
	if (typeof score !== "number" || !Number.isFinite(score)) return undefined;

	const inferredMaxScore = inferMaxScore(score, maxScore);
	if (inferredMaxScore <= 0) return undefined;

	return clampGrade((score / inferredMaxScore) * STANDARD_GRADE_MAX);
};

export const formatGrade = (grade?: number | null) =>
	typeof grade === "number" && Number.isFinite(grade)
		? grade.toFixed(1)
		: "-";

export const getScoreTime = (value?: string) =>
	value ? new Date(value).getTime() || 0 : 0;
