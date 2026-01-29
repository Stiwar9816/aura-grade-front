import {gql, DocumentNode} from "@apollo/client";

export const USER_ROLE_STUDENTS: DocumentNode = gql`
	query Users {
		users {
			id
			name
			last_name
			role
			isActive
			submissions {
				id
				status
				evaluation {
					id
					status
					totalScore
				}
			}
			assignments {
				id
				title
				isActive
			}
			courses {
				id
				course_name
			}
		}
	}
`;
