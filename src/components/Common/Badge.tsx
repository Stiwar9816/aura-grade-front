import React from "react";

type BadgeVariant =
	| "default"
	| "success"
	| "warning"
	| "error"
	| "info"
	| "electric";

interface BadgeProps {
	children: React.ReactNode;
	variant?: BadgeVariant;
	className?: string;
}

const Badge: React.FC<BadgeProps> = ({
	children,
	variant = "default",
	className = "",
}) => {
	const variants = {
		default: "bg-gray-100 text-gray-700",
		success: "bg-green-50 text-green-700 border-green-100",
		warning: "bg-yellow-50 text-yellow-700 border-yellow-100",
		error: "bg-red-50 text-red-700 border-red-100",
		info: "bg-blue-50 text-blue-700 border-blue-100",
		electric: "bg-electric-50 text-electric-700 border-electric-100",
	};

	return (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-tight border ${variants[variant]} ${className}`}
		>
			{children}
		</span>
	);
};

export default Badge;
