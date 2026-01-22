import {gql, DocumentNode} from "@apollo/client";

export const ALL_RUBRICS: DocumentNode = gql`
	query Rubrics {
		rubrics {
			id
			title
			description
			maxTotalScore
		}
	}
`;

export const RUBRIC_BY_ID: DocumentNode = gql`
	query Rubric($rubricId: String!) {
		rubric(id: $rubricId) {
			id
			title
			description
			maxTotalScore
			criteria {
				id
				title
				levels {
					description
					score
				}
				maxPoints
			}
		}
	}
`;

export const CREATE_RUBRIC: DocumentNode = gql`
	mutation CreateRubric($createRubricInput: CreateRubricInput!) {
		createRubric(createRubricInput: $createRubricInput) {
			id
			title
			description
			maxTotalScore
		}
	}
`;

export const UPDATE_RUBRIC: DocumentNode = gql`
	mutation UpdateRubric($updateRubricInput: UpdateRubricInput!) {
		updateRubric(updateRubricInput: $updateRubricInput) {
			id
			title
			description
			maxTotalScore
		}
	}
`;

export const DELETE_RUBRIC: DocumentNode = gql`
	mutation RemoveRubric($removeRubricId: String!) {
		removeRubric(id: $removeRubricId) {
			id
			title
		}
	}
`;
