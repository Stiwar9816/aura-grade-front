import {useAuth} from "@/hooks";
import {useMutation, useQuery} from "@apollo/client/react";
import {GET_TASK_TEACHER, CREATE_ASSIGNMENT} from "@/gql/Assignment";

type CreateAssignmentPayload = Record<string, unknown>;

type CreateAssignmentResponse = {
	createAssignment: CreateAssignmentPayload & {id: string};
};

export const useAssignmentActions = () => {
	const {user} = useAuth();

	const {data, loading, error} = useQuery<{assignments: unknown[]}>(
		GET_TASK_TEACHER,
		{
			skip: !user,
			fetchPolicy: "cache-and-network",
			errorPolicy: "all",
		},
	);

	const [createMutation, {loading: createLoading, error: createError}] =
		useMutation<
			CreateAssignmentResponse,
			{createAssignmentInput: CreateAssignmentPayload}
		>(CREATE_ASSIGNMENT, {
			refetchQueries: [{query: GET_TASK_TEACHER}],
		});

	const createAssignment = async (payload: CreateAssignmentPayload) => {
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
