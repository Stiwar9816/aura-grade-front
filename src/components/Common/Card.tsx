import React from "react";

interface CardProps {
	children: React.ReactNode;
	className?: string;
	noPadding?: boolean;
	hoverable?: boolean;
	onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
	children,
	className = "",
	noPadding = false,
	hoverable = false,
	onClick,
}) => {
	const baseStyles =
		"bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden";
	const paddingStyles = noPadding ? "" : "p-6";
	const interactionStyles =
		hoverable || onClick
			? "hover:border-electric-500 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.98]"
			: "";

	return (
		<div
			className={`${baseStyles} ${paddingStyles} ${interactionStyles} ${className}`}
			onClick={onClick}
		>
			{children}
		</div>
	);
};

export default Card;
