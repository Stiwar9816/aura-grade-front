import {gql, DocumentNode} from "@apollo/client";
import {title} from "process";

const RUBRIC_FIELDS = gql`
	fragment RubricFields on Rubric {
		id
		title
		description
		maxTotalScore
	}
`;

export const ALL_RUBRICS: DocumentNode = gql`
	query Rubrics {
		rubrics {
			...RubricFields
		}
	}
	${RUBRIC_FIELDS}
`;

export const RUBRIC_BY_ID: DocumentNode = gql`
	query Rubric($rubricId: String!) {
		rubric(id: $rubricId) {
			...RubricFields
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
	${RUBRIC_FIELDS}
`;

export const CREATE_RUBRIC: DocumentNode = gql`
	mutation CreateRubric($createRubricInput: CreateRubricInput!) {
		createRubric(createRubricInput: $createRubricInput) {
			...RubricFields
		}
	}
	${RUBRIC_FIELDS}
`;

export const UPDATE_RUBRIC: DocumentNode = gql`
	mutation UpdateRubric($updateRubricInput: UpdateRubricInput!) {
		updateRubric(updateRubricInput: $updateRubricInput) {
			...RubricFields
		}
	}
	${RUBRIC_FIELDS}
`;

export const DELETE_RUBRIC: DocumentNode = gql`
	mutation RemoveRubric($removeRubricId: String!) {
		removeRubric(id: $removeRubricId) {
			id
			title
		}
	}
`;
