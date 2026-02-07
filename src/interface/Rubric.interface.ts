export interface RubricCriteria {
	id: string;
	title: string;
	description?: string; // Optional as API puts it in levels
	weight?: number; // Optional as API allows calculating it or implicit
	maxPoints: number;
	levels?: {
		description: string;
		score: number;
	}[];
}

export interface RubricCriterion {
	id: string;
	name: string;
	description: string;
	weight: number;
	maxScore: number;
	performanceLevels?: {
		label: string;
		description: string;
		minScore: number;
		maxScore: number;
	}[];
}

export interface RubricBuilderProps {
	rubric: Rubric;
	onAddCriteria: (criteria: RubricCriteria) => void;
	onUpdateCriteria: (id: string, updated: Partial<RubricCriteria>) => void;
	onDeleteCriteria: (id: string) => void;
}

export interface Rubric {
	id: string;
	name: string;
	description: string;
	criteria: RubricCriteria[];
	totalWeight: number;
	isActive: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface RubricTemplate {
	id: string;
	title: string;
	description: string;
	maxTotalScore: number;
	criteria?: RubricCriteria[];
}

export interface RubricLibraryProps {
	templates: RubricTemplate[];
	loading?: boolean;
	error?: any;
	onSelectTemplate: (template: RubricTemplate) => void;
	onDeleteTemplate: (id: string) => void;
	onCreateNew: () => void;
}

export interface RubricsData {
	rubrics: RubricTemplate[];
}

export interface RubricData {
	rubric: RubricTemplate;
}

export interface RubricsCreateProps {
	onStart: (data: {title: string; description: string}) => Promise<void> | void;
}

export interface CreateRubricInput {
	title: string;
	description: string;
	maxTotalScore: number;
	userId: string;
}

export interface UpdateRubricInput {
	id: string;
	title?: string;
	description?: string;
	maxTotalScore?: number;
}
