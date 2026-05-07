export const REEVALUATION_REQUESTS_KEY = "auragrade_reevaluation_requests";

export interface ReevaluationRequest {
	id: string;
	submissionId: string;
	assignmentId?: string;
	studentId?: string;
	studentName: string;
	reason: string;
	status: "pending";
	createdAt: string;
}

export const getStoredReevaluationRequests = (): ReevaluationRequest[] => {
	if (typeof window === "undefined") return [];

	try {
		const rawRequests = window.localStorage.getItem(REEVALUATION_REQUESTS_KEY);
		if (!rawRequests) return [];

		const requests = JSON.parse(rawRequests);
		return Array.isArray(requests)
			? requests.filter((request) => request?.status === "pending")
			: [];
	} catch {
		return [];
	}
};

export const saveStoredReevaluationRequests = (
	requests: ReevaluationRequest[],
): void => {
	if (typeof window === "undefined") return;

	window.localStorage.setItem(
		REEVALUATION_REQUESTS_KEY,
		JSON.stringify(requests),
	);
};

export const getReevaluationRequestBySubmissionId = (
	submissionId?: string,
): ReevaluationRequest | null => {
	if (!submissionId) return null;

	return (
		getStoredReevaluationRequests().find(
			(request) => request.submissionId === submissionId,
		) || null
	);
};

export const getPendingReevaluationSubmissionIds = (): Set<string> =>
	new Set(
		getStoredReevaluationRequests().map((request) => request.submissionId),
	);

export const resolveStoredReevaluationRequest = (
	submissionId?: string,
): void => {
	if (!submissionId) return;

	const requests = getStoredReevaluationRequests().filter(
		(request) => request.submissionId !== submissionId,
	);
	saveStoredReevaluationRequests(requests);
};

export const getReevaluationRequestId = () => {
	if (typeof window !== "undefined" && window.crypto?.randomUUID) {
		return window.crypto.randomUUID();
	}

	return `reevaluation-${Date.now()}`;
};
