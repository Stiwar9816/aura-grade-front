export type GroupableCourse = {
	id: string;
	course_name: string;
	code_course: string;
	sga_subject_code?: string | null;
};

export type CourseGroup<T extends GroupableCourse> = {
	/** SGA group code shared by every course in the list (trimmed, upper-cased). */
	code: string;
	courses: T[];
};

/**
 * Groups courses by their SGA group code. Groups keep the order in which they first appear; inside
 * a group, courses go by subject code (those without one last) and then by name.
 */
export function groupCoursesByCode<T extends GroupableCourse>(
	courses: T[],
): CourseGroup<T>[] {
	const groups = new Map<string, T[]>();
	for (const course of courses) {
		const code = course.code_course.trim().toUpperCase();
		groups.set(code, [...(groups.get(code) ?? []), course]);
	}
	return [...groups].map(([code, items]) => ({
		code,
		courses: [...items].sort((a, b) => {
			const left = a.sga_subject_code ?? "";
			const right = b.sga_subject_code ?? "";
			if (left !== right) {
				if (!left) return 1;
				if (!right) return -1;
				return left.localeCompare(right);
			}
			return a.course_name.localeCompare(b.course_name, "es");
		}),
	}));
}
