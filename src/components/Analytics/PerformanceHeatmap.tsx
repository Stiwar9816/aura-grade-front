import React from "react";

interface PerformanceHeatmapProps {
	timeRange: "week" | "month" | "semester";
}

const PerformanceHeatmap: React.FC<PerformanceHeatmapProps> = ({timeRange}) => {
	const criteria = [
		"Argumentación",
		"Estructura",
		"Ortografía",
		"Originalidad",
		"Formato",
		"Investigación",
		"Coherencia",
		"Vocabulario",
		"Citas",
		"Creatividad",
	];

	const [heatmapData, setHeatmapData] = React.useState<
		{name: string; data: number[]}[]
	>([]);

	React.useEffect(() => {
		const generatedData = criteria.map((criterion) => ({
			name: criterion,
			data: Array.from({length: 10}, () => Math.floor(Math.random() * 100)),
		}));
		setHeatmapData(generatedData);
	}, []);

	const weeks = [
		"Sem 1",
		"Sem 2",
		"Sem 3",
		"Sem 4",
		"Sem 5",
		"Sem 6",
		"Sem 7",
		"Sem 8",
		"Sem 9",
		"Sem 10",
	];

	const getColor = (value: number) => {
		// HSL Scale: 0 is red, 120 is green.
		// We can map 0-100 to 0-120 (approx)
		const hue = Math.pow(value / 100, 1.5) * 140; // exponential for better "green" range
		return `hsl(${hue}, 75%, 45%)`;
	};

	return (
		<div className="card p-4 md:p-8 bg-white/80 backdrop-blur-md border border-white shadow-xl rounded-[2.5rem] relative overflow-hidden group">
			{/* Decorative Background Aura */}
			<div className="absolute -top-24 -right-24 w-64 h-64 bg-electric-500/5 rounded-full blur-3xl -z-10 group-hover:bg-electric-500/10 transition-colors duration-700"></div>

			<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
				<div>
					<h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
						Mapa de Calor de Competencias
					</h3>
					<p className="text-gray-500 mt-1 font-medium">
						Progreso longitudinal por criterio de evaluación
					</p>
				</div>
				<div className="flex items-center gap-6 p-3 bg-gray-50/50 rounded-2xl border border-gray-100">
					<div className="flex items-center gap-2">
						<span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
							Escala
						</span>
						<div className="w-32 h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 shadow-inner"></div>
					</div>
					<div className="flex gap-4">
						<div className="flex items-center gap-1.5">
							<span className="w-2 h-2 rounded-full bg-red-500"></span>
							<span className="text-[10px] font-bold text-gray-600">
								CRÍTICO
							</span>
						</div>
						<div className="flex items-center gap-1.5">
							<span className="w-2 h-2 rounded-full bg-green-500"></span>
							<span className="text-[10px] font-bold text-gray-600">
								DOMINIO
							</span>
						</div>
					</div>
				</div>
			</div>

			<div className="overflow-x-auto pb-4 custom-scrollbar">
				<table className="w-full border-separate border-spacing-y-2">
					<thead>
						<tr>
							<th className="text-left py-4 px-4 font-bold text-gray-400 text-[10px] uppercase tracking-widest sticky left-0 bg-white/90 backdrop-blur-sm z-10 rounded-l-2xl">
								Criterio Evaluador
							</th>
							{weeks.map((week, idx) => (
								<th
									key={idx}
									className="text-center py-4 px-2 font-bold text-gray-400 text-[10px] uppercase tracking-widest"
								>
									{week}
								</th>
							))}
							<th className="text-right py-4 px-4 font-bold text-gray-400 text-[10px] uppercase tracking-widest rounded-r-2xl">
								Global
							</th>
						</tr>
					</thead>
					<tbody className="divide-y-0">
						{heatmapData.map((row, rowIdx) => {
							const average = Math.round(
								row.data.reduce((a, b) => a + b, 0) / row.data.length
							);

							return (
								<tr
									key={rowIdx}
									className="group/row bg-white/50 hover:bg-white transition-all duration-300"
								>
									<td className="py-2 px-4 sticky left-0 bg-white/95 backdrop-blur-sm z-10 rounded-l-2xl shadow-[5px_0_15px_-5px_rgba(0,0,0,0.05)]">
										<div className="font-bold text-gray-800 text-sm group-hover/row:text-electric-500 transition-colors truncate max-w-[140px]">
											{row.name}
										</div>
									</td>

									{row.data.map((value, colIdx) => (
										<td key={colIdx} className="py-2 px-1">
											<div className="relative group/cell">
												<div
													className="w-full h-10 rounded-xl transition-all duration-500 hover:scale-[1.15] hover:z-20 hover:shadow-xl hover:shadow-black/5 cursor-pointer flex items-center justify-center"
													style={{
														backgroundColor: getColor(value),
														boxShadow: `inset 0 2px 4px rgba(255,255,255,0.2), 0 4px 6px -1px rgba(0,0,0,0.06)`,
													}}
												>
													<span className="text-[10px] font-black text-white mix-blend-overlay">
														{value}
													</span>
												</div>

												{/* Professional Tooltip */}
												<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 p-3 bg-gray-950/90 backdrop-blur-md rounded-2xl shadow-2xl opacity-0 invisible group-hover/cell:opacity-100 group-hover/cell:visible transition-all duration-300 z-50 pointer-events-none">
													<div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
														{weeks[colIdx]}
													</div>
													<div className="text-white font-bold mb-2">
														{row.name}
													</div>
													<div className="flex items-end gap-2">
														<div className="text-2xl font-black text-white">
															{value}%
														</div>
														<div
															className={`text-[10px] font-bold pb-1 ${
																value >= 60
																	? "text-green-500"
																	: "text-orange-500"
															}`}
														>
															{value >= 80
																? "DOMINIO"
																: value >= 60
																? "COMPETENTE"
																: "EN DESARROLLO"}
														</div>
													</div>
													<div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-950/90"></div>
												</div>
											</div>
										</td>
									))}

									<td className="py-2 px-4 rounded-r-2xl">
										<div
											className="w-full h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg group-hover/row:scale-110 transition-transform"
											style={{
												backgroundColor: getColor(average),
												filter: "brightness(0.9)",
											}}
										>
											{average}%
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			<div className="mt-6 pt-6 border-t border-gray-200">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="text-center p-4">
						<div className="text-lg font-bold text-green-600">
							{
								heatmapData.filter(
									(r) => r.data.reduce((a, b) => a + b, 0) / r.data.length >= 80
								).length
							}
						</div>
						<div className="text-sm text-gray-600">
							Criterios con excelente desempeño
						</div>
					</div>
					<div className="text-center p-4">
						<div className="text-lg font-bold text-red-600">
							{
								heatmapData.filter(
									(r) => r.data.reduce((a, b) => a + b, 0) / r.data.length < 40
								).length
							}
						</div>
						<div className="text-sm text-gray-600">
							Criterios que requieren atención
						</div>
					</div>
					<div className="text-center p-4">
						<div className="text-lg font-bold text-electric-500">
							{Math.round(
								heatmapData.reduce(
									(total, row) =>
										total +
										row.data.reduce((a, b) => a + b, 0) / row.data.length,
									0
								) / heatmapData.length
							)}
							%
						</div>
						<div className="text-sm text-gray-600">
							Promedio general de criterios
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PerformanceHeatmap;
