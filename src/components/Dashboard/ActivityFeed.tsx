import React, {useState, useEffect} from "react";
import {Activity} from "@/types";

interface ActivityFeedProps {
	activities?: Activity[];
	autoRefresh?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
	activities: initialActivities,
	autoRefresh = true,
}) => {
	const [activities, setActivities] = useState<Activity[]>([]);
	const [filter, setFilter] = useState<string>("all");
	const [isPaused, setIsPaused] = useState<boolean>(false);

	// Datos de ejemplo si no se proporcionan
	const sampleActivities: Activity[] = [
		{
			id: "1",
			type: "upload",
			user: "María González",
			time: "Hace 2 min",
			task: "Ensayo de Filosofía Moderna",
			score: undefined,
			message: undefined,
		},
		{
			id: "2",
			type: "graded",
			user: "Carlos Ruiz",
			time: "Hace 15 min",
			task: "Análisis de Mercado",
			score: 8.7,
			message: undefined,
		},
		{
			id: "3",
			type: "ai_processing",
			user: "Sistema IA",
			time: "Hace 30 min",
			task: "12 documentos",
			score: undefined,
			message: "Procesamiento batch completado",
		},
		{
			id: "4",
			type: "rubric_updated",
			user: "Prof. Rodríguez",
			time: "Hace 1 hora",
			task: "Rúbrica de Ensayos",
			score: undefined,
			message: "Criterios de originalidad actualizados",
		},
		{
			id: "5",
			type: "alert",
			user: "Sistema",
			time: "Hace 2 horas",
			task: undefined,
			score: undefined,
			message: "3 entregas atrasadas detectadas",
		},
		{
			id: "6",
			type: "upload",
			user: "Ana Martínez",
			time: "Hace 3 horas",
			task: "Proyecto Final de IA",
			score: undefined,
			message: undefined,
		},
		{
			id: "7",
			type: "graded",
			user: "Luis Fernández",
			time: "Hace 4 horas",
			task: "Reflexión Ética",
			score: 9.2,
			message: undefined,
		},
		{
			id: "8",
			type: "ai_processing",
			user: "Sistema IA",
			time: "Hace 5 horas",
			task: "Corrección automática",
			score: undefined,
			message: "Modelo de evaluación optimizado",
		},
	];

	useEffect(() => {
		if (initialActivities) {
			setActivities(initialActivities);
		} else {
			setActivities(sampleActivities.slice(0, 6));
		}
	}, [initialActivities]);

	useEffect(() => {
		if (!autoRefresh || isPaused) return;

		const interval = setInterval(() => {
			// Simular nueva actividad cada 30 segundos
			const newActivity: Activity = {
				id: Date.now().toString(),
				type: Math.random() > 0.5 ? "upload" : "graded",
				user: ["Estudiante Nuevo", "Sistema IA", "Profesor"][
					Math.floor(Math.random() * 3)
				],
				time: "Ahora",
				task: [
					"Tarea de Matemáticas",
					"Ensayo Literario",
					"Proyecto Científico",
				][Math.floor(Math.random() * 3)],
				score:
					Math.random() > 0.5
						? parseFloat((Math.random() * 3 + 7).toFixed(1))
						: undefined,
				message:
					Math.random() > 0.7 ? "Evaluación automática completada" : undefined,
			};

			setActivities((prev) => [newActivity, ...prev.slice(0, 7)]);
		}, 30000);

		return () => clearInterval(interval);
	}, [autoRefresh, isPaused]);

	const getActivityConfig = (type: Activity["type"]) => {
		switch (type) {
			case "upload":
				return {
					icon: "📤",
					color: "text-electric-500",
					bgColor: "bg-electric-50",
					borderColor: "border-electric-200",
					label: "Entrega",
				};
			case "graded":
				return {
					icon: "📊",
					color: "text-green-500",
					bgColor: "bg-green-50",
					borderColor: "border-green-200",
					label: "Calificado",
				};
			case "ai_processing":
				return {
					icon: "🤖",
					color: "text-purple-500",
					bgColor: "bg-purple-50",
					borderColor: "border-purple-200",
					label: "Procesando IA",
				};
			case "rubric_updated":
				return {
					icon: "⚙️",
					color: "text-cyan-500",
					bgColor: "bg-cyan-50",
					borderColor: "border-cyan-200",
					label: "Rúbrica",
				};
			case "alert":
				return {
					icon: "⚠️",
					color: "text-yellow-500",
					bgColor: "bg-yellow-50",
					borderColor: "border-yellow-200",
					label: "Alerta",
				};
			default:
				return {
					icon: "🔔",
					color: "text-gray-500",
					bgColor: "bg-gray-50",
					borderColor: "border-gray-200",
					label: "Actividad",
				};
		}
	};

	const filteredActivities =
		filter === "all"
			? activities
			: activities.filter((activity) => activity.type === filter);

	const activityCounts = {
		all: activities.length,
		upload: activities.filter((a) => a.type === "upload").length,
		graded: activities.filter((a) => a.type === "graded").length,
		ai_processing: activities.filter((a) => a.type === "ai_processing").length,
		rubric_updated: activities.filter((a) => a.type === "rubric_updated")
			.length,
		alert: activities.filter((a) => a.type === "alert").length,
	};

	return (
		<div className="card p-6 h-full">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div>
					<h2 className="text-xl font-bold text-gray-900">Feed de Actividad</h2>
					<p className="text-gray-600 text-sm mt-1">
						Actualizaciones en tiempo real
					</p>
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={() => setIsPaused(!isPaused)}
						className={`p-2 rounded-lg ${
							isPaused
								? "bg-gray-100 text-gray-600"
								: "bg-electric-100 text-electric-600"
						}`}
						title={
							isPaused ? "Reanudar actualizaciones" : "Pausar actualizaciones"
						}
					>
						{isPaused ? "▶️" : "⏸️"}
					</button>
					<button className="p-2 text-gray-600 hover:text-gray-900">⚙️</button>
				</div>
			</div>

			{/* Filter Tabs */}
			<div className="flex overflow-x-auto pb-2 mb-4 scrollbar-hide">
				<div className="flex space-x-2 min-w-max">
					{[
						{key: "all", label: "Todo", icon: "📋"},
						{key: "upload", label: "Entregas", icon: "📤"},
						{key: "graded", label: "Calificados", icon: "📊"},
						{key: "ai_processing", label: "IA", icon: "🤖"},
						{key: "alert", label: "Alertas", icon: "⚠️"},
					].map((tab) => (
						<button
							key={tab.key}
							onClick={() => setFilter(tab.key)}
							className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
								filter === tab.key
									? "bg-electric-500 text-white"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
						>
							<span>{tab.icon}</span>
							<span className="font-medium">{tab.label}</span>
							<span
								className={`text-xs px-1.5 py-0.5 rounded-full ${
									filter === tab.key ? "bg-white/30" : "bg-gray-300"
								}`}
							>
								{activityCounts[tab.key as keyof typeof activityCounts]}
							</span>
						</button>
					))}
				</div>
			</div>

			{/* Activity List */}
			<div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
				{filteredActivities.length === 0 ? (
					<div className="text-center py-12">
						<div className="text-4xl mb-4">📭</div>
						<h3 className="font-medium text-gray-900 mb-2">No hay actividad</h3>
						<p className="text-gray-600 text-sm">
							{filter === "all"
								? "No hay actividad reciente"
								: `No hay actividad de tipo ${filter}`}
						</p>
					</div>
				) : (
					filteredActivities.map((activity) => {
						const config = getActivityConfig(activity.type);

						return (
							<div
								key={activity.id}
								className={`p-4 rounded-xl border ${
									config.borderColor
								} hover:border-${config.color.replace(
									"text-",
									""
								)} transition-all duration-300 hover:shadow-sm group`}
							>
								<div className="flex items-start gap-3">
									{/* Icon */}
									<div
										className={`p-2 rounded-lg ${config.bgColor} flex-shrink-0 group-hover:scale-110 transition-transform`}
									>
										<span className={`text-lg ${config.color}`}>
											{config.icon}
										</span>
									</div>

									{/* Content */}
									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-1">
													<span className="font-medium text-gray-900">
														{activity.user}
													</span>
													<span
														className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}
													>
														{config.label}
													</span>
												</div>

												{activity.task && (
													<p className="text-gray-700 text-sm mb-2 truncate">
														{activity.task}
													</p>
												)}

												{activity.message && (
													<div className="text-gray-600 text-sm bg-gray-50 rounded-lg p-2 mb-2">
														{activity.message}
													</div>
												)}

												{activity.score !== undefined && (
													<div className="flex items-center gap-2 mb-2">
														<div
															className={`px-3 py-1 rounded-full text-sm font-bold ${
																activity.score >= 9
																	? "bg-green-100 text-green-800"
																	: activity.score >= 7
																	? "bg-blue-100 text-blue-800"
																	: "bg-yellow-100 text-yellow-800"
															}`}
														>
															{activity.score.toFixed(1)}/10
														</div>
														{activity.score >= 9 && (
															<span className="text-xs text-green-600">
																⭐ Excelente
															</span>
														)}
													</div>
												)}
											</div>

											{/* Time */}
											<div className="text-xs text-gray-500 whitespace-nowrap">
												{activity.time}
											</div>
										</div>

										{/* Actions */}
										<div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
											<button className="text-xs text-gray-600 hover:text-electric-500">
												Ver detalles
											</button>
											{activity.type === "upload" && (
												<button className="text-xs text-green-600 hover:text-green-700">
													Evaluar ahora
												</button>
											)}
											{activity.type === "graded" && (
												<button className="text-xs text-cyan-600 hover:text-cyan-700">
													Ver feedback
												</button>
											)}
										</div>
									</div>
								</div>
							</div>
						);
					})
				)}
			</div>

			{/* Stats Footer */}
			<div className="mt-6 pt-6 border-t border-gray-200">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="text-center">
						<div className="text-lg font-bold text-electric-500">
							{activities.filter((a) => a.type === "upload").length}
						</div>
						<div className="text-xs text-gray-600">Entregas hoy</div>
					</div>
					<div className="text-center">
						<div className="text-lg font-bold text-green-500">
							{activities.filter((a) => a.type === "graded").length}
						</div>
						<div className="text-xs text-gray-600">Calificados</div>
					</div>
					<div className="text-center">
						<div className="text-lg font-bold text-purple-500">
							{activities.filter((a) => a.type === "ai_processing").length}
						</div>
						<div className="text-xs text-gray-600">Procesos IA</div>
					</div>
					<div className="text-center">
						<div className="text-lg font-bold text-yellow-500">
							{activities.filter((a) => a.type === "alert").length}
						</div>
						<div className="text-xs text-gray-600">Alertas</div>
					</div>
				</div>

				{/* Auto-refresh status */}
				<div className="mt-4 flex items-center justify-between text-sm">
					<div className="flex items-center gap-2">
						<div
							className={`w-2 h-2 rounded-full ${
								isPaused ? "bg-gray-400" : "bg-green-500 animate-pulse"
							}`}
						></div>
						<span className="text-gray-600">
							{isPaused
								? "Actualizaciones pausadas"
								: "Actualizando en tiempo real"}
						</span>
					</div>
					<button
						onClick={() => setActivities(sampleActivities.slice(0, 6))}
						className="text-electric-500 hover:text-electric-600 font-medium"
					>
						Recargar
					</button>
				</div>
			</div>
		</div>
	);
};

export default ActivityFeed;
