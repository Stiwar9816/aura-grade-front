import React from "react";

import type {GradeDistributionProps} from "@/interface";

export const GradeDistribution: React.FC<GradeDistributionProps> = ({
	data,
	approvalRate,
}) => {
	const getApprovalColor = (rate: string) => {
		const value = parseInt(rate) || 0;
		if (value >= 90) return "text-green-600";
		if (value >= 80) return "text-blue-600";
		if (value >= 70) return "text-yellow-600";
		if (value >= 60) return "text-orange-600";
		return "text-red-600";
	};

	return (
		<div className="card p-8 bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-white h-full group">
			{/* Header */}
			<div className="flex justify-between items-start mb-8">
				<div>
					<h3 className="text-2xl font-black text-gray-900">Distribución</h3>
					<p className="text-gray-500 font-medium text-sm mt-1">
						Rendimiento grupal por rangos
					</p>
				</div>
				<div className="text-right">
					<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
						Aprobación
					</p>
					<div
						className={`text-3xl font-black ${getApprovalColor(approvalRate)}`}
					>
						{approvalRate}
					</div>
				</div>
			</div>

			{/* Histogram */}
			<div className="space-y-6 mb-10">
				{data.map((grade, index) => (
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
		</div>
	);
};
