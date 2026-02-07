import {RubricCriterion} from ".";

export interface AssignmentForm {
	title: string;
	description: string;
	dueDate: string;
	maxScore: number;
	rubric: {
		name: string;
		description: string;
		criteria: RubricCriterion[];
	};
}

export interface AssignmentCardProps {
	assignment: Assignment;
	onSelect: (assignment: Assignment) => void;
}

export interface Assignment {
	id: string;
	title: string;
	description: string;
	dueDate: string;
	rubric?: {
		criteria: {
			name: string;
			description: string;
			weight: number;
		}[];
	};
	status: AssignmentStatus;
}

export interface StudentAssignment {
	id: string;
	title: string;
	description: string;
	dueDate: string;
	rubric: {
		criteria: {
			name: string;
			description: string;
			weight: number;
		}[];
	};
	status: AssignmentStatus;
	grade?: number;
	feedback?: string;
}

export enum AssignmentStatus {
	PENDING = "pending",
	SUBMITTED = "submitted",
	GRADED = "graded",
	OVERDUE = "overdue",
}
