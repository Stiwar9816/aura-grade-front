import React, {useEffect} from "react";

interface UXToastProps {
	type:
		| "success"
		| "error"
		| "info"
		| "warning"
		| "upload"
		| "processing"
		| "graded";
	message: string;
	duration?: number;
	onClose: () => void;
}

const UXToast: React.FC<UXToastProps> = ({
	type,
	message,
	duration = 5000,
	onClose,
}) => {
	useEffect(() => {
		const timer = setTimeout(onClose, duration);
		return () => clearTimeout(timer);
	}, [duration, onClose]);

	const getConfig = () => {
		switch (type) {
			case "success":
				return {
					icon: "✅",
					bgColor: "bg-green-500",
					title: "¡Éxito!",
					defaultMessage: "Acción completada correctamente",
				};
			case "error":
				return {
					icon: "😕",
					bgColor: "bg-red-500",
					title: "Oops...",
					defaultMessage: "Algo no salió como esperábamos",
				};
			case "info":
				return {
					icon: "ℹ️",
					bgColor: "bg-electric-500",
					title: "Información",
					defaultMessage: "Tenemos algo que contarte",
				};
			case "warning":
				return {
					icon: "⚠️",
					bgColor: "bg-yellow-500",
					title: "Atención",
					defaultMessage: "Hay algo que debes considerar",
				};
			case "upload":
				return {
					icon: "📤",
					bgColor: "bg-blue-500",
					title: "¡Subida exitosa!",
					defaultMessage: "Tu archivo está en buenas manos",
				};
			case "processing":
				return {
					icon: "🤖",
					bgColor: "bg-purple-500",
					title: "Procesando...",
					defaultMessage: "Nuestra IA está trabajando en ello",
				};
			case "graded":
				return {
					icon: "🎉",
					bgColor: "bg-gradient-to-r from-green-500 to-emerald-500",
					title: "¡Calificación lista!",
					defaultMessage: "Tu evaluación está completa",
				};
			default:
				return {
					icon: "🔔",
					bgColor: "bg-gray-500",
					title: "Notificación",
					defaultMessage: "Tienes una nueva notificación",
				};
		}
	};

	const config = getConfig();
	const displayMessage = message || config.defaultMessage;

	// Special micro-copy based on type
	const getMicroCopy = () => {
		switch (type) {
			case "upload":
				return "Nuestra IA está revisando tu trabajo. Esto tomará unos segundos...";
			case "processing":
				return "Estamos analizando cada detalle para darte el mejor feedback posible.";
			case "graded":
				return "¡Excelente trabajo! Revisa los comentarios detallados para seguir mejorando.";
			case "error":
				return "No pudimos procesar tu solicitud. Por favor, inténtalo de nuevo o contacta con soporte si el problema persiste.";
			default:
				return "";
		}
	};

	const microCopy = getMicroCopy();

	return (
		<div
			className={`${config.bgColor} text-white rounded-xl shadow-lg p-4 mb-3 max-w-md animate-slideIn`}
		>
			<div className="flex items-start gap-3">
				<div className="text-2xl flex-shrink-0">{config.icon}</div>

				<div className="flex-1">
					<div className="font-bold text-lg mb-1">{config.title}</div>
					<div className="font-medium">{displayMessage}</div>

					{microCopy && (
						<div className="text-sm opacity-90 mt-2">{microCopy}</div>
					)}

					{/* Progress bar for timed toasts */}
					{duration > 0 && (
						<div className="w-full h-1 bg-white/30 rounded-full mt-3 overflow-hidden">
							<div
								className="h-full bg-white animate-progress"
								style={{
									animation: `progress ${duration}ms linear forwards`,
								}}
							/>
						</div>
					)}
				</div>

				<button
					onClick={onClose}
					className="text-white/80 hover:text-white text-lg"
					aria-label="Cerrar notificación"
				>
					✕
				</button>
			</div>
		</div>
	);
};

export default UXToast;
