export interface NotificationPreferences {
	emailEnabled: boolean;
	browserEnabled: boolean;
	newSubmissionsEnabled: boolean;
	gradesEnabled: boolean;
	remindersEnabled: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
	emailEnabled: true,
	browserEnabled: false,
	newSubmissionsEnabled: true,
	gradesEnabled: true,
	remindersEnabled: true,
};

export type InAppNotificationType =
	| "NEW_SUBMISSION"
	| "GRADE_PUBLISHED"
	| "GRADING_FAILED"
	| "ASSIGNMENT_REMINDER";

export type NotificationResourceType =
	| "SUBMISSION"
	| "EVALUATION"
	| "ASSIGNMENT";

export interface InAppNotification {
	id: string;
	type: InAppNotificationType;
	title: string;
	body: string;
	url: string;
	resourceType: NotificationResourceType;
	resourceId: string;
	readAt?: string | null;
	createdAt: string;
}

export interface NotificationPage {
	items: InAppNotification[];
	page: number;
	limit: number;
	total: number;
	unreadCount: number;
	hasMore: boolean;
}
