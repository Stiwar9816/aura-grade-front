import {
	SubmissionDetail,
	MappedEvaluationData,
	EvaluationCriterionFeedback,
} from "@/interface";
import {STANDARD_GRADE_MAX, normalizeGrade} from "@/utils/gradeScale";

const isFeedbackRecord = (
	value: unknown,
): value is Record<string, EvaluationCriterionFeedback> =>
	typeof value === "object" && value !== null && !Array.isArray(value);

export const mapSubmissionToEvaluation = (
	submission: SubmissionDetail,
): MappedEvaluationData => {
	const studentText = submission.extractedText;
	const studentName = submission.student
		? `${submission.student.name} ${submission.student.last_name}`
		: "Estudiante";
	const aiComments =
		submission.evaluation?.generalFeedback ||
		"No hay comentarios generales disponibles.";

	const evaluationData = {
		overallScore:
			normalizeGrade(
				submission.evaluation?.totalScore,
				submission.assignment?.rubric?.maxTotalScore,
			) || 0,
		maxScore: STANDARD_GRADE_MAX,
		generalFeedback:
			submission.evaluation?.generalFeedback || "Sin feedback general.",
		evaluationDate: submission.evaluation?.createdAt,
		criteria:
			submission.assignment?.rubric?.criteria?.map((c) => {
				let criterionFeedback: EvaluationCriterionFeedback = {
					score: 0,
					feedback: "",
					suggestion: "",
				};
				try {
					if (submission.evaluation?.detailedFeedback) {
						let parsedFeedback: unknown =
							submission.evaluation.detailedFeedback;

						if (typeof parsedFeedback === "string") {
							try {
								parsedFeedback = JSON.parse(parsedFeedback);
							} catch (e) {
								console.error("Error al analizar el feedback detallado:", e);
								parsedFeedback = [];
							}
						}

						if (Array.isArray(parsedFeedback)) {
							const match = parsedFeedback.find(
								(f: EvaluationCriterionFeedback) =>
									f.criteriaId === c.id || f.name === c.title,
							);
							if (match) criterionFeedback = match;
						} else if (isFeedbackRecord(parsedFeedback)) {
							const match = parsedFeedback[c.id] || parsedFeedback[c.title];
							if (match) criterionFeedback = match;
						}
					}
				} catch (e) {
					console.error(
						"No se pudieron procesar los comentarios detallados",
						e,
					);
				}

				return {
					id: c.id,
					name: c.title,
					score:
						normalizeGrade(criterionFeedback.score, c.maxPoints) || 0,
					maxScore: STANDARD_GRADE_MAX,
					feedback:
						criterionFeedback.feedback || "Sin feedback específico disponible.",
					suggestion: criterionFeedback.suggestion || "",
				};
			}) || [],
	};

	return {
		studentText,
		studentName,
		aiComments,
		evaluationData,
	};
};
