import React from "react";

interface SectionHeaderProps {
	title: string;
	description?: string;
	actions?: React.ReactNode;
	className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
	title,
	description,
	actions,
	className = "",
}) => {
	return (
		<div
			className={`flex flex-col md:flex-row md:items-end justify-between gap-4 ${className}`}
		>
			<div>
				<div className="flex items-center gap-2 mb-1">
					<div className="w-2 h-6 bg-electric-500 rounded-full" />
					<h2 className="text-2xl font-black text-gray-900 tracking-tight">
						{title}
					</h2>
				</div>
				{description && (
					<p className="text-gray-500 font-medium max-w-2xl">{description}</p>
				)}
			</div>
			{actions && <div className="flex gap-3">{actions}</div>}
		</div>
	);
};

export default SectionHeader;
