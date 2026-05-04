import React from "react";
import {useRouter} from "next/router";
import {useQuery} from "@apollo/client/react";
import Layout from "@/components/Layout";
import {ProtectedRoute} from "@/components/Auth";
import Card from "@/components/Common/Card";
import SectionHeader from "@/components/Common/SectionHeader";
import Badge from "@/components/Common/Badge";
import {GET_TEACHER_SUBMISSIONS} from "@/gql/Submission";
import {
	AssignmentRubricCriterion,
	AssignmentSubmission,
	ProcessedTeacherAssignment,
	useAssignments,
} from "@/hooks";
import {SubmissionDetail, SubmissionStatus, SubmissionsData, UserRole} from "@/interface";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
	faArrowLeft,
	faCalendarDays,
	faChartLine,
	faCircleExclamation,
	faClipboardList,
	faFileLines,
	faGraduationCap,
	faUserGroup,
} from "@fortawesome/free-solid-svg-icons";

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

const isPublishedSubmission = (submission: AssignmentSubmission) =>
	normalizeStatusValue(submission.status) === SubmissionStatus.PUBLISHED ||
	normalizeStatusValue(submission.evaluation?.status) === "PUBLISHED";

const isPendingTeacherReview = (submission: AssignmentSubmission) => {
	const status = normalizeStatusValue(submission.status);

	return (
		!isPublishedSubmission(submission) &&
		(status === SubmissionStatus.PENDING ||
			status === SubmissionStatus.IN_PROGRESS ||
			status === SubmissionStatus.REVIEW_PENDING ||
			status === "SUBMITTED" ||
			status === "GRADED" ||
			Boolean(submission.evaluation))
	);
};

const getSubmissionStatusConfig = (submission: AssignmentSubmission) => {
	if (isPublishedSubmission(submission)) {
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
	const {data: teacherSubmissionsData, loading: submissionsLoading} =
		useQuery<SubmissionsData>(GET_TEACHER_SUBMISSIONS, {
			skip: !assignmentId,
			fetchPolicy: "cache-and-network",
			errorPolicy: "all",
		});
	const assignment = assignments.find(
		(item: ProcessedTeacherAssignment) => item.id === assignmentId,
	);

	if (loading) {
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
	const submissions = mergeSubmissions(assignmentSubmissions, fallbackSubmissions);
	const gradedSubmissions = submissions.filter(isPublishedSubmission);
	const pendingSubmissions = submissions.filter(isPendingTeacherReview);
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
								<div className="text-sm font-bold text-gray-500">Pendientes</div>
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
								{assignment.average > 0 ? assignment.average : "-"}
							</div>
						</Card>
						<Card className="bg-white/70 border border-gray-100">
							<div className="flex items-center justify-between mb-3">
								<div className="text-sm font-bold text-gray-500">Finalizadas</div>
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
												const status = getSubmissionStatusConfig(submission);
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
														</td>
														<td className="py-4 px-4 text-sm text-gray-600">
															{formatDate(submission.createdAt, true)}
														</td>
														<td className="py-4 px-4">
															{typeof submission.evaluation?.totalScore ===
															"number" ? (
																<div className="font-black text-gray-900">
																	{submission.evaluation.totalScore}
																	<span className="text-xs font-bold text-gray-400">
																		{" "}
																		/{" "}
																		{assignment.rubric?.maxTotalScore || 10}
																	</span>
																</div>
															) : (
																<span className="text-gray-400">-</span>
															)}
															{submission.evaluation &&
																!isPublishedSubmission(submission) && (
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
																{isPublishedSubmission(submission)
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
