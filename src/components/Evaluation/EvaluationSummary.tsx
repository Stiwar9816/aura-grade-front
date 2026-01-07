import React from "react";

interface EvaluationSummaryProps {
	score: number;
	maxScore: number;
	feedback: string;
}

const EvaluationSummary: React.FC<EvaluationSummaryProps> = ({
	score,
	maxScore,
	feedback,
}) => {
	const percentage = (score / maxScore) * 100;

	const getScoreColor = () => {
		if (percentage >= 90) return "text-green-600 bg-green-50 border-green-200";
		if (percentage >= 70) return "text-blue-600 bg-blue-50 border-blue-200";
		if (percentage >= 60)
			return "text-yellow-600 bg-yellow-50 border-yellow-200";
		return "text-red-600 bg-red-50 border-red-200";
	};

	const getGradeLetter = () => {
		if (percentage >= 90) return "A";
		if (percentage >= 80) return "B";
		if (percentage >= 70) return "C";
		if (percentage >= 60) return "D";
		return "F";
	};

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
							<div
								className={`mt-1 px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor()}`}
							>
								{getGradeLetter()}
							</div>
						</div>
					</div>
				</div>

				{/* Feedback Section */}
				<div className="flex-1">
					<div className="flex items-center gap-3 mb-4">
						<div className="p-2 bg-gradient-to-r from-electric-500 to-cyan-500 rounded-lg">
							<span className="text-white text-xl">📋</span>
						</div>
						<h2 className="text-2xl font-bold text-gray-900">
							Resumen de Evaluación
						</h2>
					</div>

					<div className="bg-gray-50 rounded-xl p-5">
						<div className="flex items-start gap-3">
							<span className="text-electric-500 text-xl mt-1">💡</span>
							<div>
								<h3 className="font-semibold text-gray-900 mb-2">
									Feedback General
								</h3>
								<p className="text-gray-700 leading-relaxed">{feedback}</p>
							</div>
						</div>
					</div>

					{/* Quick Stats */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
						<div className="text-center p-3 bg-gray-50 rounded-lg">
							<div className="text-lg font-bold text-electric-500">92%</div>
							<div className="text-xs text-gray-600">Coherencia</div>
						</div>
						<div className="text-center p-3 bg-gray-50 rounded-lg">
							<div className="text-lg font-bold text-green-500">88%</div>
							<div className="text-xs text-gray-600">Originalidad</div>
						</div>
						<div className="text-center p-3 bg-gray-50 rounded-lg">
							<div className="text-lg font-bold text-cyan-500">95%</div>
							<div className="text-xs text-gray-600">Formato</div>
						</div>
						<div className="text-center p-3 bg-gray-50 rounded-lg">
							<div className="text-lg font-bold text-deep-purple">85%</div>
							<div className="text-xs text-gray-600">Investigación</div>
						</div>
					</div>
				</div>
			</div>

			{/* Time Stamp */}
			<div className="mt-6 pt-6 border-t border-gray-200">
				<div className="flex items-center justify-between text-sm text-gray-500">
					<div className="flex items-center gap-2">
						<span>🕒</span>
						<span>
							Evaluación generada el{" "}
							{new Date().toLocaleDateString("es-ES", {
								day: "numeric",
								month: "long",
								year: "numeric",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span>🤖</span>
						<span>Modelo: GPT-4 Edu v2.1</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EvaluationSummary;
