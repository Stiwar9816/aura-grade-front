export interface CreateCriterionInput {
	rubric: string;
	title: string;
	maxPoints: number;
	levels?: {
		description: string;
		score: number;
	}[];
}

export interface UpdateCriterionInput {
	id: string;
	title?: string;
	maxPoints?: number;
	levels?: {
		description: string;
		score: number;
	}[];
}

export interface Criteria {
	id: string;
	name: string;
	score: number;
	maxScore: number;
	feedback: string;
	suggestion: string;
}

export interface CriteriaTableProps {
	criteria: Criteria[];
}
