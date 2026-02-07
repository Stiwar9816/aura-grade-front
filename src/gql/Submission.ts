import {gql, DocumentNode} from "@apollo/client";

const SUBMISSION_FIELDS = gql`
	fragment SubmissionFields on Submission {
		id
		fileUrl
		extractedText
		status
		createdAt
		updatedAt
		student {
			id
			name
			last_name
			email
			isActive
		}
		evaluation {
			id
			generalFeedback
			detailedFeedback
			status
			totalScore
			createdAt
		}
		assignment {
			id
			title
			course {
				id
				course_name
			}
			rubric {
				id
				title
				description
				maxTotalScore
				criteria {
					id
					title
					maxPoints
					levels {
						description
						score
					}
				}
			}
		}
	}
`;

export const GET_ALL_SUBMISSIONS: DocumentNode = gql`
	query GetAllSubmissions {
		submissions {
			...SubmissionFields
		}
	}
	${SUBMISSION_FIELDS}
`;

export const GET_SUBMISSION_BY_ID: DocumentNode = gql`
	query Submission($submissionId: ID!) {
		submission(id: $submissionId) {
			...SubmissionFields
		}
	}
	${SUBMISSION_FIELDS}
`;

// Query para obtener las entregas (el backend ahora filtra por usuario/rol)
export const GET_TEACHER_SUBMISSIONS: DocumentNode = gql`
	query GetTeacherSubmissions {
		submissions {
			...SubmissionFields
		}
	}
	${SUBMISSION_FIELDS}
`;
