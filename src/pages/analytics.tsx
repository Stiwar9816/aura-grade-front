import React, {useState} from "react";
import Layout from "@/components/Layout";
import {GradeDistribution, StudentPerformance} from "@/components/Analytics";
import {ProtectedRoute} from "@/components/Auth";
import {useAnalyticsData} from "@/hooks";
import {UserRole} from "@/interface";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
	faChartLine,
	faChartPie,
	faRobot,
} from "@fortawesome/free-solid-svg-icons";

const AnalyticsPage: React.FC = () => {
	const [timeRange, setTimeRange] = useState<"Semana" | "Mes" | "Semestre">(
		"Mes",
	);
	const [selectedCourse, setSelectedCourse] = useState<string>("all");
	const {
		distributionData,
		studentsData,
		averageGrade,
		loading,
		approvalRate,
		courses,
	} = useAnalyticsData(timeRange, selectedCourse);

	const allCourses = [
		{id: "all", name: "Todos los cursos"},
		...(courses || []),
	];

	return (
		<ProtectedRoute requiredRole={UserRole.TEACHER}>
			<Layout title="Panel de Analíticas">
				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<div className="mb-10">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
							<div>
								<p className="text-gray-500 font-medium mt-1">
									Monitoreo predictivo y análisis de brechas pedagógicas
								</p>
							</div>

							<div className="flex flex-wrap gap-2 items-center bg-white/50 p-2 rounded-[2rem] border border-gray-100 shadow-sm backdrop-blur-sm">
								<select
									value={selectedCourse}
									onChange={(e) => setSelectedCourse(e.target.value)}
									className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 px-2 cursor-pointer"
								>
									{allCourses.map((course: any) => (
										<option key={course.id} value={course.id}>
											{course.name || course.course_name}
										</option>
									))}
								</select>

								<div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>

								<div className="flex bg-gray-100/80 rounded-2xl p-1">
									{["Semana", "Mes", "Semestre"].map((range) => (
										<button
											key={range}
											onClick={() => setTimeRange(range as any)}
											className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
												timeRange === range
													? "bg-white text-electric-600 shadow-md"
													: "text-gray-500 hover:text-gray-900"
											}`}
										>
											{range === "Semana"
												? "Semana"
												: range === "Mes"
													? "Mes"
													: "Semestre"}
										</button>
									))}
								</div>
							</div>
						</div>

						{/* Stats Overview with Sparklines */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{[
								{
									label: "Promedio General",
									value: loading ? "..." : averageGrade,
									color: "green",
									icon: <FontAwesomeIcon icon={faChartPie} />,
								},
								{
									label: "Tasa de Aprobación",
									value: loading ? "..." : approvalRate,
									color: "blue",
									icon: <FontAwesomeIcon icon={faChartLine} />,
								},
								{
									label: "Evaluaciones IA",
									value: loading
										? "..."
										: String(
												studentsData
													? studentsData.reduce(
															(acc: number, s: any) =>
																acc + (s.criteria ? s.criteria.length : 0),
															0,
														)
													: 0,
											),
									color: "purple",
									icon: <FontAwesomeIcon icon={faRobot} />,
								},
							].map((stat, i) => (
								<div
									key={i}
									className="group relative bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden"
								>
									<div className="absolute top-0 right-0 p-4">
										<span className="text-4xl">{stat.icon}</span>
									</div>

									<div className="relative z-10">
										<p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-1">
											{stat.label}
										</p>
										<div className="flex items-end justify-between">
											<div>
												<h4 className="text-3xl font-black text-gray-900">
													{stat.value}
												</h4>
											</div>
											<div className="w-16 h-10">
												{/* SVG Sparkline placeholder */}
												<svg viewBox="0 0 100 40" className="overflow-visible">
													<path
														d={`M 0 ${Math.random() * 20 + 10} L 20 ${
															Math.random() * 20 + 10
														} L 40 ${Math.random() * 20 + 10} L 60 ${
															Math.random() * 20 + 10
														} L 80 ${Math.random() * 20 + 10} L 100 ${
															Math.random() * 20 + 10
														}`}
														fill="none"
														strokeWidth="3"
														strokeLinecap="round"
														strokeLinejoin="round"
														className={`stroke-${stat.color}-500/40`}
													/>
													<path
														d={`M 0 ${Math.random() * 30} C 20 ${
															Math.random() * 10
														}, 40 ${Math.random() * 40}, 60 ${
															Math.random() * 10
														}, 80 ${Math.random() * 40}, 100 ${
															Math.random() * 10
														}`}
														fill="none"
														strokeWidth="3"
														strokeLinecap="round"
														strokeLinejoin="round"
														className={`stroke-${stat.color}-500`}
													/>
												</svg>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Main Analytics Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
						{/* Grade Distribution */}
						<div>
							{loading ? (
								<p>Cargando distribución...</p>
							) : (
								<GradeDistribution
									timeRange={timeRange}
									data={distributionData}
									approvalRate={approvalRate}
								/>
							)}
						</div>

						{/* Student Performance */}
						<div>
							{loading ? (
								<p>Cargando rendimiento...</p>
							) : (
								<StudentPerformance students={studentsData || []} />
							)}
						</div>
					</div>
				</div>
			</Layout>
		</ProtectedRoute>
	);
};

export default AnalyticsPage;
