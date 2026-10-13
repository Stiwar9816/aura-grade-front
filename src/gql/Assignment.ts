import {DocumentNode, gql} from "@apollo/client";

export const GET_TASK_TEACHER: DocumentNode = gql`
	query GetAssignmentsForTeacher {
		assignments {
			id
			title
			description
			dueDate
			effectiveDueDate
			isActive
			user {
				id
				name
				last_name
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
			submissions {
				id
				fileUrl
				extractedText
				status
				gradingAttemptCount
				gradingFailureReason
				gradingLastAttemptAt
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
					origin
					status
					totalScore
					generalFeedback
					detailedFeedback
					createdAt
				}
			}
			course {
				id
				course_name
				users {
					id
					name
					last_name
					email
					role
					isActive
				}
			}
			extensions {
				id
				extendedDueDate
				reason
				student {
					id
					name
					last_name
					email
				}
			}
		}
	}
`;

export const GET_ASSIGNMENT_BY_ID: DocumentNode = gql`
	query GetAssignmentById($id: ID!) {
		assignment(id: $id) {
			id
			title
			description
			dueDate
			effectiveDueDate
			isActive
			user {
				id
				name
				last_name
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
			submissions {
				id
				fileUrl
				extractedText
				status
				gradingAttemptCount
				gradingFailureReason
				gradingLastAttemptAt
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
					origin
					status
					totalScore
					generalFeedback
					detailedFeedback
					createdAt
				}
			}
			course {
				id
				course_name
				users {
					id
					name
					last_name
					email
					role
					isActive
				}
			}
			extensions {
				id
				extendedDueDate
				reason
				student {
					id
					name
					last_name
					email
				}
			}
		}
	}
`;

export const CREATE_ASSIGNMENT: DocumentNode = gql`
	mutation CreateAssignment($createAssignmentInput: CreateAssignmentInput!) {
		createAssignment(createAssignmentInput: $createAssignmentInput) {
			id
			title
			description
			dueDate
			isActive
		}
	}
`;

export const UPSERT_ASSIGNMENT_EXTENSION: DocumentNode = gql`
	mutation UpsertAssignmentExtension($input: UpsertAssignmentExtensionInput!) {
		upsertAssignmentExtension(input: $input) {
			id
			extendedDueDate
			reason
			student {
				id
				name
				last_name
				email
			}
		}
	}
`;

export const REMOVE_ASSIGNMENT_EXTENSION: DocumentNode = gql`
	mutation RemoveAssignmentExtension($assignmentId: ID!, $studentId: ID!) {
		removeAssignmentExtension(
			assignmentId: $assignmentId
			studentId: $studentId
		)
	}
`;
