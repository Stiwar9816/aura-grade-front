import React, {useState} from "react";
import Layout from "@/components/Layout";
import AssignmentCard from "@/components/Student/AssignmentCard";
import {ProtectedRoute} from "@/components/Auth";
import {UserRole} from "@/interface";
import Banner from "@/components/Common/Banner";
import Card from "@/components/Common/Card";
import SectionHeader from "@/components/Common/SectionHeader";
import {useAuth} from "@/hooks";

const StudentDashboard: React.FC = () => {
	const {user} = useAuth();
	const [assignments] = useState([
		{
			id: "1",
			title: "Ensayo sobre IA en Educación",
			description:
				"Analiza el impacto de la inteligencia artificial en los métodos de enseñanza contemporáneos.",
			dueDate: "2024-01-20T23:59:00",
			rubric: {
				criteria: [
					{
						name: "Argumentación",
						description: "Calidad y solidez de los argumentos presentados",
						weight: 30,
					},
					{
						name: "Estructura",
						description: "Organización lógica y coherencia del texto",
						weight: 25,
					},
					{
						name: "Ortografía y Gramática",
						description: "Corrección lingüística",
						weight: 20,
					},
					{
						name: "Originalidad",
						description: "Aportes personales y perspectiva única",
						weight: 15,
					},
					{
						name: "Formato",
						description: "Cumplimiento de requisitos formales",
						weight: 10,
					},
				],
			},
			status: "pending" as const,
		},
		{
			id: "2",
			title: "Análisis de Caso Estudio",
			description: "Estudio de mercado de una startup tecnológica emergente.",
			dueDate: "2024-01-15T23:59:00",
			rubric: {
				criteria: [
					{
						name: "Análisis Profundidad",
						description: "Nivel de detalle en el análisis",
						weight: 40,
					},
					{
						name: "Metodología",
						description: "Adecuación de los métodos utilizados",
						weight: 30,
					},
					{
						name: "Conclusiones",
						description: "Relevancia y fundamentación de conclusiones",
						weight: 30,
					},
				],
			},
			status: "graded" as const,
		},
		{
			id: "3",
			title: "Reflexión Semanal",
			description:
				"Reflexión personal sobre los temas discutidos en clase esta semana.",
			dueDate: "2024-01-10T23:59:00",
			rubric: {
				criteria: [
					{
						name: "Profundidad Reflexiva",
						description: "Nivel de introspección y autoconocimiento",
						weight: 50,
					},
					{
						name: "Aplicación Práctica",
						description: "Relación con experiencias personales",
						weight: 30,
					},
					{
						name: "Claridad Expresiva",
						description: "Calidad de la expresión escrita",
						weight: 20,
					},
				],
			},
			status: "graded" as const,
		},
	]);

	const handleSelectAssignment = (assignment: any) => {
		if (assignment.status === "pending") {
			window.location.href = `/upload?assignment=${assignment.id}`;
		} else if (assignment.status === "graded") {
			window.location.href = `/evaluation?assignment=${assignment.id}`;
		}
	};

	const pendingCount = assignments.filter((a) => a.status === "pending").length;
	const gradedCount = assignments.filter((a) => a.status === "graded").length;

	return (
		<ProtectedRoute requiredRole={UserRole.STUDENT}>
			<Layout title="Panel Estudiante" hideHeader>
				<div className="max-w-6xl mx-auto">
					{/* Welcome Banner */}
					<Banner
						title={`¡Hola, Alumno(a) ${user?.name}!`}
						description={`Tienes ${pendingCount} tarea${
							pendingCount !== 1 ? "s" : ""
						} pendiente${
							pendingCount !== 1 ? "s" : ""
						} y ${gradedCount} calificada${gradedCount !== 1 ? "s" : ""}`}
						icon="📚"
						className="mb-8"
					/>

					{/* Stats */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						<Card className="text-center">
							<div className="text-3xl font-bold text-electric-500 mb-2">
								{pendingCount}
							</div>
							<div className="text-gray-900 font-medium">Tareas Pendientes</div>
							<div className="text-sm text-gray-600 mt-1">
								Requieren tu atención
							</div>
						</Card>
						<Card className="text-center">
							<div className="text-3xl font-bold text-green-500 mb-2">8.4</div>
							<div className="text-gray-900 font-medium">Promedio Actual</div>
							<div className="text-sm text-gray-600 mt-1">
								+0.3 desde el mes pasado
							</div>
						</Card>
						<Card className="text-center">
							<div className="text-3xl font-bold text-cyan-500 mb-2">28s</div>
							<div className="text-gray-900 font-medium">
								Tiempo Promedio IA
							</div>
							<div className="text-sm text-gray-600 mt-1">
								Feedback instantáneo
							</div>
						</Card>
					</div>

					{/* Assignments Section */}
					<div className="mb-12">
						<SectionHeader
							title="Mis Tareas"
							description="Gestiona tus entregas y revisa tus calificaciones en tiempo real"
							actions={
								<div className="flex gap-3">
									<button className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-2xl hover:bg-gray-200 transition-colors">
										Ver todas
									</button>
									<button className="px-5 py-2.5 bg-electric-500 text-white text-sm font-bold rounded-2xl hover:bg-electric-600 shadow-lg shadow-electric-500/20 hover:shadow-electric-500/30 transition-all active:scale-95">
										Nueva entrega
									</button>
								</div>
							}
							className="mb-8"
						/>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{assignments.map((assignment) => (
								<AssignmentCard
									key={assignment.id}
									assignment={assignment}
									onSelect={handleSelectAssignment}
								/>
							))}
						</div>
					</div>

					{/* Recent Feedback */}
					<Card>
						<SectionHeader title="Feedback Reciente" className="mb-6" />

						<div className="space-y-4">
							<div className="p-4 bg-green-50 border border-green-200 rounded-xl">
								<div className="flex items-start gap-3">
									<div className="p-2 bg-green-100 rounded-lg">
										<span className="text-green-600">📈</span>
									</div>
									<div>
										<h3 className="font-semibold text-gray-900 mb-1">
											¡Mejora notable en estructura!
										</h3>
										<p className="text-gray-700 text-sm">
											Tu organización de ideas ha mejorado un 25% respecto a tu
											trabajo anterior. Las transiciones entre párrafos son más
											fluidas y la coherencia general es excelente.
										</p>
										<div className="flex items-center gap-4 mt-3 text-sm">
											<span className="text-gray-600">
												Ensayo sobre IA • Calificación: 9.2/10
											</span>
											<button className="text-electric-500 hover:text-electric-600 font-medium">
												Ver detalles →
											</button>
										</div>
									</div>
								</div>
							</div>

							<div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
								<div className="flex items-start gap-3">
									<div className="p-2 bg-blue-100 rounded-lg">
										<span className="text-blue-600">💡</span>
									</div>
									<div>
										<h3 className="font-semibold text-gray-900 mb-1">
											Sugerencia para próxima entrega
										</h3>
										<p className="text-gray-700 text-sm">
											Considera incluir más ejemplos concretos en tu siguiente
											trabajo. La teoría está bien fundamentada, pero los casos
											prácticos enriquecerían tu argumentación.
										</p>
										<div className="flex items-center gap-4 mt-3 text-sm">
											<span className="text-gray-600">
												Análisis de Caso • Calificación: 8.0/10
											</span>
											<button className="text-electric-500 hover:text-electric-600 font-medium">
												Ver consejos →
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</Card>
				</div>
			</Layout>
		</ProtectedRoute>
	);
};

export default StudentDashboard;
