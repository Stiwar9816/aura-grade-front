import {useQuery} from "@apollo/client/react";
import {GET_TASK_TEACHER} from "@/gql/Assignment";
import {GET_ALL_COURSES} from "@/gql/Course";
import {GET_TEACHER_SUBMISSIONS} from "@/gql/Submission";
import {useAuth} from "@/hooks";

type CourseUser = {
	id: string;
	name?: string;
	last_name?: string;
	email?: string;
	role?: string;
};

type CourseRecord = {
	id: string;
	course_name: string;
	code_course: string;
	users?: CourseUser[];
};

type RubricCriterion = {
	id?: string;
	title?: string;
	name?: string;
	maxPoints?: number;
	weight?: number;
};

type AssignmentRecord = {
	id: string;
	title: string;
	description?: string;
	dueDate: string;
	isActive?: boolean;
	course?: {
		id: string;
		course_name: string;
	};
	rubric?: {
		id: string;
		title: string;
		maxTotalScore?: number;
		criteria?: RubricCriterion[];
	};
	submissions?: SubmissionRecord[];
};

type SubmissionRecord = {
	id: string;
	fileUrl?: string;
	status?: string;
	createdAt?: string;
	updatedAt?: string;
	student?: {
		id: string;
		name?: string;
		last_name?: string;
		email?: string;
	};
	evaluation?: {
		id: string;
		status?: string;
		totalScore?: number;
		generalFeedback?: string;
		createdAt?: string;
	};
	assignment?: AssignmentRecord;
};

export type StudentSubmissionHistoryItem = {
	id: string;
	fileUrl?: string;
	status?: string;
	createdAt?: string;
	version: number;
	score?: number;
	feedback?: string;
	isPublished: boolean;
};

export type StudentAssignmentStatus =
	| "pending"
	| "submitted"
	| "review_pending"
	| "graded"
	| "overdue";

export type StudentAssignmentCardData = {
	id: string;
	title: string;
	description: string;
	dueDate: string;
	status: StudentAssignmentStatus;
	score?: number;
	maxScore: number;
	percentage?: number;
	courseId?: string;
	courseName?: string;
	submissionId?: string;
	feedback?: string;
	submissionHistory: StudentSubmissionHistoryItem[];
	rubric?: {
		criteria: {
			name: string;
			description: string;
			weight: number;
		}[];
	};
};

export type StudentCourseReport = {
	id: string;
	name: string;
	code: string;
	assignments: StudentAssignmentCardData[];
	totalAssignments: number;
	deliveredAssignments: number;
	gradedAssignments: number;
	reviewPendingAssignments: number;
	pendingAssignments: number;
	currentPercentage: number;
	currentGrade: number;
};

const normalizeStatusValue = (status?: string | null) =>
	status?.toUpperCase().replace(/-/g, "_") || "";

const isGradedSubmission = (submission?: SubmissionRecord) => {
	const submissionStatus = normalizeStatusValue(submission?.status);
	const evaluationStatus = normalizeStatusValue(submission?.evaluation?.status);
	return Boolean(
		submission?.evaluation &&
			(submissionStatus === "PUBLISHED" || evaluationStatus === "PUBLISHED"),
	);
};

const sortSubmissionsByDate = (submissions: SubmissionRecord[]) =>
	[...submissions].sort((a, b) => {
		const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
		const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
		return aTime - bTime;
	});

const getPublishedSubmission = (submissions: SubmissionRecord[]) =>
	sortSubmissionsByDate(submissions)
		.filter(isGradedSubmission)
		.at(-1);

const getLatestSubmission = (submissions: SubmissionRecord[]) =>
	sortSubmissionsByDate(submissions).at(-1);

const getAssignmentStatus = (
	assignment: AssignmentRecord,
	submission?: SubmissionRecord,
): StudentAssignmentStatus => {
	if (isGradedSubmission(submission)) return "graded";

	if (submission) return "review_pending";

	return new Date(assignment.dueDate) < new Date() ? "overdue" : "pending";
};

const normalizeScore = (score?: number | null, maxScore = 10) => {
	if (typeof score !== "number" || maxScore <= 0) return undefined;
	return Math.round((score / maxScore) * 100);
};

export const useStudentAcademicData = () => {
	const {user} = useAuth();
	const {
		data: assignmentsData,
		loading: assignmentsLoading,
		error: assignmentsError,
	} = useQuery<{assignments: AssignmentRecord[]}>(GET_TASK_TEACHER, {
		skip: !user?.id,
		fetchPolicy: "cache-and-network",
	});
	const {
		data: coursesData,
		loading: coursesLoading,
		error: coursesError,
	} = useQuery<{courses: CourseRecord[]}>(GET_ALL_COURSES, {
		skip: !user?.id,
		fetchPolicy: "cache-and-network",
	});
	const {
		data: submissionsData,
		loading: submissionsLoading,
		error: submissionsError,
	} = useQuery<{submissions: SubmissionRecord[]}>(GET_TEACHER_SUBMISSIONS, {
		skip: !user?.id,
		fetchPolicy: "cache-and-network",
	});

	if (!user?.id) {
		return {
			courses: [] as StudentCourseReport[],
			assignments: [] as StudentAssignmentCardData[],
			recentFeedback: [] as StudentAssignmentCardData[],
			pendingCount: 0,
			gradedCount: 0,
			averagePercentage: 0,
			averageGrade: 0,
			deliveredCount: 0,
			reviewPendingCount: 0,
			loading: assignmentsLoading || coursesLoading || submissionsLoading,
			error: assignmentsError || coursesError || submissionsError,
		};
	}

	const studentCourses = (coursesData?.courses || []).filter((course) =>
		course.users?.some((courseUser) => courseUser.id === user.id),
	);
	const studentCourseIds = new Set(studentCourses.map((course) => course.id));

	const studentSubmissionRecords = (submissionsData?.submissions || []).filter(
		(submission) =>
			submission.student?.id === user.id ||
			!submission.student?.id,
	);
	const submissionAssignments = studentSubmissionRecords
		.map((submission) => submission.assignment)
		.filter((assignment): assignment is AssignmentRecord =>
			Boolean(assignment?.id),
		);
	const assignmentById = new Map<string, AssignmentRecord>();

	(assignmentsData?.assignments || []).forEach((assignment) => {
		assignmentById.set(assignment.id, assignment);
	});
	submissionAssignments.forEach((assignment) => {
		const existingAssignment = assignmentById.get(assignment.id);
		assignmentById.set(assignment.id, {
			...assignment,
			...existingAssignment,
			course: existingAssignment?.course || assignment.course,
			rubric: existingAssignment?.rubric || assignment.rubric,
			submissions: existingAssignment?.submissions || assignment.submissions,
		});
	});

	const assignments = Array.from(assignmentById.values())
		.filter((assignment) => assignment.course?.id)
		.filter((assignment) => studentCourseIds.has(assignment.course!.id))
		.map((assignment) => {
			const studentSubmissions = sortSubmissionsByDate(
				[
					...(assignment.submissions || []),
					...studentSubmissionRecords.filter(
						(submission) => submission.assignment?.id === assignment.id,
					),
				]
					.filter((item) => item.student?.id === user.id || !item.student?.id)
					.filter(
						(item, index, allItems) =>
							allItems.findIndex((candidate) => candidate.id === item.id) ===
							index,
					),
			);
			const publishedSubmission = getPublishedSubmission(studentSubmissions);
			const latestSubmission = getLatestSubmission(studentSubmissions);
			const displaySubmission = publishedSubmission || latestSubmission;
			const maxScore = assignment.rubric?.maxTotalScore || 10;
			const isPublished = isGradedSubmission(publishedSubmission);
			const score = isPublished
				? publishedSubmission?.evaluation?.totalScore
				: undefined;
			const percentage = normalizeScore(score, maxScore);
			const submissionHistory = studentSubmissions.map((submission, index) => ({
				id: submission.id,
				fileUrl: submission.fileUrl,
				status: submission.status,
				createdAt: submission.createdAt,
				version: index + 1,
				score: isGradedSubmission(submission)
					? submission.evaluation?.totalScore
					: undefined,
				feedback: isGradedSubmission(submission)
					? submission.evaluation?.generalFeedback
					: undefined,
				isPublished: isGradedSubmission(submission),
			}));

			return {
				id: assignment.id,
				title: assignment.title,
				description: assignment.description || "Sin descripción",
				dueDate: assignment.dueDate,
				status: getAssignmentStatus(assignment, displaySubmission),
				score,
				maxScore,
				percentage,
				courseId: assignment.course?.id,
				courseName: assignment.course?.course_name,
				submissionId: displaySubmission?.id,
				feedback: isPublished
					? publishedSubmission?.evaluation?.generalFeedback
					: undefined,
				submissionHistory,
				rubric: {
					criteria:
						assignment.rubric?.criteria?.map((criterion) => ({
							name: criterion.title || criterion.name || "Criterio",
							description: "",
							weight:
								criterion.weight ||
								Math.round(((criterion.maxPoints || 0) / maxScore) * 100) ||
								0,
						})) || [],
				},
			} satisfies StudentAssignmentCardData;
		})
		.sort(
			(a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
		);

	const courses = studentCourses.map((course) => {
		const courseAssignments = assignments.filter(
			(assignment) => assignment.courseId === course.id,
		);
		const gradedAssignments = courseAssignments.filter(
			(assignment) => assignment.status === "graded",
		);
		const deliveredAssignments = courseAssignments.filter((assignment) =>
			["submitted", "review_pending", "graded"].includes(assignment.status),
		);
		const reviewPendingAssignments = courseAssignments.filter((assignment) =>
			["submitted", "review_pending"].includes(assignment.status),
		);
		const percentages = gradedAssignments
			.map((assignment) => assignment.percentage)
			.filter((value): value is number => value !== undefined);
		const currentPercentage =
			percentages.length > 0
				? Math.round(
						percentages.reduce((sum, value) => sum + value, 0) /
							percentages.length,
					)
				: 0;

		return {
			id: course.id,
			name: course.course_name,
			code: course.code_course,
			assignments: courseAssignments,
			totalAssignments: courseAssignments.length,
			deliveredAssignments: deliveredAssignments.length,
			gradedAssignments: gradedAssignments.length,
			reviewPendingAssignments: reviewPendingAssignments.length,
			pendingAssignments: courseAssignments.filter(
				(assignment) =>
					assignment.status === "pending" || assignment.status === "overdue",
			).length,
			currentPercentage,
			currentGrade: Number(((currentPercentage / 100) * 10).toFixed(1)),
		} satisfies StudentCourseReport;
	});

	const gradedAssignments = assignments.filter(
		(assignment) => assignment.status === "graded",
	);
	const percentages = gradedAssignments
		.map((assignment) => assignment.percentage)
		.filter((value): value is number => value !== undefined);
	const averagePercentage =
		percentages.length > 0
			? Math.round(
					percentages.reduce((sum, value) => sum + value, 0) /
						percentages.length,
				)
			: 0;

	return {
		courses,
		assignments,
		recentFeedback: gradedAssignments.slice(-2).reverse(),
		pendingCount: assignments.filter(
			(assignment) =>
				assignment.status === "pending" || assignment.status === "overdue",
		).length,
		gradedCount: gradedAssignments.length,
		averagePercentage,
		averageGrade: Number(((averagePercentage / 100) * 10).toFixed(1)),
		deliveredCount: assignments.filter((assignment) =>
			["submitted", "review_pending", "graded"].includes(assignment.status),
		).length,
		reviewPendingCount: assignments.filter((assignment) =>
			["submitted", "review_pending"].includes(assignment.status),
		).length,
		loading: assignmentsLoading || coursesLoading || submissionsLoading,
		error: assignmentsError || coursesError || submissionsError,
	};
};
