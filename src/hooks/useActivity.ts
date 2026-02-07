import {useAuth} from "@/hooks";
import {useActivityActions} from "@/actions";
import {ActivityItem, ActivityType} from "@/interface";
import {formatDistanceToNow} from "date-fns";
import {es} from "date-fns/locale";

export const useRecentActivity = (limit: number = 8) => {
	const {user} = useAuth();
	const {data, loading, error} = useActivityActions();

	const processActivity = (): ActivityItem[] => {
		if (!data?.submissions) return [];

		return [...data.submissions]
			.filter((s: any) => s.assignment?.user?.id === user?.id)
			.sort(
				(a: any, b: any) =>
					new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
			)
			.slice(0, limit)
			.map((submission: any) => {
				const studentName = submission.student
					? `${submission.student.name} ${submission.student.last_name}`
					: "Estudiante desconocido";
				const assignmentTitle =
					submission.assignment?.title || "Tarea desconocida";

				// Determinar la acción y tipo
				let action = "";
				let grade = undefined;
				let type: ActivityType = ActivityType.SUBMISSION;

				const isGraded =
					submission.evaluation?.status === "PUBLISHED" ||
					submission.evaluation?.status === "GRADED";

				if (isGraded) {
					action = "fue calificado";
					grade = submission.evaluation.totalScore;
					type = ActivityType.EVALUATION;
				} else if (submission.status === "IN_PROGRESS") {
					action = "está siendo evaluado con IA";
					type = ActivityType.SYSTEM;
				} else if (submission.status === "SUBMITTED") {
					action = "entregó";
				} else {
					action = "actualizó";
				}

				// Calcular tiempo relativo
				const time = formatDistanceToNow(new Date(submission.updatedAt), {
					addSuffix: true,
					locale: es,
				});

				return {
					id: submission.id,
					student:
						type === ActivityType.SYSTEM && !isGraded
							? "Sistema IA"
							: studentName,
					action,
					assignment: assignmentTitle,
					time,
					grade,
					type,
				};
			});
	};

	return {
		activities: processActivity(),
		loading,
		error,
	};
};
