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

export interface SubmissionsData {
	submissions: {
		id: string;
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
			};
		};
	}[];
}

export enum SubmissionStatus {
	PENDING = "PENDING",
	IN_PROGRESS = "IN_PROGRESS",
	REVIEW_PENDING = "REVIEW_PENDING",
	PUBLISHED = "PUBLISHED",
	FAILED = "FAILED",
}
