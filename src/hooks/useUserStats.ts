import {useQuery} from "@apollo/client/react";
import {USER_ROLE_STUDENTS} from "@/gql/User";
import {useAuth} from "@/hooks";
import {DashboardStats, UserRole, UsersStats} from "@/types";

export const useUserStats = () => {
	const {user: currentUser} = useAuth();
	const {data, loading, error} = useQuery<UsersStats>(USER_ROLE_STUDENTS, {
		fetchPolicy: "cache-and-network",
	});

	const calculateStats = (): DashboardStats => {
		if (!data || !data.users) {
			return {
				totalStudents: 0,
				activeAssignments: 0,
				pendingEvaluations: 0,
				averageGrade: 0,
				completionRate: 0,
			};
		}

		const users = data.users;

		// Find current teacher in the data to get their courses
		const currentTeacher = users.find((u) => u.id === currentUser?.id);
		const teacherCourseIds = currentTeacher?.courses?.map((c) => c.id) || [];

		// Filter students: must have STUDENT role, be active, AND share at least one course with the teacher
		const students = users.filter((u) => {
			const isStudent = u.role === UserRole.STUDENT;
			const isActive = u.isActive === true;
			const sharesCourse = u.courses?.some((c) =>
				teacherCourseIds.includes(c.id),
			);

			return isStudent && isActive && sharesCourse;
		});

		const totalStudents = students.length;

		// Get assignments from the current teacher
		const teacher: any = currentTeacher || currentUser;
		const activeAssignments =
			teacher?.assignments?.filter((a: any) => a.isActive).length || 0;

		// Submissions from all filtered students
		const allSubmissions = students.flatMap((s) => s.submissions || []);

		// Pending are those not published yet
		const pendingEvaluations = allSubmissions.filter(
			(s) => s.status !== "PUBLISHED",
		).length;

		// Evaluations
		const evaluations = allSubmissions
			.map((s) => s.evaluation)
			.filter((e) => e && e.status === "PUBLISHED");

		const totalScore = evaluations.reduce(
			(acc: number, e) => acc + (e.totalScore || 0),
			0,
		);
		const averageGrade =
			evaluations.length > 0
				? Number((totalScore / evaluations.length).toFixed(1))
				: 0;

		// Completion Rate
		const totalExpectedSubmissions = totalStudents * activeAssignments;
		const completionRate =
			totalExpectedSubmissions > 0
				? Math.round((allSubmissions.length / totalExpectedSubmissions) * 100)
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
	};
};
