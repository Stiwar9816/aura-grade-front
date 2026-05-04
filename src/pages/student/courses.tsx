import React, {useState} from "react";
import {useRouter} from "next/router";
import Layout from "@/components/Layout";
import {ProtectedRoute} from "@/components/Auth";
import Card from "@/components/Common/Card";
import Badge from "@/components/Common/Badge";
import SectionHeader from "@/components/Common/SectionHeader";
import {
	StudentAssignmentCardData,
	StudentCourseReport,
	useStudentAcademicData,
} from "@/hooks";
import {UserRole} from "@/interface";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
	faArrowTrendUp,
	faBookOpen,
	faChartPie,
	faCircleCheck,
	faClock,
	faFileLines,
} from "@fortawesome/free-solid-svg-icons";

const getStatusBadge = (status: StudentAssignmentCardData["status"]) => {
	switch (status) {
		case "graded":
			return {label: "Calificada", variant: "success" as const};
		case "submitted":
		case "review_pending":
			return {label: "En revisión", variant: "warning" as const};
		case "overdue":
			return {label: "Vencida", variant: "error" as const};
		default:
			return {label: "Pendiente", variant: "warning" as const};
	}
};

const getActionLabel = (status: StudentAssignmentCardData["status"]) => {
	switch (status) {
		case "graded":
			return "Ver reporte";
		case "submitted":
		case "review_pending":
			return "Ver entrega";
		case "overdue":
			return "Ver cierre";
		default:
			return "Entregar";
	}
};

const formatDate = (date: string) =>
	new Date(date).toLocaleDateString("es-ES", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});

const CourseProgressBar: React.FC<{value: number}> = ({value}) => (
	<div className="h-3 bg-gray-100 rounded-full overflow-hidden">
		<div
			className="h-full bg-electric-500 rounded-full transition-all"
			style={{width: `${Math.min(value, 100)}%`}}
		/>
	</div>
);

const StudentCoursesPage: React.FC = () => {
	const router = useRouter();
	const {courses, loading, error} = useStudentAcademicData();
	const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

	const selectedCourse: StudentCourseReport | undefined = selectedCourseId
		? courses.find((course) => course.id === selectedCourseId)
		: courses[0];

	const handleOpenAssignment = (assignment: StudentAssignmentCardData) => {
		if (assignment.status === "pending" || assignment.status === "overdue") {
			router.push(`/upload?assignment=${assignment.id}`);
			return;
		}

		if (assignment.submissionId) {
			router.push(`/evaluation?submission=${assignment.submissionId}`);
			return;
		}

		router.push(`/upload?assignment=${assignment.id}`);
	};

	return (
		<ProtectedRoute requiredRole={UserRole.STUDENT}>
			<Layout title="Mis cursos" hideHeader>
				<div className="max-w-7xl mx-auto space-y-8">
					<SectionHeader
						title="Mis cursos"
						description="Consulta tus cursos registrados y el avance progresivo de tus notas."
					/>

					{error && (
						<Card className="bg-red-50 border-red-100">
							<p className="text-sm text-red-600 font-medium">
								No se pudo cargar la información: {error.message}
							</p>
						</Card>
					)}

					{loading ? (
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							{[1, 2, 3].map((item) => (
								<Card key={item} className="h-48">
									<div className="animate-pulse space-y-4">
										<div className="h-5 bg-gray-200 rounded w-1/3" />
										<div className="h-8 bg-gray-200 rounded w-3/4" />
										<div className="h-4 bg-gray-200 rounded w-full" />
									</div>
								</Card>
							))}
						</div>
					) : courses.length === 0 ? (
						<Card className="text-center py-12 bg-white/70 border border-gray-100">
							<FontAwesomeIcon
								icon={faBookOpen}
								className="text-5xl text-gray-300 mb-4"
							/>
							<h2 className="text-xl font-black text-gray-900 mb-2">
								No tienes cursos registrados
							</h2>
							<p className="text-gray-500">
								Cuando un docente te asigne a un curso, aparecerá en esta vista.
							</p>
						</Card>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							<div className="space-y-4">
								{courses.map((course) => (
									<Card
										key={course.id}
										hoverable
										onClick={() => setSelectedCourseId(course.id)}
										className={`border-2 ${
											selectedCourse?.id === course.id
												? "border-electric-500 bg-electric-50/40"
												: "border-transparent bg-white/70"
										}`}
									>
										<div className="flex items-start justify-between gap-3 mb-4">
											<div>
												<div className="text-xs font-black text-electric-600 uppercase tracking-widest">
													{course.code}
												</div>
												<h3 className="text-lg font-black text-gray-900">
													{course.name}
												</h3>
											</div>
											<Badge variant="electric">
												{course.currentPercentage}%
											</Badge>
										</div>
										<CourseProgressBar value={course.currentPercentage} />
										<div className="flex justify-between text-xs text-gray-500 mt-3">
											<span>{course.gradedAssignments} calificadas</span>
											<span>{course.reviewPendingAssignments} en revisión</span>
										</div>
									</Card>
								))}
							</div>

							<div className="lg:col-span-2">
								{selectedCourse && (
									<div className="space-y-6">
										<Card className="bg-white/70 border border-gray-100">
											<div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
												<div>
													<div className="text-xs font-black text-electric-600 uppercase tracking-widest mb-1">
														{selectedCourse.code}
													</div>
													<h2 className="text-2xl font-black text-gray-900">
														{selectedCourse.name}
													</h2>
													<p className="text-sm text-gray-500 mt-2">
														La nota actual se calcula con las tareas calificadas.
														Las tareas pendientes se integran progresivamente al
														recibir evaluación.
													</p>
												</div>
												<div className="text-right">
													<div className="text-4xl font-black text-electric-600">
														{selectedCourse.currentGrade}
													</div>
													<div className="text-xs font-bold text-gray-400 uppercase">
														Promedio actual /10
													</div>
													<div className="text-xs text-gray-500 mt-1">
														{selectedCourse.currentPercentage}% con{" "}
														{selectedCourse.gradedAssignments} calificada
														{selectedCourse.gradedAssignments !== 1 ? "s" : ""}
													</div>
												</div>
											</div>

											<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
												<div className="p-4 rounded-xl bg-gray-50">
													<FontAwesomeIcon
														icon={faFileLines}
														className="text-gray-500 mb-2"
													/>
													<div className="text-2xl font-black text-gray-900">
														{selectedCourse.totalAssignments}
													</div>
													<div className="text-xs text-gray-500">Tareas</div>
												</div>
												<div className="p-4 rounded-xl bg-blue-50">
													<FontAwesomeIcon
														icon={faCircleCheck}
														className="text-blue-500 mb-2"
													/>
													<div className="text-2xl font-black text-blue-600">
														{selectedCourse.deliveredAssignments}
													</div>
													<div className="text-xs text-gray-500">Entregadas</div>
												</div>
												<div className="p-4 rounded-xl bg-green-50">
													<FontAwesomeIcon
														icon={faArrowTrendUp}
														className="text-green-500 mb-2"
													/>
													<div className="text-2xl font-black text-green-600">
														{selectedCourse.gradedAssignments}
													</div>
													<div className="text-xs text-gray-500">Calificadas</div>
												</div>
												<div className="p-4 rounded-xl bg-yellow-50">
													<FontAwesomeIcon
														icon={faClock}
														className="text-yellow-500 mb-2"
													/>
													<div className="text-2xl font-black text-yellow-600">
														{selectedCourse.reviewPendingAssignments}
													</div>
													<div className="text-xs text-gray-500">
														En revisión
													</div>
												</div>
											</div>
										</Card>

										<Card className="bg-white/70 border border-gray-100">
											<SectionHeader
												title="Reporte de notas"
												description="Porcentaje obtenido por tarea y aporte al promedio progresivo."
												className="mb-6"
												actions={
													<div className="flex items-center gap-2 text-sm font-bold text-electric-600">
														<FontAwesomeIcon icon={faChartPie} />
														{selectedCourse.currentPercentage}%
													</div>
												}
											/>

											{selectedCourse.assignments.length === 0 ? (
												<div className="text-center py-10 text-gray-500">
													No hay tareas creadas para este curso.
												</div>
											) : (
												<div className="overflow-x-auto">
													<table className="w-full">
														<thead>
															<tr className="border-b border-gray-200">
																<th className="text-left py-3 px-4 text-sm font-bold text-gray-600">
																	Tarea
																</th>
																<th className="text-left py-3 px-4 text-sm font-bold text-gray-600">
																	Estado
																</th>
																<th className="text-left py-3 px-4 text-sm font-bold text-gray-600">
																	Vence
																</th>
																<th className="text-left py-3 px-4 text-sm font-bold text-gray-600">
																	Nota
																</th>
																<th className="text-left py-3 px-4 text-sm font-bold text-gray-600">
																	Porcentaje
																</th>
																<th className="text-right py-3 px-4 text-sm font-bold text-gray-600">
																	Acción
																</th>
															</tr>
														</thead>
														<tbody>
															{selectedCourse.assignments.map((assignment) => {
																const status = getStatusBadge(assignment.status);

																return (
																	<tr
																		key={assignment.id}
																		className="border-b border-gray-100 hover:bg-gray-50"
																	>
																		<td className="py-4 px-4">
																			<div className="font-bold text-gray-900">
																				{assignment.title}
																			</div>
																			<div className="text-xs text-gray-500 line-clamp-1">
																				{assignment.description}
																			</div>
																			{assignment.submissionHistory.length > 0 && (
																				<div className="text-xs font-bold text-electric-600 mt-1">
																					{assignment.submissionHistory.length}{" "}
																					{assignment.submissionHistory.length ===
																					1
																						? "versión enviada"
																						: "versiones enviadas"}
																				</div>
																			)}
																		</td>
																		<td className="py-4 px-4">
																			<Badge variant={status.variant}>
																				{status.label}
																			</Badge>
																		</td>
																		<td className="py-4 px-4 text-sm text-gray-600">
																			{formatDate(assignment.dueDate)}
																		</td>
																		<td className="py-4 px-4">
																			{assignment.score !== undefined ? (
																				<span className="font-black text-gray-900">
																					{assignment.score.toFixed(1)}
																					<span className="text-xs text-gray-400">
																						/{assignment.maxScore}
																					</span>
																				</span>
																			) : (
																				<span className="text-gray-400">-</span>
																			)}
																		</td>
																		<td className="py-4 px-4">
																			{assignment.percentage !== undefined ? (
																				<div className="min-w-28">
																					<div className="text-sm font-bold text-gray-900 mb-1">
																						{assignment.percentage}%
																					</div>
																					<CourseProgressBar
																						value={assignment.percentage}
																					/>
																				</div>
																			) : (
																				<span className="text-gray-400">Pendiente</span>
																			)}
																		</td>
																		<td className="py-4 px-4 text-right">
																			<button
																				onClick={() =>
																					handleOpenAssignment(assignment)
																				}
																				className="px-3 py-1.5 bg-electric-500 text-white text-sm rounded-lg hover:bg-electric-600 transition-colors disabled:bg-gray-200 disabled:text-gray-400"
																			>
																				{getActionLabel(assignment.status)}
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
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</Layout>
		</ProtectedRoute>
	);
};

export default StudentCoursesPage;
