import React from "react";
import {CriteriaTableProps} from "@/interface";

export const CriteriaTable: React.FC<CriteriaTableProps> = ({criteria}) => {
	const getScoreColor = (score: number, maxScore: number) => {
		const percentage = (score / maxScore) * 100;
		if (percentage >= 90) return "bg-green-100 text-green-800";
		if (percentage >= 70) return "bg-blue-100 text-blue-800";
		if (percentage >= 60) return "bg-yellow-100 text-yellow-800";
		return "bg-red-100 text-red-800";
	};

	return (
		<div className="card p-6">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-bold text-gray-900">
					Desglose por Criterio
				</h2>
				<span className="text-sm text-gray-600">
					{criteria.length} criterios evaluados
				</span>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-gray-200">
							<th className="text-left py-3 px-4 font-semibold text-gray-700">
								Criterio
							</th>
							<th className="text-left py-3 px-4 font-semibold text-gray-700">
								Puntaje
							</th>

							<th className="text-left py-3 px-4 font-semibold text-gray-700">
								Feedback
							</th>
						</tr>
					</thead>
					<tbody>
						{criteria.map((criterion, index) => (
							<tr
								key={criterion.id}
								className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
									index === criteria.length - 1 ? "border-b-0" : ""
								}`}
							>
								<td className="py-4 px-4">
									<div>
										<div className="font-medium text-gray-900">
											{criterion.name}
										</div>
										<div className="text-sm text-gray-600 mt-1">
											Máx: {criterion.maxScore} puntos
										</div>
									</div>
								</td>
								<td className="py-4 px-4">
									<div className="flex items-center gap-3">
										<span
											className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(
												criterion.score,
												criterion.maxScore,
											)}`}
										>
											{criterion.score.toFixed(1)}
										</span>
										<div className="text-gray-600">/ {criterion.maxScore}</div>
									</div>
									<div className="w-32 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
										<div
											className={`h-full rounded-full ${getScoreColor(
												criterion.score,
												criterion.maxScore,
											).replace("100", "500")}`}
											style={{
												width: `${
													(criterion.score / criterion.maxScore) * 100
												}%`,
											}}
										/>
									</div>
								</td>

								<td className="py-4 px-4">
									<div className="space-y-2">
										<div className="text-gray-700 text-sm">
											{criterion.feedback}
										</div>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Summary Footer */}
			<div className="mt-6 pt-6 border-t border-gray-200">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
					<div className="flex items-center gap-3">
						<div>
							<div className="font-medium text-gray-900">
								Resumen de Puntajes
							</div>
							<div className="text-sm text-gray-600">
								Puntaje Acumulado:{" "}
								{criteria.reduce((acc, c) => acc + c.score, 0).toFixed(1)} /{" "}
								{criteria.reduce((acc, c) => acc + c.maxScore, 0)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
