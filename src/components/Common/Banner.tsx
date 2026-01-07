import React from "react";

interface BannerProps {
	title: string;
	description: string;
	icon?: string;
	className?: string;
}

const Banner: React.FC<BannerProps> = ({
	title,
	description,
	icon,
	className = "",
}) => {
	return (
		<div
			className={`bg-gradient-to-r from-electric-500 to-cyan-500 rounded-2xl p-8 text-white shadow-lg shadow-electric-500/20 ${className}`}
		>
			<div className="flex flex-col md:flex-row items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold mb-2">{title}</h1>
					<p className="text-cyan-100 font-medium">{description}</p>
				</div>
				{icon && (
					<div className="mt-4 md:mt-0">
						<div className="text-5xl mb-2 animate-float drop-shadow-lg">
							{icon}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Banner;
