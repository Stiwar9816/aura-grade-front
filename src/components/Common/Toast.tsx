import React, {useEffect} from "react";

interface ToastProps {
	message: string;
	type: "success" | "error" | "info" | "warning";
	duration?: number;
	onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
	message,
	type,
	duration = 5000,
	onClose,
}) => {
	useEffect(() => {
		const timer = setTimeout(() => {
			onClose();
		}, duration);

		return () => clearTimeout(timer);
	}, [duration, onClose]);

	const getConfig = () => {
		switch (type) {
			case "success":
				return {
					icon: "✅",
					bgColor: "bg-green-500",
					textColor: "text-white",
				};
			case "error":
				return {
					icon: "❌",
					bgColor: "bg-red-500",
					textColor: "text-white",
				};
			case "info":
				return {
					icon: "ℹ️",
					bgColor: "bg-electric-500",
					textColor: "text-white",
				};
			case "warning":
				return {
					icon: "⚠️",
					bgColor: "bg-yellow-500",
					textColor: "text-white",
				};
		}
	};

	const config = getConfig();

	return (
		<div
			className={`${config.bgColor} ${config.textColor} rounded-xl shadow-lg p-4 mb-3 flex items-center justify-between animate-slideIn`}
		>
			<div className="flex items-center gap-3">
				<span className="text-xl">{config.icon}</span>
				<span className="font-medium">{message}</span>
			</div>
			<button onClick={onClose} className="text-white hover:text-gray-200 ml-4">
				✕
			</button>
		</div>
	);
};

export default Toast;
