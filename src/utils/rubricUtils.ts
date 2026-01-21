import {Rubric, RubricTemplate} from "@/types";

/**
 * Convert RubricTemplate from API to Rubric format for UI
 */
export const convertTemplateToRubric = (template: RubricTemplate): Rubric => {
	return {
		id: template.id,
		name: template.title,
		description: template.description,
		criteria: [], // Will be populated from API or builder
		totalWeight: 100,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		isActive: true,
	};
};

/**
 * Convert Rubric to API input format
 */
export const convertRubricToInput = (rubric: Rubric) => {
	return {
		id: rubric.id,
		title: rubric.name,
		description: rubric.description,
		maxTotalScore: rubric.criteria.reduce((acc, c) => acc + c.maxScore, 0),
	};
};
