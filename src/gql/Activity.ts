import {DocumentNode, gql} from "@apollo/client";

export const GET_RECENT_ACTIVITY: DocumentNode = gql`
	query GetRecentActivity {
		submissions {
			id
			status
			createdAt
			updatedAt
			student {
				id
				name
				last_name
			}
			assignment {
				id
				title
				user {
					id
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
