import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {useMutation} from "@apollo/client/react";
import {
	StudentAssignmentCardData,
	useAuth,
	useAssignments,
	useEvaluationDetail,
	useReEvaluationRequests,
	useStudentAcademicData,
} from "@/hooks";
import {GET_SUBMISSION_BY_ID, PUBLISH_EVALUATION} from "@/gql/Submission";
import {
	CREATE_RE_EVALUATION_REQUEST,
	GET_RE_EVALUATION_REQUESTS,
	RESOLVE_RE_EVALUATION_REQUEST,
} from "@/gql/ReEvaluationRequest";
import Layout from "@/components/Layout";
import {
	EvaluationSummary,
	CriteriaTable,
	ComparisonView,
} from "@/components/Evaluation";
import {ProtectedRoute} from "@/components/Auth";
import Card from "@/components/Common/Card";
import Badge from "@/components/Common/Badge";
import SectionHeader from "@/components/Common/SectionHeader";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
	faArrowLeft,
	faChartLine,
	faClock,
	faFileCircleCheck,
	faFileLines,
	faGraduationCap,
	faPaperPlane,
	faRotateRight,
	faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
	ReEvaluationRequest,
	ReEvaluationRequestStatus,
	UserRole,
} from "@/interface";
import {STANDARD_GRADE_MAX, normalizeGrade} from "@/utils/gradeScale";
import {
	notifyError,
	notifyInfo,
	notifyLoading,
	notifySuccess,
	notifyWarning,
} from "@/utils/toastNotify";
import {
	isPendingReEvaluationRequest,
	normalizeReEvaluationStatus,
} from "@/utils/reevaluationRequests";

const getResultStatus = (assignment: StudentAssignmentCardData) => {
	if (assignment.status === "graded") {
		return {label: "Calificada", variant: "success" as const};
	}

	if (assignment.status === "submitted") {
		return {label: "En revisión", variant: "warning" as const};
	}

	if (assignment.status === "review_pending") {
		return {label: "Pendiente de revisión", variant: "warning" as const};
	}

	if (assignment.status === "overdue") {
		return {label: "Vencida", variant: "error" as const};
	}

	return {label: "Pendiente", variant: "warning" as const};
};

const formatDate = (date?: string) => {
	if (!date) return "Sin fecha";

	return new Date(date).toLocaleDateString("es-ES", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
};

const formatDateTime = (date?: string) => {
	if (!date) return "Sin fecha";

	return new Date(date).toLocaleDateString("es-ES", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const getReEvaluationRequestTime = (request: ReEvaluationRequest) =>
	request.reviewedAt || request.updatedAt || request.createdAt;

const getReEvaluationStatusContent = (request?: ReEvaluationRequest | null) => {
	const status = normalizeReEvaluationStatus(request?.status);

	if (status === ReEvaluationRequestStatus.APPROVED) {
		return {
			title: "Re-evaluación aprobada",
			label: "Aprobada",
			variant: "success" as const,
			message: `Solicitud aprobada el ${formatDateTime(
				request ? getReEvaluationRequestTime(request) : undefined,
			)}.`,
		};
	}

	if (status === ReEvaluationRequestStatus.REJECTED) {
		return {
			title: "Re-evaluación rechazada",
			label: "Rechazada",
			variant: "error" as const,
			message: `Solicitud rechazada el ${formatDateTime(
				request ? getReEvaluationRequestTime(request) : undefined,
			)}.`,
		};
	}

	return {
		title: "Re-evaluación pendiente",
		label: "Pendiente",
		variant: "warning" as const,
		message: `Solicitud enviada el ${formatDateTime(request?.createdAt)}.`,
	};
};

const EvaluationPage: React.FC = () => {
	const router = useRouter();
	const {user} = useAuth();
	const {submission} = router.query;
	const submissionId = typeof submission === "string" ? submission : null;
	const {
		loading,
		error,
		submission: submissionDetail,
		evaluationData,
		studentText,
		aiComments,
		studentName,
		refetch: refetchEvaluationDetail,
	} = useEvaluationDetail(submissionId);
	const {assignments: teacherAssignments} = useAssignments();
	const {
		assignments,
		loading: resultsLoading,
		error: resultsError,
		gradedCount,
		deliveredCount,
		reviewPendingCount,
		averageGrade,
		averagePercentage,
	} = useStudentAcademicData();
	const {
		requests: reEvaluationRequests,
		loading: reEvaluationLoading,
		error: reEvaluationQueryError,
		refetch: refetchReEvaluationRequests,
	} = useReEvaluationRequests();
	const [showComparison, setShowComparison] = useState<boolean>(false);
	const [finalScore, setFinalScore] = useState<string>("");
	const [finalFeedback, setFinalFeedback] = useState<string>("");
	const [publishError, setPublishError] = useState<string | null>(null);
	const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
	const [reportStatus, setReportStatus] = useState<string | null>(null);
	const [reevaluationReason, setReevaluationReason] = useState<string>("");
	const [reevaluationError, setReevaluationError] = useState<string | null>(
		null,
	);
	const [teacherResponse, setTeacherResponse] = useState<string>("");
	const [showReevaluationForm, setShowReevaluationForm] =
		useState<boolean>(false);
	const [publishEvaluation, {loading: publishing}] =
		useMutation(PUBLISH_EVALUATION);
	const [createReEvaluationRequest, {loading: creatingReevaluationRequest}] =
		useMutation(CREATE_RE_EVALUATION_REQUEST);
	const [resolveReEvaluationRequest, {loading: resolvingReevaluationRequest}] =
		useMutation(RESOLVE_RE_EVALUATION_REQUEST);

	useEffect(() => {
		window.requestAnimationFrame(() => {
			setReportStatus(null);
			setReevaluationReason("");
			setReevaluationError(null);
			setTeacherResponse("");
			setShowReevaluationForm(false);
		});
	}, [submissionId]);

	const relatedReEvaluationRequests = reEvaluationRequests
		.filter((request) => {
			const requestSubmissionId = request.evaluation?.submission?.id;
			const requestEvaluationId = request.evaluation?.id;

			return (
				(requestSubmissionId && requestSubmissionId === submissionId) ||
				(requestEvaluationId &&
					requestEvaluationId === submissionDetail?.evaluation?.id)
			);
		})
		.sort(
			(a, b) =>
				new Date(getReEvaluationRequestTime(b)).getTime() -
				new Date(getReEvaluationRequestTime(a)).getTime(),
		);
	const pendingReEvaluationRequest =
		relatedReEvaluationRequests.find(isPendingReEvaluationRequest) || null;
	const latestReEvaluationRequest =
		pendingReEvaluationRequest || relatedReEvaluationRequests[0] || null;
	const hasReEvaluationRequest = relatedReEvaluationRequests.length > 0;
	const reevaluationStatusContent = latestReEvaluationRequest
		? getReEvaluationStatusContent(latestReEvaluationRequest)
		: null;

	if (!submissionId) {
		const deliveredAssignments = assignments.filter((assignment) =>
			["submitted", "review_pending", "graded"].includes(assignment.status),
		);

		return (
			<ProtectedRoute>
				<Layout title="Mis Resultados" hideHeader>
					<div className="max-w-7xl mx-auto space-y-8">
						<SectionHeader
							title="Mis resultados"
							description="Retroalimentación y calificaciones de las tareas que ya entregaste."
						/>

						{resultsError && (
							<Card className="bg-red-50 border-red-100">
								<p className="text-sm text-red-600 font-medium">
									No se pudieron cargar los resultados: {resultsError.message}
								</p>
							</Card>
						)}

						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<Card className="bg-white/70 border border-gray-100">
								<div className="flex items-center justify-between mb-3">
									<div className="text-sm font-bold text-gray-500">
										Entregadas
									</div>
									<FontAwesomeIcon
										icon={faFileCircleCheck}
										className="text-blue-500"
									/>
								</div>
								<div className="text-3xl font-black text-blue-600">
									{resultsLoading ? "-" : deliveredCount}
								</div>
							</Card>
							<Card className="bg-white/70 border border-gray-100">
								<div className="flex items-center justify-between mb-3">
									<div className="text-sm font-bold text-gray-500">
										Calificadas
									</div>
									<FontAwesomeIcon
										icon={faGraduationCap}
										className="text-green-500"
									/>
								</div>
								<div className="text-3xl font-black text-green-600">
									{resultsLoading ? "-" : gradedCount}
								</div>
							</Card>
							<Card className="bg-white/70 border border-gray-100">
								<div className="flex items-center justify-between mb-3">
									<div className="text-sm font-bold text-gray-500">
										En revisión
									</div>
									<FontAwesomeIcon icon={faClock} className="text-yellow-500" />
								</div>
								<div className="text-3xl font-black text-yellow-600">
									{resultsLoading ? "-" : reviewPendingCount}
								</div>
								<div className="text-xs text-gray-500">
									Pendientes por revisar
								</div>
							</Card>
							<Card className="bg-white/70 border border-gray-100">
								<div className="flex items-center justify-between mb-3">
									<div className="text-sm font-bold text-gray-500">
										Promedio
									</div>
									<FontAwesomeIcon
										icon={faChartLine}
										className="text-electric-500"
									/>
								</div>
								<div className="text-3xl font-black text-electric-600">
									{resultsLoading ? "-" : averageGrade}
								</div>
								<div className="text-xs text-gray-500">
									{averagePercentage}% acumulado
								</div>
							</Card>
						</div>

						<Card className="bg-white/70 border border-gray-100">
							<SectionHeader title="Retroalimentación" className="mb-6" />

							{resultsLoading ? (
								<div className="space-y-4">
									{[1, 2, 3].map((item) => (
										<div
											key={item}
											className="animate-pulse p-4 rounded-xl border border-gray-100"
										>
											<div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
											<div className="h-4 bg-gray-200 rounded w-full mb-2" />
											<div className="h-4 bg-gray-200 rounded w-2/3" />
										</div>
									))}
								</div>
							) : deliveredAssignments.length === 0 ? (
								<div className="text-center py-12">
									<FontAwesomeIcon
										icon={faFileLines}
										className="text-5xl text-gray-300 mb-4"
									/>
									<h2 className="text-xl font-black text-gray-900 mb-2">
										Aún no tienes entregas registradas
									</h2>
									<p className="text-gray-500">
										Cuando entregues una tarea, su estado y retroalimentación
										aparecerán aquí.
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{deliveredAssignments.map((assignment) => {
										const status = getResultStatus(assignment);

										return (
											<div
												key={assignment.id}
												className="p-5 rounded-2xl border border-gray-100 bg-white hover:border-electric-100 hover:shadow-sm transition-all"
											>
												<div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
													<div className="min-w-0">
														<div className="flex flex-wrap items-center gap-2 mb-2">
															<Badge variant={status.variant}>
																{status.label}
															</Badge>
															<span className="text-xs font-bold text-gray-400 uppercase">
																{assignment.courseName || "Sin curso"}
															</span>
														</div>
														<h3 className="text-lg font-black text-gray-900">
															{assignment.title}
														</h3>
														<p className="text-sm text-gray-500 mt-1 line-clamp-2">
															{assignment.description}
														</p>
														<div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
															<div className="text-xs font-bold text-gray-400 uppercase mb-1">
																Retroalimentación
															</div>
															<p className="text-sm text-gray-700">
																{assignment.feedback ||
																	"La tarea fue entregada y está pendiente de retroalimentación."}
															</p>
														</div>
													</div>

													<div className="lg:w-56 shrink-0">
														<div className="p-4 rounded-xl bg-electric-50/15 border border-electric-100 text-center mb-3">
															<div className="text-xs font-bold text-electric-700 uppercase mb-1">
																Resultado
															</div>
															{assignment.score !== undefined ? (
																<>
																	<div className="text-3xl font-black text-electric-700">
																		{assignment.score.toFixed(1)}
																		<span className="text-sm text-electric-500">
																			/{assignment.maxScore}
																		</span>
																	</div>
																</>
															) : (
																<div className="text-sm font-bold text-gray-500 py-3">
																	En revisión
																</div>
															)}
														</div>
														<div className="text-xs text-gray-500 mb-3 text-center">
															Fecha límite: {formatDate(assignment.dueDate)}
														</div>
														<button
															disabled={!assignment.submissionId}
															onClick={() =>
																assignment.submissionId &&
																router.push(
																	`/evaluation?submission=${assignment.submissionId}`,
																)
															}
															className="w-full px-4 py-2 bg-electric-500 text-white text-sm font-bold rounded-xl hover:bg-electric-600 transition-colors disabled:bg-gray-200 disabled:text-gray-400"
														>
															Ver detalle
														</button>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</Card>
					</div>
				</Layout>
			</ProtectedRoute>
		);
	}

	if (loading) {
		return (
			<ProtectedRoute>
				<Layout title="Evaluación de IA">
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-500"></div>
					</div>
				</Layout>
			</ProtectedRoute>
		);
	}

	if (error || !evaluationData) {
		return (
			<ProtectedRoute>
				<Layout title="Error en Evaluación">
					<div className="max-w-6xl mx-auto text-center py-12">
						<h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
						<p className="text-gray-600">
							{error || "No se encontraron datos de la evaluación."}
						</p>
						<button
							onClick={() => router.push("/")}
							className="mt-4 btn-primary"
						>
							Volver
						</button>
					</div>
				</Layout>
			</ProtectedRoute>
		);
	}

	const canViewDraft =
		user?.role === UserRole.TEACHER || user?.role === UserRole.ADMIN;
	const hasPendingReevaluationRequest = Boolean(pendingReEvaluationRequest);
	const hasPublishedResult =
		submissionDetail?.status === "PUBLISHED" ||
		submissionDetail?.evaluation?.status === "PUBLISHED";
	const isPublishedEvaluation =
		!hasPendingReevaluationRequest && hasPublishedResult;
	const teacherActionLoading = publishing || resolvingReevaluationRequest;
	const scoreDraft = evaluationData.overallScore;
	const feedbackDraft = evaluationData.generalFeedback;
	const maxScore = evaluationData.maxScore || STANDARD_GRADE_MAX;
	const relatedAssignment = submissionDetail?.assignment?.id
		? assignments.find(
				(assignment) => assignment.id === submissionDetail.assignment.id,
			)
		: undefined;
	const submissionHistory = relatedAssignment?.submissionHistory || [];
	const relatedTeacherAssignment = submissionDetail?.assignment?.id
		? teacherAssignments.find(
				(assignment) => assignment.id === submissionDetail.assignment.id,
			)
		: undefined;
	const teacherSubmissionHistory =
		relatedTeacherAssignment?.submissionItems
			.filter(
				(submission) =>
					submission.student?.id === submissionDetail?.student?.id ||
					submission.student?.email === submissionDetail?.student?.email,
			)
			.slice()
			.sort(
				(a, b) =>
					new Date(a.createdAt || 0).getTime() -
					new Date(b.createdAt || 0).getTime(),
			)
			.map((submission, index) => {
				const isPublished =
					submission.status === "PUBLISHED" ||
					submission.evaluation?.status === "PUBLISHED";

				return {
					id: submission.id,
					fileUrl: submission.fileUrl,
					status: submission.status,
					createdAt: submission.createdAt,
					version: index + 1,
					score:
						isPublished && typeof submission.evaluation?.totalScore === "number"
							? normalizeGrade(
									submission.evaluation.totalScore,
									relatedTeacherAssignment.rubric?.maxTotalScore,
								)
							: undefined,
					feedback: isPublished
						? submission.evaluation?.generalFeedback
						: undefined,
					isPublished,
				};
			}) || [];
	const baseSubmissionHistory =
		submissionHistory.length > 0 ? submissionHistory : teacherSubmissionHistory;
	const currentSubmissionHistoryItem = submissionDetail
		? {
				id: submissionDetail.id,
				fileUrl: submissionDetail.fileUrl,
				status: submissionDetail.status,
				createdAt: submissionDetail.createdAt,
				version:
					baseSubmissionHistory.find(
						(submission) => submission.id === submissionDetail.id,
					)?.version || baseSubmissionHistory.length + 1,
				score: hasPublishedResult ? evaluationData.overallScore : undefined,
				feedback: hasPublishedResult
					? evaluationData.generalFeedback
					: undefined,
				isPublished: hasPublishedResult,
			}
		: null;
	const evaluationSubmissionHistory = Array.from(
		new Map(
			[
				...baseSubmissionHistory,
				...(currentSubmissionHistoryItem ? [currentSubmissionHistoryItem] : []),
			].map((submission) => [submission.id, submission]),
		).values(),
	).sort(
		(a, b) =>
			new Date(a.createdAt || 0).getTime() -
			new Date(b.createdAt || 0).getTime(),
	);
	const currentHistoryItem = evaluationSubmissionHistory.find(
		(submission) => submission.id === submissionId,
	);
	const canSendNewVersion = Boolean(
		relatedAssignment &&
		relatedAssignment.status !== "graded" &&
		new Date(relatedAssignment.dueDate) >= new Date(),
	);

	const handlePublishEvaluation = async () => {
		if (!submissionId) return;
		if (!submissionDetail?.evaluation?.id) {
			const message =
				"Esta entrega aún no tiene evaluación de IA para publicar.";
			setPublishError(message);
			setPublishSuccess(null);
			notifyWarning(message);
			return;
		}

		const parsedScore = Number(finalScore || scoreDraft);
		const feedbackToPublish = (finalFeedback || feedbackDraft || "").trim();

		if (
			!Number.isFinite(parsedScore) ||
			parsedScore < 0 ||
			parsedScore > maxScore
		) {
			const message = `La nota final debe estar entre 0 y ${maxScore}.`;
			setPublishError(message);
			setPublishSuccess(null);
			notifyWarning(message);
			return;
		}

		if (!feedbackToPublish) {
			const message = "La retroalimentación final es obligatoria.";
			setPublishError(message);
			setPublishSuccess(null);
			notifyWarning(message);
			return;
		}

		const responseToStudent = teacherResponse.trim();
		if (pendingReEvaluationRequest && responseToStudent.length < 10) {
			const message =
				"Agrega una respuesta para el estudiante antes de resolver la solicitud.";
			setPublishError(message);
			setPublishSuccess(null);
			notifyWarning(message);
			return;
		}

		const notificationId = notifyLoading(
			pendingReEvaluationRequest
				? "Publicando nota y resolviendo solicitud..."
				: "Publicando evaluación...",
		);
		try {
			setPublishError(null);
			setPublishSuccess(null);
			await publishEvaluation({
				variables: {
					id: submissionDetail.evaluation.id,
					updateEvaluationInput: {
						id: submissionDetail.evaluation.id,
						submissionId,
						totalScore: parsedScore,
						generalFeedback: feedbackToPublish,
					},
				},
				refetchQueries: [
					{query: GET_SUBMISSION_BY_ID, variables: {submissionId}},
				],
				awaitRefetchQueries: true,
			});
			await refetchEvaluationDetail();

			if (pendingReEvaluationRequest) {
				await resolveReEvaluationRequest({
					variables: {
						input: {
							id: pendingReEvaluationRequest.id,
							status: ReEvaluationRequestStatus.APPROVED,
							teacherResponse: responseToStudent,
						},
					},
					refetchQueries: [{query: GET_RE_EVALUATION_REQUESTS}],
					awaitRefetchQueries: true,
				});
				await refetchReEvaluationRequests();
				await refetchEvaluationDetail();
				setTeacherResponse("");
				setPublishSuccess("Solicitud aprobada y nota actualizada.");
				notifySuccess("Solicitud aprobada y nota actualizada.", {
					id: notificationId,
				});
				return;
			}

			setPublishSuccess("Nota final publicada para el estudiante.");
			notifySuccess("Nota final publicada para el estudiante.", {
				id: notificationId,
			});
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "No se pudo publicar la evaluación.";
			setPublishError(message);
			notifyError(message, {id: notificationId});
		}
	};

	const handleRejectReevaluation = async () => {
		if (!pendingReEvaluationRequest) return;

		const responseToStudent = teacherResponse.trim();
		if (responseToStudent.length < 10) {
			const message =
				"Agrega una respuesta para el estudiante antes de rechazar la solicitud.";
			setPublishError(message);
			setPublishSuccess(null);
			notifyWarning(message);
			return;
		}

		const notificationId = notifyLoading("Rechazando solicitud de reevaluación...");
		try {
			setPublishError(null);
			setPublishSuccess(null);
			await resolveReEvaluationRequest({
				variables: {
					input: {
						id: pendingReEvaluationRequest.id,
						status: ReEvaluationRequestStatus.REJECTED,
						teacherResponse: responseToStudent,
					},
				},
				refetchQueries: [{query: GET_RE_EVALUATION_REQUESTS}],
				awaitRefetchQueries: true,
			});
			await refetchReEvaluationRequests();
			setTeacherResponse("");
			setPublishSuccess("Solicitud rechazada y respuesta enviada.");
			notifySuccess("Solicitud rechazada y respuesta enviada.", {
				id: notificationId,
			});
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "No se pudo resolver la solicitud.";
			setPublishError(message);
			notifyError(message, {id: notificationId});
		}
	};

	const handleSubmitReevaluation = async () => {
		if (!submissionDetail || !submissionId) return;

		const reason = reevaluationReason.trim();
		if (reason.length < 20) {
			const message =
				"Describe el motivo de la solicitud con al menos 20 caracteres.";
			setReevaluationError(message);
			notifyWarning(message);
			return;
		}

		if (pendingReEvaluationRequest) {
			setReevaluationError(null);
			setShowReevaluationForm(false);
			notifyInfo("Ya existe una solicitud de reevaluación para esta entrega.");
			return;
		}

		if (!submissionDetail.evaluation?.id) {
			const message =
				"No se encontró una evaluación publicada para solicitar revisión.";
			setReevaluationError(message);
			notifyWarning(message);
			return;
		}

		const notificationId = notifyLoading("Enviando solicitud de reevaluación...");
		try {
			await createReEvaluationRequest({
				variables: {
					input: {
						evaluationId: submissionDetail.evaluation.id,
						reason,
					},
				},
				refetchQueries: [{query: GET_RE_EVALUATION_REQUESTS}],
				awaitRefetchQueries: true,
			});
			await refetchReEvaluationRequests();
			setReevaluationReason("");
			setReevaluationError(null);
			setShowReevaluationForm(false);
			notifySuccess("Solicitud de reevaluación enviada.", {
				id: notificationId,
			});
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "No se pudo enviar la solicitud de reevaluación.";
			setReevaluationError(message);
			notifyError(message, {id: notificationId});
		}
	};

	if (!canViewDraft && !hasPublishedResult) {
		return (
			<ProtectedRoute>
				<Layout title="Detalle de entrega" hideHeader>
					<div className="max-w-5xl mx-auto py-8 space-y-6">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<button
								type="button"
								onClick={() => router.back()}
								className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors"
							>
								<FontAwesomeIcon icon={faArrowLeft} />
								Volver atrás
							</button>
							<Badge variant="warning">En revisión</Badge>
						</div>

						<Card className="bg-amber-50 border-amber-100">
							<div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
								<div>
									<div className="flex items-center gap-2 mb-3">
										<FontAwesomeIcon
											icon={faClock}
											className="text-amber-500"
										/>
										<span className="text-xs font-black text-amber-700 uppercase tracking-widest">
											Entrega recibida
										</span>
									</div>
									<h1 className="text-2xl font-black text-gray-900 mb-2">
										{submissionDetail?.assignment?.title || "Entrega"}
									</h1>
									<p className="text-gray-600">
										Tu trabajo está en revisión docente. La nota y la
										retroalimentación final aparecerán cuando el docente
										publique el resultado.
									</p>
								</div>
								<div className="grid grid-cols-2 gap-3 min-w-64">
									<div className="p-3 rounded-xl bg-white/80 border border-amber-100">
										<div className="text-xs font-bold text-gray-400 uppercase">
											Versión
										</div>
										<div className="text-xl font-black text-gray-900">
											{currentHistoryItem
												? currentHistoryItem.version
												: evaluationSubmissionHistory.length || 1}
										</div>
									</div>
									<div className="p-3 rounded-xl bg-white/80 border border-amber-100">
										<div className="text-xs font-bold text-gray-400 uppercase">
											Estado
										</div>
										<div className="text-sm font-black text-amber-700">
											En revisión
										</div>
									</div>
								</div>
							</div>
						</Card>

						<Card className="bg-white/80 border border-gray-100">
							<SectionHeader title="Detalle de la entrega" className="mb-6" />
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
									<div className="text-xs font-bold text-gray-400 uppercase mb-1">
										Curso
									</div>
									<div className="font-bold text-gray-900">
										{submissionDetail?.assignment?.course?.course_name ||
											relatedAssignment?.courseName ||
											"Sin curso"}
									</div>
								</div>
								<div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
									<div className="text-xs font-bold text-gray-400 uppercase mb-1">
										Fecha de entrega
									</div>
									<div className="font-bold text-gray-900">
										{formatDateTime(submissionDetail?.createdAt)}
									</div>
								</div>
								<div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
									<div className="text-xs font-bold text-gray-400 uppercase mb-1">
										Fecha límite
									</div>
									<div className="font-bold text-gray-900">
										{formatDateTime(relatedAssignment?.dueDate)}
									</div>
								</div>
								<div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
									<div className="text-xs font-bold text-gray-400 uppercase mb-1">
										Archivo
									</div>
									{submissionDetail?.fileUrl ? (
										<a
											href={submissionDetail.fileUrl}
											target="_blank"
											rel="noreferrer"
											className="font-bold text-electric-600 hover:text-electric-700"
										>
											Ver archivo enviado
										</a>
									) : (
										<div className="font-bold text-gray-500">
											Sin archivo disponible
										</div>
									)}
								</div>
							</div>

							{canSendNewVersion && (
								<div className="mt-6 flex justify-end">
									<button
										type="button"
										onClick={() =>
											router.push(
												`/upload?assignment=${submissionDetail?.assignment?.id}`,
											)
										}
										className="btn-primary"
									>
										Enviar nueva versión
									</button>
								</div>
							)}
						</Card>

						<Card className="bg-white/80 border border-gray-100">
							<SectionHeader title="Histórico de entregas" className="mb-6" />
							{evaluationSubmissionHistory.length === 0 ? (
								<p className="text-sm text-gray-500">
									Esta es la primera entrega registrada para la tarea.
								</p>
							) : (
								<div className="space-y-3">
									{evaluationSubmissionHistory
										.slice()
										.reverse()
										.map((submission) => (
											<div
												key={submission.id}
												className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl border ${
													submission.id === submissionId
														? "bg-electric-50 border-electric-100"
														: "bg-gray-50 border-gray-100"
												}`}
											>
												<div>
													<div className="font-black text-gray-900">
														Versión {submission.version}
														{submission.id === submissionId ? " actual" : ""}
													</div>
													<div className="text-sm text-gray-500">
														{formatDateTime(submission.createdAt)}
													</div>
													{submission.score !== undefined && (
														<div className="mt-2 text-sm font-bold text-electric-700">
															Nota: {submission.score.toFixed(1)}/
															{STANDARD_GRADE_MAX}
														</div>
													)}
													{submission.feedback && (
														<p className="mt-1 text-sm text-gray-600 line-clamp-2">
															{submission.feedback}
														</p>
													)}
												</div>
												<div className="flex items-center gap-3">
													<Badge
														variant={
															submission.isPublished ? "success" : "warning"
														}
													>
														{submission.isPublished
															? "Calificada"
															: "En revisión"}
													</Badge>
													{submission.fileUrl && (
														<a
															href={submission.fileUrl}
															target="_blank"
															rel="noreferrer"
															className="text-sm font-bold text-electric-600 hover:text-electric-700"
														>
															Archivo
														</a>
													)}
												</div>
											</div>
										))}
								</div>
							)}
						</Card>
					</div>
				</Layout>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute>
			<Layout title="Evaluación de IA">
				<div className="max-w-6xl mx-auto">
					<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
						<button
							type="button"
							onClick={() => router.back()}
							className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors"
						>
							<FontAwesomeIcon icon={faArrowLeft} />
							Volver atrás
						</button>
						<Badge variant={isPublishedEvaluation ? "success" : "warning"}>
							{pendingReEvaluationRequest
								? "Re-evaluación pendiente"
								: isPublishedEvaluation
									? "Resultado publicado"
									: "Borrador interno"}
						</Badge>
					</div>

					{submissionDetail && (
						<Card className="mb-8 bg-white/80 border border-gray-100">
							<SectionHeader title="Detalle de la entrega" className="mb-6" />
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
								<div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
									<div className="text-xs font-bold text-gray-400 uppercase mb-1">
										Tarea
									</div>
									<div className="font-bold text-gray-900">
										{submissionDetail.assignment?.title || "Sin tarea"}
									</div>
								</div>
								<div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
									<div className="text-xs font-bold text-gray-400 uppercase mb-1">
										Curso
									</div>
									<div className="font-bold text-gray-900">
										{submissionDetail.assignment?.course?.course_name ||
											relatedAssignment?.courseName ||
											"Sin curso"}
									</div>
								</div>
								<div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
									<div className="text-xs font-bold text-gray-400 uppercase mb-1">
										Entregada
									</div>
									<div className="font-bold text-gray-900">
										{formatDateTime(submissionDetail.createdAt)}
									</div>
								</div>
								<div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
									<div className="text-xs font-bold text-gray-400 uppercase mb-1">
										Versión
									</div>
									<div className="font-bold text-gray-900">
										{currentHistoryItem
											? currentHistoryItem.version
											: evaluationSubmissionHistory.length || 1}
									</div>
								</div>
							</div>

							{evaluationSubmissionHistory.length > 0 && (
								<div>
									<div className="text-xs font-bold text-gray-400 uppercase mb-3">
										Histórico de entregas y calificaciones
									</div>
									<div className="space-y-2">
										{evaluationSubmissionHistory
											.slice()
											.reverse()
											.map((submission) => (
												<div
													key={submission.id}
													className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
												>
													<div>
														<div className="text-sm font-bold text-gray-900">
															Versión {submission.version}
															{submission.id === submissionId ? " actual" : ""}
														</div>
														<div className="text-xs text-gray-500">
															{formatDateTime(submission.createdAt)}
														</div>
														{submission.feedback && (
															<p className="mt-1 text-sm text-gray-600 line-clamp-2">
																{submission.feedback}
															</p>
														)}
													</div>
													<div className="flex items-center gap-3">
														{submission.score !== undefined && (
															<div className="text-sm font-black text-electric-700">
																{submission.score.toFixed(1)}/
																{STANDARD_GRADE_MAX}
															</div>
														)}
														<Badge
															variant={
																submission.isPublished ? "success" : "warning"
															}
														>
															{submission.isPublished
																? "Calificada"
																: "En revisión"}
														</Badge>
													</div>
												</div>
											))}
									</div>
								</div>
							)}
						</Card>
					)}

					{/* Resumen de evaluación */}
					<EvaluationSummary
						score={evaluationData.overallScore}
						maxScore={evaluationData.maxScore}
						feedback={evaluationData.generalFeedback}
						evaluationDate={evaluationData.evaluationDate}
					/>

					{canViewDraft && (
						<Card className="mb-8 bg-white/80 border border-gray-100">
							<div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
								<div className="flex-1">
									<div className="flex flex-wrap items-center gap-2 mb-3">
										<Badge
											variant={
												pendingReEvaluationRequest
													? "warning"
													: isPublishedEvaluation
														? "success"
														: "warning"
											}
										>
											{pendingReEvaluationRequest
												? "Reevaluación solicitada"
												: isPublishedEvaluation
													? "Publicado"
													: "Pendiente de publicación docente"}
										</Badge>
										<Badge variant="info">Sugerencia interna IA</Badge>
									</div>
									<h2 className="text-xl font-black text-gray-900 mb-2">
										Revisión docente
									</h2>
									<p className="text-sm text-gray-600">
										{pendingReEvaluationRequest
											? "El estudiante pidió una segunda revisión. Si apruebas la solicitud, publica la nota/feedback ajustados y la solicitud quedará resuelta."
											: "La nota sugerida por IA no es visible para el estudiante hasta que publiques la nota final."}
									</p>
									{pendingReEvaluationRequest && (
										<div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-100">
											<div className="text-xs font-black text-amber-700 uppercase mb-2">
												Motivo del estudiante
											</div>
											<p className="text-sm text-gray-700">
												{pendingReEvaluationRequest.reason}
											</p>
											<div className="text-xs text-gray-500 mt-3">
												Enviada el{" "}
												{formatDateTime(pendingReEvaluationRequest.createdAt)}
											</div>
										</div>
									)}
									{reEvaluationQueryError && (
										<p className="mt-4 text-sm font-medium text-red-600">
											No se pudieron cargar las solicitudes de reevaluación:{" "}
											{reEvaluationQueryError.message}
										</p>
									)}
								</div>

								<div className="w-full lg:w-[420px] space-y-4">
									<div>
										<label className="block text-sm font-bold text-gray-700 mb-2">
											Nota final
										</label>
										<input
											type="number"
											min={0}
											max={maxScore}
											step="0.1"
											value={finalScore}
											onChange={(event) => setFinalScore(event.target.value)}
											placeholder={`${scoreDraft.toFixed(1)} / ${maxScore}`}
											disabled={isPublishedEvaluation || teacherActionLoading}
											className="input-primary"
										/>
									</div>

									<div>
										<label className="block text-sm font-bold text-gray-700 mb-2">
											Retroalimentación final
										</label>
										<textarea
											value={finalFeedback}
											onChange={(event) => setFinalFeedback(event.target.value)}
											placeholder={feedbackDraft}
											disabled={isPublishedEvaluation || teacherActionLoading}
											className="input-primary min-h-32"
										/>
									</div>

									{pendingReEvaluationRequest && (
										<div>
											<label className="block text-sm font-bold text-gray-700 mb-2">
												Respuesta al estudiante
											</label>
											<textarea
												value={teacherResponse}
												onChange={(event) =>
													setTeacherResponse(event.target.value)
												}
												placeholder="Explica la decisión y los cambios aplicados, si corresponde."
												disabled={teacherActionLoading}
												className="input-primary min-h-24"
											/>
										</div>
									)}

									{publishError && (
										<p className="text-sm font-medium text-red-600">
											{publishError}
										</p>
									)}
									{publishSuccess && (
										<p className="text-sm font-medium text-green-600">
											{publishSuccess}
										</p>
									)}

									<button
										onClick={handlePublishEvaluation}
										disabled={isPublishedEvaluation || teacherActionLoading}
										className="btn-primary w-full disabled:bg-gray-200 disabled:text-gray-400"
									>
										{isPublishedEvaluation
											? "Nota publicada"
											: teacherActionLoading
												? "Publicando..."
												: pendingReEvaluationRequest
													? "Aprobar y publicar nota"
													: "Publicar nota final"}
									</button>
									{pendingReEvaluationRequest && (
										<button
											type="button"
											onClick={handleRejectReevaluation}
											disabled={teacherActionLoading}
											className="w-full px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-colors disabled:bg-gray-100 disabled:text-gray-400 inline-flex items-center justify-center gap-2"
										>
											<FontAwesomeIcon icon={faXmark} />
											{resolvingReevaluationRequest
												? "Resolviendo..."
												: "Rechazar solicitud"}
										</button>
									)}
								</div>
							</div>
						</Card>
					)}

					{/* Controles de vista */}
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-xl font-bold text-gray-900">
							Desglose por Rúbrica
						</h2>
						{canViewDraft && (
							<button
								onClick={() => setShowComparison(!showComparison)}
								className={`px-4 py-2 rounded-lg font-medium ${
									showComparison
										? "bg-electric-500 text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`}
							>
								{showComparison
									? "Ocultar Comparación"
									: "Ver Modo Comparativo"}
							</button>
						)}
					</div>

					{/* Vista principal */}
					<div
						className={`grid gap-6 ${
							canViewDraft && showComparison
								? "grid-cols-1 lg:grid-cols-2"
								: "grid-cols-1"
						}`}
					>
						{/* Tabla de criterios */}
						<div
							className={canViewDraft && showComparison ? "lg:col-span-1" : ""}
						>
							<CriteriaTable criteria={evaluationData.criteria} />
						</div>

						{/* Vista comparativa */}
						{canViewDraft && showComparison && (
							<div className="lg:col-span-1">
								<ComparisonView
									studentText={studentText}
									aiComments={aiComments}
									criteria={evaluationData.criteria}
									studentName={studentName}
								/>
							</div>
						)}
					</div>

					{/* Acciones adicionales */}
					{!canViewDraft && hasPublishedResult && (
						<div className="mt-8 space-y-4">
							<div className="flex flex-col sm:flex-row justify-end gap-3">
								{!hasReEvaluationRequest && (
									<button
										type="button"
										onClick={() => {
											setReevaluationError(null);
											setShowReevaluationForm(true);
										}}
										disabled={
											creatingReevaluationRequest || reEvaluationLoading
										}
										className="btn-primary inline-flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
									>
										<FontAwesomeIcon icon={faRotateRight} />
										{creatingReevaluationRequest
											? "Enviando..."
											: "Solicitar Re-evaluación"}
									</button>
								)}
							</div>

							{reportStatus && (
								<p className="text-sm font-medium text-green-600 text-right">
									{reportStatus}
								</p>
							)}

							{latestReEvaluationRequest && reevaluationStatusContent && (
								<Card
									className={`${
										reevaluationStatusContent.variant === "success"
											? "bg-green-50 border-green-100"
											: reevaluationStatusContent.variant === "error"
												? "bg-red-50 border-red-100"
												: "bg-amber-50 border-amber-100"
									}`}
								>
									<div className="flex items-start gap-3">
										<FontAwesomeIcon
											icon={faClock}
											className={`mt-1 ${
												reevaluationStatusContent.variant === "success"
													? "text-green-500"
													: reevaluationStatusContent.variant === "error"
														? "text-red-500"
														: "text-amber-500"
											}`}
										/>
										<div>
											<div className="flex flex-wrap items-center gap-2 mb-1">
												<h3 className="font-black text-gray-900">
													{reevaluationStatusContent.title}
												</h3>
												<Badge variant={reevaluationStatusContent.variant}>
													{reevaluationStatusContent.label}
												</Badge>
											</div>
											<p className="text-sm text-gray-600">
												{reevaluationStatusContent.message}{" "}
												{pendingReEvaluationRequest
													? "El docente debe revisar la solicitud antes de modificar una nota publicada."
													: "Puedes revisar la respuesta del docente."}
											</p>
											{latestReEvaluationRequest.teacherResponse && (
												<div className="mt-3 p-3 rounded-xl bg-white/70 border border-white">
													<div className="text-xs font-black uppercase text-gray-400 mb-1">
														Respuesta del docente
													</div>
													<p className="text-sm text-gray-700">
														{latestReEvaluationRequest.teacherResponse}
													</p>
												</div>
											)}
										</div>
									</div>
								</Card>
							)}

							{showReevaluationForm && !hasReEvaluationRequest && (
								<Card className="bg-white/80 border border-gray-100">
									<SectionHeader
										title="Solicitud de re-evaluación"
										description="Indica el motivo académico por el que solicitas una segunda revisión."
										className="mb-4"
									/>
									<textarea
										value={reevaluationReason}
										onChange={(event) =>
											setReevaluationReason(event.target.value)
										}
										className="input-primary min-h-32"
										placeholder="Ejemplo: considero que el criterio de análisis no refleja la evidencia incluida en la sección..."
									/>
									{reevaluationError && (
										<p className="mt-2 text-sm font-medium text-red-600">
											{reevaluationError}
										</p>
									)}
									<div className="mt-4 flex flex-col sm:flex-row justify-end gap-3">
										<button
											type="button"
											onClick={() => {
												setShowReevaluationForm(false);
												setReevaluationError(null);
											}}
											className="btn-ghost"
										>
											Cancelar
										</button>
										<button
											type="button"
											onClick={handleSubmitReevaluation}
											disabled={creatingReevaluationRequest}
											className="btn-primary inline-flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400"
										>
											<FontAwesomeIcon icon={faPaperPlane} />
											{creatingReevaluationRequest
												? "Enviando..."
												: "Enviar solicitud"}
										</button>
									</div>
								</Card>
							)}
						</div>
					)}
				</div>
			</Layout>
		</ProtectedRoute>
	);
};

export default EvaluationPage;
