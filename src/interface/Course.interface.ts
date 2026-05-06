export interface CoursesData {
	courses: {
		id: string;
		course_name: string;
		code_course: string;
		users?: {
			id: string;
			name: string;
			last_name?: string | null;
			role?: string;
			email?: string | null;
			phone?: number | string | null;
		}[];
	}[];
}
