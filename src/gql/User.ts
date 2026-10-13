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

export const UPDATE_MY_PROFILE: DocumentNode = gql`
	mutation UpdateMyProfile($input: UpdateOwnProfileInput!) {
		updateMyProfile(input: $input) {
			id
			name
			last_name
			email
			phone
			document_type
			document_num
			role
			isActive
		}
	}
`;

export const ASSIGN_COURSES_TO_USER: DocumentNode = gql`
	mutation AssignCoursesToUser($assignCoursesInput: AssignCoursesInput!) {
		assignCoursesToUser(assignCoursesInput: $assignCoursesInput) {
			id
			courses {
				id
			}
		}
	}
`;

export const RESET_PASSWORD_AUTH: DocumentNode = gql`
	mutation ResetPasswordAuth($input: ChangePasswordInput!) {
		resetPasswordAuth(input: $input) {
			id
			name
			last_name
			email
			role
		}
	}
`;

export const PENDING_INSTITUTION_USERS: DocumentNode = gql`
	query PendingInstitutionUsers {
		pendingInstitutionUsers {
			id
			name
			last_name
			email
			phone
			document_type
			document_num
			role
			approvalStatus
		}
	}
`;

export const REVIEW_INSTITUTION_USER: DocumentNode = gql`
	mutation ReviewInstitutionUser($input: ReviewInstitutionUserInput!) {
		reviewInstitutionUser(input: $input) {
			id
			approvalStatus
		}
	}
`;
