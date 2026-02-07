import {useAuth} from "@/hooks";
import {useMutation, useQuery} from "@apollo/client/react";
import {GET_TASK_TEACHER, CREATE_ASSIGNMENT} from "@/gql/Assignment";

export const useAssignmentActions = () => {
	const {user} = useAuth();

	const {data, loading, error} = useQuery<{assignments: any[]}>(
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
			console.error("Error al crear la tarea:", err);
			throw err;
		}
	};
	return {
		assignments: data?.assignments,
		loading,
		error,
		createAssignment,
		createLoading,
		createError,
	};
};
