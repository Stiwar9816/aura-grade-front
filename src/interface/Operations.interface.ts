export type FeedbackCategory = "BUG" | "SUGGESTION" | "QUESTION" | "OTHER";
export type FeedbackStatus = "OPEN" | "IN_REVIEW" | "RESOLVED";

export interface FeedbackEntry {
	id: string;
	category: FeedbackCategory;
	status: FeedbackStatus;
	message: string;
	page: string;
	referenceId?: string | null;
	adminNote?: string | null;
	createdAt: string;
	resolvedAt?: string | null;
	user?: {
		id: string;
		name: string;
		last_name: string;
		email: string;
		role: string;
	};
}

export interface FeedbackPage {
	items: FeedbackEntry[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface QueueCounts {
	waiting: number;
	active: number;
	delayed: number;
	failed: number;
	paused: number;
}

export interface OperationsSummary {
	submissions: {
		byStatus: Record<"PENDING" | "IN_PROGRESS" | "REVIEW_PENDING" | "PUBLISHED" | "FAILED", number>;
		active: number;
		failed: number;
	};
	openFeedback: number;
	recentFailures: Array<{
		id: string;
		assignmentTitle: string;
		studentName: string;
		attemptCount: number;
		reason: string;
		lastAttemptAt: string;
	}>;
	infrastructure: null | {
		available: boolean;
		queues?: {grading: QueueCounts; notifications: QueueCounts};
		outboxPending?: number;
		oldestOutboxAt?: string | null;
		failedDeliveries24h?: number;
	};
	generatedAt: string;
}

export interface OnboardingState {
	role: string;
	allowedSteps: string[];
	completedSteps: string[];
	dismissedAt?: string | null;
}
