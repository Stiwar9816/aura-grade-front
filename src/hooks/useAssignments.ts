import {GET_TASK_TEACHER, CREATE_ASSIGNMENT} from "@/gql/Assignment";
import {useMutation, useQuery} from "@apollo/client/react";
import {useAuth} from "@/hooks";
import {UserRole} from "@/types";

export const useAssignments = () => {
	const {user} = useAuth();
	const isAdmin = user?.role === UserRole.ADMIN;

	const {data, loading, error, refetch} = useQuery<{assignments: any[]}>(
		GET_TASK_TEACHER,
		{
			skip: !user,
			fetchPolicy: "cache-and-network",
		},
	);

	const [createMutation, {loading: createLoading, error: createError}] =
		useMutation(CREATE_ASSIGNMENT, {
			refetchQueries: [{query: GET_TASK_TEACHER}],
		});

	const createAssignment = async (payload: any) => {
		try {
			const result = await createMutation({
				variables: {
					createAssignmentInput: payload,
				},
			});
			return result.data?.createAssignment;
		} catch (err) {
			console.error("Error creating assignment:", err);
			throw err;
		}
	};

	const processAssignments = () => {
		if (!data?.assignments) return [];

		// Filtro manual por docente si el back no lo hace
		let filtered = data.assignments;
		if (!isAdmin && user?.id) {
			filtered = data.assignments.filter(
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
		refetch,
	};
};
