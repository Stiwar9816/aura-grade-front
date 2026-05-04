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
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
	faBookOpen,
	faChartLine,
	faCheckCircle,
	faClock,
	faGraduationCap,
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
		averagePercentage,
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

	const visibleAssignments = assignments.slice(0, 6);

	return (
		<ProtectedRoute requiredRole={UserRole.STUDENT}>
			<Layout title="Panel de inicio" hideHeader>
				<div className="max-w-6xl mx-auto">
					<Banner
						title={`Hola, Alumno(a) ${user?.name || ""}`}
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
						className="mb-8"
					/>

					{error && (
						<Card className="mb-8 bg-red-50 border-red-100">
							<p className="text-sm text-red-600 font-medium">
								No se pudo cargar toda la información: {error.message}
							</p>
						</Card>
					)}

					<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
						<Card className="text-center">
							<FontAwesomeIcon
								icon={faClock}
								className="text-yellow-500 mb-3"
							/>
							<div className="text-3xl font-bold text-yellow-600 mb-2">
								{loading ? "-" : pendingCount}
							</div>
							<div className="text-gray-900 font-medium">Pendientes</div>
							<div className="text-sm text-gray-600 mt-1">
								Tareas por entregar
							</div>
						</Card>
						<Card className="text-center">
							<FontAwesomeIcon
								icon={faGraduationCap}
								className="text-green-500 mb-3"
							/>
							<div className="text-3xl font-bold text-green-600 mb-2">
								{loading ? "-" : averageGrade}
							</div>
							<div className="text-gray-900 font-medium">Promedio actual</div>
							<div className="text-sm text-gray-600 mt-1">
								{averagePercentage}% con {gradedCount} calificada
								{gradedCount !== 1 ? "s" : ""}
							</div>
						</Card>
						<Card className="text-center">
							<FontAwesomeIcon
								icon={faBookOpen}
								className="text-electric-500 mb-3"
							/>
							<div className="text-3xl font-bold text-electric-600 mb-2">
								{loading ? "-" : courses.length}
							</div>
							<div className="text-gray-900 font-medium">Mis cursos</div>
							<div className="text-sm text-gray-600 mt-1">
								Cursos registrados
							</div>
						</Card>
						<Card className="text-center">
							<FontAwesomeIcon
								icon={faCheckCircle}
								className="text-blue-500 mb-3"
							/>
							<div className="text-3xl font-bold text-blue-600 mb-2">
								{loading ? "-" : deliveredCount}
							</div>
							<div className="text-gray-900 font-medium">Entregadas</div>
							<div className="text-sm text-gray-600 mt-1">
								{reviewPendingCount} en revisión docente
							</div>
						</Card>
					</div>

					<div className="mb-12">
						<SectionHeader
							title="Mis Tareas"
							description="Tareas activas y resultados registrados desde la base de datos"
							actions={
								<div className="flex gap-3">
									<button
										onClick={() => router.push("/student/courses")}
										className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-2xl hover:bg-gray-200 transition-colors"
									>
										Ver cursos
									</button>
									<button
										onClick={() => router.push("/upload")}
										className="px-5 py-2.5 bg-electric-500 text-white text-sm font-bold rounded-2xl hover:bg-electric-600 shadow-lg shadow-electric-500/20 hover:shadow-electric-500/30 transition-all active:scale-95"
									>
										Nueva entrega
									</button>
								</div>
							}
							className="mb-8"
						/>

						{loading ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
						<SectionHeader title="Feedback Reciente" className="mb-6" />

						{recentFeedback.length === 0 ? (
							<div className="text-center py-10">
								<FontAwesomeIcon
									icon={faChartLine}
									className="text-4xl text-gray-300 mb-4"
								/>
								<p className="text-gray-500">
									Aún no hay feedback calificado para mostrar.
								</p>
							</div>
						) : (
							<div className="space-y-4">
								{recentFeedback.map((assignment) => (
									<div
										key={assignment.id}
										className="p-4 bg-green-50 border border-green-200 rounded-xl"
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
