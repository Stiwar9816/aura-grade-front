import {useMutation, useQuery} from "@apollo/client/react";
import {
	GET_ALL_COURSES,
	CREATE_COURSE,
	UPDATE_COURSE,
	DELETE_COURSE,
} from "@/gql/Course";
import {CoursesData} from "@/interface";
import {useAuth} from "./useAuth";

type CourseUpdateData = Partial<Pick<CoursesData["courses"][number], "course_name" | "code_course">> & {
	studentsIds?: string[];
};

export const useCourse = () => {
	const {user} = useAuth();
	const {data, loading, error, refetch} =
		useQuery<CoursesData>(GET_ALL_COURSES);
	const [createCourseMutation] = useMutation(CREATE_COURSE);
	const [updateCourseMutation] = useMutation(UPDATE_COURSE);
	const [deleteCourseMutation] = useMutation(DELETE_COURSE);

	const createCourse = async (course_name: string, code_course: string) => {
		if (!user?.id) {
			throw new Error("Se requiere el ID del usuario para crear un curso");
		}
		try {
			await createCourseMutation({
				variables: {
					createCourseInput: {
						course_name,
						code_course,
						userId: user.id,
					},
				},
			});
			refetch();
		} catch (error) {
			console.error("Error al crear el curso:", error);
			throw error;
		}
	};

	const updateCourse = async (id: string, data: CourseUpdateData) => {
		try {
			await updateCourseMutation({
				variables: {
					updateCourseInput: {
						id,
						...data,
					},
				},
			});
			refetch();
		} catch (error) {
			console.error("Error al actualizar el curso:", error);
			throw error;
		}
	};

	const addStudentToCourse = async (
		courseId: string,
		studentId: string,
		currentStudentIds: string[],
	) => {
		try {
			const newStudentIds = [...currentStudentIds, studentId];
			await updateCourseMutation({
				variables: {
					updateCourseInput: {
						id: courseId,
						studentsIds: newStudentIds,
					},
				},
			});
		} catch (error) {
			console.error("Error al agregar estudiante:", error);
			throw error;
		}
	};

	const removeStudentFromCourse = async (
		courseId: string,
		studentId: string,
		currentStudentIds: string[],
	) => {
		try {
			const newStudentIds = currentStudentIds.filter((id) => id !== studentId);
			await updateCourseMutation({
				variables: {
					updateCourseInput: {
						id: courseId,
						studentsIds: newStudentIds,
					},
				},
			});
		} catch (error) {
			console.error("Error removing student:", error);
			throw error;
		}
	};

	const deleteCourse = async (id: string) => {
		try {
			await deleteCourseMutation({
				variables: {
					removeCourseId: id,
				},
			});
			refetch();
		} catch (error) {
			console.error("Error al eliminar el curso:", error);
			throw error;
		}
	};

	const saveCourse = async (name: string, code: string, courseId?: string) => {
		try {
			if (courseId) {
				await updateCourse(courseId, {
					course_name: name,
					code_course: code,
				});
			} else {
				await createCourse(name, code);
			}
		} catch (error) {
			console.error("Error al guardar el curso:", error);
			throw error;
		}
	};

	return {
		courses: data?.courses || [],
		loading,
		error,
		createCourse,
		updateCourse,
		deleteCourse,
		saveCourse,
		addStudentToCourse,
		removeStudentFromCourse,
		refetch,
	};
};
