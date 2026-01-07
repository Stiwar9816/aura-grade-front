import React from "react";

interface SkeletonLoaderProps {
	type?: "dashboard" | "table" | "card" | "list";
	count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
	type = "dashboard",
	count = 1,
}) => {
	if (type === "dashboard") {
		return (
			<div className="p-6 space-y-6">
				{/* Header */}
				<div className="flex justify-between items-center">
					<div className="h-10 bg-gray-200 rounded-xl w-64 skeleton"></div>
					<div className="h-10 bg-gray-200 rounded-xl w-32 skeleton"></div>
				</div>

				{/* KPI Grid */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="card p-6">
							<div className="h-6 bg-gray-200 rounded w-24 skeleton mb-4"></div>
							<div className="h-10 bg-gray-200 rounded w-16 skeleton mb-2"></div>
							<div className="h-4 bg-gray-200 rounded w-32 skeleton"></div>
						</div>
					))}
				</div>

				{/* Content */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2 space-y-4">
						<div className="card p-6">
							<div className="h-6 bg-gray-200 rounded w-32 skeleton mb-6"></div>
							<div className="space-y-3">
								{[...Array(3)].map((_, i) => (
									<div
										key={i}
										className="h-20 bg-gray-200 rounded-lg skeleton"
									></div>
								))}
							</div>
						</div>
					</div>
					<div className="lg:col-span-1">
						<div className="card p-6">
							<div className="h-6 bg-gray-200 rounded w-32 skeleton mb-6"></div>
							<div className="space-y-3">
								{[...Array(4)].map((_, i) => (
									<div
										key={i}
										className="h-16 bg-gray-200 rounded-lg skeleton"
									></div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (type === "table") {
		return (
			<div className="card p-6 space-y-4">
				<div className="h-8 bg-gray-200 rounded w-48 skeleton"></div>
				<div className="space-y-3">
					{[...Array(5)].map((_, i) => (
						<div key={i} className="h-16 bg-gray-200 rounded-lg skeleton"></div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{[...Array(count)].map((_, i) => (
				<div key={i} className="h-20 bg-gray-200 rounded-lg skeleton"></div>
			))}
		</div>
	);
};

export default SkeletonLoader;
