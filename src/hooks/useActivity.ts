import {useActivityActions} from "@/actions";
import {ActivityItem, ActivityType} from "@/interface";
import {formatDistanceToNow} from "date-fns";
import {es} from "date-fns/locale";
import {
	AssignmentSubmission,
	ProcessedTeacherAssignment,
	useAssignments,
} from "./useAssignments";
import {useAuth} from "./useAuth";

type ActivitySubmission = AssignmentSubmission & {
	updatedAt?: string;
	assignment?: {
		id: string;
		title?: string;
		user?: {
			id: string;
		};
	};
};

const normalizeStatusValue = (status?: string | null) =>
	status?.toUpperCase().replace(/[-\s]+/g, "_") || "";

const isTeacherOwnedSubmission = (
	submission: ActivitySubmission,
	teacherId?: string,
) => !teacherId || !submission.assignment?.user?.id || submission.assignment.user.id === teacherId;

const mergeActivitySubmissions = (...sources: ActivitySubmission[][]) => {
	const merged = new Map<string, ActivitySubmission>();

	sources.flat().forEach((submission) => {
		if (!submission?.id) return;

		const current = merged.get(submission.id);
		merged.set(submission.id, {
			...current,
			...submission,
			student: submission.student || current?.student,
			assignment: submission.assignment || current?.assignment,
			evaluation: submission.evaluation || current?.evaluation,
		});
	});

	return Array.from(merged.values());
};

const mapActivity = (submission: ActivitySubmission): ActivityItem => {
	const status = normalizeStatusValue(submission.status);
	const evaluationStatus = normalizeStatusValue(submission.evaluation?.status);
	const studentName = submission.student
		? `${submission.student.name} ${submission.student.last_name || ""}`.trim()
		: "Estudiante desconocido";
	const assignmentTitle = submission.assignment?.title || "Tarea desconocida";

	let action = "actualizó";
	let grade: number | undefined;
	let type: ActivityType = ActivityType.SUBMISSION;

	const isPublished =
		status === "PUBLISHED" || evaluationStatus === "PUBLISHED";

	if (isPublished) {
		action = "fue calificado";
		grade =
			typeof submission.evaluation?.totalScore === "number"
				? submission.evaluation.totalScore
				: undefined;
		type = ActivityType.EVALUATION;
	} else if (status === "IN_PROGRESS") {
		action = "está siendo evaluado con IA";
		type = ActivityType.SYSTEM;
	} else if (
		status === "REVIEW_PENDING" ||
		status === "GRADED" ||
		Boolean(submission.evaluation)
	) {
		action = "queda pendiente de revisión";
	} else if (status === "PENDING" || status === "SUBMITTED") {
		action = "entregó";
	}

	const date = submission.updatedAt || submission.createdAt;
	const time = date
		? formatDistanceToNow(new Date(date), {
				addSuffix: true,
				locale: es,
			})
		: "Sin fecha";

	return {
		id: submission.id,
		student: type === ActivityType.SYSTEM && !isPublished ? "Sistema IA" : studentName,
		action,
		assignment: assignmentTitle,
		time,
		grade,
		type,
	};
};

export const useRecentActivity = (limit: number = 8) => {
	const {user} = useAuth();
	const {data, loading, error} = useActivityActions();
	const {
		assignments,
		loading: assignmentsLoading,
		error: assignmentsError,
	} = useAssignments();

	const processActivity = (): ActivityItem[] => {
		const directSubmissions = (data?.submissions || []) as ActivitySubmission[];
		const directOwnedSubmissions = directSubmissions.filter((submission) =>
			isTeacherOwnedSubmission(submission, user?.id),
		);
		const scopedDirectSubmissions =
			directOwnedSubmissions.length > 0
				? directOwnedSubmissions
				: directSubmissions;
		const assignmentSubmissions = assignments.flatMap(
			(assignment: ProcessedTeacherAssignment) =>
				assignment.submissionItems.map((submission) => ({
					...submission,
					assignment: {
						id: assignment.id,
						title: assignment.title,
						user: undefined,
					},
				})),
		);

		return mergeActivitySubmissions(
			scopedDirectSubmissions,
			assignmentSubmissions,
		)
			.sort((a, b) => {
				const bDate = b.updatedAt || b.createdAt || "";
				const aDate = a.updatedAt || a.createdAt || "";
				return new Date(bDate).getTime() - new Date(aDate).getTime();
			})
			.slice(0, limit)
			.map(mapActivity);
	};

	return {
		activities: processActivity(),
		loading: loading || assignmentsLoading,
		error: error || assignmentsError,
	};
};
