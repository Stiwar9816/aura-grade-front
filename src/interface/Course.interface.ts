export interface CoursesData {
	courses: {
		id: string;
		course_name: string;
		code_course: string;
		users?: {id: string}[];
	}[];
}
