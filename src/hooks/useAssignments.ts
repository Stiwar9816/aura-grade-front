import {useAssignmentActions} from "@/actions";
import {useAuth} from "@/hooks";
import {UserRole} from "@/interface";

export const useAssignments = () => {
	const {user} = useAuth();
	const isAdmin = user?.role === UserRole.ADMIN;
	const {
		assignments,
		createAssignment,
		createError,
		createLoading,
		error,
		loading,
	} = useAssignmentActions();

	const processAssignments = () => {
		if (!assignments) return [];

		// Filtro manual por docente si el back no lo hace
		let filtered = assignments;
		if (!isAdmin && user?.id) {
			filtered = assignments.filter(
				(assignment: any) => assignment.user?.id === user.id,
			);
		}

		const now = new Date();

		return filtered.map((assignment: any) => {
			const submissions = assignment.submissions || [];
			const evaluations = submissions
				.map((s: any) => s.evaluation)
				.filter(
					(e: any) => e && (e.status === "PUBLISHED" || e.status === "GRADED"),
				);

			const totalScore = evaluations.reduce(
				(acc: number, e: any) => acc + (e.totalScore || 0),
				0,
			);
			const average =
				evaluations.length > 0
					? Number((totalScore / evaluations.length).toFixed(1))
					: 0;

			const pending = submissions.filter(
				(s: any) =>
					s.status === "SUBMITTED" ||
					s.status === "PENDING" ||
					s.status === "IN_PROGRESS",
			).length;

			const dueDate = new Date(assignment.dueDate);
			const isExpired = dueDate < now;

			return {
				id: assignment.id,
				title: assignment.title,
				description: assignment.description,
				dueDate: assignment.dueDate,
				courseName: assignment.course?.course_name,
				rubricTitle: assignment.rubric?.title,
				submissions: submissions.length,
				pending,
				average,
				isActive: assignment.isActive,
				isExpired,
			};
		});
	};

	return {
		assignments: processAssignments(),
		loading,
		error,
		createLoading,
		createError,
		createAssignment,
	};
};
