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
