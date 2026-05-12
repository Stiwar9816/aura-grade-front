import {useEffect, useMemo, useState} from "react";
import {useAssignmentActions} from "@/actions";
import {useAuth} from "./useAuth";
import {useReEvaluationRequests} from "./useReEvaluationRequests";
import {SubmissionStatus, UserRole} from "@/interface";
import {GET_ASSIGNMENT_BY_ID} from "@/gql/Assignment";
import client from "@/lib/apolloClient";
import {normalizeGrade, getScoreTime} from "@/utils/gradeScale";

export interface AssignmentStudent {
	id: string;
	name: string;
	last_name?: string;
	email?: string;
	isActive?: boolean;
}

export interface AssignmentEvaluation {
	id: string;
	status?: string;
	totalScore?: number;
	generalFeedback?: string;
	detailedFeedback?: string;
	createdAt?: string;
}

export interface AssignmentSubmission {
	id: string;
	fileUrl?: string;
	extractedText?: string;
	status?: string;
	createdAt?: string;
	updatedAt?: string;
	student?: AssignmentStudent;
	evaluation?: AssignmentEvaluation;
	hasReevaluationRequest?: boolean;
}

export interface AssignmentRubricCriterion {
	id: string;
	title: string;
	maxPoints: number;
	levels?: {
		description: string;
		score: number;
	}[];
}

export interface AssignmentRubric {
	id: string;
	title: string;
	description?: string;
	maxTotalScore?: number;
	criteria?: AssignmentRubricCriterion[];
}

export interface TeacherAssignment {
	id: string;
	title: string;
	description?: string;
	dueDate: string;
	isActive?: boolean;
	user?: {
		id: string;
		name?: string;
		last_name?: string;
	};
	course?: {
		id: string;
		course_name: string;
		users?: {
			id: string;
			role?: string;
		}[];
	};
	rubric?: AssignmentRubric;
	submissions?: AssignmentSubmission[];
}

export interface ProcessedTeacherAssignment {
	id: string;
	title: string;
	description?: string;
	dueDate: string;
	course?: TeacherAssignment["course"];
	courseName?: string;
	rubric?: AssignmentRubric;
	rubricTitle?: string;
	submissionItems: AssignmentSubmission[];
	submissions: number;
	pending: number;
	average: number;
	isActive?: boolean;
	isExpired: boolean;
}

const normalizeStatusValue = (status?: string | null) =>
	status?.toUpperCase().replace(/[-\s]+/g, "_") || "";

const isPublishedSubmission = (
	submission: AssignmentSubmission,
	reevaluationSubmissionIds: Set<string>,
) =>
	!reevaluationSubmissionIds.has(submission.id) &&
	(normalizeStatusValue(submission.status) === "PUBLISHED" ||
		normalizeStatusValue(submission.evaluation?.status) === "PUBLISHED");

const isPendingTeacherReview = (
	submission: AssignmentSubmission,
	reevaluationSubmissionIds: Set<string>,
) => {
	const status = normalizeStatusValue(submission.status);

	return (
		(reevaluationSubmissionIds.has(submission.id) ||
			!isPublishedSubmission(submission, reevaluationSubmissionIds)) &&
		(status === "REVIEW_PENDING" ||
			status === "GRADED" ||
			status === "PENDING" ||
			status === "IN_PROGRESS" ||
			status === "SUBMITTED" ||
			Boolean(submission.evaluation) ||
			reevaluationSubmissionIds.has(submission.id))
	);
};

const mergeSubmissions = (...sources: AssignmentSubmission[][]) => {
	const merged = new Map<string, AssignmentSubmission>();

	sources.flat().forEach((submission) => {
		if (!submission?.id) return;

		const current = merged.get(submission.id);
		merged.set(submission.id, {
			...current,
			...submission,
			student: submission.student || current?.student,
			evaluation: submission.evaluation || current?.evaluation,
		});
	});

	return Array.from(merged.values()).sort((a, b) => {
		const aTime = getScoreTime(a.createdAt);
		const bTime = getScoreTime(b.createdAt);
		return bTime - aTime;
	});
};

const getSubmissionOwnerKey = (submission: AssignmentSubmission) =>
	submission.student?.id || submission.student?.email || submission.id;

const getLatestSubmissionsByStudent = (submissions: AssignmentSubmission[]) => {
	const latestByStudent = new Map<string, AssignmentSubmission>();

	submissions.forEach((submission) => {
		const key = getSubmissionOwnerKey(submission);
		const current = latestByStudent.get(key);

		if (
			!current ||
			getScoreTime(submission.createdAt) >= getScoreTime(current.createdAt)
		) {
			latestByStudent.set(key, submission);
		}
	});

	return Array.from(latestByStudent.values()).sort((a, b) => {
		const aTime = getScoreTime(a.createdAt);
		const bTime = getScoreTime(b.createdAt);
		return bTime - aTime;
	});
};

const assignmentBelongsToTeacher = (
	assignment: TeacherAssignment,
	teacherId?: string,
) => {
	if (!teacherId) return true;

	const ownerIds = [
		assignment.user?.id,
		...(assignment.course?.users?.map((courseUser) => courseUser.id) || []),
	].filter(Boolean);

	if (ownerIds.length === 0) {
		return true;
	}

	return ownerIds.includes(teacherId);
};

export const useAssignments = () => {
	const {user} = useAuth();
	const isAdmin = user?.role === UserRole.ADMIN;
	const [assignmentDetailsById, setAssignmentDetailsById] = useState<
		Record<string, TeacherAssignment>
	>({});
	const [detailsLoading, setDetailsLoading] = useState(false);
	const {
		assignments,
		createAssignment,
		createError,
		createLoading,
		error,
		loading,
	} = useAssignmentActions();
	const {
		pendingSubmissionIds: reevaluationSubmissionIds,
		loading: reevaluationLoading,
		error: reevaluationError,
	} = useReEvaluationRequests();

	const filteredAssignments = useMemo(() => {
		if (!assignments) return [];

		const teacherAssignments = assignments as TeacherAssignment[];

		if (!isAdmin && user?.id) {
			const ownedAssignments = teacherAssignments.filter((assignment) =>
				assignmentBelongsToTeacher(assignment, user.id),
			);

			return ownedAssignments.length > 0 ? ownedAssignments : teacherAssignments;
		}

		return teacherAssignments;
	}, [assignments, isAdmin, user?.id]);

	useEffect(() => {
		const assignmentsMissingSubmissions = filteredAssignments.filter(
			(assignment) =>
				assignment.id &&
				!assignment.submissions?.length &&
				!assignmentDetailsById[assignment.id],
		);

		if (assignmentsMissingSubmissions.length === 0) return;

		let isActive = true;

		const loadAssignmentDetails = async () => {
			try {
				setDetailsLoading(true);
				const results = await Promise.all(
					assignmentsMissingSubmissions.map(async (assignment) => {
						const {data} = await client.query<{assignment: TeacherAssignment}>({
							query: GET_ASSIGNMENT_BY_ID,
							variables: {id: assignment.id},
							fetchPolicy: "network-only",
						});

						return data?.assignment;
					}),
				);

				if (!isActive) return;

				setAssignmentDetailsById((current) => {
					const next = {...current};
					results.forEach((assignment) => {
						if (assignment?.id) {
							next[assignment.id] = assignment;
						}
					});
					return next;
				});
			} catch (detailError) {
				console.error("Error al cargar entregas de las tareas:", detailError);
			} finally {
				if (isActive) {
					setDetailsLoading(false);
				}
			}
		};

		loadAssignmentDetails();

		return () => {
			isActive = false;
		};
	}, [assignmentDetailsById, filteredAssignments]);

	const processAssignments = () => {
		if (!filteredAssignments.length) return [];

		const now = new Date();
		return filteredAssignments.map((assignment: TeacherAssignment) => {
			const assignmentDetail = assignmentDetailsById[assignment.id];
			const submissions = mergeSubmissions(
				assignment.submissions || [],
				assignmentDetail?.submissions || [],
			);
			const latestSubmissions = getLatestSubmissionsByStudent(submissions).map(
				(submission) =>
					reevaluationSubmissionIds.has(submission.id)
						? {
								...submission,
								status: SubmissionStatus.REVIEW_PENDING,
								hasReevaluationRequest: true,
							}
						: submission,
			);
			const publishedLatestSubmissions = latestSubmissions.filter(
				(submission) =>
					isPublishedSubmission(submission, reevaluationSubmissionIds) &&
					typeof submission.evaluation?.totalScore === "number",
			);
			const totalScore = publishedLatestSubmissions.reduce(
				(acc: number, submission) =>
					acc +
					(normalizeGrade(
						submission.evaluation?.totalScore,
						assignment.rubric?.maxTotalScore,
					) || 0),
				0,
			);
			const average =
				publishedLatestSubmissions.length > 0
					? Number((totalScore / publishedLatestSubmissions.length).toFixed(1))
					: 0;

			const pending = latestSubmissions.filter((submission) =>
				isPendingTeacherReview(submission, reevaluationSubmissionIds),
			).length;

			const dueDate = new Date(assignment.dueDate);
			const isExpired = dueDate < now;

			return {
				id: assignment.id,
				title: assignment.title,
				description: assignment.description,
				dueDate: assignment.dueDate,
				course: assignment.course,
				courseName: assignment.course?.course_name,
				rubric: assignment.rubric,
				rubricTitle: assignment.rubric?.title,
				submissionItems: latestSubmissions,
				submissions: latestSubmissions.length,
				pending,
				average,
				isActive: assignment.isActive,
				isExpired,
			} satisfies ProcessedTeacherAssignment;
		});
	};

	return {
		assignments: processAssignments(),
		loading: loading || detailsLoading || reevaluationLoading,
		error: error || reevaluationError,
		createLoading,
		createError,
		createAssignment,
	};
};
