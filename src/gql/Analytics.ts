import {gql, DocumentNode} from "@apollo/client";

export const GET_ANALYTICS_DATA: DocumentNode = gql`
	query GetAnalyticsData {
		users {
			name
			last_name
			role
			isActive
			submissions {
				id
				status
				updatedAt
				assignment {
					id
					title
					dueDate
					rubric {
						id
						maxTotalScore
					}
				}
				evaluation {
					id
					detailedFeedback
					totalScore
				}
			}
			courses {
				id
				course_name
			}
		}
	}
`;
