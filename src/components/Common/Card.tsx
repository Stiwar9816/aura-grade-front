import React from "react";
import type { CardProps } from "@/interface";

const Card: React.FC<CardProps> = ({
	children,
	className = "",
	noPadding = false,
	hoverable = false,
	onClick,
}) => {
	const baseStyles =
		"bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden";
	const paddingStyles = noPadding ? "" : "p-4 sm:p-5";
	const interactionStyles =
		hoverable || onClick
			? "hover:border-electric-400 transition-colors duration-200 cursor-pointer"
			: "";

	return (
		<div
			className={`${baseStyles} ${paddingStyles} ${interactionStyles} ${className}`}
			onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (event) => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onClick(); } } : undefined}
		>
			{children}
		</div>
	);
};

export default Card;
