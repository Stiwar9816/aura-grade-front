import React from "react";

interface AIScoreMeterProps {
	score: number;
	maxScore: number;
	label: string;
	description?: string;
}

const AIScoreMeter: React.FC<AIScoreMeterProps> = ({
	score,
	maxScore,
	label,
	description,
}) => {
	const percentage = (score / maxScore) * 100;

	const getGradientColor = () => {
		if (percentage >= 80) return "from-green-500 to-green-400";
		if (percentage >= 60) return "from-yellow-500 to-yellow-400";
		if (percentage >= 40) return "from-orange-500 to-orange-400";
		return "from-red-500 to-red-400";
	};

	return (
		<div className="bg-white border border-gray-200 rounded-xl p-5">
			<div className="flex justify-between items-start mb-4">
				<div>
					<h3 className="font-semibold text-gray-900">{label}</h3>
					{description && (
						<p className="text-sm text-gray-600 mt-1">{description}</p>
					)}
				</div>
				<div className="text-right">
					<div className="text-2xl font-bold text-gray-900">
						{score.toFixed(1)}
					</div>
					<div className="text-sm text-gray-600">/{maxScore}</div>
				</div>
			</div>

			{/* Meter */}
			<div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
				<div
					className={`absolute h-full rounded-full bg-gradient-to-r ${getGradientColor()}`}
					style={{width: `${percentage}%`}}
				/>
			</div>

			{/* Markers */}
			<div className="flex justify-between text-xs text-gray-500 mt-2">
				<span>0</span>
				<span>{maxScore * 0.25}</span>
				<span>{maxScore * 0.5}</span>
				<span>{maxScore * 0.75}</span>
				<span>{maxScore}</span>
			</div>

			{/* Status */}
			<div className="flex items-center justify-between mt-4">
				<div
					className={`text-sm font-medium px-3 py-1 rounded-full ${
						percentage >= 80
							? "bg-green-100 text-green-800"
							: percentage >= 60
							? "bg-yellow-100 text-yellow-800"
							: percentage >= 40
							? "bg-orange-100 text-orange-800"
							: "bg-red-100 text-red-800"
					}`}
				>
					{percentage >= 80
						? "Excelente"
						: percentage >= 60
						? "Bueno"
						: percentage >= 40
						? "Regular"
						: "Necesita mejorar"}
				</div>
				<div className="text-sm text-gray-600">{percentage.toFixed(0)}%</div>
			</div>
		</div>
	);
};

export default AIScoreMeter;
