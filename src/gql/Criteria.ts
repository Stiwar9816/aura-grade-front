import {DocumentNode, gql} from "@apollo/client";

export const ALL_CRITERIA: DocumentNode = gql`
	query Criteria {
		criteria {
			id
			title
			maxPoints
			levels {
				description
				score
			}
			rubric {
				id
			}
		}
	}
`;

export const CRITERIA_BY_ID: DocumentNode = gql`
	query Criterion($criterionId: String!) {
		criterion(id: $criterionId) {
			id
			title
			levels {
				description
				score
			}
			maxPoints
			rubric {
				id
			}
		}
	}
`;

export const CREATE_CRITERIA: DocumentNode = gql`
	mutation CreateCriterion($createCriterionInput: CreateCriterionInput!) {
		createCriterion(createCriterionInput: $createCriterionInput) {
			id
			title
			levels {
				score
				description
			}
			maxPoints
			rubric {
				id
			}
		}
	}
`;

export const UPDATE_CRITERIA: DocumentNode = gql`
	mutation UpdateCriterion($updateCriterionInput: UpdateCriterionInput!) {
		updateCriterion(updateCriterionInput: $updateCriterionInput) {
			id
			title
			levels {
				description
				score
			}
			maxPoints
			rubric {
				id
			}
		}
	}
`;

export const DELETE_CRITERIA: DocumentNode = gql`
	mutation RemoveCriterion($removeCriterionId: String!) {
		removeCriterion(id: $removeCriterionId) {
			id
			title
		}
	}
`;
