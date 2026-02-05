import {Rubric} from ".";

export interface TeacherAssignment {
	id: string;
	title: string;
	description: string;
	dueDate: string;
	totalStudents: number;
	submissions: number;
	pendingEvaluations: number;
	averageGrade: number;
	rubric: Rubric;
}

export interface TeacherEvaluation {
	overallScore: number;
	criteriaScores: Record<string, number>;
	overrides: TeacherOverride[];
	finalFeedback: string;
	published: boolean;
}

export interface TeacherOverride {
	criterionId: string;
	originalScore: number;
	newScore: number;
	reason: string;
	comments: string;
}
