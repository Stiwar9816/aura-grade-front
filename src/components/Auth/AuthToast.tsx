import React, {useEffect} from "react";
import {AuthToastProps} from "@/types";

export const AuthToast: React.FC<AuthToastProps> = ({
	type,
	message,
	onClose,
	duration = 5000,
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
					bgColor: "bg-gradient-to-r from-green-500 to-emerald-500",
					title: "¡Éxito!",
					defaultMessage: "Acción completada correctamente",
				};
			case "error":
				return {
					icon: "😕",
					bgColor: "bg-gradient-to-r from-red-500 to-pink-500",
					title: "Oops...",
					defaultMessage: "Algo no salió como esperábamos",
				};
			case "info":
				return {
					icon: "ℹ️",
					bgColor: "bg-gradient-to-r from-electric-500 to-cyan-500",
					title: "Información",
					defaultMessage: "Tenemos algo que contarte",
				};
			case "welcome":
				return {
					icon: "🎉",
					bgColor: "bg-gradient-to-r from-purple-500 to-pink-500",
					title: "¡Bienvenido!",
					defaultMessage: "Nos alegra tenerte aquí",
				};
		}
	};

	const config = getConfig();
	const displayMessage = message || config.defaultMessage;

	// Special micro-copy for auth
	const getAuthMicroCopy = () => {
		switch (type) {
			case "welcome":
				return "Tu cuenta ha sido creada exitosamente. ¡Prepárate para transformar la evaluación educativa!";
			case "success":
				return "Sesión iniciada correctamente. Redirigiendo a tu dashboard...";
			case "error":
				return "Por favor, verifica tus credenciales e intenta nuevamente. Si el problema persiste, contacta a nuestro soporte.";
			default:
				return "";
		}
	};

	const authMicroCopy = getAuthMicroCopy();

	return (
		<div
			className={`${config.bgColor} text-white rounded-2xl shadow-2xl p-6 max-w-md animate-slideIn`}
		>
			<div className="flex items-start gap-4">
				<div className="text-3xl flex-shrink-0 animate-bounce">
					{config.icon}
				</div>

				<div className="flex-1">
					<div className="font-bold text-xl mb-2">{config.title}</div>
					<div className="font-medium text-lg mb-3">{displayMessage}</div>

					{authMicroCopy && (
						<div className="text-sm opacity-90">{authMicroCopy}</div>
					)}

					{/* Progress bar */}
					{duration > 0 && (
						<div className="w-full h-1 bg-white/30 rounded-full mt-4 overflow-hidden">
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
					className="text-white/80 hover:text-white text-xl transition-colors"
					aria-label="Cerrar notificación"
				>
					✕
				</button>
			</div>
		</div>
	);
};
