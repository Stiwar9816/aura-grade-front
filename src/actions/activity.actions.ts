import {useQuery} from "@apollo/client/react";
import {GET_RECENT_ACTIVITY} from "@/gql/Activity";
import type {SubmissionDetail} from "@/interface";

export const useActivityActions = () => {
	const {data, loading, error} = useQuery<{submissions: SubmissionDetail[]}>(
		GET_RECENT_ACTIVITY,
		{
			fetchPolicy: "cache-and-network",
			pollInterval: 30000,
		},
	);

	return {
		data,
		loading,
		error,
	};
};
