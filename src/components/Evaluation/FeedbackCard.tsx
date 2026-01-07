import React from "react";

interface FeedbackCardProps {
	type: "strength" | "improvement" | "suggestion" | "warning";
	title: string;
	content: string;
	example?: string;
	icon?: string;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({
	type,
	title,
	content,
	example,
	icon,
}) => {
	const getConfig = () => {
		switch (type) {
			case "strength":
				return {
					color: "green",
					bgColor: "bg-green-50",
					borderColor: "border-green-200",
					icon: icon || "✅",
				};
			case "improvement":
				return {
					color: "yellow",
					bgColor: "bg-yellow-50",
					borderColor: "border-yellow-200",
					icon: icon || "📈",
				};
			case "suggestion":
				return {
					color: "blue",
					bgColor: "bg-blue-50",
					borderColor: "border-blue-200",
					icon: icon || "💡",
				};
			case "warning":
				return {
					color: "red",
					bgColor: "bg-red-50",
					borderColor: "border-red-200",
					icon: icon || "⚠️",
				};
		}
	};

	const config = getConfig();

	return (
		<div
			className={`${config.bgColor} border ${config.borderColor} rounded-xl p-5`}
		>
			<div className="flex items-start gap-4">
				<div className={`p-2 bg-${config.color}-100 rounded-lg flex-shrink-0`}>
					<span className="text-xl">{config.icon}</span>
				</div>

				<div className="flex-1">
					<h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
					<p className="text-gray-700 mb-3">{content}</p>

					{example && (
						<div className="mt-4 pt-4 border-t border-gray-200">
							<div className="text-sm font-medium text-gray-900 mb-2">
								Ejemplo:
							</div>
							<div className="bg-white border border-gray-200 rounded-lg p-3 text-gray-600 text-sm">
								{example}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default FeedbackCard;
