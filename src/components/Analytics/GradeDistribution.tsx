import React from "react";

interface GradeDistributionProps {
	timeRange: "week" | "month" | "semester";
}

const GradeDistribution: React.FC<GradeDistributionProps> = ({timeRange}) => {
	const grades = [
		{
			range: "9-10",
			label: "A (Excelente)",
			count: 45,
			percentage: 30,
			color: "from-green-400 to-green-600",
			light: "bg-green-50",
		},
		{
			range: "8-8.9",
			label: "B (Bueno)",
			count: 60,
			percentage: 40,
			color: "from-blue-400 to-blue-600",
			light: "bg-blue-50",
		},
		{
			range: "7-7.9",
			label: "C (Aceptable)",
			count: 30,
			percentage: 20,
			color: "from-yellow-400 to-yellow-600",
			light: "bg-yellow-50",
		},
		{
			range: "6-6.9",
			label: "D (Regular)",
			count: 10,
			percentage: 7,
			color: "from-orange-400 to-orange-600",
			light: "bg-orange-50",
		},
		{
			range: "0-5.9",
			label: "F (Reprobado)",
			count: 5,
			percentage: 3,
			color: "from-red-400 to-red-600",
			light: "bg-red-50",
		},
	];

	const total = grades.reduce((sum, grade) => sum + grade.count, 0);

	return (
		<div className="card p-8 bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-white h-full group">
			<div className="flex items-center justify-between mb-8">
				<div>
					<h3 className="text-2xl font-black text-gray-900">Distribución</h3>
					<p className="text-gray-500 font-medium text-sm mt-1">
						{total} muestras procesadas {timeRange}
					</p>
				</div>
				<div className="text-right">
					<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
						Aprobación
					</p>
					<div className="text-3xl font-black text-green-600">97%</div>
				</div>
			</div>

			{/* Histogram */}
			<div className="space-y-6 mb-10">
				{grades.map((grade, index) => (
					<div key={index} className="group/grade transition-all duration-300">
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-3">
								<div
									className={`w-2 h-6 bg-gradient-to-b ${grade.color} rounded-full`}
								></div>
								<span className="font-bold text-gray-800 text-sm whitespace-nowrap">
									{grade.label}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-xs font-bold text-gray-400">
									{grade.range}
								</span>
								<div className="h-4 w-px bg-gray-200"></div>
								<span className="font-black text-gray-900 text-sm">
									{grade.percentage}%
								</span>
							</div>
						</div>
						<div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
							<div
								className={`h-full bg-gradient-to-r ${grade.color} rounded-full transition-all duration-1000 group-hover/grade:brightness-110 shadow-[0_0_12px_-2px_rgba(0,0,0,0.1)]`}
								style={{width: `${grade.percentage}%`}}
							/>
						</div>
					</div>
				))}
			</div>

			{/* Trend Sparklines Visualization */}
			<div className="mt-auto pt-8 border-t border-gray-100">
				<div className="flex items-center justify-between mb-6">
					<p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
						Histórico de Probabilidad
					</p>
					<div className="flex items-center gap-1.5">
						<span className="text-xs font-bold text-green-600">+2.4%</span>
						<span className="w-4 h-4 text-green-500 animate-bounce">📈</span>
					</div>
				</div>
				<div className="flex items-end h-24 gap-1.5 px-2">
					{[45, 52, 48, 65, 58, 75, 82, 70, 88, 95].map((value, idx) => (
						<div
							key={idx}
							className="flex-1 bg-gradient-to-t from-electric-600 via-electric-500 to-cyan-400 rounded-full transition-all duration-500 hover:scale-x-125 hover:brightness-110 cursor-pointer shadow-lg shadow-electric-500/10"
							style={{height: `${value}%`}}
						/>
					))}
				</div>
				<div className="flex justify-between text-[10px] font-medium text-gray-500 mt-4 px-1 uppercase tracking-tighter">
					<span>Inicio Periodo</span>
					<span>Consolidado Final</span>
				</div>
			</div>
		</div>
	);
};

export default GradeDistribution;
