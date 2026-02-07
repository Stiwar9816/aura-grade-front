export interface DashboardStats {
	totalStudents: number;
	activeAssignments: number;
	pendingEvaluations: number;
	averageGrade: number;
	completionRate: number;
}

export interface Task {
	id: string;
	title: string;
	description: string;
	dueDate: string;
	status: "pending" | "submitted" | "graded" | "overdue";
	score?: number;
	maxScore: number;
	studentCount?: number;
}
// CRITERIA REMOVED (Duplicate)
// EVALUATION
export interface Evaluation {
	id: string;
	taskId: string;
	studentId: string;
	overallScore: number;
	generalFeedback: string;
	criteriaFeedback: CriteriaFeedback[];
	createdAt: string;
}

export interface CriteriaFeedback {
	criteriaId: string;
	score: number;
	feedback: string;
	suggestion: string;
}
// ACTIVITY
export interface Activity {
	id: string;
	type: "upload" | "graded" | "ai_processing" | "rubric_updated" | "alert";
	user: string;
	time: string;
	task?: string;
	score?: number;
	message?: string;
}

export interface KPI {
	title: string;
	value: string | number;
	change: string;
	icon: string;
	color: "blue" | "green" | "purple" | "orange" | "cyan";
}

export interface UploadStep {
	id: number;
	title: string;
	description: string;
	icon?: string;
	status?: "pending" | "active" | "completed";
}

export interface FileInfo {
	name: string;
	size: number;
	type: string;
	lastModified: number;
	extension: string;
}

export interface UploadProgress {
	step: number;
	percentage: number;
	estimatedTime: number;
	currentAction: string;
}

export interface ValidationResult {
	isValid: boolean;
	error?: string;
	warnings?: string[];
}

// RUBRIC

// CRITERION

// ANALYTICS
export interface AnalyticsData {
	period: string;
	averageGrade: number;
	passRate: number;
	totalEvaluations: number;
	averageTime: number;
	criteriaPerformance: Record<string, number>;
	gradeDistribution: {
		range: string;
		count: number;
		percentage: number;
	}[];
	studentPerformance: {
		id: string;
		name: string;
		grade: number;
		trend: "up" | "down" | "stable";
		riskLevel: "low" | "medium" | "high";
	}[];
	activityTrends: {
		date: string;
		uploads: number;
		evaluations: number;
		averageTime: number;
	}[];
}

export interface HeatmapData {
	criteria: string;
	weeks: string[];
	scores: number[][];
}

export interface Step {
	id: number;
	title: string;
	description: string;
	status: "pending" | "active" | "completed";
	message: string;
}

export interface AIEvaluation {
	criteria: {
		name: string;
		score: number;
		maxScore: number;
		feedback: string;
		suggestions: string[];
	}[];
	overallScore: number;
	generalFeedback: string;
	confidence: number;
}

export interface UserJourney {
	role: "student" | "teacher";
	journeyType: "upload" | "evaluation" | "creation" | "review";
	currentStep: number;
	totalSteps: number;
	estimatedTime: number;
	isComplete: boolean;
}
