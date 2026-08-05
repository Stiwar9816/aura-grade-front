import {useMutation, useQuery} from "@apollo/client/react";
import {
	GET_ALL_COURSES,
	CREATE_COURSE,
	UPDATE_COURSE,
	DELETE_COURSE,
} from "@/gql/Course";
import {CoursesData} from "@/interface";
import {ASSIGN_COURSES_TO_USER} from "@/gql/User";
import {useAuth} from "./useAuth";

type CourseUpdateData = Partial<
	Pick<CoursesData["courses"][number], "course_name" | "code_course">
>;

export const useCourse = () => {
	const {user} = useAuth();
	const {data, loading, error, refetch} =
		useQuery<CoursesData>(GET_ALL_COURSES);
	const [createCourseMutation] = useMutation(CREATE_COURSE);
	const [updateCourseMutation] = useMutation(UPDATE_COURSE);
	const [deleteCourseMutation] = useMutation(DELETE_COURSE);
	const [assignCoursesMutation] = useMutation(ASSIGN_COURSES_TO_USER);

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

	const assignCoursesToStudent = async (
		studentId: string,
		courseIds: string[],
	) => {
		try {
			await assignCoursesMutation({
				variables: {
					assignCoursesInput: {
						userId: studentId,
						courseIds,
					},
				},
			});
			await refetch();
		} catch (error) {
			console.error("Error al asignar cursos al estudiante:", error);
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
		assignCoursesToStudent,
		refetch,
	};
};
