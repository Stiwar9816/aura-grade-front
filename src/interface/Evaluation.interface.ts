import type {Criteria} from "./Criteria.interface";
import type {SubmissionDetail} from "./Submission.interface";

export interface EvaluationCriterionFeedback {
	id?: string;
	criteriaId?: string;
	name?: string;
	title?: string;
	score?: number;
	maxScore?: number;
	maxPoints?: number;
	feedback?: string;
	suggestion?: string;
}

export interface EvaluationDetailState {
	loading: boolean;
	error: string | null;
	submission: SubmissionDetail | null;
	evaluationData: MappedEvaluationData["evaluationData"] | null;
	studentText: string;
	aiComments: string;
	studentName: string;
}

export interface MappedEvaluationData {
	studentText: string;
	studentName: string;
	aiComments: string;
	evaluationData: {
		overallScore: number;
		maxScore: number;
		generalFeedback: string;
		evaluationDate?: string;
		criteria: Criteria[];
	};
}

export interface ComparisonViewProps {
	studentText: string;
	aiComments: string;
	criteria?: Criteria[];
	studentName?: string;
}

export interface EvaluationSummaryProps {
	score: number;
	maxScore: number;
	feedback: string;
	evaluationDate?: string;
}
