import {DocumentNode, gql} from "@apollo/client";

export const GET_TASK_TEACHER: DocumentNode = gql`
	query GetAssignmentsForTeacher {
		assignments {
			id
			title
			description
			dueDate
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
