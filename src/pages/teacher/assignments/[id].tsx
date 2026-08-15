import React from "react";
import {useRouter} from "next/router";
import {useMutation, useQuery} from "@apollo/client/react";
import Layout from "@/components/Layout";
import {ProtectedRoute} from "@/components/Auth";
import Card from "@/components/Common/Card";
import SectionHeader from "@/components/Common/SectionHeader";
import Badge from "@/components/Common/Badge";
import {GET_TEACHER_SUBMISSIONS} from "@/gql/Submission";
import {
	GET_ASSIGNMENT_BY_ID,
	GET_TASK_TEACHER,
	REMOVE_ASSIGNMENT_EXTENSION,
	UPSERT_ASSIGNMENT_EXTENSION,
} from "@/gql/Assignment";
import {
	AssignmentRubricCriterion,
	AssignmentSubmission,
	ProcessedTeacherAssignment,
	useAssignments,
	useReEvaluationRequests,
} from "@/hooks";
import {
	SubmissionDetail,
	SubmissionStatus,
	SubmissionsData,
	UserRole,
} from "@/interface";
import {STANDARD_GRADE_MAX, normalizeGrade} from "@/utils/gradeScale";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
	faArrowLeft,
	faBell,
	faCalendarDays,
	faChartLine,
	faCircleExclamation,
	faClipboardList,
	faClock,
	faFileLines,
	faGraduationCap,
	faTrashCan,
	faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import {
	notifyError,
	notifyLoading,
	notifySuccess,
} from "@/utils/toastNotify";

type AssignmentReminderPreview = {
	assignmentId: string;
	dueDate: string;
	pendingCount: number;
	eligibleCount: number;
	cooldownCount: number;
	canSendCount: number;
	nextAllowedAt?: string;
};

type AssignmentReminderSendResult = AssignmentReminderPreview & {
	queuedCount: number;
};

const reminderResponseMessage = async (response: Response, fallback: string) => {
	const payload = (await response.json().catch(() => null)) as {
		error?: unknown;
		message?: unknown;
	} | null;
	const message = payload?.error ?? payload?.message;
	return typeof message === "string" ? message : fallback;
};

type StatusConfig = {
	label: string;
	variant: "default" | "success" | "warning" | "error" | "info" | "electric";
};

const statusConfigByValue: Record<string, StatusConfig> = {
	[SubmissionStatus.PENDING]: {label: "Pendiente", variant: "warning"},
	[SubmissionStatus.IN_PROGRESS]: {label: "En progreso", variant: "info"},
	[SubmissionStatus.REVIEW_PENDING]: {label: "En revisión", variant: "info"},
	[SubmissionStatus.PUBLISHED]: {label: "Calificada", variant: "success"},
	[SubmissionStatus.FAILED]: {label: "Fallida", variant: "error"},
	SUBMITTED: {label: "Enviada", variant: "electric"},
	GRADED: {label: "Pendiente de revisión", variant: "warning"},
};

const formatDate = (date?: string, withTime = false) => {
	if (!date) return "Sin fecha";

	return new Date(date).toLocaleDateString("es-ES", {
		day: "numeric",
		month: "short",
		year: "numeric",
		...(withTime ? {hour: "2-digit", minute: "2-digit"} : {}),
	});
};

const toDateTimeLocalValue = (date: Date) => {
	const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
	return localDate.toISOString().slice(0, 16);
};

const normalizeStatusValue = (status?: string | null) =>
	status?.toUpperCase().replace(/[-\s]+/g, "_") || "";

const getStatusConfig = (status?: string): StatusConfig => {
	const normalizedStatus = normalizeStatusValue(status);
	if (!normalizedStatus) return {label: "Sin estado", variant: "default"};
	return (
		statusConfigByValue[normalizedStatus] || {
			label: normalizedStatus,
			variant: "default",
		}
	);
};

const isPublishedSubmission = (
	submission: AssignmentSubmission,
	reevaluationSubmissionIds: Set<string>,
) =>
	!reevaluationSubmissionIds.has(submission.id) &&
	(normalizeStatusValue(submission.status) === SubmissionStatus.PUBLISHED ||
		normalizeStatusValue(submission.evaluation?.status) === "PUBLISHED");

const isPendingTeacherReview = (
	submission: AssignmentSubmission,
	reevaluationSubmissionIds: Set<string>,
) => {
	const status = normalizeStatusValue(submission.status);

	return (
		(reevaluationSubmissionIds.has(submission.id) ||
			!isPublishedSubmission(submission, reevaluationSubmissionIds)) &&
		(status === SubmissionStatus.PENDING ||
			status === SubmissionStatus.IN_PROGRESS ||
			status === SubmissionStatus.REVIEW_PENDING ||
			status === "SUBMITTED" ||
			status === "GRADED" ||
			Boolean(submission.evaluation) ||
			reevaluationSubmissionIds.has(submission.id))
	);
};

const getSubmissionStatusConfig = (
	submission: AssignmentSubmission,
	reevaluationSubmissionIds: Set<string>,
) => {
	if (reevaluationSubmissionIds.has(submission.id)) {
		return {label: "Reevaluación solicitada", variant: "warning" as const};
	}

	if (isPublishedSubmission(submission, reevaluationSubmissionIds)) {
		return getStatusConfig(SubmissionStatus.PUBLISHED);
	}

	const status = normalizeStatusValue(submission.status);

	if (
		status === SubmissionStatus.REVIEW_PENDING ||
		status === "GRADED" ||
		submission.evaluation
	) {
		return {label: "Pendiente de revisión", variant: "warning" as const};
	}

	return getStatusConfig(submission.status);
};

const mapSubmissionDetailToAssignmentSubmission = (
	submission: SubmissionDetail,
): AssignmentSubmission => ({
	id: submission.id,
	fileUrl: submission.fileUrl,
	extractedText: submission.extractedText,
	status: submission.status,
	createdAt: submission.createdAt,
	updatedAt: submission.updatedAt,
	student: submission.student,
	evaluation: submission.evaluation,
});

const mergeSubmissions = (...sources: AssignmentSubmission[][]) => {
	const merged = new Map<string, AssignmentSubmission>();

	sources.flat().forEach((submission) => {
		if (!submission?.id) return;

		const current = merged.get(submission.id);
		merged.set(submission.id, {
			...current,
			...submission,
			student: submission.student || current?.student,
			evaluation: submission.evaluation || current?.evaluation,
		});
	});

	return Array.from(merged.values()).sort((a, b) => {
		const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
		const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
		return bTime - aTime;
	});
};

const AssignmentDetailPage: React.FC = () => {
	const router = useRouter();
	const assignmentId =
		typeof router.query.id === "string" ? router.query.id : undefined;
	const {assignments, loading, error} = useAssignments();
	const {
		getRequestBySubmissionId,
		pendingSubmissionIds: reevaluationSubmissionIds,
		loading: reevaluationLoading,
	} = useReEvaluationRequests();
	const {data: teacherSubmissionsData, loading: submissionsLoading} =
		useQuery<SubmissionsData>(GET_TEACHER_SUBMISSIONS, {
			skip: !assignmentId,
			fetchPolicy: "cache-and-network",
			errorPolicy: "all",
		});
	const assignment = assignments.find(
		(item: ProcessedTeacherAssignment) => item.id === assignmentId,
	);
	const [reminderPreview, setReminderPreview] =
		React.useState<AssignmentReminderPreview | null>(null);
	const [reminderLoading, setReminderLoading] = React.useState(false);
	const [reminderError, setReminderError] = React.useState<string | null>(null);
	const [extensionStudentId, setExtensionStudentId] = React.useState("");
	const [extensionDueDate, setExtensionDueDate] = React.useState("");
	const [extensionReason, setExtensionReason] = React.useState("");
	const [extensionSaving, setExtensionSaving] = React.useState(false);
	const [upsertExtension] = useMutation(UPSERT_ASSIGNMENT_EXTENSION);
	const [removeExtension] = useMutation(REMOVE_ASSIGNMENT_EXTENSION);
	const submittedStudentIds = React.useMemo(
		() =>
			new Set(
				(assignment?.submissionItems || [])
					.map((submission) => submission.student?.id)
					.filter((id): id is string => Boolean(id)),
			),
		[assignment?.submissionItems],
	);
	const studentsWithoutSubmission = React.useMemo(
		() =>
			(assignment?.course?.users || []).filter(
				(student) =>
					student.role === UserRole.STUDENT &&
					student.isActive !== false &&
					!submittedStudentIds.has(student.id),
			),
		[assignment?.course?.users, submittedStudentIds],
	);

	const loadReminderPreview = React.useCallback(async () => {
		if (!assignmentId) return;
		setReminderLoading(true);
		setReminderError(null);
		try {
			const response = await fetch(
				`/api/notifications/assignments/${encodeURIComponent(assignmentId)}/reminder-preview`,
				{credentials: "same-origin", cache: "no-store"},
			);
			if (!response.ok) {
				throw new Error(
					await reminderResponseMessage(
						response,
						"No fue posible consultar los estudiantes pendientes.",
					),
				);
			}
			setReminderPreview((await response.json()) as AssignmentReminderPreview);
		} catch (loadError) {
			setReminderError(
				loadError instanceof Error
					? loadError.message
					: "No fue posible consultar los estudiantes pendientes.",
			);
		} finally {
			setReminderLoading(false);
		}
	}, [assignmentId]);

	React.useEffect(() => {
		void loadReminderPreview();
	}, [loadReminderPreview]);

	const sendPendingReminders = async () => {
		if (!assignmentId) return;
		const notificationId = notifyLoading("Programando recordatorios...");
		setReminderLoading(true);
		try {
			const response = await fetch(
				`/api/notifications/assignments/${encodeURIComponent(assignmentId)}/reminders`,
				{method: "POST", credentials: "same-origin"},
			);
			if (!response.ok) {
				throw new Error(
					await reminderResponseMessage(
						response,
						"No fue posible programar los recordatorios.",
					),
				);
			}
			const result = (await response.json()) as AssignmentReminderSendResult;
			setReminderPreview(result);
			notifySuccess(
				result.queuedCount === 1
					? "Se programó 1 recordatorio."
					: `Se programaron ${result.queuedCount} recordatorios.`,
				{id: notificationId},
			);
		} catch (sendError) {
			notifyError(
				sendError instanceof Error
					? sendError.message
					: "No fue posible programar los recordatorios.",
				{id: notificationId},
			);
		} finally {
			setReminderLoading(false);
		}
	};

	const selectExtensionStudent = (studentId: string) => {
		setExtensionStudentId(studentId);
		const currentExtension = assignment?.extensions.find(
			(extension) => extension.student.id === studentId,
		);
		setExtensionDueDate(
			currentExtension
				? toDateTimeLocalValue(new Date(currentExtension.extendedDueDate))
				: "",
		);
		setExtensionReason(currentExtension?.reason || "");
	};

	const extensionRefetchQueries = assignmentId
		? [
				{query: GET_ASSIGNMENT_BY_ID, variables: {id: assignmentId}},
				{query: GET_TASK_TEACHER},
			]
		: [];

	const saveExtension = async () => {
		if (!assignmentId || !extensionStudentId || !extensionDueDate) {
			notifyError("Selecciona un estudiante y una nueva fecha límite.");
			return;
		}
		const notificationId = notifyLoading("Guardando prórroga...");
		setExtensionSaving(true);
		try {
			await upsertExtension({
				variables: {
					input: {
						assignmentId,
						studentId: extensionStudentId,
						extendedDueDate: new Date(extensionDueDate),
						...(extensionReason.trim()
							? {reason: extensionReason.trim()}
							: {}),
					},
				},
				refetchQueries: extensionRefetchQueries,
				awaitRefetchQueries: true,
			});
			notifySuccess("La prórroga quedó aplicada.", {id: notificationId});
			setExtensionStudentId("");
			setExtensionDueDate("");
			setExtensionReason("");
			await loadReminderPreview();
		} catch (saveError) {
			notifyError(
				saveError instanceof Error
					? saveError.message
					: "No fue posible guardar la prórroga.",
				{id: notificationId},
			);
		} finally {
			setExtensionSaving(false);
		}
	};

	const deleteExtension = async (studentId: string) => {
		if (!assignmentId) return;
		const notificationId = notifyLoading("Retirando prórroga...");
		setExtensionSaving(true);
		try {
			await removeExtension({
				variables: {assignmentId, studentId},
				refetchQueries: extensionRefetchQueries,
				awaitRefetchQueries: true,
			});
			notifySuccess("La prórroga fue retirada.", {id: notificationId});
			if (extensionStudentId === studentId) selectExtensionStudent("");
			await loadReminderPreview();
		} catch (removeError) {
			notifyError(
				removeError instanceof Error
					? removeError.message
					: "No fue posible retirar la prórroga.",
				{id: notificationId},
			);
		} finally {
			setExtensionSaving(false);
		}
	};

	if (loading || reevaluationLoading) {
		return (
			<ProtectedRoute requiredRole={UserRole.TEACHER}>
				<Layout title="Detalle de tarea" hideHeader>
					<div className="max-w-7xl mx-auto space-y-6">
						<div className="h-10 w-48 skeleton" />
						<Card className="p-8 bg-white/60 border border-gray-100">
							<div className="animate-pulse space-y-4">
								<div className="h-8 bg-gray-200 rounded w-2/3" />
								<div className="h-4 bg-gray-200 rounded w-full" />
								<div className="h-4 bg-gray-200 rounded w-3/4" />
							</div>
						</Card>
					</div>
				</Layout>
			</ProtectedRoute>
		);
	}

	if (error || !assignment) {
		return (
			<ProtectedRoute requiredRole={UserRole.TEACHER}>
				<Layout title="Detalle de tarea" hideHeader>
					<div className="max-w-3xl mx-auto py-12">
						<Card className="p-8 text-center bg-white/70 border border-gray-100">
							<div className="text-3xl text-red-500 mb-4">
								<FontAwesomeIcon icon={faCircleExclamation} />
							</div>
							<h1 className="text-2xl font-black text-gray-900 mb-2">
								No se pudo cargar la tarea
							</h1>
							<p className="text-gray-600 mb-6">
								{error?.message ||
									"La tarea no existe o no pertenece al docente actual."}
							</p>
							<button onClick={() => router.back()} className="btn-primary">
								Volver
							</button>
						</Card>
					</div>
				</Layout>
			</ProtectedRoute>
		);
	}

	const assignmentSubmissions = assignment.submissionItems || [];
	const fallbackSubmissions =
		teacherSubmissionsData?.submissions
			?.filter((submission) => submission.assignment?.id === assignment.id)
			.map(mapSubmissionDetailToAssignmentSubmission) || [];
	const submissions = mergeSubmissions(
		assignmentSubmissions,
		fallbackSubmissions,
	);
	const gradedSubmissions = submissions.filter((submission) =>
		isPublishedSubmission(submission, reevaluationSubmissionIds),
	);
	const pendingSubmissions = submissions.filter((submission) =>
		isPendingTeacherReview(submission, reevaluationSubmissionIds),
	);
	const completionRate =
		submissions.length > 0
			? Math.round((gradedSubmissions.length / submissions.length) * 100)
			: 0;
	const rubricCriteria = assignment.rubric?.criteria || [];

	return (
		<ProtectedRoute requiredRole={UserRole.TEACHER}>
			<Layout title={assignment.title} hideHeader>
				<div className="max-w-7xl mx-auto space-y-8">
					<div>
						<button
							onClick={() => router.push("/teacher")}
							className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-electric-600 transition-colors mb-6"
						>
							<FontAwesomeIcon icon={faArrowLeft} />
							Volver al panel
						</button>

						<SectionHeader
							title={assignment.title}
							description={
								assignment.description ||
								"Detalle de configuración, entregas y resultados de la tarea."
							}
							actions={
								<div className="flex flex-wrap gap-2">
									<Badge variant={assignment.isExpired ? "default" : "success"}>
										{assignment.isExpired ? "Vencida" : "Vigente"}
									</Badge>
									<Badge variant={assignment.isActive ? "electric" : "default"}>
										{assignment.isActive ? "Activa" : "Inactiva"}
									</Badge>
								</div>
							}
						/>
					</div>

					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
						<Card className="bg-white/70 border border-gray-100">
							<div className="flex items-center justify-between mb-3">
								<div className="text-sm font-bold text-gray-500">Entregas</div>
								<FontAwesomeIcon icon={faUserGroup} className="text-blue-500" />
							</div>
							<div className="text-3xl font-black text-gray-900">
								{submissions.length}
							</div>
						</Card>
						<Card className="bg-white/70 border border-gray-100">
							<div className="flex items-center justify-between mb-3">
								<div className="text-sm font-bold text-gray-500">
									Pendientes
								</div>
								<FontAwesomeIcon
									icon={faClipboardList}
									className="text-yellow-500"
								/>
							</div>
							<div className="text-3xl font-black text-yellow-600">
								{pendingSubmissions.length}
							</div>
						</Card>
						<Card className="bg-white/70 border border-gray-100">
							<div className="flex items-center justify-between mb-3">
								<div className="text-sm font-bold text-gray-500">Promedio</div>
								<FontAwesomeIcon
									icon={faGraduationCap}
									className="text-green-500"
								/>
							</div>
							<div className="text-3xl font-black text-green-600">
								{assignment.average > 0 ? assignment.average.toFixed(2) : "-"}
							</div>
						</Card>
						<Card className="bg-white/70 border border-gray-100">
							<div className="flex items-center justify-between mb-3">
								<div className="text-sm font-bold text-gray-500">
									Finalizadas
								</div>
								<FontAwesomeIcon
									icon={faChartLine}
									className="text-electric-500"
								/>
							</div>
							<div className="text-3xl font-black text-electric-600">
								{completionRate}%
							</div>
						</Card>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<Card className="lg:col-span-2 bg-white/70 border border-gray-100">
							<SectionHeader title="Entregas de estudiantes" className="mb-6" />

							{submissionsLoading && submissions.length === 0 ? (
								<div className="space-y-3">
									<div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
									<div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
									<div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
								</div>
							) : submissions.length === 0 ? (
								<div className="text-center py-12">
									<div className="text-3xl text-gray-300 mb-3">
										<FontAwesomeIcon icon={faFileLines} />
									</div>
									<h3 className="font-bold text-gray-900 mb-2">
										Sin entregas registradas
									</h3>
									<p className="text-sm text-gray-500">
										Cuando los estudiantes entreguen esta tarea aparecerán aquí.
									</p>
								</div>
							) : (
								<div className="overflow-x-auto">
									<table className="w-full">
										<thead>
											<tr className="border-b border-gray-200">
												<th className="text-left py-3 px-4 text-sm font-bold text-gray-600">
													Estudiante
												</th>
												<th className="text-left py-3 px-4 text-sm font-bold text-gray-600">
													Estado
												</th>
												<th className="text-left py-3 px-4 text-sm font-bold text-gray-600">
													Entrega
												</th>
												<th className="text-left py-3 px-4 text-sm font-bold text-gray-600">
													Nota
												</th>
												<th className="text-right py-3 px-4 text-sm font-bold text-gray-600">
													Acción
												</th>
											</tr>
										</thead>
										<tbody>
											{submissions.map((submission: AssignmentSubmission) => {
												const status = getSubmissionStatusConfig(
													submission,
													reevaluationSubmissionIds,
												);
												const reevaluationRequest = getRequestBySubmissionId(
													submission.id,
												);
												const studentName = submission.student
													? `${submission.student.name} ${
															submission.student.last_name || ""
														}`.trim()
													: "Estudiante sin nombre";

												return (
													<tr
														key={submission.id}
														className="border-b border-gray-100 hover:bg-gray-50"
													>
														<td className="py-4 px-4">
															<div className="font-bold text-gray-900">
																{studentName}
															</div>
															<div className="text-xs text-gray-500">
																{submission.student?.email || "Sin correo"}
															</div>
														</td>
														<td className="py-4 px-4">
															<Badge variant={status.variant}>
																{status.label}
															</Badge>
															{reevaluationRequest && (
																<div className="mt-2 max-w-xs">
																	<div className="text-[10px] font-black uppercase text-amber-700">
																		Solicitud del estudiante
																	</div>
																	<p className="text-xs text-gray-600 line-clamp-2">
																		{reevaluationRequest.reason}
																	</p>
																	<div className="text-[10px] text-gray-400 mt-1">
																		{formatDate(
																			reevaluationRequest.createdAt,
																			true,
																		)}
																	</div>
																</div>
															)}
														</td>
														<td className="py-4 px-4 text-sm text-gray-600">
															{formatDate(submission.createdAt, true)}
														</td>
														<td className="py-4 px-4">
															{typeof submission.evaluation?.totalScore ===
															"number" ? (
																<div className="font-black text-gray-900">
																	{normalizeGrade(
																		submission.evaluation.totalScore,
																		assignment.rubric?.maxTotalScore,
																	)?.toFixed(2)}
																	<span className="text-xs font-bold text-gray-400">
																		{" "}
																		/ {STANDARD_GRADE_MAX}
																	</span>
																</div>
															) : (
																<span className="text-gray-400">-</span>
															)}
															{submission.evaluation &&
																!isPublishedSubmission(
																	submission,
																	reevaluationSubmissionIds,
																) && (
																	<div className="text-[10px] font-bold uppercase text-amber-600 mt-1">
																		Sugerencia IA
																	</div>
																)}
														</td>
														<td className="py-4 px-4 text-right">
															<button
																onClick={() =>
																	router.push(
																		`/evaluation?submission=${submission.id}`,
																	)
																}
																className="px-3 py-1.5 bg-electric-500 text-white text-sm rounded-lg hover:bg-electric-600 transition-colors"
															>
																{reevaluationRequest
																	? "Reevaluar"
																	: isPublishedSubmission(
																				submission,
																				reevaluationSubmissionIds,
																		  )
																		? "Ver"
																		: submission.evaluation
																			? "Revisar"
																			: "Evaluar"}
															</button>
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							)}
						</Card>

						<div className="space-y-6">
							<Card className="bg-white/70 border border-gray-100">
								<SectionHeader title="Recordar a pendientes" className="mb-4" />
								<div className="flex items-start gap-3 rounded-xl bg-electric-50 p-4">
									<FontAwesomeIcon
										icon={faBell}
										className="mt-1 text-electric-600"
									/>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-bold text-gray-900">
											{reminderLoading && !reminderPreview
												? "Consultando destinatarios..."
												: `${reminderPreview?.canSendCount ?? 0} estudiantes recibirán el aviso`}
										</p>
										<p className="mt-1 text-xs text-gray-600">
											{reminderPreview
												? `${reminderPreview.pendingCount} sin entrega; ${reminderPreview.eligibleCount} tienen recordatorios activos.`
												: "Solo se avisará a estudiantes matriculados que aún no hayan entregado."}
										</p>
										{reminderError && (
											<p className="mt-2 text-xs font-medium text-red-600">
												{reminderError}
											</p>
										)}
										{Boolean(reminderPreview?.cooldownCount) && (
											<p className="mt-2 text-xs text-amber-700">
												{reminderPreview?.cooldownCount} ya fueron avisados durante
												 las últimas 6 horas.
											</p>
										)}
									</div>
								</div>
								<button
									type="button"
									onClick={() => void sendPendingReminders()}
									disabled={
										reminderLoading ||
										!reminderPreview?.canSendCount ||
										assignment.isExpired ||
										!assignment.isActive
									}
									className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
								>
									<FontAwesomeIcon icon={faBell} className="mr-2" />
									Enviar recordatorio
								</button>
							</Card>

							<Card className="bg-white/70 border border-gray-100">
								<SectionHeader title="Prórrogas individuales" className="mb-4" />
								<p className="mb-4 text-sm text-gray-500">
									Extiende la fecha de un estudiante pendiente sin cambiar el plazo
									general del curso.
								</p>
								{studentsWithoutSubmission.length === 0 ? (
									<p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-500">
										No hay estudiantes pendientes disponibles.
									</p>
								) : (
									<div className="space-y-3">
										<select
											value={extensionStudentId}
											onChange={(event) => selectExtensionStudent(event.target.value)}
											className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
										>
											<option value="">Selecciona un estudiante</option>
											{studentsWithoutSubmission.map((student) => (
												<option key={student.id} value={student.id}>
													{`${student.name} ${student.last_name || ""}`.trim()}
												</option>
											))}
										</select>
										<input
											type="datetime-local"
											value={extensionDueDate}
											min={toDateTimeLocalValue(
												new Date(
													Math.max(Date.now(), new Date(assignment.dueDate).getTime()) +
														60_000,
												),
											)}
											onChange={(event) => setExtensionDueDate(event.target.value)}
											disabled={!extensionStudentId}
											className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm disabled:bg-gray-100"
										/>
										<textarea
											value={extensionReason}
											onChange={(event) => setExtensionReason(event.target.value)}
											placeholder="Motivo (opcional)"
											maxLength={500}
											disabled={!extensionStudentId}
											className="min-h-20 w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm disabled:bg-gray-100"
										/>
										<button
											type="button"
											onClick={() => void saveExtension()}
											disabled={
												extensionSaving || !extensionStudentId || !extensionDueDate
											}
											className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
										>
											<FontAwesomeIcon icon={faClock} className="mr-2" />
											Guardar prórroga
										</button>
									</div>
								)}

								{assignment.extensions.length > 0 && (
									<div className="mt-5 space-y-2 border-t border-gray-100 pt-4">
										{assignment.extensions.map((extension) => (
											<div
												key={extension.id}
												className="flex items-start justify-between gap-3 rounded-xl bg-electric-50 p-3"
											>
												<button
													type="button"
													onClick={() => selectExtensionStudent(extension.student.id)}
													className="min-w-0 flex-1 text-left"
												>
													<div className="truncate text-sm font-bold text-gray-900">
														{`${extension.student.name} ${extension.student.last_name || ""}`.trim()}
													</div>
													<div className="text-xs text-electric-700">
														Hasta {formatDate(extension.extendedDueDate, true)}
													</div>
													{extension.reason && (
														<p className="mt-1 text-xs text-gray-500">
															{extension.reason}
														</p>
													)}
												</button>
												<button
													type="button"
													onClick={() => void deleteExtension(extension.student.id)}
													disabled={extensionSaving}
													aria-label={`Retirar prórroga de ${extension.student.name}`}
													className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50"
												>
													<FontAwesomeIcon icon={faTrashCan} />
												</button>
											</div>
										))}
									</div>
								)}
							</Card>

							<Card className="bg-white/70 border border-gray-100">
								<SectionHeader title="Configuración" className="mb-6" />
								<div className="space-y-4">
									<div className="flex gap-3">
										<FontAwesomeIcon
											icon={faCalendarDays}
											className="mt-1 text-electric-500"
										/>
										<div>
											<div className="text-xs font-bold uppercase text-gray-400">
												Fecha límite
											</div>
											<div className="font-bold text-gray-900">
												{formatDate(assignment.dueDate, true)}
											</div>
										</div>
									</div>
									<div>
										<div className="text-xs font-bold uppercase text-gray-400">
											Curso
										</div>
										<div className="font-bold text-gray-900">
											{assignment.courseName || "Sin curso"}
										</div>
									</div>
									<div>
										<div className="text-xs font-bold uppercase text-gray-400">
											Rúbrica
										</div>
										<div className="font-bold text-gray-900">
											{assignment.rubricTitle || "Sin rúbrica"}
										</div>
										{assignment.rubric?.description && (
											<p className="text-sm text-gray-500 mt-1">
												{assignment.rubric.description}
											</p>
										)}
									</div>
								</div>
							</Card>

							<Card className="bg-white/70 border border-gray-100">
								<SectionHeader title="Criterios" className="mb-6" />
								{rubricCriteria.length === 0 ? (
									<p className="text-sm text-gray-500">
										No hay criterios configurados para esta rúbrica.
									</p>
								) : (
									<div className="space-y-3">
										{rubricCriteria.map(
											(criterion: AssignmentRubricCriterion) => (
												<div
													key={criterion.id}
													className="p-3 rounded-xl bg-gray-50 border border-gray-100"
												>
													<div className="flex items-start justify-between gap-3">
														<div className="font-bold text-gray-900 text-sm">
															{criterion.title}
														</div>
														<Badge variant="default">
															{criterion.maxPoints} pts
														</Badge>
													</div>
													{Boolean(criterion.levels?.length) && (
														<div className="mt-2 text-xs text-gray-500">
															{criterion.levels?.length} niveles de desempeño
														</div>
													)}
												</div>
											),
										)}
									</div>
								)}
							</Card>
						</div>
					</div>
				</div>
			</Layout>
		</ProtectedRoute>
	);
};

export default AssignmentDetailPage;
