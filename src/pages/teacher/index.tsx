import React, {useState} from "react";
import {useRouter} from "next/router";
import Layout from "@/components/Layout";
import SubmissionTracker from "@/components/Teacher/SubmissionTracker";
import GradeHistory from "@/components/Teacher/GradeHistory";
import {ProtectedRoute} from "@/components/Auth";
import Card from "@/components/Common/Card";
import SectionHeader from "@/components/Common/SectionHeader";
import Badge from "@/components/Common/Badge";
import {
	useAuth,
	useUserStats,
	useAssignments,
	useRecentActivity,
} from "@/hooks";
import {notifyError} from "@/utils/toastNotify";
import type {ProcessedTeacherAssignment} from "@/hooks";
import {UserRole} from "@/interface";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
	faBell,
	faCheck,
	faChevronRight,
	faCloudArrowUp,
	faFilePen,
	faHouse,
	faRobot,
	faUser,
	faChartLine,
	faPlayCircle,
} from "@fortawesome/free-solid-svg-icons";

type TeacherDashboardTab = {
	id: "overview" | "submissions" | "history";
	label: string;
	icon: React.ReactNode;
	badge?: number;
};

const StatSkeleton = () => (
	<div className="h-8 w-16 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
);

const AssignmentSkeleton = () => (
	<Card className="p-4 bg-white/60 border border-gray-100">
		<div className="animate-pulse space-y-3">
			<div className="h-4 bg-gray-200 rounded w-3/4"></div>
			<div className="h-3 bg-gray-200 rounded w-1/2"></div>
			<div className="flex gap-4 mt-4">
				<div className="h-8 bg-gray-200 rounded w-20"></div>
				<div className="h-8 bg-gray-200 rounded w-24"></div>
			</div>
		</div>
	</Card>
);

const ActivitySkeleton = () => (
	<div className="flex items-start gap-4 p-3">
		<div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
		<div className="flex-1 space-y-2">
			<div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
			<div className="h-2 bg-gray-200 rounded w-1/2 animate-pulse"></div>
		</div>
	</div>
);

const TeacherDashboard: React.FC = () => {
	const {user} = useAuth();
	const [activeTab, setActiveTab] = useState<
		"overview" | "submissions" | "history"
	>("overview");
	const [showExpired, setShowExpired] = useState(true);
	const [activityLimit, setActivityLimit] = useState(8);
	const [selectedCourse, setSelectedCourse] = useState<string>("all");

	const {stats, loading: statsLoading, error: statsError} = useUserStats();
	const {
		assignments,
		loading: assignmentsLoading,
		error: assignmentsError,
	} = useAssignments();
	const {
		activities,
		loading: activitiesLoading,
		error: activitiesError,
	} = useRecentActivity(activityLimit);

	const router = useRouter();

	React.useEffect(() => {
		if (activitiesError) {
			notifyError(
				activitiesError.message || "Error al cargar actividad reciente",
			);
		}
	}, [activitiesError]);

	const {
		activeAssignmentsList,
		pendingAssignmentsList,
		expiredAssignmentsList,
		courses,
	} = React.useMemo(() => {
		const active: ProcessedTeacherAssignment[] = [];
		const pending: ProcessedTeacherAssignment[] = [];
		const expired: ProcessedTeacherAssignment[] = [];
		const courseSet = new Set<string>();

		assignments.forEach((assignment: ProcessedTeacherAssignment) => {
			if (assignment.courseName) {
				courseSet.add(assignment.courseName);
			}

			if (
				selectedCourse !== "all" &&
				assignment.courseName !== selectedCourse
			) {
				return;
			}

			if (assignment.isExpired) {
				expired.push(assignment);
			} else if (assignment.pending > 0 || assignment.submissions === 0) {
				pending.push(assignment);
			} else {
				active.push(assignment);
			}
		});
		return {
			activeAssignmentsList: active,
			pendingAssignmentsList: pending,
			expiredAssignmentsList: expired,
			courses: Array.from(courseSet).sort(),
		};
	}, [assignments, selectedCourse]);

	const pendingReviewCount = React.useMemo(() => {
		return assignments.reduce(
			(total: number, assignment: ProcessedTeacherAssignment) =>
				total + assignment.pending,
			0,
		);
	}, [assignments]);
	const tabs: TeacherDashboardTab[] = [
		{
			id: "overview",
			label: "Vista General",
			icon: <FontAwesomeIcon icon={faHouse} />,
		},
		{
			id: "submissions",
			label: "Entregas",
			icon: <FontAwesomeIcon icon={faCloudArrowUp} />,
			badge: pendingReviewCount,
		},
		{
			id: "history",
			label: "Histórico",
			icon: <FontAwesomeIcon icon={faChartLine} />,
		},
	];

	// Mostrar mensaje de error si hay problemas críticos
	if (statsError || assignmentsError) {
		return (
			<Layout>
				<div className="max-w-7xl mx-auto p-4">
					<Card className="bg-red-50 border-red-200">
						<p className="text-red-600">
							Error al cargar datos:{" "}
							{statsError?.message || assignmentsError?.message}
						</p>
					</Card>
				</div>
			</Layout>
		);
	}

	return (
		<ProtectedRoute requiredRole={UserRole.TEACHER}>
			<Layout title="Panel de docente" hideHeader>
				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<SectionHeader
						title={`Bienvenido(a), ${
							user?.role === UserRole.ADMIN ? "Administrador(a)" : "Profesor(a)"
						} ${user?.name}`}
						description={
							user?.role === UserRole.ADMIN
								? "Vista general del sistema y todos los estudiantes activos"
								: "Monitorea el progreso de tus estudiantes y gestiona tus evaluaciones"
						}
						className="mb-8"
					/>

					{/* Tabs */}
					<div className="border-b border-gray-200">
						<nav
							className="flex space-x-8"
							role="tablist"
							aria-label="Secciones del panel"
						>
							{tabs.map((tab) => (
								<button
									key={tab.id}
									role="tab"
									aria-selected={activeTab === tab.id}
									aria-controls={`panel-${tab.id}`}
									id={`tab-${tab.id}`}
									onClick={() => {
										setActiveTab(tab.id);
									}}
									className={`flex items-center gap-2 py-4 px-1 font-medium border-b-2 transition-colors ${
										activeTab === tab.id
											? "border-electric-500 text-electric-600"
											: "border-transparent text-gray-500 hover:text-gray-700"
									}`}
								>
									<span>{tab.icon}</span>
									<span>{tab.label}</span>
									{tab.badge !== undefined && tab.badge > 0 && (
										<span
											className={`px-2 py-0.5 rounded-full text-xs font-bold ${
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
					<div
						role="tabpanel"
						id={`panel-${activeTab}`}
						aria-labelledby={`tab-${activeTab}`}
						className="outline-none focus:outline-none"
						tabIndex={0}
					>
						{activeTab === "overview" && (
							<>
								{/* Stats Grid */}
								<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 mt-4">
									<Card className="text-center group hoverable">
										{statsLoading ? (
											<StatSkeleton />
										) : (
											<div className="text-2xl font-bold text-gray-900 group-hover:scale-110 transition-transform">
												{stats.totalStudents}
											</div>
										)}
										<div className="text-sm text-gray-600">
											{user?.role === UserRole.ADMIN
												? "Total Estudiantes"
												: "Mis Estudiantes"}
										</div>
									</Card>

									<Card className="text-center group hoverable">
										{statsLoading ? (
											<StatSkeleton />
										) : (
											<div className="text-2xl font-bold text-electric-500 group-hover:scale-110 transition-transform">
												{pendingAssignmentsList.length +
													activeAssignmentsList.length}
											</div>
										)}
										<div className="text-sm text-gray-600">Tareas activas</div>
									</Card>

									<Card className="text-center group hoverable">
										{statsLoading || assignmentsLoading ? (
											<StatSkeleton />
										) : (
											<div className="text-2xl font-bold text-yellow-500 group-hover:scale-110 transition-transform">
												{pendingReviewCount}
											</div>
										)}
										<div className="text-sm text-gray-600">Por revisar</div>
									</Card>

									<Card className="text-center group hoverable">
										{statsLoading ? (
											<StatSkeleton />
										) : (
											<div className="text-2xl font-bold text-green-500 group-hover:scale-110 transition-transform">
												{stats.averageGrade}
											</div>
										)}
										<div className="text-sm text-gray-600">Promedio</div>
									</Card>

									<Card className="text-center group hoverable">
										{statsLoading ? (
											<StatSkeleton />
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
											<SectionHeader
												title="Tareas activas"
												actions={
													<div className="flex flex-wrap items-center gap-3">
														{!assignmentsLoading && courses.length > 0 && (
															<select
																value={selectedCourse}
																onChange={(e) =>
																	setSelectedCourse(e.target.value)
																}
																className="text-sm bg-white border border-gray-200 text-gray-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-500 transition-shadow cursor-pointer"
																aria-label="Filtrar por curso"
															>
																<option value="all">Todos los cursos</option>
																{courses.map((course) => (
																	<option key={course} value={course}>
																		{course}
																	</option>
																))}
															</select>
														)}

														{user?.role === UserRole.TEACHER && (
															<button
																onClick={() =>
																	router.push("/teacher/assignments")
																}
																className="text-xs font-bold bg-electric-50 text-electric-600 hover:bg-electric-100 transition-colors px-3 py-1.5 rounded-lg border border-electric-100 whitespace-nowrap"
																title="Crear nueva tarea"
															>
																<FontAwesomeIcon
																	icon={faFilePen}
																	className="mr-1.5"
																/>
																Crear Tarea
															</button>
														)}
													</div>
												}
												className="mb-6"
											/>

											<div className="space-y-4">
												{assignmentsLoading ? (
													// Skeletons mientras carga
													<>
														<AssignmentSkeleton />
														<AssignmentSkeleton />
														<AssignmentSkeleton />
													</>
												) : pendingAssignmentsList.length === 0 &&
												  activeAssignmentsList.length === 0 ? (
													// Estado vacío para tareas activas
													<Card className="p-8 text-center bg-white/60 border border-gray-100">
														<div className="text-4xl mb-3">
															<FontAwesomeIcon icon={faFilePen} />
														</div>
														<h3 className="font-bold text-gray-900 mb-2">
															No hay tareas vigentes
														</h3>
														<p className="text-sm text-gray-600 mb-4">
															Las tareas que ya vencieron se encuentran en la
															sección inferior
														</p>
														{user?.role === UserRole.TEACHER && (
															<button
																onClick={() =>
																	router.push("/teacher/assignments")
																}
																className="btn-primary"
															>
																Crear nueva tarea
															</button>
														)}
													</Card>
												) : (
													<>
														{pendingAssignmentsList.length > 0 && (
															<div className="space-y-3">
																{pendingAssignmentsList.map(
																	(assignment: ProcessedTeacherAssignment) => (
																		<Card
																			key={assignment.id}
																			hoverable
																			className="p-4 bg-amber-50/60 border border-amber-100 group shadow-sm"
																		>
																			<div className="flex items-center justify-between mb-3">
																				<div className="flex-1">
																					<h3 className="font-bold text-gray-900 group-hover:text-electric-600 transition-colors">
																						{assignment.title}
																					</h3>
																					<div className="flex items-center gap-2 mt-1">
																						<div className="text-xs font-medium text-gray-500">
																							Vence:{" "}
																							{new Date(
																								assignment.dueDate,
																							).toLocaleDateString("es-ES", {
																								day: "numeric",
																								month: "short",
																								year: "numeric",
																							})}
																						</div>
																						{assignment.courseName && (
																							<>
																								<span className="text-gray-300">
																									•
																								</span>
																								<span className="text-xs text-gray-500">
																									{assignment.courseName}
																								</span>
																							</>
																						)}
																					</div>
																				</div>
																				<div className="text-right">
																					<div className="text-lg font-black text-gray-900">
																						{assignment.average > 0
																							? assignment.average
																							: "-"}
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
																							{assignment.submissions === 1
																								? "entrega"
																								: "entregas"}
																						</span>
																					</div>
																					{assignment.pending > 0 ? (
																						<Badge variant="warning">
																							{assignment.pending} por revisar
																						</Badge>
																					) : (
																						<Badge variant="default">
																							Pendiente de entrega
																						</Badge>
																					)}
																				</div>

																				<button
																					onClick={() =>
																						router.push(
																							`/teacher/assignments/${assignment.id}`,
																						)
																					}
																					className="text-xs font-bold text-electric-500 hover:text-electric-600 transition-colors bg-electric-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-electric-200"
																				>
																					Ver detalles{" "}
																					<FontAwesomeIcon
																						icon={faChevronRight}
																					/>
																				</button>
																			</div>
																		</Card>
																	),
																)}
															</div>
														)}

														{activeAssignmentsList.length > 0 && (
															<div className="space-y-3">
																{pendingAssignmentsList.length > 0 && (
																	<h3 className="text-sm font-black uppercase tracking-wider text-gray-400 pt-2">
																		Otras tareas activas
																	</h3>
																)}
																{activeAssignmentsList.map(
																	(assignment: ProcessedTeacherAssignment) => (
																		<Card
																			key={assignment.id}
																			hoverable
																			className="p-4 bg-white/60 border border-gray-100 group shadow-sm"
																		>
																			<div className="flex items-center justify-between mb-3">
																				<div className="flex-1">
																					<h3 className="font-bold text-gray-900 group-hover:text-electric-600 transition-colors">
																						{assignment.title}
																					</h3>
																					<div className="flex items-center gap-2 mt-1">
																						<div className="text-xs font-medium text-gray-500">
																							Vence:{" "}
																							{new Date(
																								assignment.dueDate,
																							).toLocaleDateString("es-ES", {
																								day: "numeric",
																								month: "short",
																								year: "numeric",
																							})}
																						</div>
																						{assignment.courseName && (
																							<>
																								<span className="text-gray-300">
																									•
																								</span>
																								<span className="text-xs text-gray-500">
																									{assignment.courseName}
																								</span>
																							</>
																						)}
																					</div>
																				</div>
																				<div className="text-right">
																					<div className="text-lg font-black text-gray-900">
																						{assignment.average > 0
																							? Number(
																									assignment.average,
																								).toFixed(2)
																							: "-"}
																					</div>
																					<div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
																						Promedio
																					</div>
																				</div>
																			</div>

																			<div className="flex items-center justify-between mt-4">
																				<div className="text-sm">
																					<span className="font-bold text-gray-900">
																						{assignment.submissions}
																					</span>
																					<span className="text-gray-500 ml-1">
																						{assignment.submissions === 1
																							? "entrega"
																							: "entregas"}
																					</span>
																				</div>

																				<button
																					onClick={() =>
																						router.push(
																							`/teacher/assignments/${assignment.id}`,
																						)
																					}
																					className="text-xs font-bold text-electric-500 hover:text-electric-600 transition-colors bg-electric-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-electric-200"
																				>
																					Ver detalles{" "}
																					<FontAwesomeIcon
																						icon={faChevronRight}
																					/>
																				</button>
																			</div>
																		</Card>
																	),
																)}
															</div>
														)}
													</>
												)}

												{/* Collapsible Section for Expired Assignments */}
												{!assignmentsLoading && (
													<div className="mt-8">
														<button
															onClick={() => setShowExpired(!showExpired)}
															aria-expanded={showExpired}
															aria-controls="expired-assignments-panel"
															className="flex items-center gap-2 w-full p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600 border border-gray-100"
														>
															<span
																className={`transform transition-transform ${
																	showExpired ? "rotate-90" : ""
																}`}
															>
																<FontAwesomeIcon icon={faPlayCircle} />
															</span>
															<span className="font-bold text-sm uppercase tracking-wider">
																Tareas vencidas ({expiredAssignmentsList.length}
																)
															</span>
														</button>

														{showExpired && (
															<div
																id="expired-assignments-panel"
																className="mt-4 space-y-4"
															>
																{expiredAssignmentsList.length === 0 ? (
																	<Card className="p-4 bg-gray-50/60 border border-gray-100 text-center">
																		<p className="text-sm font-medium text-gray-500">
																			No hay tareas vencidas para este filtro.
																		</p>
																	</Card>
																) : (
																	expiredAssignmentsList.map(
																		(
																			assignment: ProcessedTeacherAssignment,
																		) => (
																			<Card
																				key={assignment.id}
																				className="p-4 bg-gray-50/50 border border-gray-100 hover:bg-white transition-all"
																			>
																				<div className="flex items-center justify-between mb-3">
																					<div className="flex-1">
																						<h3 className="font-bold text-gray-700">
																							{assignment.title}
																						</h3>
																						<div className="flex items-center gap-2 mt-1">
																							<Badge
																								variant="default"
																								className="text-[10px]"
																							>
																								Vencida
																							</Badge>
																							<span className="text-[10px] text-gray-400">
																								Venció el{" "}
																								{new Date(
																									assignment.dueDate,
																								).toLocaleDateString("es-ES")}
																							</span>
																						</div>
																					</div>
																					<div className="text-right">
																						<div className="text-lg font-black text-gray-500">
																							{assignment.average > 0
																								? assignment.average
																								: "-"}
																						</div>
																					</div>
																				</div>
																				<div className="flex items-center justify-between mt-2">
																					<div className="flex items-center gap-2 text-xs text-gray-500">
																						<span>
																							{assignment.submissions} entregas
																						</span>
																						{assignment.pending > 0 && (
																							<Badge variant="warning">
																								{assignment.pending} por revisar
																							</Badge>
																						)}
																					</div>
																					<button
																						onClick={() =>
																							router.push(
																								`/teacher/assignments/${assignment.id}`,
																							)
																						}
																						className="text-xs font-bold text-electric-500 hover:text-electric-600 transition-colors"
																					>
																						Ver detalles{" "}
																						<FontAwesomeIcon
																							icon={faChevronRight}
																						/>
																					</button>
																				</div>
																			</Card>
																		),
																	)
																)}
															</div>
														)}
													</div>
												)}
											</div>
										</Card>
									</div>

									{/* Right Column - Recent Activity */}
									<div className="space-y-6">
										<Card className="border-none shadow-none bg-white/40 ring-1 ring-gray-100">
											<SectionHeader
												title="Actividad Reciente"
												actions={
													!activitiesLoading &&
													activities.length > 0 && (
														<button
															onClick={() =>
																setActivityLimit((prev) =>
																	prev === 8 ? 50 : 8,
																)
															}
															className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
														>
															{activityLimit === 8 ? "Ver todo" : "Ver menos"}
														</button>
													)
												}
												className="mb-6"
											/>

											<div className="space-y-5">
												{activitiesLoading ? (
													// Skeletons mientras carga
													<>
														<ActivitySkeleton />
														<ActivitySkeleton />
														<ActivitySkeleton />
														<ActivitySkeleton />
													</>
												) : activities.length === 0 ? (
													// Estado vacío
													<div className="text-center py-8">
														<div className="text-4xl mb-3">
															<FontAwesomeIcon icon={faBell} />
														</div>
														<p className="text-sm text-gray-600">
															No hay actividad reciente
														</p>
													</div>
												) : (
													// Lista de actividades
													activities.map((activity) => (
														<div
															key={activity.id}
															className="flex items-start gap-4 p-3 rounded-xl hover:bg-white transition-all duration-300 group"
														>
															<div
																className={`p-2 rounded-xl text-lg ${
																	activity.type === "system"
																		? "bg-electric-50 text-electric-500"
																		: activity.type === "evaluation"
																			? "bg-green-50 text-green-500"
																			: "bg-gray-50 text-gray-500"
																} group-hover:scale-110 transition-transform`}
															>
																{activity.type === "system" ? (
																	<FontAwesomeIcon icon={faRobot} />
																) : activity.type === "evaluation" ? (
																	<FontAwesomeIcon icon={faCheck} />
																) : (
																	<FontAwesomeIcon icon={faUser} />
																)}
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
																	{activity.grade !== undefined && (
																		<Badge
																			variant="success"
																			className="text-[10px] font-black italic"
																		>
																			{activity.grade.toFixed(2)}
																		</Badge>
																	)}
																</div>
															</div>
														</div>
													))
												)}
											</div>
										</Card>
									</div>
								</div>
							</>
						)}

						{activeTab === "submissions" && <SubmissionTracker />}
						{activeTab === "history" && <GradeHistory />}
					</div>
				</div>
			</Layout>
		</ProtectedRoute>
	);
};

export default TeacherDashboard;
