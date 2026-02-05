export interface ActivityItem {
	id: string;
	student: string;
	action: string;
	assignment: string;
	time: string;
	grade?: number;
	type: ActivityType;
}

export enum ActivityType {
	SUBMISSION = "submission",
	EVALUATION = "evaluation",
	SYSTEM = "system",
}
