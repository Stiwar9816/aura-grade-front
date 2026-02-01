import {useQuery} from "@apollo/client/react";
import {USER_ROLE_STUDENTS} from "@/gql/User";
import {useAuth} from "@/hooks";
import {DashboardStats, UserRole, UsersStats} from "@/types";

export const useUserStats = () => {
	const {user: currentUser} = useAuth();
	const {data, loading, error} = useQuery<UsersStats>(USER_ROLE_STUDENTS, {
		fetchPolicy: "cache-and-network",
		skip: !currentUser,
	});

	const calculateStats = (): DashboardStats => {
		if (!data || !data.users || !currentUser) {
			return {
				totalStudents: 0,
				activeAssignments: 0,
				pendingEvaluations: 0,
				averageGrade: 0,
				completionRate: 0,
			};
		}

		const isAdmin = currentUser.role === UserRole.ADMIN;
		const isTeacher = currentUser.role === UserRole.TEACHER;

		// 1. Filtrar estudiantes según el rol
		let students = data.users.filter(
			(u) => u.role === UserRole.STUDENT && u.isActive === true,
		);

		// Si es docente, filtrar solo estudiantes de sus cursos
		if (isTeacher) {
			const teacherCourseIds = currentUser.courses?.map((c: any) => c.id) || [];
			students = students.filter((student) =>
				student.courses?.some((c: any) => teacherCourseIds.includes(c.id)),
			);
		}

		const totalStudents = students.length;

		// 2. Obtener tareas activas según el rol
		let activeAssignments = 0;
		let relevantAssignments: any[] = [];

		const now = new Date();
		// Para que las tareas que vencen HOY sigan apareciendo como activas,
		// comparamos con el inicio del día actual.
		const startOfToday = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
		);

		if (isAdmin) {
			// Admin: todas las tareas activas del sistema que no han vencido
			const allTeachers = data.users.filter((u) => u.role === UserRole.TEACHER);
			relevantAssignments = allTeachers.flatMap(
				(teacher) =>
					teacher.assignments?.filter(
						(a: any) => a.isActive && new Date(a.dueDate) >= startOfToday,
					) || [],
			);
			activeAssignments = relevantAssignments.length;
		} else if (isTeacher) {
			const teacherData = data.users.find(
				(u) => String(u.id) === String(currentUser.id),
			);

			if (
				teacherData &&
				teacherData.assignments &&
				teacherData.assignments.length > 0
			) {
				relevantAssignments = teacherData.assignments.filter(
					(a: any) => a.isActive && new Date(a.dueDate) >= startOfToday,
				);
			} else {
				// Fallback 1: currentUser assignments
				relevantAssignments = (currentUser.assignments || []).filter(
					(a: any) => a.isActive && new Date(a.dueDate) >= startOfToday,
				);

				// Fallback 2: Colectar todas las tareas únicas de todos los usuarios
				if (relevantAssignments.length === 0) {
					const allAssignments = data.users.flatMap((u) => u.assignments || []);
					const uniqueMap = new Map();
					allAssignments.forEach((a: any) => {
						if (a && !uniqueMap.has(a.id)) {
							if (a.isActive && new Date(a.dueDate) >= startOfToday) {
								uniqueMap.set(a.id, a);
							}
						}
					});
					relevantAssignments = Array.from(uniqueMap.values());
				}
			}
			activeAssignments = relevantAssignments.length;
		}

		// 3. Obtener submissions de los estudiantes filtrados
		const allSubmissions = students.flatMap((s) => s.submissions || []);

		// 4. Calcular tareas pendientes por calificar
		// Submissions que no han sido publicadas (evaluadas)
		const pendingEvaluations = allSubmissions.filter(
			(s) => s.status !== "PUBLISHED" && s.status !== "GRADED",
		).length;

		// 5. Calcular promedio de notas
		const publishedEvaluations = allSubmissions
			.map((s) => s.evaluation)
			.filter((e) => e && (e.status === "PUBLISHED" || e.status === "GRADED"));

		const totalScore = publishedEvaluations.reduce(
			(acc: number, e) => acc + (e.totalScore || 0),
			0,
		);
		const averageGrade =
			publishedEvaluations.length > 0
				? Number((totalScore / publishedEvaluations.length).toFixed(1))
				: 0;

		// 6. Calcular porcentaje de completitud
		// Total esperado = estudiantes × tareas activas
		const totalExpectedSubmissions = totalStudents * activeAssignments;

		// Submissions completadas (entregadas)
		const completedSubmissions = allSubmissions.filter(
			(s) =>
				s.status === "SUBMITTED" ||
				s.status === "GRADED" ||
				s.status === "PUBLISHED",
		).length;

		const completionRate =
			totalExpectedSubmissions > 0
				? Math.round((completedSubmissions / totalExpectedSubmissions) * 100)
				: 0;

		return {
			totalStudents,
			activeAssignments,
			pendingEvaluations,
			averageGrade,
			completionRate,
		};
	};

	return {
		stats: calculateStats(),
		loading,
		error,
		refetch: () => {}, // Agregar si necesitas refetch manual
	};
};
