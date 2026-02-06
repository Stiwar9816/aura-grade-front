import {SubmissionDetail} from ".";

export interface EvaluationDetailState {
	loading: boolean;
	error: string | null;
	submission: SubmissionDetail | null;
	evaluationData: any | null;
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
		criteria: any[];
	};
}

export interface ComparisonViewProps {
	studentText: string;
	aiComments: string;
	criteria?: any[];
	studentName?: string;
}

export interface EvaluationSummaryProps {
	score: number;
	maxScore: number;
	feedback: string;
	evaluationDate?: string;
}
