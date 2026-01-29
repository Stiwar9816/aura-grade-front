import React, {useState} from "react";
import Layout from "@/components/Layout";
import SubmissionTracker from "@/components/Teacher/SubmissionTracker";
import {ProtectedRoute} from "@/components/Auth";
import Card from "@/components/Common/Card";
import SectionHeader from "@/components/Common/SectionHeader";
import Badge from "@/components/Common/Badge";
import {useAuth, useUserStats} from "@/hooks";
import {UserRole} from "@/types";

const TeacherDashboard: React.FC = () => {
	const {user} = useAuth();
	const [activeTab, setActiveTab] = useState<"overview" | "submissions">(
		"overview",
	);

	const {stats, loading} = useUserStats();

	const recentActivity = [
		{
			id: 1,
			student: "María González",
			action: "entregó",
			assignment: "Ensayo sobre IA",
			time: "Hace 15 min",
		},
		{
			id: 2,
			student: "Carlos Ruiz",
			action: "fue calificado",
			assignment: "Análisis de Caso",
			grade: 8.7,
			time: "Hace 30 min",
		},
		{
			id: 3,
			student: "Sistema IA",
			action: "completó evaluación",
			assignment: "12 documentos",
			time: "Hace 1 hora",
		},
		{
			id: 4,
			student: "Ana Martínez",
			action: "solicitó revisión",
			assignment: "Proyecto Final",
			time: "Hace 2 horas",
		},
	];

	const assignments = [
		{
			id: 1,
			title: "Ensayo sobre IA",
			dueDate: "2024-01-20",
			submissions: 38,
			pending: 7,
			average: 8.2,
		},
		{
			id: 2,
			title: "Análisis de Caso",
			dueDate: "2024-01-15",
			submissions: 42,
			pending: 3,
			average: 7.9,
		},
		{
			id: 3,
			title: "Reflexión Semanal",
			dueDate: "2024-01-10",
			submissions: 45,
			pending: 0,
			average: 8.7,
		},
	];

	return (
		<ProtectedRoute requiredRole={UserRole.TEACHER}>
			<Layout>
				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<SectionHeader
						title={`Bienvenido(a), Profesor(a) ${user?.name}`}
						description="Monitorea el progreso de tus estudiantes y gestiona tus evaluaciones"
						actions={
							<button className="btn-primary">
								<span className="flex items-center gap-2">
									<span>➕</span>
									<span>Nueva Tarea</span>
								</span>
							</button>
						}
						className="mb-8"
					/>

					{/* Tabs */}
					<div className="border-b border-gray-200">
						<nav className="flex space-x-8">
							{[
								{id: "overview", label: "Vista General", icon: "🏠"},
								{
									id: "submissions",
									label: "Entregas",
									icon: "📤",
									badge: stats.activeAssignments,
								},
							].map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id as any)}
									className={`flex items-center gap-2 py-4 px-1 font-medium border-b-2 transition-colors ${
										activeTab === tab.id
											? "border-electric-500 text-electric-600"
											: "border-transparent text-gray-500 hover:text-gray-700"
									}`}
								>
									<span>{tab.icon}</span>
									<span>{tab.label}</span>
									{tab.badge && (
										<span
											className={`px-2 py-0.5 rounded-full text-xs ${
												activeTab === tab.id
													? "bg-electric-500 text-white"
													: "bg-gray-200 text-gray-700"
											}`}
										>
											{tab.badge}
										</span>
									)}
								</button>
							))}
						</nav>
					</div>

					{/* Content based on tab */}
					{activeTab === "overview" && (
						<>
							{/* Stats Grid */}
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 mt-4">
								<Card className="text-center group hoverable">
									{loading ? (
										<div className="h-8 w-12 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
									) : (
										<div className="text-2xl font-bold text-gray-900 group-hover:scale-110 transition-transform">
											{stats.totalStudents}
										</div>
									)}
									<div className="text-sm text-gray-600">Estudiantes</div>
								</Card>
								<Card className="text-center group hoverable">
									{loading ? (
										<div className="h-8 w-12 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
									) : (
										<div className="text-2xl font-bold text-electric-500 group-hover:scale-110 transition-transform">
											{stats.activeAssignments}
										</div>
									)}
									<div className="text-sm text-gray-600">Tareas activas</div>
								</Card>
								<Card className="text-center group hoverable">
									{loading ? (
										<div className="h-8 w-12 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
									) : (
										<div className="text-2xl font-bold text-yellow-500 group-hover:scale-110 transition-transform">
											{stats.pendingEvaluations}
										</div>
									)}
									<div className="text-sm text-gray-600">Pendientes</div>
								</Card>
								<Card className="text-center group hoverable">
									{loading ? (
										<div className="h-8 w-12 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
									) : (
										<div className="text-2xl font-bold text-green-500 group-hover:scale-110 transition-transform">
											{stats.averageGrade}
										</div>
									)}
									<div className="text-sm text-gray-600">Promedio</div>
								</Card>
								<Card className="text-center group hoverable">
									{loading ? (
										<div className="h-8 w-12 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
									) : (
										<div className="text-2xl font-bold text-blue-500 group-hover:scale-110 transition-transform">
											{stats.completionRate}%
										</div>
									)}
									<div className="text-sm text-gray-600">Completadas</div>
								</Card>
							</div>

							{/* Main Grid */}
							<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
								{/* Left Column - Assignments */}
								<div className="lg:col-span-2">
									<Card className="border-none shadow-none bg-white/40 ring-1 ring-gray-100">
										<SectionHeader title="Tareas Activas" className="mb-6" />

										<div className="space-y-4">
											{assignments.map((assignment) => (
												<Card
													key={assignment.id}
													hoverable
													className="p-4 bg-white/60 border border-gray-100 group shadow-sm"
												>
													<div className="flex items-center justify-between mb-3">
														<div>
															<h3 className="font-bold text-gray-900 group-hover:text-electric-600 transition-colors">
																{assignment.title}
															</h3>
															<div className="text-xs font-medium text-gray-500">
																Vence:{" "}
																{new Date(
																	assignment.dueDate,
																).toLocaleDateString("es-ES", {
																	day: "numeric",
																	month: "short",
																})}
															</div>
														</div>
														<div className="text-right">
															<div className="text-lg font-black text-gray-900">
																{assignment.average}
															</div>
															<div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
																Promedio
															</div>
														</div>
													</div>

													<div className="flex items-center justify-between mt-4">
														<div className="flex items-center gap-4">
															<div className="text-sm">
																<span className="font-bold text-gray-900">
																	{assignment.submissions}
																</span>
																<span className="text-gray-500 ml-1">
																	entregas
																</span>
															</div>
															{assignment.pending > 0 && (
																<Badge variant="warning">
																	{assignment.pending} pendientes
																</Badge>
															)}
														</div>

														<button className="text-xs font-bold text-electric-500 hover:text-electric-600 transition-colors bg-electric-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-electric-200">
															Ver detalles →
														</button>
													</div>
												</Card>
											))}
										</div>
									</Card>
								</div>

								{/* Right Column - Recent Activity */}
								<div className="space-y-6">
									<Card className="border-none shadow-none bg-white/40 ring-1 ring-gray-100">
										<SectionHeader
											title="Actividad Reciente"
											actions={
												<button className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest">
													Ver todo
												</button>
											}
											className="mb-6"
										/>

										<div className="space-y-5">
											{recentActivity.map((activity, index) => (
												<div
													key={activity.id}
													className="flex items-start gap-4 p-3 rounded-xl hover:bg-white transition-all duration-300 group"
												>
													<div
														className={`p-2 rounded-xl text-lg ${
															activity.student === "Sistema IA"
																? "bg-electric-50 text-electric-500"
																: "bg-gray-50 text-gray-500"
														} group-hover:scale-110 transition-transform`}
													>
														{activity.student === "Sistema IA" ? "🤖" : "👤"}
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-sm text-gray-600 leading-tight">
															<span className="font-bold text-gray-900">
																{activity.student}
															</span>{" "}
															{activity.action}{" "}
															<span className="font-semibold text-gray-800">
																{activity.assignment}
															</span>
														</p>
														<div className="flex items-center gap-2 mt-1.5">
															<span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
																{activity.time}
															</span>
															{activity.grade && (
																<Badge
																	variant="success"
																	className="text-[10px] font-black italic"
																>
																	★ {activity.grade}
																</Badge>
															)}
														</div>
													</div>
												</div>
											))}
										</div>
									</Card>
								</div>
							</div>
						</>
					)}

					{activeTab === "submissions" && <SubmissionTracker />}
				</div>
			</Layout>
		</ProtectedRoute>
	);
};

export default TeacherDashboard;
