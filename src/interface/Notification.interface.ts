export interface NotificationPreferences {
	emailEnabled: boolean;
	browserEnabled: boolean;
	newSubmissionsEnabled: boolean;
	gradesEnabled: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
	emailEnabled: true,
	browserEnabled: false,
	newSubmissionsEnabled: true,
	gradesEnabled: true,
};
