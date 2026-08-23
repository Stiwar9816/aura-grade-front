import {gql, DocumentNode} from "@apollo/client";

const RUBRIC_FIELDS = gql`
	fragment RubricFields on Rubric {
		id
		title
		description
		maxTotalScore
		academicLevel
		status
		source
		version
		user {
			id
		}
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
				description
				maxPoints
				weight
				sortOrder
				levels {
					label
					minScore
					maxScore
					description
				}
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

export const GENERATE_RUBRIC_DRAFT: DocumentNode = gql`
	mutation GenerateRubricDraft($input: GenerateRubricInput!) {
		generateRubricDraft(input: $input) {
			title
			description
			academicLevel
			generationToken
			criteria {
				title
				description
				weight
				levels {
					label
					minScore
					maxScore
					description
				}
			}
		}
	}
`;

export const SAVE_RUBRIC_DRAFT: DocumentNode = gql`
	mutation SaveRubricDraft($input: SaveRubricDraftInput!) {
		saveRubricDraft(input: $input) {
			...RubricFields
			criteria {
				id
				title
				description
				maxPoints
				weight
				sortOrder
				levels {
					label
					minScore
					maxScore
					description
				}
			}
		}
	}
	${RUBRIC_FIELDS}
`;
