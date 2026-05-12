import {GET_SUBMISSION_BY_ID, GET_TEACHER_SUBMISSIONS} from "@/gql/Submission";
import {SubmissionDetail, SubmissionsData} from "@/interface";
import client from "@/lib/apolloClient";
import {useQuery} from "@apollo/client/react";
import {useCallback} from "react";

export const SubmissionActions = () => {
	const {
		data: GetTeacherSubmissions,
		loading,
		error,
		refetch,
	} = useQuery<SubmissionsData>(GET_TEACHER_SUBMISSIONS, {
		fetchPolicy: "cache-and-network",
		errorPolicy: "all",
	});

	const getSubmissionById = useCallback(async (
		id: string,
	): Promise<SubmissionDetail | null> => {
		try {
			const {data} = await client.query<
				{submission: SubmissionDetail | null},
				{submissionId: string}
			>({
				query: GET_SUBMISSION_BY_ID,
				variables: {submissionId: id},
				fetchPolicy: "network-only",
			});

			return data?.submission || null;
		} catch (error) {
			console.error("Error fetching submission:", error);
			throw error;
		}
	}, []);

	return {
		GetTeacherSubmissions,
		loading,
		error,
		refetch,
		getSubmissionById,
	};
};
