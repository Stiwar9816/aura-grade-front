import React from "react";
import {KPI} from "@/types";

interface KPIWidgetProps extends KPI {}

const KPIWidget: React.FC<KPIWidgetProps> = ({
	title,
	value,
	change,
	icon,
	color,
}) => {
	const colorClasses = {
		blue: "bg-electric-50 border-electric-200 text-electric-500",
		green: "bg-green-50 border-green-200 text-green-500",
		purple: "bg-purple-50 border-purple-200 text-purple-500",
		orange: "bg-orange-50 border-orange-200 text-orange-500",
		cyan: "bg-cyan-50 border-cyan-200 text-cyan-500",
	};

	const changeColor = change.startsWith("+")
		? "text-green-600 bg-green-50"
		: change.startsWith("-")
		? "text-red-600 bg-red-50"
		: "text-gray-600 bg-gray-100";

	return (
		<div className={`bento-item border-2 ${colorClasses[color]}`}>
			<div className="flex items-start justify-between">
				<div>
					<p className="text-sm font-medium text-gray-600">{title}</p>
					<p className="text-2xl font-bold mt-1">{value}</p>
				</div>
				<span className="text-xl">{icon}</span>
			</div>
			<div className="mt-2 flex items-center">
				<span
					className={`text-xs font-medium px-2 py-0.5 rounded-full ${changeColor}`}
				>
					{change}
				</span>
				<span className="text-xs text-gray-500 ml-2">vs. ant.</span>
			</div>
		</div>
	);
};

export default KPIWidget;
