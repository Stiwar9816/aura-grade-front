import React from "react";
import {useRouter} from "next/router";
import Layout from "@/components/Layout";
import AssignmentCard from "@/components/Student/AssignmentCard";
import {ProtectedRoute} from "@/components/Auth";
import {UserRole} from "@/interface";
import Banner from "@/components/Common/Banner";
import Card from "@/components/Common/Card";
import SectionHeader from "@/components/Common/SectionHeader";
import {
	StudentAssignmentCardData,
	useAuth,
	useStudentAcademicData,
} from "@/hooks";
import {STANDARD_GRADE_MAX} from "@/utils/gradeScale";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
	faBookOpen,
	faChartLine,
			} from "@fortawesome/free-solid-svg-icons";

const StudentDashboard: React.FC = () => {
	const router = useRouter();
	const {user} = useAuth();
	const {
		assignments,
		courses,
		recentFeedback,
		pendingCount,
		gradedCount,
		averageGrade,
		deliveredCount,
		reviewPendingCount,
		loading,
		error,
	} = useStudentAcademicData();
	const handleSelectAssignment = (assignment: StudentAssignmentCardData) => {
		if (assignment.status === "pending" || assignment.status === "overdue") {
			router.push(`/upload?assignment=${assignment.id}`);
			return;
		}

		if (assignment.submissionId) {
			router.push(`/evaluation?submission=${assignment.submissionId}`);
			return;
		}

		router.push("/evaluation");
	};

	const visibleAssignments = [...assignments].sort((a, b) => Number(!["pending", "overdue"].includes(a.status)) - Number(!["pending", "overdue"].includes(b.status))).slice(0, 6);

	return (
		<ProtectedRoute requiredRole={UserRole.STUDENT}>
			<Layout title="Panel de inicio" hideHeader>
				<div className="max-w-6xl mx-auto">
					<Banner
						title={`Hola, ${user?.name || "estudiante"}`}
						description={
							loading
								? "Cargando tu información académica..."
								: `Tienes ${pendingCount} tarea${
										pendingCount !== 1 ? "s" : ""
									} pendiente${
										pendingCount !== 1 ? "s" : ""
									}, ${reviewPendingCount} entrega${
										reviewPendingCount !== 1 ? "s" : ""
									} en revisión, ${gradedCount} calificada${
										gradedCount !== 1 ? "s" : ""
									} y ${courses.length} curso${
										courses.length !== 1 ? "s" : ""
									} activo${courses.length !== 1 ? "s" : ""}.`
						}
						icon={
							<FontAwesomeIcon icon={faBookOpen} className="text-white mb-3" />
						}
						className="mb-5"
					/>

					{error && (
						<Card className="mb-8 bg-red-50 border-red-100">
							<p className="text-sm text-red-600 font-medium">
								No se pudo cargar toda la información: {error.message}
							</p>
						</Card>
					)}

					<dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                      {[
                        {label: "Por entregar", value: pendingCount, detail: "Tareas pendientes"},
                        {label: "Promedio publicado", value: gradedCount ? `${averageGrade} / ${STANDARD_GRADE_MAX}` : "—", detail: `${gradedCount} tareas calificadas`},
                        {label: "Cursos", value: courses.length, detail: "Cursos registrados"},
                        {label: "Entregadas", value: deliveredCount, detail: `${reviewPendingCount} en revisión docente`},
                      ].map((metric) => <div key={metric.label} className="rounded-xl border border-gray-200 bg-white p-4">
                        <dt className="text-xs font-medium text-gray-600">{metric.label}</dt>
                        <dd className="mt-2 text-2xl font-semibold tabular-nums text-gray-900">{loading ? "—" : metric.value}</dd>
                        <dd className="mt-1 text-xs text-gray-500">{metric.detail}</dd>
                      </div>)}
                    </dl>

					<div className="mb-12">
						<SectionHeader
							title="Mis tareas"
							description="Primero, las tareas por entregar. Consulta la rúbrica antes de enviar."
							actions={
								<div className="flex flex-wrap gap-2">
									<button
										onClick={() => router.push("/student/courses")}
										className="btn-ghost text-sm"
									>
										Ver cursos
									</button>
									<button
										onClick={() => router.push("/upload")}
										className="btn-primary text-sm"
									>
										Nueva entrega
									</button>
								</div>
							}
							className="mb-5"
						/>

						{loading ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{[1, 2, 3].map((item) => (
									<Card key={item} className="h-72 bg-white/70">
										<div className="animate-pulse space-y-4">
											<div className="h-5 bg-gray-200 rounded w-1/3" />
											<div className="h-7 bg-gray-200 rounded w-3/4" />
											<div className="h-4 bg-gray-200 rounded w-full" />
											<div className="h-4 bg-gray-200 rounded w-2/3" />
										</div>
									</Card>
								))}
							</div>
						) : visibleAssignments.length === 0 ? (
							<Card className="text-center bg-white/70 border border-gray-100">
								<FontAwesomeIcon
									icon={faBookOpen}
									className="text-4xl text-gray-300 mb-4"
								/>
								<h3 className="font-bold text-gray-900 mb-2">
									No hay tareas para mostrar
								</h3>
								<p className="text-sm text-gray-500">
									Cuando un docente cree tareas para tus cursos, aparecerán
									aquí.
								</p>
							</Card>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{visibleAssignments.map((assignment) => (
									<AssignmentCard
										key={assignment.id}
										assignment={assignment}
										onSelect={handleSelectAssignment}
									/>
								))}
							</div>
						)}
					</div>

					<Card>
						<SectionHeader title="Retroalimentación publicada" className="mb-6" />

						{recentFeedback.length === 0 ? (
							<div className="text-center py-10">
								<FontAwesomeIcon
									icon={faChartLine}
									className="text-4xl text-gray-300 mb-4"
								/>
								<p className="text-gray-500">
									Las observaciones de tu docente aparecerán aquí cuando publique una evaluación.
								</p>
							</div>
						) : (
							<div className="space-y-4">
								{recentFeedback.map((assignment) => (
									<div
										key={assignment.id}
										className="p-4 bg-gray-50 border border-gray-200 rounded-xl"
									>
										<div className="flex items-start justify-between gap-4">
											<div>
												<h3 className="font-semibold text-gray-900 mb-1">
													{assignment.title}
												</h3>
												<p className="text-gray-700 text-sm">
													{assignment.feedback ||
														"Tu entrega ya tiene calificación registrada."}
												</p>
												<div className="text-sm text-gray-600 mt-3">
													{assignment.courseName} - Calificación:{" "}
													{assignment.score?.toFixed(1)}/{assignment.maxScore} (
													{assignment.percentage}%)
												</div>
											</div>
											<button
												onClick={() => handleSelectAssignment(assignment)}
												className="text-electric-500 hover:text-electric-600 font-medium text-sm shrink-0"
											>
												Ver detalles
											</button>
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
};

export default StudentDashboard;
