export enum ReEvaluationRequestStatus {
	PENDING = "PENDING",
	APPROVED = "APPROVED",
	REJECTED = "REJECTED",
}

export interface ReEvaluationRequestUser {
	id: string;
	name: string;
	last_name?: string | null;
	email?: string | null;
}

export interface ReEvaluationRequest {
	id: string;
	reason: string;
	status: ReEvaluationRequestStatus | string;
	teacherResponse?: string | null;
	createdAt: string;
	updatedAt?: string | null;
	reviewedAt?: string | null;
	student?: ReEvaluationRequestUser | null;
	teacher?: ReEvaluationRequestUser | null;
	evaluation?: {
		id: string;
		status?: string | null;
		totalScore?: number | null;
		generalFeedback?: string | null;
		detailedFeedback?: string | null;
		submission?: {
			id: string;
			status?: string | null;
			assignment?: {
				id: string;
				title?: string | null;
				course?: {
					id: string;
					course_name?: string | null;
				} | null;
			} | null;
		} | null;
	} | null;
}

export interface ReEvaluationRequestsData {
	reEvaluationRequests: ReEvaluationRequest[];
}

export interface CreateReEvaluationRequestInput {
	evaluationId: string;
	reason: string;
}

export interface ResolveReEvaluationRequestInput {
	id: string;
	status: ReEvaluationRequestStatus.APPROVED | ReEvaluationRequestStatus.REJECTED;
	teacherResponse: string;
}
