import {useMemo} from "react";
import {useQuery} from "@apollo/client/react";
import {GET_RE_EVALUATION_REQUESTS} from "@/gql/ReEvaluationRequest";
import {
	ReEvaluationRequest,
	ReEvaluationRequestsData,
} from "@/interface";
import {
	findReEvaluationRequestByEvaluationId,
	findReEvaluationRequestBySubmissionId,
	getPendingReEvaluationSubmissionIds,
} from "@/utils/reevaluationRequests";

export const useReEvaluationRequests = (skip = false) => {
	const {data, loading, error, refetch} = useQuery<ReEvaluationRequestsData>(
		GET_RE_EVALUATION_REQUESTS,
		{
			fetchPolicy: "cache-and-network",
			errorPolicy: "all",
			skip,
		},
	);

	const requests = useMemo<ReEvaluationRequest[]>(
		() => data?.reEvaluationRequests || [],
		[data?.reEvaluationRequests],
	);

	const pendingSubmissionIds = useMemo(
		() => getPendingReEvaluationSubmissionIds(requests),
		[requests],
	);

	return {
		requests,
		pendingSubmissionIds,
		loading,
		error,
		refetch,
		getRequestBySubmissionId: (submissionId?: string, pendingOnly = true) =>
			findReEvaluationRequestBySubmissionId(
				requests,
				submissionId,
				pendingOnly,
			),
		getRequestByEvaluationId: (evaluationId?: string, pendingOnly = true) =>
			findReEvaluationRequestByEvaluationId(requests, evaluationId, pendingOnly),
	};
};
