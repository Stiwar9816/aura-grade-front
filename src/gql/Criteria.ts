import {DocumentNode, gql} from "@apollo/client";

const CRITERION_FIELDS = gql`
	fragment CriterionFields on Criterion {
		id
		title
		maxPoints
		levels {
			description
			score
		}
		maxPoints
		rubric {
			id
		}
	}
`;

export const ALL_CRITERIA: DocumentNode = gql`
	query Criteria {
		...CriterionFields
	}
	${CRITERION_FIELDS}
`;

export const CRITERIA_BY_ID: DocumentNode = gql`
	query Criterion($criterionId: String!) {
		criterion(id: $criterionId) {
			...CriterionFields
		}
	}
	${CRITERION_FIELDS}
`;

export const CREATE_CRITERIA: DocumentNode = gql`
	mutation CreateCriterion($createCriterionInput: CreateCriterionInput!) {
		createCriterion(createCriterionInput: $createCriterionInput) {
			...CriterionFields
		}
	}
	${CRITERION_FIELDS}
`;

export const UPDATE_CRITERIA: DocumentNode = gql`
	mutation UpdateCriterion($updateCriterionInput: UpdateCriterionInput!) {
		updateCriterion(updateCriterionInput: $updateCriterionInput) {
			...CriterionFields
		}
	}
	${CRITERION_FIELDS}
`;

export const DELETE_CRITERIA: DocumentNode = gql`
	mutation RemoveCriterion($removeCriterionId: String!) {
		removeCriterion(id: $removeCriterionId) {
			id
			title
		}
	}
`;
