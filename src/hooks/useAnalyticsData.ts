import {useAnalyticsDataActions} from "@/actions";
import {UserRole} from "@/interface";
import {format, subMonths, isAfter} from "date-fns";
import {es} from "date-fns/locale";
import {
	PASSING_GRADE,
	STANDARD_GRADE_MAX,
	getScoreTime,
	normalizeGrade,
} from "@/utils/gradeScale";

export const useAnalyticsData = (
	timeRange: "Semana" | "Mes" | "Semestre" = "Semestre",
	selectedCourseId: string = "all",
) => {
	const {analyticsData, coursesData, loading, error} =
		useAnalyticsDataActions() as {
			analyticsData: any;
			coursesData: any;
			loading: boolean;
			error: any;
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
	const students = (analyticsData?.users || []).filter((u: any) => {
		const isStudent = u.role === UserRole.STUDENT && u.isActive;
		if (!isStudent) return false;

		// Course Filter
		if (selectedCourseId !== "all") {
			return u.courses?.some((c: any) => c.id === selectedCourseId);
		}
		return true;
	});

	const allSubmissions = students
		.flatMap((s: any) =>
			(s.submissions || []).map((sub: any) => ({
				...sub,
				studentId: s.id,
				studentName: `${s.name} ${s.last_name}`,
			})),
		)
		.filter((s: any) => {
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
			.reduce((latestByStudentAssignment: Map<string, any>, submission: any) => {
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
			}, new Map<string, any>())
			.values(),
	);

	// --- 2. Heatmap Data (Criteria Scores over Time) ---
	// Agrupar entregas por tarea (orden cronológico)
	const assignmentsMap = new Map();
	latestSubmissions.forEach((s: any) => {
		if (!assignmentsMap.has(s.assignment.id)) {
			assignmentsMap.set(s.assignment.id, {
				id: s.assignment.id,
				title: s.assignment.title,
				dueDate: new Date(s.assignment.dueDate),
				submissions: [],
			});
		}
		assignmentsMap.get(s.assignment.id).submissions.push(s);
	});

	// Ordenar tareas por fecha
	const sortedAssignments = Array.from(assignmentsMap.values()).sort(
		(a: any, b: any) => a.dueDate - b.dueDate,
	);

	// Limitar a las últimas 10 tareas para el heatmap si hay muchas
	const recentAssignments = sortedAssignments.slice(-10);
	const weeks = recentAssignments.map((a: any) =>
		format(a.dueDate, "d MMM", {locale: es}),
	); // Labels for columns

	// Extraer y promediar scores por criterio
	const criteriaMap = new Map(); // "Criterio Name" -> [score_assignment_1, score_assignment_2, ...]

	recentAssignments.forEach((assignment: any, index: number) => {
		assignment.submissions.forEach((sub: any) => {
			if (sub.evaluation?.detailedFeedback) {
				try {
					let feedback = sub.evaluation.detailedFeedback;
					if (typeof feedback === "string") feedback = JSON.parse(feedback);

					// Feedback puede ser array o objeto
					// Normalizar a array de {name, score, maxScore}
					let criteriaList: any[] = [];
					if (Array.isArray(feedback)) {
						criteriaList = feedback;
					} else {
						// Si es objeto clave-valor, ignoramos por complejidad o adaptamos si conocemos estructura
						// Por ahora asumimos array que es lo estándar del sistema
						criteriaList = Object.values(feedback);
					}

					criteriaList.forEach((c: any) => {
						const key = c.name || c.title || "General";
						if (!criteriaMap.has(key)) {
							criteriaMap.set(key, new Array(recentAssignments.length).fill(0));
						}
						// Acumulamos para promediar luego
						// Guardamos {sum, count} en el array temporalmente? No, simplifiquemos:
						// Mejor estructura: Map<CriterionName, Map<AssignmentIndex, {sum, count}>>
					});
				} catch (e) {
					console.error("Error parsing feedback", e);
				}
			}
		});
	});

	// Re-process for accurate averages
	const criteriaDataRaw = new Map<
		string,
		Array<{sum: number; count: number}>
	>();

	recentAssignments.forEach((assignment: any, idx: number) => {
		assignment.submissions.forEach((sub: any) => {
			if (sub.evaluation?.detailedFeedback) {
				let feedback: any = sub.evaluation.detailedFeedback;
				if (typeof feedback === "string") {
					try {
						feedback = JSON.parse(feedback);
					} catch {
						feedback = [];
					}
				}

				const list = Array.isArray(feedback) ? feedback : [];
				list.forEach((c: any) => {
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
					// Normalizar score a 0-100
					let score = c.score || 0;
					const max = c.maxPoints || 20; // Default max?
					const normalizedScore = Math.round((score / max) * 100);

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

	latestSubmissions.forEach((s: any) => {
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
		.map((student: any) => {
			const latestStudentSubs = (student.submissions || [])
				.filter((s: any) => s.evaluation?.totalScore !== undefined)
				.reduce((latestByAssignment: Map<string, any>, submission: any) => {
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
				}, new Map<string, any>());
			const studentSubs = Array.from<any>(latestStudentSubs.values())
				.sort(
					(a: any, b: any) =>
						new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
				);

			if (studentSubs.length === 0) return null;

			// Average Grade
			const sum = studentSubs.reduce((acc: number, s: any) => {
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
					let fb = lastSub.evaluation.detailedFeedback;
					if (typeof fb === "string") fb = JSON.parse(fb);
					criteria = (Array.isArray(fb) ? fb : [])
						.slice(0, 3)
						.map((c: any) => ({
							name: c.name || c.title,
							score: c.score || 0,
							maxScore: c.maxPoints || 20,
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
		.filter(Boolean); // Remove nulls

	const availableCourses = (coursesData?.courses || []).map((c: any) => ({
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
						studentsData.reduce((acc: any, s: any) => acc + s.grade, 0) /
						studentsData.length
					).toFixed(1)
				: "0.0",
		approvalRate: `${approvalRate}%`,
		courses: availableCourses,
	};
};
