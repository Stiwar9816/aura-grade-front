import {useAnalyticsDataActions} from "@/actions";
import {UserRole} from "@/interface";
import {format, subMonths, isAfter} from "date-fns";
import {es} from "date-fns/locale";
import {
	PASSING_GRADE,
	STANDARD_GRADE_MAX,
	gradeToPercentage,
	getScoreTime,
	normalizeGrade,
} from "@/utils/gradeScale";

type AnalyticsCourse = {
	id: string;
	course_name?: string;
};

type AnalyticsFeedbackCriterion = {
	name?: string;
	title?: string;
	score?: number;
	maxScore?: number;
	maxPoints?: number;
};

type AnalyticsSubmission = {
	id: string;
	status?: string;
	createdAt?: string;
	updatedAt?: string;
	assignment?: {
		id?: string;
		title?: string;
		dueDate?: string;
		rubric?: {
			id?: string;
			maxTotalScore?: number;
		};
	};
	evaluation?: {
		id?: string;
		detailedFeedback?: string | AnalyticsFeedbackCriterion[] | null;
		totalScore?: number;
	};
	studentId?: string;
	studentName?: string;
};

type AnalyticsStudent = {
	id: string;
	name: string;
	last_name: string;
	role: UserRole | string;
	isActive: boolean;
	submissions?: AnalyticsSubmission[];
	courses?: AnalyticsCourse[];
};

type AnalyticsDataResponse = {
	users?: AnalyticsStudent[];
};

type CoursesDataResponse = {
	courses?: AnalyticsCourse[];
};

type AssignmentSummary = {
	id: string;
	title?: string;
	dueDate: Date;
	submissions: AnalyticsSubmission[];
};

type StudentPerformanceDatum = {
	id: string;
	name: string;
	grade: number;
	trend: "up" | "down" | "stable";
	riskLevel: "low" | "medium" | "high";
	criteria: {name: string; score: number; maxScore: number}[];
};

const parseFeedbackList = (
	feedback: AnalyticsSubmission["evaluation"] extends {detailedFeedback?: infer T}
		? T
		: unknown,
): AnalyticsFeedbackCriterion[] => {
	if (!feedback) return [];
	if (typeof feedback === "string") {
		try {
			const parsed: unknown = JSON.parse(feedback);
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	}

	return Array.isArray(feedback) ? feedback : [];
};

export const useAnalyticsData = (
	timeRange: "Semana" | "Mes" | "Semestre" = "Semestre",
	selectedCourseId: string = "all",
) => {
	const {analyticsData, coursesData, loading, error} =
		useAnalyticsDataActions() as {
			analyticsData?: AnalyticsDataResponse;
			coursesData?: CoursesDataResponse;
			loading: boolean;
			error: unknown;
		};

	// --- Helpers ---
	const getStartDate = () => {
		const now = new Date();
		if (timeRange === "Semana") return subMonths(now, 0.25); // Approx 1 week
		if (timeRange === "Mes") return subMonths(now, 1);
		return subMonths(now, 6);
	};

	const startDate = getStartDate();

	// 1. Filtrar estudiantes y sus entregas relevantes
	const students = (analyticsData?.users || []).filter((u) => {
		const isStudent = u.role === UserRole.STUDENT && u.isActive;
		if (!isStudent) return false;

		// Course Filter
		if (selectedCourseId !== "all") {
			return u.courses?.some((c) => c.id === selectedCourseId);
		}
		return true;
	});

	const allSubmissions = students
		.flatMap((s) =>
			(s.submissions || []).map((sub) => ({
				...sub,
				studentId: s.id,
				studentName: `${s.name} ${s.last_name}`,
			})),
		)
		.filter((s) => {
			if (!s.evaluation || !s.assignment?.dueDate) return false;

			// Additional check: If student belongs to course X, but submission is for course Y?
			// Ideally backend filters, but for now assuming if student is in course, we count their active work.
			// Refinement: check if assignment belongs to selected course if data available
			// (Assuming assignment has course? GQL shows assignment -> course {id} in other queries but maybe not here)
			// Verified GQL: assignment { id, title ... } no course info in current Analytics query for assignment
			// BUT student is filtered. good enough for MVP.

			return isAfter(new Date(s.assignment.dueDate), startDate);
		});
	const latestSubmissions = Array.from(
		allSubmissions
			.reduce((latestByStudentAssignment, submission) => {
				const key = `${submission.assignment?.id || "assignment"}|${submission.studentId || submission.studentName}`;
				const current = latestByStudentAssignment.get(key);

				if (
					!current ||
					getScoreTime(submission.createdAt || submission.updatedAt) >=
						getScoreTime(current.createdAt || current.updatedAt)
				) {
					latestByStudentAssignment.set(key, submission);
				}

				return latestByStudentAssignment;
			}, new Map<string, AnalyticsSubmission>())
			.values(),
	);

	// --- 2. Heatmap Data (Criteria Scores over Time) ---
	// Agrupar entregas por tarea (orden cronológico)
	const assignmentsMap = new Map<string, AssignmentSummary>();
	latestSubmissions.forEach((s) => {
		const assignmentId = s.assignment?.id;
		const dueDate = s.assignment?.dueDate;
		if (!assignmentId || !dueDate) return;

		if (!assignmentsMap.has(assignmentId)) {
			assignmentsMap.set(assignmentId, {
				id: assignmentId,
				title: s.assignment?.title,
				dueDate: new Date(dueDate),
				submissions: [],
			});
		}
		assignmentsMap.get(assignmentId)?.submissions.push(s);
	});

	// Ordenar tareas por fecha
	const sortedAssignments = Array.from(assignmentsMap.values()).sort(
		(a, b) => a.dueDate.getTime() - b.dueDate.getTime(),
	);

	// Limitar a las últimas 10 tareas para el heatmap si hay muchas
	const recentAssignments = sortedAssignments.slice(-10);
	const weeks = recentAssignments.map((a) =>
		format(a.dueDate, "d MMM", {locale: es}),
	); // Labels for columns

	// Re-process for accurate averages
	const criteriaDataRaw = new Map<
		string,
		Array<{sum: number; count: number}>
	>();

	recentAssignments.forEach((assignment, idx) => {
		assignment.submissions.forEach((sub) => {
			if (sub.evaluation?.detailedFeedback) {
				const list = parseFeedbackList(sub.evaluation.detailedFeedback);
				list.forEach((c) => {
					const name = c.name || c.title;
					if (!name) return;

					if (!criteriaDataRaw.has(name)) {
						criteriaDataRaw.set(
							name,
							Array.from({length: recentAssignments.length}, () => ({
								sum: 0,
								count: 0,
							})),
						);
					}

					const data = criteriaDataRaw.get(name)!;
					const grade = normalizeGrade(c.score || 0, c.maxPoints || c.maxScore);
					const normalizedScore = gradeToPercentage(grade) || 0;

					data[idx].sum += normalizedScore;
					data[idx].count += 1;
				});
			}
		});
	});

	const heatmapData = Array.from(criteriaDataRaw.entries())
		.map(([name, data]) => ({
			name,
			data: data.map((item) =>
				item.count > 0 ? Math.round(item.sum / item.count) : 0,
			),
		}))
		.slice(0, 10); // Limit to top 10 criteria

	// --- 3. Grade Distribution ---
	const distributionData = [
		{
			range: "4.5-5.0",
			label: "MB (Muy Bueno)",
			min: 4.5,
			max: STANDARD_GRADE_MAX,
			color: "from-green-400 to-green-600",
			light: "bg-green-50",
			count: 0,
		},
		{
			range: "4.0-4.5",
			label: "B (Bueno)",
			min: 4,
			max: 4.49,
			color: "from-blue-400 to-blue-600",
			light: "bg-blue-50",
			count: 0,
		},
		{
			range: "3.0-3.9",
			label: "R (Regular)",
			min: 3,
			max: 3.99,
			color: "from-yellow-400 to-yellow-600",
			light: "bg-yellow-50",
			count: 0,
		},
		{
			range: "0.0-2.9",
			label: "MD (Muy Deficiente)",
			min: 0,
			max: 2.99,
			color: "from-red-400 to-red-600",
			light: "bg-red-50",
			count: 0,
		},
	];

	let passingCount = 0;
	let totalCount = 0;

	latestSubmissions.forEach((s) => {
		if (s.evaluation?.totalScore !== undefined) {
			const maxScore = s.assignment?.rubric?.maxTotalScore;
			const grade = normalizeGrade(s.evaluation.totalScore, maxScore) || 0;

			if (grade >= PASSING_GRADE) passingCount++;
			totalCount++;

			const bucket =
				distributionData.find((d) => grade >= d.min && grade <= d.max) ||
				distributionData[3]; // Fallback to lowest range
			bucket.count += 1;
		}
	});

	const approvalRate =
		totalCount > 0 ? Math.round((passingCount / totalCount) * 100) : 0;

	const totalGrades = totalCount;
	const finalDistribution = distributionData.map((d) => ({
		...d,
		percentage: totalGrades > 0 ? Math.round((d.count / totalGrades) * 100) : 0,
	}));

	// --- 4. Student Performance ---
	const studentsData = students
		.map((student): StudentPerformanceDatum | null => {
			const latestStudentSubs = (student.submissions || [])
				.filter((s) => s.evaluation?.totalScore !== undefined)
				.reduce((latestByAssignment, submission) => {
					const key = submission.assignment?.id || submission.id;
					const current = latestByAssignment.get(key);

					if (
						!current ||
						getScoreTime(submission.createdAt || submission.updatedAt) >=
							getScoreTime(current.createdAt || current.updatedAt)
					) {
						latestByAssignment.set(key, submission);
					}

					return latestByAssignment;
				}, new Map<string, AnalyticsSubmission>());
			const studentSubs = Array.from(latestStudentSubs.values())
				.sort(
					(a, b) =>
						new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
				);

			if (studentSubs.length === 0) return null;

			// Average Grade
			const sum = studentSubs.reduce((acc, s) => {
				const max = s.assignment?.rubric?.maxTotalScore;
				return acc + (normalizeGrade(s.evaluation.totalScore, max) || 0);
			}, 0);
			const avg = sum / studentSubs.length;

			// Trend
			let trend: "up" | "down" | "stable" = "stable";
			if (studentSubs.length >= 2) {
				const last = studentSubs[studentSubs.length - 1];
				const prev = studentSubs[studentSubs.length - 2];
				const lastGrade =
					normalizeGrade(
						last.evaluation.totalScore,
						last.assignment?.rubric?.maxTotalScore,
					) || 0;
				const prevGrade =
					normalizeGrade(
						prev.evaluation.totalScore,
						prev.assignment?.rubric?.maxTotalScore,
					) || 0;

				if (lastGrade > prevGrade + 0.5) trend = "up";
				else if (lastGrade < prevGrade - 0.5) trend = "down";
			}

			// Risk Level
			let riskLevel: "low" | "medium" | "high" = "low";
			if (avg < PASSING_GRADE) riskLevel = "high";
			else if (avg < 4) riskLevel = "medium";

			// Extract criteria summary from last submission
			const lastSub = studentSubs[studentSubs.length - 1];
			let criteria: {name: string; score: number; maxScore: number}[] = [];
			if (lastSub.evaluation?.detailedFeedback) {
				try {
					const fb = lastSub.evaluation.detailedFeedback;
					const feedbackList = parseFeedbackList(fb);
					criteria = feedbackList
						.slice(0, 3)
						.map((c) => ({
							name: c.name || c.title || "General",
							score: normalizeGrade(c.score || 0, c.maxPoints || c.maxScore) || 0,
							maxScore: STANDARD_GRADE_MAX,
						}));
				} catch {}
			}

			return {
				id: student.id,
				name: `${student.name} ${student.last_name}`,
				grade: Number(avg.toFixed(1)),
				trend,
				riskLevel,
				criteria,
			};
		})
		.filter((student): student is StudentPerformanceDatum => Boolean(student)); // Remove nulls

	const availableCourses = (coursesData?.courses || []).map((c) => ({
		id: c.id,
		name: c.course_name,
	}));

	return {
		loading,
		error,
		heatmapData,
		heatmapLabels: weeks,
		distributionData: finalDistribution,
		totalEvaluations: totalGrades,
		studentsData,
		averageGrade:
			studentsData.length > 0
				? (
						studentsData.reduce((acc, s) => acc + s.grade, 0) /
						studentsData.length
					).toFixed(1)
				: "0.0",
		approvalRate: `${approvalRate}%`,
		courses: availableCourses,
	};
};
