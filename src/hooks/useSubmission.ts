import {useQuery} from "@apollo/client/react";
import {GET_TEACHER_SUBMISSIONS} from "@/gql/Submission";
import {Submission, SubmissionsData} from "@/types";

export const useSubmission = () => {
	const {data, loading, error, refetch} = useQuery<SubmissionsData>(
		GET_TEACHER_SUBMISSIONS,
	);

	// Handle potential undefined data safely
	const submissions: Submission[] =
		data?.submissions?.map((s: any) => {
			// Calcular si necesita atención
			const daysSinceSubmission = s.createdAt
				? Math.floor(
						(Date.now() - new Date(s.createdAt).getTime()) /
							(1000 * 60 * 60 * 24),
					)
				: 0;

			const needsAttention = s.status === "PENDING" && daysSinceSubmission > 3; // Más de 3 días sin revisar

			return {
				id: s.id,
				studentName: s.student
					? `${s.student.name} ${s.student.last_name || ""}`
					: "Estudiante Desconocido",
				studentEmail: s.student?.email || "",
				assignmentTitle: s.assignment?.title || "Tarea sin título",
				courseName: s.assignment?.course?.course_name || "Sin curso",
				rubricName: s.assignment?.rubric?.title || "Sin rúbrica",
				submittedAt: s.createdAt,
				status: s.status,
				grade: s.evaluation?.totalScore,
				needsAttention,
			};
		}) || [];

	return {
		submissions,
		loading,
		error,
		refetch,
	};
};
