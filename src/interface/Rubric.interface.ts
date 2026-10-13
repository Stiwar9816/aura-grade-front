export interface RubricCriteria {
	id: string;
	title: string;
	description: string;
	weight: number;
	maxPoints: number;
	sortOrder?: number;
	levels: {
		label: RubricPerformanceLevel;
		minScore: number;
		maxScore: number;
		description: string;
		score?: number;
	}[];
}

export type RubricAcademicLevel = "UNIVERSITARIO" | "POSGRADO";
export type RubricStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type RubricSource = "MANUAL" | "AI";
export type RubricPerformanceLevel =
	| "Excelente"
	| "Bueno"
	| "Aceptable"
	| "Insuficiente";

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
	academicLevel: RubricAcademicLevel;
	status?: RubricStatus;
	source?: RubricSource;
	version?: number;
	generationToken?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface RubricTemplate {
	id: string;
	title: string;
	description: string;
	maxTotalScore: number;
	user?: {id: string};
	criteria?: RubricCriteria[];
	academicLevel: RubricAcademicLevel;
	status: RubricStatus;
	source: RubricSource;
	version: number;
}

export interface RubricLibraryProps {
	templates: RubricTemplate[];
	loading?: boolean;
	error?: unknown;
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

export interface GenerateRubricInput {
	title: string;
	taskDescription: string;
	academicLevel: RubricAcademicLevel;
	criterionCount: number;
	additionalInstructions?: string;
}

export interface GeneratedRubric {
	title: string;
	description: string;
	academicLevel: RubricAcademicLevel;
	criteria: Omit<RubricCriteria, "id" | "maxPoints">[];
	generationToken: string;
}

export interface RubricsCreateProps {
	onStart: (data: {
		title: string;
		description: string;
		academicLevel: RubricAcademicLevel;
	}) => Promise<void> | void;
	onGenerate: (data: GenerateRubricInput) => Promise<void> | void;
	isGenerating?: boolean;
	initialData?: {
		title?: string;
		description?: string;
		academicLevel?: RubricAcademicLevel;
	};
}

export interface CreateRubricInput {
	title: string;
	description: string;
	maxTotalScore: number;
	academicLevel?: RubricAcademicLevel;
}

export interface UpdateRubricInput {
	id: string;
	title?: string;
	description?: string;
	maxTotalScore?: number;
}
