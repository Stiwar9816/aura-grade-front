import React from "react";
import type { SectionHeaderProps } from "@/interface";

const SectionHeader: React.FC<SectionHeaderProps> = ({
	title,
	description,
	actions,
	className = "",
	as: Heading = "h2",
}) => {
	return (
		<div
			className={`flex flex-col md:flex-row md:items-end justify-between gap-4 ${className}`}
		>
			<div>
				<div className="flex items-center gap-2 mb-1">

					<Heading className="text-2xl font-semibold text-gray-900 tracking-tight">
						{title}
					</Heading>
				</div>
				{description && (
					<p className="text-sm text-gray-600 max-w-2xl">{description}</p>
				)}
			</div>
			{actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
		</div>
	);
};

export default SectionHeader;
