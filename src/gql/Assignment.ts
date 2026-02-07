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
				maxTotalScore
			}
			submissions {
				id
				status
				createdAt
				evaluation {
					id
					status
					totalScore
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
