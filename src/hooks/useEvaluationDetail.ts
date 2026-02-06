import {useState, useEffect} from "react";
import {getSubmissionById} from "@/actions";
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

	useEffect(() => {
		const fetchEvaluation = async () => {
			if (!submissionId) {
				setState((prev) => ({...prev, loading: false}));
				return;
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
			} catch (err: any) {
				setState((prev) => ({
					...prev,
					loading: false,
					error: err.message || "Error al cargar la evaluación",
				}));
			}
		};

		fetchEvaluation();
	}, [submissionId]);

	return state;
};
