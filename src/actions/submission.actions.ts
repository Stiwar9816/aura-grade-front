import client from "@/lib/apolloClient";
import {GET_SUBMISSION_BY_ID} from "@/gql/Submission";
import {SubmissionDetail} from "@/interface";

export const getSubmissionById = async (
	id: string,
): Promise<SubmissionDetail | null> => {
	try {
		const {data} = await client.query({
			query: GET_SUBMISSION_BY_ID,
			variables: {submissionId: id},
			fetchPolicy: "network-only", // Ensure fresh data
		});

		return data.submission || null;
	} catch (error) {
		console.error("Error fetching submission:", error);
		throw error;
	}
};
