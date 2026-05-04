export interface Submission {
	id: string;
	studentName: string;
	studentEmail: string;
	assignmentTitle: string;
	submittedAt: string;
	status: SubmissionStatus;
	grade?: number;
	aiConfidence?: number;
	needsAttention: boolean;
	courseName?: string;
	rubricName?: string;
}

export interface SubmissionDetail {
	id: string;
	fileUrl?: string; // Adding fileUrl as it is in the fragment
	extractedText: string;
	status: SubmissionStatus;
	createdAt: string;
	updatedAt: string;
	student: {
		id: string;
		name: string;
		last_name: string;
		email: string;
		isActive: boolean;
	};
	evaluation?: {
		id: string;
		status: string;
		totalScore: number;
		generalFeedback?: string;
		detailedFeedback?: string;
		createdAt?: string;
	};
	assignment: {
		id: string;
		title: string;
		course: {
			id: string;
			course_name: string;
		};
		rubric: {
			id: string;
			title: string;
			description: string;
			maxTotalScore: number;
			criteria?: {
				id: string;
				title: string;
				maxPoints: number;
				levels?: {
					description: string;
					score: number;
				}[];
			}[];
		};
	};
}

export interface SubmissionsData {
	submissions: SubmissionDetail[];
}

export enum SubmissionStatus {
	PENDING = "PENDING",
	IN_PROGRESS = "IN_PROGRESS",
	REVIEW_PENDING = "REVIEW_PENDING",
	GRADED = "GRADED",
	PUBLISHED = "PUBLISHED",
	FAILED = "FAILED",
}
