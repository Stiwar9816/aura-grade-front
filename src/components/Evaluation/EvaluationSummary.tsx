import React from "react";
import {EvaluationSummaryProps} from "@/interface";
import {gradeToPercentage} from "@/utils/gradeScale";

export const EvaluationSummary: React.FC<EvaluationSummaryProps> = ({
	score,
	maxScore,
	feedback,
	evaluationDate,
}) => {
	const percentage = gradeToPercentage(score) ?? 0;

	return (
		<div className="card p-6 mb-8">
			<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
				{/* Score Circle */}
				<div className="flex-shrink-0">
					<div className="relative w-32 h-32">
						<svg className="w-full h-full" viewBox="0 0 100 100">
							{/* Background circle */}
							<circle
								cx="50"
								cy="50"
								r="45"
								fill="none"
								stroke="#F3F4F6"
								strokeWidth="8"
							/>
							{/* Progress circle */}
							<circle
								cx="50"
								cy="50"
								r="45"
								fill="none"
								stroke="url(#gradient)"
								strokeWidth="8"
								strokeLinecap="round"
								strokeDasharray={`${percentage * 2.83} 283`}
								transform="rotate(-90 50 50)"
							/>
							<defs>
								<linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
									<stop offset="0%" stopColor="#0066FF" />
									<stop offset="100%" stopColor="#00D4FF" />
								</linearGradient>
							</defs>
						</svg>
						<div className="absolute inset-0 flex flex-col items-center justify-center">
							<span className="text-3xl font-bold text-gray-900">
								{score.toFixed(1)}
							</span>
							<span className="text-gray-600">/{maxScore}</span>
						</div>
					</div>
				</div>

				{/* Feedback Section */}
				<div className="flex-1">
					<div className="flex items-center gap-3 mb-4">
						<h2 className="text-2xl font-bold text-gray-900">
							Resumen de Evaluación
						</h2>
					</div>

					<div className="bg-gray-100 rounded-xl p-5">
						<div className="flex items-start gap-3">
							<div>
								<h3 className="font-semibold text-gray-900 mb-2">
									Feedback General
								</h3>
								<p className="text-gray-700 leading-relaxed">{feedback}</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Time Stamp */}
			<div className="mt-6 pt-6 border-t border-gray-200">
				<div className="flex items-center justify-between text-sm text-gray-500">
					<div className="flex items-center gap-2">
						<span>
							Evaluación generada el{" "}
							{evaluationDate
								? new Date(evaluationDate).toLocaleDateString("es-ES", {
										day: "numeric",
										month: "long",
										year: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									})
								: "Fecha desconocida"}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};
