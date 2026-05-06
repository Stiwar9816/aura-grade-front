import React, {useMemo, useRef, useState} from "react";
import {useRouter} from "next/router";
import Layout from "@/components/Layout";
import UploadZone from "@/components/Upload/UploadZone";
import UploadStepper from "@/components/Upload/UploadStepper";
import Toast from "@/components/Common/Toast";
import Card from "@/components/Common/Card";
import Badge from "@/components/Common/Badge";
import SectionHeader from "@/components/Common/SectionHeader";
import {ProtectedRoute} from "@/components/Auth";
import {UserRole} from "@/interface";
import {
	StudentAssignmentCardData,
	useAuth,
	useStudentAcademicData,
} from "@/hooks";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
	faBookOpen,
	faCalendarDays,
	faCheck,
	faCircleCheck,
	faCloudUpload,
	faFileLines,
	faGraduationCap,
	faRobot,
	faSearch,
} from "@fortawesome/free-solid-svg-icons";

type ToastState = {
	id: number;
	message: string;
	type: "success" | "error" | "info" | "warning";
};

type CreatedSubmission = {
	id: string;
	status?: string;
	gradingProgress?: number;
	progress?: number;
	fileUrl?: string;
	evaluation?: {
		id: string;
		totalScore?: number;
		generalFeedback?: string;
		detailedFeedback?: string;
		aiModelUsed?: string;
	};
};

type GradingStage = {
	progress: number;
	step: number;
	label: string;
	description: string;
};

const GRADING_STAGES: GradingStage[] = [
	{
		progress: 10,
		step: 1,
		label: "Entrega recibida",
		description: "El backend creó la entrega y registró el archivo.",
	},
	{
		progress: 30,
		step: 2,
		label: "Archivo procesado",
		description: "El documento está siendo preparado para evaluación.",
	},
	{
		progress: 40,
		step: 3,
		label: "IA iniciada",
		description: "El motor de IA está calificando con la rúbrica.",
	},
	{
		progress: 80,
		step: 3,
		label: "Resultado preliminar",
		description: "La IA generó el borrador de retroalimentación.",
	},
	{
		progress: 90,
		step: 3,
		label: "Guardando resultado",
		description: "El backend está persistiendo la evaluación.",
	},
	{
		progress: 100,
		step: 4,
		label: "Borrador listo",
		description: "La calificación quedó lista para revisión docente.",
	},
];

const formatFileSize = (bytes: number) => {
	if (bytes === 0) return "0 Bytes";
	const units = ["Bytes", "KB", "MB", "GB"];
	const index = Math.floor(Math.log(bytes) / Math.log(1024));
	return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
};

const getAuthToken = () => {
	if (typeof window === "undefined") return "";

	const storedUser = localStorage.getItem("auraGrade_user");
	if (!storedUser) return "";

	try {
		return JSON.parse(storedUser).token || "";
	} catch {
		return "";
	}
};

const createSubmissionWithFile = async (
	file: File,
	assignment: StudentAssignmentCardData,
	userId: string,
) => {
	const graphqlUrl =
		process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "http://localhost:3000/graphql";
	const token = getAuthToken();
	const formData = new FormData();

	formData.append(
		"operations",
		JSON.stringify({
			query: `
				mutation CreateSubmission(
					$createSubmissionInput: CreateSubmissionInput!
					$file: Upload!
				) {
					createSubmission(
						createSubmissionInput: $createSubmissionInput
						file: $file
					) {
						id
						status
						fileUrl
						evaluation {
							id
							totalScore
							generalFeedback
							detailedFeedback
							aiModelUsed
						}
					}
				}
			`,
			variables: {
				createSubmissionInput: {
					assignmentId: assignment.id,
					studentId: userId,
				},
				file: null,
			},
		}),
	);
	formData.append("map", JSON.stringify({"0": ["variables.file"]}));
	formData.append("0", file);

	const response = await fetch(graphqlUrl, {
		method: "POST",
		headers: token ? {authorization: `Bearer ${token}`} : undefined,
		body: formData,
	});

	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(
			`El backend rechazó la entrega (${response.status}): ${errorBody}`,
		);
	}

	const payload = await response.json();
	if (payload.errors?.length) {
		throw new Error(payload.errors[0]?.message || "Error al crear la entrega.");
	}

	return payload.data?.createSubmission as CreatedSubmission | null;
};

const getStageByProgress = (progress: number) =>
	GRADING_STAGES.reduce(
		(currentStage, stage) =>
			progress >= stage.progress ? stage : currentStage,
		GRADING_STAGES[0],
	);

const getBackendProgress = (submission: CreatedSubmission | null) => {
	if (!submission) return 0;
	if (typeof submission.gradingProgress === "number") {
		return submission.gradingProgress;
	}
	if (typeof submission.progress === "number") {
		return submission.progress;
	}
	if (submission.evaluation) return 100;

	switch (submission.status) {
		case "FAILED":
			return 100;
		case "REVIEW_PENDING":
		case "GRADED":
		case "PUBLISHED":
			return 100;
		case "IN_PROGRESS":
			return 40;
		case "PENDING":
			return 30;
		default:
			return 10;
	}
};

const fetchSubmissionById = async (submissionId: string) => {
	const graphqlUrl =
		process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "http://localhost:3000/graphql";
	const token = getAuthToken();
	const response = await fetch(graphqlUrl, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			...(token ? {authorization: `Bearer ${token}`} : {}),
		},
		body: JSON.stringify({
			query: `
				query Submission($submissionId: ID!) {
					submission(id: $submissionId) {
						id
						status
						fileUrl
						evaluation {
							id
							totalScore
							generalFeedback
							detailedFeedback
							aiModelUsed
						}
					}
				}
			`,
			variables: {submissionId},
		}),
	});

	if (!response.ok) {
		throw new Error(`No se pudo consultar la entrega (${response.status}).`);
	}

	const payload = await response.json();
	if (payload.errors?.length) {
		throw new Error(
			payload.errors[0]?.message ||
				"Error al consultar el estado de la entrega.",
		);
	}

	return payload.data?.submission as CreatedSubmission | null;
};

const UploadPage: React.FC = () => {
	const router = useRouter();
	const {user} = useAuth();
	const {
		assignments,
		loading: assignmentsLoading,
		error: assignmentsError,
	} = useStudentAcademicData();
	const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
	const [currentStep, setCurrentStep] = useState<number>(0);
	const [uploadProgress, setUploadProgress] = useState<number>(0);
	const [progressLabel, setProgressLabel] = useState<string>("");
	const [progressDescription, setProgressDescription] = useState<string>("");
	const [file, setFile] = useState<File | null>(null);
	const [createdSubmission, setCreatedSubmission] =
		useState<CreatedSubmission | null>(null);
	const [processError, setProcessError] = useState<string | null>(null);
	const [toasts, setToasts] = useState<ToastState[]>([]);
	const toastIdRef = useRef(0);

	const queryAssignmentId =
		typeof router.query.assignment === "string" ? router.query.assignment : "";
	const effectiveSelectedAssignmentId =
		selectedAssignmentId || queryAssignmentId;

	const deliverableAssignments = useMemo(
		() =>
			assignments.filter((assignment) =>
				["pending", "submitted", "review_pending"].includes(assignment.status),
			),
		[assignments],
	);

	const selectedAssignment =
		assignments.find(
			(assignment) => assignment.id === effectiveSelectedAssignmentId,
		) || null;
	const selectedAssignmentExpired = selectedAssignment
		? selectedAssignment.status === "overdue" ||
			new Date(selectedAssignment.dueDate) < new Date()
		: false;
	const uploadDisabled =
		!selectedAssignment ||
		selectedAssignment.status === "graded" ||
		selectedAssignmentExpired ||
		assignmentsLoading;

	const steps = [
		{
			id: 1,
			title: "Subir archivo",
			description: "Registrando archivo seleccionado",
			icon: <FontAwesomeIcon icon={faCloudUpload} />,
		},
		{
			id: 2,
			title: "Enviando entrega",
			description: "El backend recibe el archivo completo",
			icon: <FontAwesomeIcon icon={faSearch} />,
		},
		{
			id: 3,
			title: "Generando evaluación",
			description: "La IA procesa la entrega según la rúbrica",
			icon: <FontAwesomeIcon icon={faRobot} />,
		},
		{
			id: 4,
			title: "Resultado listo",
			description: "Calificación o revisión registrada",
			icon: <FontAwesomeIcon icon={faCheck} />,
		},
	];

	const addToast = (
		message: string,
		type: "success" | "error" | "info" | "warning",
	) => {
		toastIdRef.current += 1;
		const id = toastIdRef.current;
		setToasts([{id, message, type}]);
	};

	const closeToast = (id: number) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	};

	const updateGradingProgress = (progress: number) => {
		const boundedProgress = Math.min(100, Math.max(0, progress));
		const stage = getStageByProgress(boundedProgress);

		setUploadProgress(boundedProgress);
		setCurrentStep(stage.step);
		setProgressLabel(stage.label);
		setProgressDescription(stage.description);
	};

	const waitForBackendEvaluation = async (submissionId: string) => {
		let localProgressIndex = 1;
		let latestSubmission: CreatedSubmission | null = null;

		for (let attempt = 0; attempt < 30; attempt += 1) {
			latestSubmission = await fetchSubmissionById(submissionId);
			const backendProgress = getBackendProgress(latestSubmission);
			const fallbackProgress =
				GRADING_STAGES[Math.min(localProgressIndex, GRADING_STAGES.length - 2)]
					.progress;

			updateGradingProgress(Math.max(backendProgress, fallbackProgress));
			setCreatedSubmission(latestSubmission);

			if (latestSubmission?.status === "FAILED") {
				throw new Error("El backend marcó la evaluación como fallida.");
			}

			if (latestSubmission?.evaluation) {
				updateGradingProgress(100);
				return latestSubmission;
			}

			localProgressIndex += 1;
			await new Promise((resolve) => setTimeout(resolve, 2500));
		}

		return latestSubmission;
	};

	const handleUploadStart = async (selectedFile: File) => {
		if (!selectedAssignment || !user?.id) {
			setProcessError("Selecciona una tarea antes de subir el archivo.");
			return;
		}

		if (selectedAssignmentExpired) {
			setProcessError(
				"La fecha límite de esta tarea ya pasó. No es posible enviar la entrega.",
			);
			return;
		}

		if (selectedAssignment.status === "graded") {
			setProcessError(
				"Esta tarea ya fue calificada. No es posible enviar nuevas versiones.",
			);
			return;
		}

		try {
			setFile(selectedFile);
			setCreatedSubmission(null);
			setProcessError(null);
			updateGradingProgress(10);

			const submission = await createSubmissionWithFile(
				selectedFile,
				selectedAssignment,
				user.id,
			);

			setCreatedSubmission(submission);
			updateGradingProgress(getBackendProgress(submission));

			const finalSubmission = submission?.evaluation
				? submission
				: submission?.id
					? await waitForBackendEvaluation(submission.id)
					: null;

			setCreatedSubmission(finalSubmission || submission);

			if (finalSubmission?.evaluation) {
				updateGradingProgress(100);
				addToast(
					"Tu entrega fue registrada y quedó pendiente de revisión docente.",
					"success",
				);
			}
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "No se pudo registrar la entrega.";
			setProcessError(message);
			setCurrentStep(0);
			addToast(message, "error");
		}
	};

	const resetProcess = () => {
		setCurrentStep(0);
		setUploadProgress(0);
		setProgressLabel("");
		setProgressDescription("");
		setFile(null);
		setCreatedSubmission(null);
		setProcessError(null);
	};

	return (
		<ProtectedRoute requiredRole={UserRole.STUDENT}>
			<Layout title="Centro de Entregas" hideHeader>
				<div className="max-w-6xl mx-auto space-y-2">
					<div className="fixed bottom-4 right-4 z-50 max-w-sm">
						{toasts.map((toast) => (
							<Toast
								key={toast.id}
								message={toast.message}
								type={toast.type}
								duration={3500}
								onClose={() => closeToast(toast.id)}
							/>
						))}
					</div>

					<SectionHeader
						title="Centro de entregas"
						description="Selecciona una tarea, revisa su rúbrica y sube el archivo correspondiente."
					/>

					{assignmentsError && (
						<Card className="bg-red-50 border-red-100">
							<p className="text-sm text-red-600 font-medium">
								No se pudo cargar la información de tus tareas:{" "}
								{assignmentsError.message}
							</p>
						</Card>
					)}

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<Card className="lg:col-span-1 bg-white/70 border border-gray-100">
							<SectionHeader title="Tarea" className="mb-6" />

							<label className="block text-sm font-bold text-gray-700 mb-2">
								Selecciona la entrega
							</label>
							<select
								value={effectiveSelectedAssignmentId}
								onChange={(event) => {
									setSelectedAssignmentId(event.target.value);
									resetProcess();
								}}
								disabled={assignmentsLoading || currentStep > 0}
								className="input-primary mb-6"
							>
								<option value="">
									{assignmentsLoading
										? "Cargando tareas..."
										: "Selecciona una tarea"}
								</option>
								{deliverableAssignments.map((assignment) => (
									<option key={assignment.id} value={assignment.id}>
										{assignment.title}
									</option>
								))}
							</select>

							{selectedAssignment ? (
								<div className="space-y-5">
									<div>
										<div className="flex items-start justify-between gap-3">
											<div>
												<h3 className="font-black text-gray-900">
													{selectedAssignment.title}
												</h3>
												<p className="text-sm text-gray-500 mt-1">
													{selectedAssignment.courseName || "Sin curso"}
												</p>
											</div>
											<Badge
												variant={
													selectedAssignment.status === "overdue"
														? "error"
														: "electric"
												}
											>
												{selectedAssignment.status === "submitted"
													? "Entregada"
													: selectedAssignment.status === "review_pending"
														? "En revisión"
														: selectedAssignment.status === "graded"
															? "Calificada"
															: selectedAssignment.status === "overdue"
																? "Vencida"
																: "Pendiente"}
											</Badge>
										</div>
										<p className="text-sm text-gray-600 mt-3">
											{selectedAssignment.description}
										</p>
									</div>

									<div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
										<FontAwesomeIcon
											icon={faCalendarDays}
											className="text-electric-500"
										/>
										<div>
											<div className="text-xs font-bold uppercase text-gray-400">
												Fecha límite
											</div>
											<div className="text-sm font-bold text-gray-900">
												{new Date(
													selectedAssignment.dueDate,
												).toLocaleDateString("es-ES", {
													day: "numeric",
													month: "short",
													year: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</div>
										</div>
									</div>

									<div>
										<div className="flex items-center gap-2 mb-3">
											<FontAwesomeIcon
												icon={faGraduationCap}
												className="text-green-500"
											/>
											<h4 className="font-black text-gray-900">
												Peso de la rúbrica
											</h4>
										</div>
										<div className="space-y-2">
											{selectedAssignment.rubric?.criteria?.length ? (
												selectedAssignment.rubric.criteria.map((criterion) => (
													<div
														key={criterion.name}
														className="p-3 rounded-xl bg-gray-50 border border-gray-100"
													>
														<div className="flex items-center justify-between gap-3 mb-2">
															<span className="text-sm font-bold text-gray-800">
																{criterion.name}
															</span>
															<span className="text-xs font-black text-electric-600">
																{criterion.weight}%
															</span>
														</div>
														<div className="h-2 rounded-full bg-gray-200 overflow-hidden">
															<div
																className="h-full bg-electric-500"
																style={{width: `${criterion.weight}%`}}
															/>
														</div>
													</div>
												))
											) : (
												<p className="text-sm text-gray-500">
													Esta tarea no tiene criterios visibles.
												</p>
											)}
										</div>
									</div>

									{selectedAssignment.submissionHistory.length > 0 && (
										<div>
											<h4 className="font-black text-gray-900 mb-3">
												Historial de entregas
											</h4>
											<div className="space-y-2">
												{selectedAssignment.submissionHistory
													.slice()
													.reverse()
													.map((submission) => (
														<div
															key={submission.id}
															className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
														>
															<div>
																<div className="text-sm font-bold text-gray-800">
																	Versión {submission.version}
																</div>
																<div className="text-xs text-gray-500">
																	{submission.createdAt
																		? new Date(
																				submission.createdAt,
																			).toLocaleDateString("es-ES", {
																				day: "numeric",
																				month: "short",
																				year: "numeric",
																				hour: "2-digit",
																				minute: "2-digit",
																			})
																		: "Sin fecha"}
																</div>
															</div>
															<Badge
																variant={
																	submission.isPublished ? "success" : "warning"
																}
															>
																{submission.isPublished
																	? "Publicada"
																	: "En revisión"}
															</Badge>
														</div>
													))}
											</div>
										</div>
									)}
								</div>
							) : (
								<div className="text-center py-10">
									<FontAwesomeIcon
										icon={faBookOpen}
										className="text-4xl text-gray-300 mb-4"
									/>
									<p className="text-sm text-gray-500">
										Elige una tarea para ver su información y activar la zona de
										subida.
									</p>
								</div>
							)}
						</Card>

						<div className="lg:col-span-2 space-y-6">
							<UploadStepper
								steps={steps}
								currentStep={currentStep}
								progressPercent={uploadProgress}
								progressLabel={progressLabel}
								progressDescription={progressDescription}
							/>

							{processError && (
								<Card className="bg-red-50 border-red-100">
									<p className="text-sm text-red-600 font-medium">
										{processError}
									</p>
								</Card>
							)}

							{selectedAssignmentExpired && (
								<Card className="bg-amber-50 border-amber-100">
									<p className="text-sm text-amber-700 font-medium">
										La fecha límite de esta tarea ya pasó. El backend no permite
										registrar nuevas entregas para esta asignación.
									</p>
								</Card>
							)}

							{selectedAssignment?.status === "graded" && (
								<Card className="bg-green-50 border-green-100">
									<p className="text-sm text-green-700 font-medium">
										Esta tarea ya fue calificada. La entrega está cerrada y no
										acepta nuevas versiones.
									</p>
								</Card>
							)}

							{selectedAssignment &&
								["submitted", "review_pending"].includes(
									selectedAssignment.status,
								) &&
								!selectedAssignmentExpired && (
									<Card className="bg-blue-50 border-blue-100">
										<p className="text-sm text-blue-700 font-medium">
											Ya tienes una entrega registrada. Puedes subir una nueva
											versión mientras el docente no publique la calificación
											final.
										</p>
									</Card>
								)}

							{currentStep === 0 ? (
								<UploadZone
									onUploadStart={handleUploadStart}
									disabled={uploadDisabled}
									assignmentTitle={selectedAssignment?.title}
								/>
							) : (
								<Card className="bg-white/70 border border-gray-100">
									<div className="flex flex-col items-center text-center">
										<div
											className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
												currentStep === 4
													? "bg-green-100 text-green-600"
													: "bg-electric-100 text-electric-600"
											}`}
										>
											<FontAwesomeIcon
												icon={currentStep === 4 ? faCircleCheck : faFileLines}
												className="text-3xl"
											/>
										</div>

										<h2 className="text-2xl font-bold text-gray-900 mb-2">
											{steps[Math.max(currentStep - 1, 0)].title}
										</h2>
										<p className="text-gray-600 mb-8 max-w-md">
											{steps[Math.max(currentStep - 1, 0)].description}
										</p>

										{file && (
											<div className="w-full max-w-2xl bg-gray-50 rounded-xl p-4 mb-6">
												<div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
													<div className="md:col-span-2">
														<div className="text-xs font-bold uppercase text-gray-400">
															Archivo
														</div>
														<div className="font-bold text-gray-900 truncate">
															{file.name}
														</div>
													</div>
													<div>
														<div className="text-xs font-bold uppercase text-gray-400">
															Tamaño
														</div>
														<div className="font-bold text-gray-900">
															{formatFileSize(file.size)}
														</div>
													</div>
													<div>
														<div className="text-xs font-bold uppercase text-gray-400">
															Tipo
														</div>
														<div className="font-bold text-gray-900">
															{file.name.split(".").pop()?.toUpperCase()}
														</div>
													</div>
												</div>
											</div>
										)}

										{currentStep > 0 && currentStep < 4 && (
											<div className="w-full max-w-md mb-6">
												<div className="flex justify-between text-sm text-gray-600 mb-2">
													<span>
														{progressLabel || "Procesando entrega..."}
													</span>
													<span>{uploadProgress}%</span>
												</div>
												<div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
													<div
														className="h-full bg-gradient-to-r from-electric-500 to-cyan-500 transition-all duration-300"
														style={{width: `${uploadProgress}%`}}
													/>
												</div>
												{progressDescription && (
													<p className="text-xs text-gray-500 mt-2">
														{progressDescription}
													</p>
												)}
											</div>
										)}

										{currentStep === 4 && (
											<div className="w-full max-w-2xl">
												<div className="bg-green-50 border border-green-200 rounded-xl p-6">
													<h3 className="text-xl font-bold text-gray-900 mb-2">
														Entrega registrada
													</h3>
													<p className="text-gray-600 mb-6">
														Tu trabajo quedó registrado. La nota y la
														retroalimentación aparecerán cuando el docente
														publique el resultado final.
													</p>
													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														<div className="text-center p-4 bg-white rounded-lg">
															<div className="text-2xl font-bold text-green-600">
																En revisión
															</div>
															<div className="text-sm text-gray-600">
																Resultado docente
															</div>
														</div>
														<div className="text-center p-4 bg-white rounded-lg">
															<div className="text-2xl font-bold text-electric-600">
																{createdSubmission?.status || "Registrada"}
															</div>
															<div className="text-sm text-gray-600">
																Estado
															</div>
														</div>
													</div>
												</div>
											</div>
										)}

										<div className="flex flex-wrap justify-center gap-3 mt-8">
											<button onClick={resetProcess} className="btn-ghost">
												Nueva entrega
											</button>
										</div>
									</div>
								</Card>
							)}
						</div>
					</div>
				</div>
			</Layout>
		</ProtectedRoute>
	);
};

export default UploadPage;
