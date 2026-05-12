import {gql, DocumentNode} from "@apollo/client";

export const USER_ROLE_STUDENTS: DocumentNode = gql`
	query Users {
		users {
			id
			name
			last_name
			role
			isActive
			email
			phone
			submissions {
				id
				status
				evaluation {
					status
					totalScore
				}
			}
			assignments {
				id
				title
				isActive
				dueDate
			}
			courses {
				id
			}
		}
	}
`;

export const UPDATE_USER: DocumentNode = gql`
	mutation UpdateUser($updateUserInput: UpdateUserInput!) {
		updateUser(updateUserInput: $updateUserInput) {
			id
			name
			last_name
			email
			phone
			role
			isActive
		}
	}
`;

export const RESET_PASSWORD_AUTH: DocumentNode = gql`
	mutation ResetPasswordAuth($newPassword: String!) {
		resetPasswordAuth(newPassword: $newPassword) {
			id
			name
			last_name
			email
			role
		}
	}
`;
