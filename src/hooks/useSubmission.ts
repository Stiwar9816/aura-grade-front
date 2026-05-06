import {Submission, SubmissionDetail, SubmissionStatus} from "@/interface";
import {SubmissionActions} from "@/actions/submission.actions";
import {
	AssignmentSubmission,
	ProcessedTeacherAssignment,
	useAssignments,
} from "./useAssignments";
import {getScoreTime, normalizeGrade} from "@/utils/gradeScale";

const normalizeStatusValue = (status?: string | null) =>
	status?.toUpperCase().replace(/[-\s]+/g, "_") || "";

const isPublishedSubmission = (status?: string, evaluationStatus?: string) =>
	normalizeStatusValue(status) === "PUBLISHED" ||
	normalizeStatusValue(evaluationStatus) === "PUBLISHED";

const getTeacherReviewStatus = (
	status?: string,
	evaluationStatus?: string,
): SubmissionStatus => {
	const normalizedStatus = normalizeStatusValue(status);
	const normalizedEvaluationStatus = normalizeStatusValue(evaluationStatus);

	if (isPublishedSubmission(normalizedStatus, normalizedEvaluationStatus)) {
		return SubmissionStatus.PUBLISHED;
	}
	if (normalizedStatus === "FAILED") return SubmissionStatus.FAILED;
	if (normalizedStatus === "IN_PROGRESS") return SubmissionStatus.IN_PROGRESS;
	if (normalizedStatus === "PENDING") return SubmissionStatus.PENDING;
	if (
		normalizedStatus === "REVIEW_PENDING" ||
		normalizedStatus === "GRADED" ||
		normalizedEvaluationStatus
	) {
		return SubmissionStatus.REVIEW_PENDING;
	}

	return SubmissionStatus.PENDING;
};

export const useSubmission = () => {
	const {GetTeacherSubmissions, loading, error, refetch} = SubmissionActions();
	const {
		assignments,
		loading: assignmentsLoading,
		error: assignmentsError,
	} = useAssignments();

	const mapSubmission = (
		s: SubmissionDetail | AssignmentSubmission,
		assignment?: ProcessedTeacherAssignment,
	): Submission => {
		// Calcular si necesita atención
		const daysSinceSubmission = s.createdAt
			? Math.floor(
					(Date.now() - new Date(s.createdAt).getTime()) /
						(1000 * 60 * 60 * 24),
				)
			: 0;

		const rawStatus = normalizeStatusValue(s.status);
		const needsAttention = rawStatus === "PENDING" && daysSinceSubmission > 3; // Más de 3 días sin revisar

		const normalizedStatus = getTeacherReviewStatus(
			s.status,
			s.evaluation?.status,
		);

		return {
			id: s.id,
			studentName: s.student
				? `${s.student.name} ${s.student.last_name || ""}`
				: "Estudiante Desconocido",
			studentEmail: s.student?.email || "",
			assignmentTitle:
				"assignment" in s
					? s.assignment?.title || "Tarea sin título"
					: assignment?.title || "Tarea sin título",
			courseName:
				"assignment" in s
					? s.assignment?.course?.course_name || "Sin curso"
					: assignment?.courseName || "Sin curso",
			rubricName:
				"assignment" in s
					? s.assignment?.rubric?.title || "Sin rúbrica"
					: assignment?.rubricTitle || "Sin rúbrica",
			submittedAt: s.createdAt || new Date().toISOString(),
			status: normalizedStatus,
			grade:
				typeof s.evaluation?.totalScore === "number"
					? normalizeGrade(
							s.evaluation.totalScore,
							"assignment" in s
								? s.assignment?.rubric?.maxTotalScore
								: assignment?.rubric?.maxTotalScore,
						)
					: undefined,
			needsAttention,
		};
	};

	const querySubmissions =
		GetTeacherSubmissions?.submissions?.map((s: SubmissionDetail) =>
			mapSubmission(s),
		) || [];
	const assignmentSubmissions = assignments.flatMap(
		(assignment: ProcessedTeacherAssignment) =>
			assignment.submissionItems.map((submission) =>
				mapSubmission(submission, assignment),
			),
	);
	const dedupedById = Array.from(
		new Map(
			[...querySubmissions, ...assignmentSubmissions].map((submission) => [
				submission.id,
				submission,
			]),
		).values(),
	);
	const submissions = Array.from(
		dedupedById
			.reduce((latestByStudentAssignment, submission) => {
				const key = `${submission.courseName || "course"}|${submission.assignmentTitle}|${
					submission.studentEmail || submission.studentName
				}`;
				const current = latestByStudentAssignment.get(key);

				if (
					!current ||
					getScoreTime(submission.submittedAt) >=
						getScoreTime(current.submittedAt)
				) {
					latestByStudentAssignment.set(key, submission);
				}

				return latestByStudentAssignment;
			}, new Map<string, Submission>())
			.values(),
	).sort((a, b) => getScoreTime(b.submittedAt) - getScoreTime(a.submittedAt));
	const effectiveLoading =
		submissions.length === 0 && (loading || assignmentsLoading);
	const effectiveError =
		submissions.length === 0 ? error || assignmentsError : undefined;

	return {
		submissions,
		loading: effectiveLoading,
		error: effectiveError,
		refetch,
	};
};
