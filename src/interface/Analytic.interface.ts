export interface GradeDistributionProps {
	data: {
		range: string;
		label: string;
		count: number;
		percentage: number;
		color: string;
		light: string;
	}[];
	approvalRate: string;
}

export interface Student {
	id: string;
	name: string;
	grade: number;
	trend: "up" | "down" | "stable";
	riskLevel: "low" | "medium" | "high";
	criteria: {
		name: string;
		score: number;
		maxScore: number;
	}[];
}

export interface StudentPerformanceProps {
	students: Student[];
}
