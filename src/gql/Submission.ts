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
			description
			dueDate
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

export const GET_TEACHER_EVALUATIONS: DocumentNode = gql`
	query GetTeacherEvaluations {
		evaluations {
			id
			status
			totalScore
			generalFeedback
			detailedFeedback
			createdAt
			submission {
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
						}
					}
				}
			}
		}
	}
`;

export const GET_SUBMISSION_BY_ID: DocumentNode = gql`
	query Submission($submissionId: ID!) {
		submission(id: $submissionId) {
			...SubmissionFields
		}
	}
	${SUBMISSION_FIELDS}
`;

export const CREATE_SUBMISSION: DocumentNode = gql`
	mutation CreateSubmission(
		$createSubmissionInput: CreateSubmissionInput!
		$file: Upload!
	) {
		createSubmission(
			createSubmissionInput: $createSubmissionInput
			file: $file
		) {
			...SubmissionFields
		}
	}
	${SUBMISSION_FIELDS}
`;

export const PUBLISH_EVALUATION: DocumentNode = gql`
	mutation PublishEvaluation(
		$id: ID!
		$updateEvaluationInput: UpdateEvaluationInput
	) {
		publishEvaluation(id: $id, updateEvaluationInput: $updateEvaluationInput) {
			id
			status
			totalScore
			generalFeedback
			detailedFeedback
			createdAt
		}
	}
`;

// Query para obtener las entregas (el backend ahora filtra por usuario/rol)
export const GET_TEACHER_SUBMISSIONS: DocumentNode = gql`
	query GetTeacherSubmissions {
		submissions {
			id
			status
			createdAt
			student {
				id
				name
				last_name
				email
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
				}
			}
			evaluation {
				id
				status
				totalScore
			}
		}
	}
`;
