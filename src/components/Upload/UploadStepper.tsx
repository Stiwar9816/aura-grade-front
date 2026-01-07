import React from "react";

interface Step {
	id: number;
	title: string;
	description: string;
	icon?: string;
}

interface UploadStepperProps {
	steps: Step[];
	currentStep: number;
}

const UploadStepper: React.FC<UploadStepperProps> = ({steps, currentStep}) => {
	const getStepStatus = (stepId: number) => {
		if (stepId < currentStep) return "completed";
		if (stepId === currentStep) return "active";
		return "pending";
	};

	const getStepIcon = (stepId: number, stepIcon?: string) => {
		const status = getStepStatus(stepId);

		if (status === "completed") {
			return (
				<div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
					<span className="text-white text-lg">✓</span>
				</div>
			);
		}

		if (status === "active") {
			return (
				<div className="relative group">
					{/* Aura Glow Effect */}
					<div
						className={`absolute -inset-4 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse ${
							stepId === 2
								? "bg-cyan-400"
								: stepId === 3
								? "bg-purple-400"
								: "bg-electric-400"
						}`}
					></div>

					<div className="relative w-12 h-12 bg-gradient-to-br from-electric-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl shadow-electric-500/40 border border-white/20">
						<span className="text-white text-xl font-bold">
							{stepIcon || stepId}
						</span>
					</div>
					<div className="absolute inset-0 border-4 border-electric-400/30 rounded-full animate-ping"></div>
				</div>
			);
		}

		return (
			<div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
				<span className="text-gray-500 text-lg">{stepIcon || stepId}</span>
			</div>
		);
	};

	return (
		<div className="card p-6 mb-8">
			<div className="flex items-center justify-between mb-6">
				<div className="text-right">
					<div className="text-sm text-gray-600">Progreso</div>
					<div className="text-2xl font-bold text-electric-500">
						{Math.round((currentStep / steps.length) * 100)}%
					</div>
				</div>
			</div>

			{/* Desktop Stepper */}
			<div className="hidden md:block">
				<div className="relative">
					{/* Progress Bar */}
					<div className="absolute top-5 left-10 right-10 h-1 bg-gray-200 -z-10">
						<div
							className="h-full bg-gradient-to-r from-electric-500 to-cyan-500 transition-all duration-500"
							style={{
								width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
							}}
						/>
					</div>

					{/* Steps */}
					<div className="flex justify-between">
						{steps.map((step, index) => {
							const status = getStepStatus(index + 1);

							return (
								<div
									key={step.id}
									className="flex flex-col items-center relative"
									style={{width: `${100 / steps.length}%`}}
								>
									{/* Step Circle */}
									<div className="mb-4">{getStepIcon(step.id, step.icon)}</div>

									{/* Step Content */}
									<div className="text-center px-2">
										<div
											className={`font-semibold mb-1 ${
												status === "completed"
													? "text-green-600"
													: status === "active"
													? "text-electric-500"
													: "text-gray-500"
											}`}
										>
											{step.title}
										</div>
										<div className="text-sm text-gray-600">
											{step.description}
										</div>
									</div>

									{/* Status Badge */}
									<div className="mt-3">
										<span
											className={`text-xs px-3 py-1 rounded-full ${
												status === "completed"
													? "bg-green-100 text-green-800"
													: status === "active"
													? "bg-electric-100 text-electric-800 animate-pulse"
													: "bg-gray-100 text-gray-800"
											}`}
										>
											{status === "completed"
												? "Completado"
												: status === "active"
												? "En progreso"
												: "Pendiente"}
										</span>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* Mobile Stepper */}
			<div className="md:hidden">
				<div className="space-y-6">
					{steps.map((step, index) => {
						const status = getStepStatus(index + 1);
						const isActive = status === "active";
						const isCompleted = status === "completed";

						return (
							<div
								key={step.id}
								className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
									isActive
										? "border-electric-500 bg-electric-50"
										: isCompleted
										? "border-green-500 bg-green-50"
										: "border-gray-200"
								}`}
							>
								{/* Step Icon */}
								<div className="flex-shrink-0">
									{getStepIcon(step.id, step.icon)}
								</div>

								{/* Step Content */}
								<div className="flex-1">
									<div className="flex items-center justify-between">
										<div>
											<div
												className={`font-semibold ${
													isActive
														? "text-electric-500"
														: isCompleted
														? "text-green-600"
														: "text-gray-700"
												}`}
											>
												{step.title}
											</div>
											<div className="text-sm text-gray-600 mt-1">
												{step.description}
											</div>
										</div>
										<div>
											<span
												className={`text-xs px-3 py-1 rounded-full ${
													isCompleted
														? "bg-green-100 text-green-800"
														: isActive
														? "bg-electric-100 text-electric-800"
														: "bg-gray-100 text-gray-800"
												}`}
											>
												{isCompleted ? "✓" : `${index + 1}/${steps.length}`}
											</span>
										</div>
									</div>

									{/* Progress for active step */}
									{isActive && index === currentStep - 1 && (
										<div className="mt-3">
											<div className="flex justify-between text-xs text-gray-600 mb-1">
												<span>Procesando...</span>
												<span>~30s</span>
											</div>
											<div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
												<div className="h-full bg-gradient-to-r from-electric-500 to-cyan-500 animate-progress"></div>
											</div>
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* AI Processing Details - Professional Terminal */}
			{(currentStep === 2 || currentStep === 3) && (
				<div className="mt-10 p-6 bg-gray-950 rounded-[2.5rem] border border-gray-800 shadow-2xl overflow-hidden relative">
					<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

					<div className="flex items-center justify-between mb-4 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 border-b border-gray-900 pb-3">
						<div className="flex items-center gap-2">
							<span className="w-2 h-2 bg-green-500 rounded-full"></span>
							<span>AI_ENGINE_CORE_V2</span>
						</div>
						<div className="flex gap-2">
							<span className="px-2 py-0.5 bg-gray-900 rounded border border-gray-800">
								LIVE_THREAD
							</span>
							<span className="px-2 py-0.5 bg-cyan-900/30 text-cyan-400 rounded border border-cyan-800/30">
								ENCRYPTED
							</span>
						</div>
					</div>

					<div className="space-y-3 font-mono text-sm leading-relaxed">
						{currentStep === 2 ? (
							<>
								<div className="flex items-start gap-3 animate-in fade-in slide-in-from-left duration-500">
									<span className="text-cyan-600 shrink-0">01</span>
									<span className="text-gray-300">
										Iniciando motor OCR de alta precisión...{" "}
										<span className="text-cyan-500 text-xs">[OK]</span>
									</span>
								</div>
								<div className="flex items-start gap-3 animate-in fade-in slide-in-from-left delay-300 duration-500">
									<span className="text-cyan-600 shrink-0">02</span>
									<span className="text-gray-300">
										Extrayendo vectores de texto y jerarquía visual...
									</span>
								</div>
								<div className="flex items-start gap-3 italic text-cyan-400/60 animate-pulse">
									<span className="text-cyan-600 shrink-0">03</span>
									<span>
										Analizando regularidad sintáctica en bloques B04...
									</span>
								</div>
							</>
						) : (
							<>
								<div className="flex items-start gap-3 animate-in fade-in slide-in-from-left duration-500">
									<span className="text-purple-600 shrink-0">01</span>
									<span className="text-gray-300">
										Parámetros de rúbrica sincronizados.{" "}
										<span className="text-purple-500 text-xs">[SYNC]</span>
									</span>
								</div>
								<div className="flex items-start gap-3 animate-in fade-in slide-in-from-left delay-300 duration-500">
									<span className="text-purple-600 shrink-0">02</span>
									<span className="text-gray-300">
										Mapeando respuestas de usuario vs criterios de evaluación...
									</span>
								</div>
								<div className="flex items-start gap-3 italic text-purple-400/60 animate-pulse text-xs">
									<span className="text-purple-600 shrink-0">03</span>
									<span>
										Generando inferencias de retroalimentación pedagógica...
									</span>
								</div>
							</>
						)}
					</div>

					{/* Background Decoration */}
					<div className="absolute top-1/2 -right-8 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -z-10"></div>
				</div>
			)}

			{/* Status Summary */}
			<div className="mt-8 pt-6 border-t border-gray-100">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="text-center p-4 bg-gray-50 rounded-xl">
						<div className="text-lg font-bold text-gray-900">
							{currentStep > 0 ? currentStep - 1 : 0}
						</div>
						<div className="text-sm text-gray-600 mt-1">Pasos completados</div>
					</div>
					<div className="text-center p-4 bg-gray-50 rounded-xl">
						<div className="text-lg font-bold text-electric-500">
							{currentStep > 0 && currentStep <= steps.length ? 1 : 0}
						</div>
						<div className="text-sm text-gray-600 mt-1">Paso actual</div>
					</div>
					<div className="text-center p-4 bg-gray-50 rounded-xl">
						<div className="text-lg font-bold text-gray-900">
							{steps.length - currentStep}
						</div>
						<div className="text-sm text-gray-600 mt-1">Pasos restantes</div>
					</div>
				</div>
			</div>

			{/* Estimated Time */}
			{currentStep > 0 && currentStep < steps.length && (
				<div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-electric-50 rounded-xl border border-cyan-200">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-cyan-100 rounded-lg">
								<span className="text-cyan-600">⏱️</span>
							</div>
							<div>
								<div className="font-medium text-gray-900">
									Tiempo estimado restante
								</div>
								<div className="text-sm text-gray-600">
									{Math.max(0, (steps.length - currentStep) * 15)} segundos
									aproximadamente
								</div>
							</div>
						</div>
						<div className="text-2xl font-bold text-cyan-600">
							{Math.round((currentStep / steps.length) * 100)}%
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default UploadStepper;
