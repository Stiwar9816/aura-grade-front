import {gql, DocumentNode} from "@apollo/client";

const RE_EVALUATION_REQUEST_FIELDS = gql`
	fragment ReEvaluationRequestFields on ReEvaluationRequest {
		id
		reason
		status
		teacherResponse
		createdAt
		updatedAt
		reviewedAt
		student {
			id
			name
			last_name
			email
		}
		teacher {
			id
			name
			last_name
			email
		}
		evaluation {
			id
			status
			totalScore
			generalFeedback
			detailedFeedback
			submission {
				id
				status
				assignment {
					id
					title
					course {
						id
						course_name
					}
				}
			}
		}
	}
`;

export const GET_RE_EVALUATION_REQUESTS: DocumentNode = gql`
	query GetReEvaluationRequests {
		reEvaluationRequests {
			...ReEvaluationRequestFields
		}
	}
	${RE_EVALUATION_REQUEST_FIELDS}
`;

export const GET_RE_EVALUATION_REQUEST_BY_ID: DocumentNode = gql`
	query GetReEvaluationRequest($id: ID!) {
		reEvaluationRequest(id: $id) {
			...ReEvaluationRequestFields
		}
	}
	${RE_EVALUATION_REQUEST_FIELDS}
`;

export const CREATE_RE_EVALUATION_REQUEST: DocumentNode = gql`
	mutation CreateReEvaluationRequest($input: CreateReEvaluationRequestInput!) {
		createReEvaluationRequest(createReEvaluationRequestInput: $input) {
			...ReEvaluationRequestFields
		}
	}
	${RE_EVALUATION_REQUEST_FIELDS}
`;

export const RESOLVE_RE_EVALUATION_REQUEST: DocumentNode = gql`
	mutation ResolveReEvaluationRequest($input: ResolveReEvaluationRequestInput!) {
		resolveReEvaluationRequest(resolveReEvaluationRequestInput: $input) {
			...ReEvaluationRequestFields
		}
	}
	${RE_EVALUATION_REQUEST_FIELDS}
`;
