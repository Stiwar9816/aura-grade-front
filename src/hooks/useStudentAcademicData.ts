import {useQuery} from "@apollo/client/react";
import {GET_TASK_TEACHER} from "@/gql/Assignment";
import {GET_ALL_COURSES} from "@/gql/Course";
import {GET_TEACHER_SUBMISSIONS} from "@/gql/Submission";
import {useAuth} from "@/hooks";
import {
	STANDARD_GRADE_MAX,
	averageGrades,
	gradeToPercentage,
	normalizeGrade,
} from "@/utils/gradeScale";

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
	effectiveDueDate?: string;
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

const getLatestSubmission = (submissions: SubmissionRecord[]) =>
	sortSubmissionsByDate(submissions).at(-1);

const getAssignmentStatus = (
	assignment: AssignmentRecord,
	submission?: SubmissionRecord,
): StudentAssignmentStatus => {
	if (isGradedSubmission(submission)) return "graded";

	if (submission) return "review_pending";

	return new Date(assignment.effectiveDueDate || assignment.dueDate) < new Date()
		? "overdue"
		: "pending";
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
			const latestSubmission = getLatestSubmission(studentSubmissions);
			const displaySubmission = latestSubmission;
			const maxScore = STANDARD_GRADE_MAX;
			const isPublished = isGradedSubmission(displaySubmission);
			const score = isPublished
				? normalizeGrade(
						displaySubmission?.evaluation?.totalScore,
						assignment.rubric?.maxTotalScore,
					)
				: undefined;
			const percentage = gradeToPercentage(score);
			const rubricCriteria = assignment.rubric?.criteria || [];
			const rubricMaxScore =
				assignment.rubric?.maxTotalScore ||
				rubricCriteria.reduce(
					(total, criterion) => total + (criterion.maxPoints || 0),
					0,
				) ||
				STANDARD_GRADE_MAX;
			const submissionHistory = studentSubmissions.map((submission, index) => {
				const submissionIsPublished = isGradedSubmission(submission);

				return {
					id: submission.id,
					fileUrl: submission.fileUrl,
					status: submission.status,
					createdAt: submission.createdAt,
					version: index + 1,
					score: submissionIsPublished
						? normalizeGrade(
								submission.evaluation?.totalScore,
								assignment.rubric?.maxTotalScore,
							)
						: undefined,
					feedback: submissionIsPublished
						? submission.evaluation?.generalFeedback
						: undefined,
					isPublished: submissionIsPublished,
				};
			});

			return {
				id: assignment.id,
				title: assignment.title,
				description: assignment.description || "Sin descripción",
				dueDate: assignment.effectiveDueDate || assignment.dueDate,
				status: getAssignmentStatus(assignment, displaySubmission),
				score,
				maxScore,
				percentage,
				courseId: assignment.course?.id,
				courseName: assignment.course?.course_name,
				submissionId: displaySubmission?.id,
				feedback: isPublished
					? displaySubmission?.evaluation?.generalFeedback
					: undefined,
				submissionHistory,
				rubric: {
					criteria:
						rubricCriteria.map((criterion) => ({
							name: criterion.title || criterion.name || "Criterio",
							description: "",
							weight:
								criterion.weight ||
								Math.round(((criterion.maxPoints || 0) / rubricMaxScore) * 100) ||
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
		const currentGrade = averageGrades(
			gradedAssignments.map((assignment) => assignment.score),
		);
		const currentPercentage = gradeToPercentage(currentGrade) || 0;

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
			currentGrade: currentGrade || 0,
		} satisfies StudentCourseReport;
	});

	const gradedAssignments = assignments.filter(
		(assignment) => assignment.status === "graded",
	);
	const averageGradeValue = averageGrades(
		gradedAssignments.map((assignment) => assignment.score),
	);
	const averagePercentage = gradeToPercentage(averageGradeValue) || 0;

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
		averageGrade: averageGradeValue || 0,
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
