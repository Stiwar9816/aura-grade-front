import {
	ReEvaluationRequest,
	ReEvaluationRequestStatus,
} from "@/interface/ReEvaluationRequest.interface";

export const normalizeReEvaluationStatus = (status?: string | null) =>
	status?.toUpperCase().replace(/[-\s]+/g, "_") || "";

export const isPendingReEvaluationRequest = (
	request?: Pick<ReEvaluationRequest, "status"> | null,
) =>
	normalizeReEvaluationStatus(request?.status) ===
	ReEvaluationRequestStatus.PENDING;

export const findReEvaluationRequestBySubmissionId = (
	requests: ReEvaluationRequest[],
	submissionId?: string,
	pendingOnly = true,
): ReEvaluationRequest | null => {
	if (!submissionId) return null;

	return (
		requests.find(
			(request) =>
				request.evaluation?.submission?.id === submissionId &&
				(!pendingOnly || isPendingReEvaluationRequest(request)),
		) || null
	);
};

export const findReEvaluationRequestByEvaluationId = (
	requests: ReEvaluationRequest[],
	evaluationId?: string,
	pendingOnly = true,
): ReEvaluationRequest | null => {
	if (!evaluationId) return null;

	return (
		requests.find(
			(request) =>
				request.evaluation?.id === evaluationId &&
				(!pendingOnly || isPendingReEvaluationRequest(request)),
		) || null
	);
};

export const getPendingReEvaluationSubmissionIds = (
	requests: ReEvaluationRequest[],
): Set<string> =>
	new Set(
		requests
			.filter(isPendingReEvaluationRequest)
			.map((request) => request.evaluation?.submission?.id)
			.filter((submissionId): submissionId is string => Boolean(submissionId)),
	);
