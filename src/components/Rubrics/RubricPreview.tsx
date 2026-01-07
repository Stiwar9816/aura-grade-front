import React from "react";
import {Rubric} from "@/types";

interface RubricPreviewProps {
	rubric: Rubric;
}

const RubricPreview: React.FC<RubricPreviewProps> = ({rubric}) => {
	const [simulatedScores, setSimulatedScores] = React.useState<
		Record<string, number>
	>({});

	const handleSimulate = (criteriaId: string, score: number) => {
		setSimulatedScores((prev) => ({...prev, [criteriaId]: score}));
	};

	const totalSimulatedScore = rubric.criteria.reduce((acc, c) => {
		const score = simulatedScores[c.id] || 0;
		return acc + (score / c.maxScore) * (c.weight / 100) * 10;
	}, 0);

	const getPerformanceLevels = (maxScore: number) => {
		if (maxScore === 10) {
			return [
				{
					score: "9-10",
					label: "Excelente",
					color: "bg-green-100 text-green-800",
				},
				{score: "7-8", label: "Bueno", color: "bg-blue-100 text-blue-800"},
				{
					score: "5-6",
					label: "Aceptable",
					color: "bg-yellow-100 text-yellow-800",
				},
				{
					score: "0-4",
					label: "Necesita mejorar",
					color: "bg-red-100 text-red-800",
				},
			];
		}
		return [];
	};

	return (
		<div className="space-y-6">
			{/* Preview Header */}
			<div className="card p-6">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h2 className="text-2xl font-bold text-gray-900">{rubric.name}</h2>
						<p className="text-gray-600 mt-2">{rubric.description}</p>
					</div>
					<div className="text-right">
						<div className="text-sm text-gray-600">Estado</div>
						<div
							className={`px-3 py-1 rounded-full text-sm font-medium ${
								rubric.isActive
									? "bg-green-100 text-green-800"
									: "bg-gray-100 text-gray-800"
							}`}
						>
							{rubric.isActive ? "Activa" : "Inactiva"}
						</div>
					</div>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="text-center p-4 bg-gray-50 rounded-xl">
						<div className="text-2xl font-bold text-gray-900">
							{rubric.criteria.length}
						</div>
						<div className="text-sm text-gray-600">Criterios</div>
					</div>
					<div className="text-center p-4 bg-gray-50 rounded-xl">
						<div className="text-2xl font-bold text-electric-500">
							{rubric.totalWeight}%
						</div>
						<div className="text-sm text-gray-600">Ponderación</div>
					</div>
					<div className="text-center p-4 bg-gray-50 rounded-xl">
						<div className="text-2xl font-bold text-green-500">
							{rubric.criteria.reduce(
								(acc: any, c: any) => acc + c.maxScore,
								0
							)}
						</div>
						<div className="text-sm text-gray-600">Puntos totales</div>
					</div>
					<div className="text-center p-4 bg-gray-50 rounded-xl">
						<div className="text-2xl font-bold text-cyan-500">92%</div>
						<div className="text-sm text-gray-600">Precisión IA estimada</div>
					</div>
				</div>
			</div>

			{/* Preview Table */}
			<div className="card p-6">
				<h3 className="text-xl font-bold text-gray-900 mb-6">
					Vista Previa de Evaluación
				</h3>

				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-b border-gray-200">
								<th className="text-left py-3 px-4 font-semibold text-gray-700">
									Criterio
								</th>
								<th className="text-left py-3 px-4 font-semibold text-gray-700">
									Ponderación
								</th>
								<th className="text-left py-3 px-4 font-semibold text-gray-700">
									Puntos
								</th>
								<th className="text-left py-3 px-4 font-semibold text-gray-700">
									Niveles de Desempeño
								</th>
							</tr>
						</thead>
						<tbody>
							{rubric.criteria.map((criteria: any, index: number) => (
								<tr
									key={criteria.id}
									className="border-b border-gray-100 last:border-0"
								>
									<td className="py-4 px-4">
										<div className="font-medium text-gray-900">
											{criteria.name}
										</div>
										<div className="text-sm text-gray-600 mt-1">
											{criteria.description}
										</div>
									</td>
									<td className="py-4 px-4">
										<div className="flex items-center gap-2">
											<div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
												<div
													className="h-full bg-electric-500"
													style={{width: `${criteria.weight}%`}}
												/>
											</div>
											<span className="font-bold text-electric-500">
												{criteria.weight}%
											</span>
										</div>
									</td>
									<td className="py-4 px-4 text-center">
										<div className="flex flex-col items-center gap-2">
											<input
												type="number"
												min="0"
												max={criteria.maxScore}
												value={simulatedScores[criteria.id] || 0}
												onChange={(e) =>
													handleSimulate(
														criteria.id,
														parseFloat(e.target.value) || 0
													)
												}
												className="w-16 p-1 text-center border border-gray-200 rounded-lg focus:ring-2 focus:ring-electric-200 outline-none"
											/>
											<span className="text-xs text-gray-500">
												de {criteria.maxScore} pts
											</span>
										</div>
									</td>
									<td className="py-4 px-4">
										<div className="space-y-2">
											{getPerformanceLevels(criteria.maxScore).map(
												(level, idx) => (
													<div
														key={idx}
														className="flex items-center justify-between text-sm"
													>
														<span
															className={`px-2 py-1 rounded ${level.color}`}
														>
															{level.label}
														</span>
														<span className="text-gray-700">{level.score}</span>
													</div>
												)
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* AI Evaluation Preview */}
			<div className="card p-6">
				<h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
					<span>🤖</span>
					Simulación de Evaluación IA
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-4">
						<div className="p-4 bg-gradient-to-r from-electric-50 to-cyan-50 rounded-xl border border-electric-200">
							<h4 className="font-semibold text-gray-900 mb-2">
								Proceso de Evaluación
							</h4>
							<ul className="space-y-2 text-sm text-gray-700">
								<li className="flex items-center gap-2">
									<span className="text-green-500">✓</span>
									<span>Análisis de texto completo</span>
								</li>
								<li className="flex items-center gap-2">
									<span className="text-green-500">✓</span>
									<span>Comparación con criterios establecidos</span>
								</li>
								<li className="flex items-center gap-2">
									<span className="text-green-500">✓</span>
									<span>Cálculo ponderado de puntuaciones</span>
								</li>
								<li className="flex items-center gap-2">
									<span className="text-green-500">✓</span>
									<span>Generación de feedback detallado</span>
								</li>
							</ul>
						</div>

						<div className="p-4 bg-gray-50 rounded-xl">
							<h4 className="font-semibold text-gray-900 mb-2">
								Tiempo Estimado
							</h4>
							<div className="flex items-center justify-between">
								<div>
									<div className="text-2xl font-bold text-cyan-500">15-30s</div>
									<div className="text-sm text-gray-600">por evaluación</div>
								</div>
								<div className="text-right">
									<div className="text-lg font-bold text-gray-900">~95%</div>
									<div className="text-sm text-gray-600">precisión</div>
								</div>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
							<h4 className="font-semibold text-gray-900 mb-3 flex justify-between items-center">
								<span>Resultado Simulado</span>
								<button
									onClick={() => setSimulatedScores({})}
									className="text-xs text-gray-400 hover:text-red-500"
								>
									Reiniciar
								</button>
							</h4>
							<div className="space-y-3">
								<div className="flex justify-between items-end">
									<span className="text-gray-600">Puntuación Final:</span>
									<span
										className={`text-3xl font-bold ${
											totalSimulatedScore >= 6
												? "text-green-600"
												: "text-red-600"
										}`}
									>
										{totalSimulatedScore.toFixed(1)}/10
									</span>
								</div>
								<div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
									<div
										className={`h-full transition-all duration-500 ${
											totalSimulatedScore >= 6 ? "bg-green-500" : "bg-red-500"
										}`}
										style={{width: `${totalSimulatedScore * 10}%`}}
									/>
								</div>
								<div className="flex justify-between text-xs mt-2 pt-2 border-t border-gray-100">
									<span className="text-gray-500">Confianza IA estimada:</span>
									<span className="font-bold text-green-500">92%</span>
								</div>
							</div>
						</div>

						<button className="w-full btn-primary py-3 hover:scale-[1.02] transition-transform">
							<span className="flex items-center justify-center gap-2">
								<span>🚀</span>
								<span>Guardar y Publicar Rúbrica</span>
							</span>
						</button>
					</div>
				</div>
			</div>

			{/* Export Options */}
			<div className="card p-6">
				<h3 className="text-xl font-bold text-gray-900 mb-6">
					Exportar Rúbrica
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<button className="p-4 border-2 border-gray-300 rounded-xl hover:border-electric-500 hover:bg-electric-50 transition-colors group">
						<div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
							📊
						</div>
						<div className="font-medium text-gray-900 mb-1">CSV/Excel</div>
						<div className="text-sm text-gray-600">
							Para análisis estadístico
						</div>
					</button>
					<button className="p-4 border-2 border-gray-300 rounded-xl hover:border-electric-500 hover:bg-electric-50 transition-colors group">
						<div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
							📄
						</div>
						<div className="font-medium text-gray-900 mb-1">PDF</div>
						<div className="text-sm text-gray-600">
							Para compartir con estudiantes
						</div>
					</button>
					<button className="p-4 border-2 border-gray-300 rounded-xl hover:border-electric-500 hover:bg-electric-50 transition-colors group">
						<div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
							🔗
						</div>
						<div className="font-medium text-gray-900 mb-1">API JSON</div>
						<div className="text-sm text-gray-600">
							Para integración con sistemas
						</div>
					</button>
				</div>
			</div>
		</div>
	);
};

export default RubricPreview;
