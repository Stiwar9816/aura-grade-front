import React from "react";
import {EvaluationSummaryProps} from "@/interface";

export const EvaluationSummary: React.FC<EvaluationSummaryProps> = ({
	score,
	maxScore,
	feedback,
	evaluationDate,
}) => {

	return (
		<div className="card p-6 mb-8">
			<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="w-full shrink-0 rounded-lg border border-electric-100 bg-electric-50 p-5 md:w-40">
                    <p className="text-xs font-medium text-electric-700">Calificación</p>
                    <p className="mt-2 text-4xl font-semibold tabular-nums text-electric-800">{score.toFixed(1)} <span className="text-base font-normal text-electric-700">/ {maxScore}</span></p>
                </div>

				{/* Feedback Section */}
				<div className="flex-1">
					<div className="flex items-center gap-3 mb-4">
						<h2 className="text-2xl font-bold text-gray-900">
							Resumen de evaluación
						</h2>
					</div>

					<div className="bg-gray-100 rounded-xl p-5">
						<div className="flex items-start gap-3">
							<div>
								<h3 className="font-semibold text-gray-900 mb-2">
									Observaciones de la evaluación
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
