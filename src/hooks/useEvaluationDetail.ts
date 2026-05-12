import {useState, useEffect, useCallback} from "react";
import {SubmissionActions} from "@/actions";
import {EvaluationDetailState} from "@/interface";
import {mapSubmissionToEvaluation} from "@/utils";

export const useEvaluationDetail = (submissionId: string | null) => {
	const [state, setState] = useState<EvaluationDetailState>({
		loading: true,
		error: null,
		submission: null,
		evaluationData: null,
		studentText: "",
		aiComments: "",
		studentName: "",
	});
	const {getSubmissionById} = SubmissionActions();

	const refetch = useCallback(async () => {
		if (!submissionId) {
			setState((prev) => ({...prev, loading: false}));
			return null;
		}

		try {
			setState((prev) => ({...prev, loading: true, error: null}));
			const submission = await getSubmissionById(submissionId);

			if (!submission) throw new Error("Envío no encontrado");

			const {studentText, studentName, aiComments, evaluationData} =
				mapSubmissionToEvaluation(submission);

			setState({
				loading: false,
				error: null,
				submission,
				evaluationData,
				studentText,
				aiComments,
				studentName,
			});

			return submission;
		} catch (err: unknown) {
			setState((prev) => ({
				...prev,
				loading: false,
				error:
					err instanceof Error
						? err.message
						: "Error al cargar la evaluación",
			}));
			return null;
		}
	}, [getSubmissionById, submissionId]);

	useEffect(() => {
		refetch();
	}, [refetch]);

	return {...state, refetch};
};
