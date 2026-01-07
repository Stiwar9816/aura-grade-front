import React from "react";

interface ActivityTrendsProps {
	timeRange: "week" | "month" | "semester";
}

const ActivityTrends: React.FC<ActivityTrendsProps> = ({timeRange}) => {
	const getData = () => {
		if (timeRange === "week") {
			return {
				labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
				uploads: [12, 18, 15, 22, 28, 8, 5],
				evaluations: [10, 15, 12, 20, 25, 6, 3],
				avgTime: [32, 28, 30, 25, 22, 35, 40],
			};
		} else if (timeRange === "month") {
			return {
				labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
				uploads: [45, 52, 60, 48],
				evaluations: [40, 48, 55, 44],
				avgTime: [30, 28, 25, 27],
			};
		} else {
			return {
				labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
				uploads: [120, 135, 145, 130, 140, 125],
				evaluations: [110, 128, 138, 122, 135, 118],
				avgTime: [35, 32, 30, 28, 26, 24],
			};
		}
	};

	const data = getData();

	const getMaxValue = (arr: number[]) => Math.max(...arr);

	const maxUploads = getMaxValue(data.uploads);
	const maxEvaluations = getMaxValue(data.evaluations);
	const maxTime = getMaxValue(data.avgTime);

	return (
		<div className="card p-6">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h3 className="text-xl font-bold text-gray-900">
						Tendencias de Actividad
					</h3>
					<p className="text-gray-600 mt-1">
						Análisis temporal de entregas y evaluaciones
					</p>
				</div>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 bg-electric-500 rounded-full"></div>
						<span className="text-sm text-gray-600">Entregas</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 bg-green-500 rounded-full"></div>
						<span className="text-sm text-gray-600">Evaluaciones</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
						<span className="text-sm text-gray-600">Tiempo (s)</span>
					</div>
				</div>
			</div>

			{/* Charts */}
			<div className="space-y-8">
				{/* Entregas y Evaluaciones */}
				<div>
					<div className="flex items-center justify-between mb-4">
						<div className="font-medium text-gray-900">
							Entregas vs Evaluaciones
						</div>
						<div className="text-sm text-gray-600">
							Total: {data.uploads.reduce((a, b) => a + b, 0)} entregas,{" "}
							{data.evaluations.reduce((a, b) => a + b, 0)} evaluaciones
						</div>
					</div>
					<div className="flex items-end h-40 gap-2">
						{data.labels.map((label, idx) => (
							<div key={idx} className="flex-1 flex flex-col items-center">
								<div className="flex items-end justify-center w-full gap-1 mb-2">
									<div
										className="flex-1 bg-electric-500 rounded-t-lg"
										style={{
											height: `${(data.uploads[idx] / maxUploads) * 80}%`,
										}}
										title={`${data.uploads[idx]} entregas`}
									/>
									<div
										className="flex-1 bg-green-500 rounded-t-lg"
										style={{
											height: `${
												(data.evaluations[idx] / maxEvaluations) * 80
											}%`,
										}}
										title={`${data.evaluations[idx]} evaluaciones`}
									/>
								</div>
								<div className="text-xs text-gray-600">{label}</div>
							</div>
						))}
					</div>
				</div>

				{/* Tiempo promedio */}
				<div>
					<div className="flex items-center justify-between mb-4">
						<div className="font-medium text-gray-900">
							Tiempo Promedio de Evaluación
						</div>
						<div className="text-sm text-gray-600">
							Promedio:{" "}
							{Math.round(
								data.avgTime.reduce((a, b) => a + b, 0) / data.avgTime.length
							)}{" "}
							segundos
						</div>
					</div>
					<div className="flex items-end h-24 gap-2">
						{data.labels.map((label, idx) => (
							<div key={idx} className="flex-1 flex flex-col items-center">
								<div
									className="w-full bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-t-lg"
									style={{height: `${(data.avgTime[idx] / maxTime) * 60}%`}}
									title={`${data.avgTime[idx]} segundos`}
								/>
								<div className="text-xs text-gray-600 mt-2">{label}</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Insights */}
			<div className="mt-8 pt-8 border-t border-gray-200">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="p-4 bg-gradient-to-r from-electric-50 to-blue-50 rounded-xl border border-electric-200">
						<div className="flex items-center gap-3 mb-3">
							<div className="p-2 bg-electric-100 rounded-lg">
								<span className="text-electric-600">📊</span>
							</div>
							<div>
								<div className="font-semibold text-gray-900">
									Pico de Actividad
								</div>
								<div className="text-2xl font-bold text-electric-600">
									{data.labels[data.uploads.indexOf(maxUploads)]}
								</div>
							</div>
						</div>
						<p className="text-sm text-gray-700">
							{maxUploads} entregas en un solo día/semana
						</p>
					</div>

					<div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
						<div className="flex items-center gap-3 mb-3">
							<div className="p-2 bg-green-100 rounded-lg">
								<span className="text-green-600">⚡</span>
							</div>
							<div>
								<div className="font-semibold text-gray-900">Eficiencia IA</div>
								<div className="text-2xl font-bold text-green-600">
									-
									{Math.round(
										((data.avgTime[0] - data.avgTime[data.avgTime.length - 1]) /
											data.avgTime[0]) *
											100
									)}
									%
								</div>
							</div>
						</div>
						<p className="text-sm text-gray-700">
							Tiempo de evaluación reducido significativamente
						</p>
					</div>

					<div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
						<div className="flex items-center gap-3 mb-3">
							<div className="p-2 bg-purple-100 rounded-lg">
								<span className="text-purple-600">📈</span>
							</div>
							<div>
								<div className="font-semibold text-gray-900">Crecimiento</div>
								<div className="text-2xl font-bold text-purple-600">
									+
									{Math.round(
										((data.uploads[data.uploads.length - 1] - data.uploads[0]) /
											data.uploads[0]) *
											100
									)}
									%
								</div>
							</div>
						</div>
						<p className="text-sm text-gray-700">
							Incremento en uso del sistema
						</p>
					</div>
				</div>
			</div>

			{/* Recommendations */}
			<div className="mt-6 p-4 bg-gray-50 rounded-xl">
				<h4 className="font-medium text-gray-900 mb-2">
					Recomendaciones basadas en datos:
				</h4>
				<ul className="space-y-2 text-sm text-gray-700">
					<li className="flex items-start gap-2">
						<span className="text-green-500 mt-1">✓</span>
						<span>Programar recordatorios para días de baja actividad</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-green-500 mt-1">✓</span>
						<span>
							Optimizar recursos en horarios pico (
							{data.labels[data.uploads.indexOf(maxUploads)]})
						</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-green-500 mt-1">✓</span>
						<span>
							Considerar incentivos para incrementar entregas tempranas
						</span>
					</li>
				</ul>
			</div>
		</div>
	);
};

export default ActivityTrends;
