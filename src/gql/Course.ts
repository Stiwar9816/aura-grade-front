import {DocumentNode, gql} from "@apollo/client";

const COURSE_FIELDS = gql`
	fragment CoursesFields on Course {
		id
		course_name
		code_course
	}
`;

export const CREATE_COURSE: DocumentNode = gql`
	mutation CreateCourse($createCourseInput: CreateCourseInput!) {
		createCourse(createCourseInput: $createCourseInput) {
			...CoursesFields
		}
	}
	${COURSE_FIELDS}
`;

export const UPDATE_COURSE: DocumentNode = gql`
	mutation UpdateCourse($updateCourseInput: UpdateCourseInput!) {
		updateCourse(updateCourseInput: $updateCourseInput) {
			...CoursesFields
			users {
				id
				name
				last_name
				role
				email
				phone
			}
		}
	}
	${COURSE_FIELDS}
`;

export const DELETE_COURSE: DocumentNode = gql`
	mutation RemoveCourse($removeCourseId: String!) {
		removeCourse(id: $removeCourseId) {
			id
			course_name
		}
	}
`;

export const GET_ALL_COURSES: DocumentNode = gql`
	query Courses {
		courses {
			...CoursesFields
			users {
				id
				name
				last_name
				role
				email
				phone
			}
		}
	}
	${COURSE_FIELDS}
`;

export const GET_COURSE_BY_ID: DocumentNode = gql`
	query Courses($courseId: String!) {
		course(id: $courseId) {
			...CoursesFields
			users {
				id
				name
				last_name
				role
				email
				phone
			}
		}
	}
	${COURSE_FIELDS}
`;
