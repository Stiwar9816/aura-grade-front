import React, {useState} from "react";
import UploadZone from "../Upload/UploadZone";
import {Step} from "@/types";

const UploadWithStepper: React.FC = () => {
	const [currentStep, setCurrentStep] = useState<number>(0);
	const [steps, setSteps] = useState<Step[]>([
		{
			id: 1,
			title: "Preparando tu entrega",
			description: "Estamos listos para recibir tu trabajo",
			status: "pending",
			message: "¡Hola! Sube tu trabajo y te daremos feedback instantáneo",
		},
		{
			id: 2,
			title: "Subiendo archivo",
			description: "Transferencia segura en progreso",
			status: "pending",
			message: "Tu archivo está viajando de forma segura a nuestros servidores",
		},
		{
			id: 3,
			title: "Nuestra IA está leyendo",
			description: "Análisis de contenido en curso",
			status: "pending",
			message: "Estamos extrayendo y comprendiendo tus argumentos...",
		},
		{
			id: 4,
			title: "Evaluando según rúbrica",
			description: "Aplicando criterios de evaluación",
			status: "pending",
			message: "Comparando tu trabajo con los criterios establecidos",
		},
		{
			id: 5,
			title: "¡Feedback listo!",
			description: "Evaluación completada",
			status: "pending",
			message: "Tu evaluación está lista. ¡Vamos a ver los resultados!",
		},
	]);

	const simulateUploadProcess = (file: File) => {
		void file;
		setCurrentStep(1);
		updateStepStatus(1, "active", "Preparando todo para tu archivo...");

		// Simular subida
		setTimeout(() => {
			updateStepStatus(1, "completed", "¡Todo listo!");
			setCurrentStep(2);
			updateStepStatus(2, "active", "Subiendo tu archivo de forma segura...");

			setTimeout(() => {
				updateStepStatus(2, "completed", "Archivo recibido correctamente ✓");
				setCurrentStep(3);
				updateStepStatus(
					3,
					"active",
					"Nuestra IA está leyendo tus argumentos, esto tomará unos segundos..."
				);

				setTimeout(() => {
					updateStepStatus(3, "completed", "¡Contenido analizado con éxito!");
					setCurrentStep(4);
					updateStepStatus(
						4,
						"active",
						"Aplicando los criterios de la rúbrica..."
					);

					setTimeout(() => {
						updateStepStatus(4, "completed", "Evaluación completa ✓");
						setCurrentStep(5);
						updateStepStatus(
							5,
							"active",
							"¡Excelente trabajo! Tu evaluación está lista."
						);

						// Redirigir después de 2 segundos
						setTimeout(() => {
							window.location.href = "/evaluation";
						}, 2000);
					}, 3000);
				}, 4000);
			}, 2000);
		}, 1000);
	};

	const updateStepStatus = (
		stepId: number,
		status: Step["status"],
		message: string
	) => {
		setSteps((prev) =>
			prev.map((step) =>
				step.id === stepId ? {...step, status, message} : step
			)
		);
	};

	const getStepIcon = (status: Step["status"]) => {
		switch (status) {
			case "completed":
				return "✅";
			case "active":
				return "⏳";
			default:
				return "🔘";
		}
	};

	return (
		<div className="max-w-4xl mx-auto">
			{currentStep === 0 ? (
				<div className="card p-8">
					<div className="text-center mb-8">
						<div className="text-5xl mb-6 animate-float">🚀</div>
						<h1 className="text-3xl font-bold text-gray-900 mb-4">
							Estamos listos para tu entrega
						</h1>
						<p className="text-gray-600 text-lg">
							Sube tu trabajo y recibe feedback instantáneo de nuestra IA
							especializada
						</p>
					</div>

					<UploadZone onUploadStart={simulateUploadProcess} />

					<div className="mt-8 p-6 bg-gradient-to-r from-electric-50 to-cyan-50 rounded-2xl border border-electric-200">
						<h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
							<span>💭</span>
							<span>¿Qué sucederá después de subir?</span>
						</h3>
						<ul className="space-y-2 text-sm text-gray-700">
							<li className="flex items-start gap-2">
								<span className="text-green-500 mt-1">✓</span>
								<span>
									<strong>Seguridad:</strong> Tu archivo se procesa de forma
									privada y segura
								</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-green-500 mt-1">✓</span>
								<span>
									<strong>Análisis IA:</strong> Nuestro sistema entenderá y
									evaluará tu contenido
								</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-green-500 mt-1">✓</span>
								<span>
									<strong>Feedback detallado:</strong> Recibirás sugerencias
									específicas para mejorar
								</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-green-500 mt-1">✓</span>
								<span>
									<strong>Tiempo real:</strong> Todo en menos de 30 segundos
								</span>
							</li>
						</ul>
					</div>
				</div>
			) : (
				<div className="card p-8">
					<div className="text-center mb-8">
						<div className="text-5xl mb-6 animate-pulse">
							{currentStep < 5 ? "🤖" : "🎉"}
						</div>
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							{steps[currentStep - 1].title}
						</h1>
						<p className="text-gray-600 text-lg">
							{steps[currentStep - 1].message}
						</p>
					</div>

					{/* Stepper */}
					<div className="relative mb-8">
						{/* Progress Line */}
						<div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
							<div
								className="h-1 bg-gradient-to-r from-electric-500 to-cyan-500 transition-all duration-1000"
								style={{
									width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
								}}
							/>
						</div>

						{/* Steps */}
						<div className="relative flex justify-between">
							{steps.map((step) => (
								<div key={step.id} className="flex flex-col items-center">
									<div
										className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-3 z-10 ${
											step.status === "completed"
												? "bg-green-100 border-2 border-green-500"
												: step.status === "active"
												? "bg-electric-100 border-2 border-electric-500 animate-pulse"
												: "bg-gray-100 border-2 border-gray-300"
										}`}
									>
										{getStepIcon(step.status)}
									</div>
									<div className="text-center">
										<div
											className={`text-sm font-medium ${
												step.status === "completed"
													? "text-green-700"
													: step.status === "active"
													? "text-electric-700"
													: "text-gray-500"
											}`}
										>
											Paso {step.id}
										</div>
										<div className="text-xs text-gray-600 mt-1 max-w-[80px]">
											{step.description}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Status Message */}
					<div
						className={`p-6 rounded-2xl mb-6 ${
							currentStep < 5
								? "bg-blue-50 border border-blue-200"
								: "bg-green-50 border border-green-200"
						}`}
					>
						<div className="flex items-center gap-4">
							<div
								className={`text-3xl ${
									currentStep < 5
										? "text-blue-500 animate-pulse"
										: "text-green-500"
								}`}
							>
								{currentStep < 5 ? "⏳" : "✅"}
							</div>
							<div>
								<h3 className="font-semibold text-gray-900 mb-1">
									{currentStep < 5 ? "Procesando..." : "¡Completado!"}
								</h3>
								<p className="text-gray-700">
									{steps[currentStep - 1].message}
								</p>
								{currentStep < 5 && (
									<div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
										<span className="animate-pulse">●</span>
										<span>
											Tiempo estimado: {Math.max(0, (5 - currentStep) * 5)}{" "}
											segundos
										</span>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Time Estimate */}
					{currentStep < 5 && (
						<div className="bg-gray-50 rounded-xl p-6">
							<div className="flex items-center justify-between mb-4">
								<div>
									<div className="font-medium text-gray-900">
										Progreso total
									</div>
									<div className="text-sm text-gray-600">
										Casi estamos ahí...
									</div>
								</div>
								<div className="text-2xl font-bold text-electric-500">
									{Math.round((currentStep / steps.length) * 100)}%
								</div>
							</div>
							<div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
								<div
									className="h-full bg-gradient-to-r from-electric-500 to-cyan-500 transition-all duration-500"
									style={{width: `${(currentStep / steps.length) * 100}%`}}
								/>
							</div>
							<div className="flex justify-between text-xs text-gray-500 mt-2">
								<span>Inicio</span>
								<span>~30 segundos</span>
								<span>Final</span>
							</div>
						</div>
					)}

					{/* Micro-copy motivacional */}
					<div className="mt-8 text-center">
						<p className="text-gray-600 italic">
							{currentStep < 5
								? "Relájate, nuestra IA está trabajando duro para darte el mejor feedback..."
								: "¡Excelente! Tu evaluación está lista. Prepárate para insights valiosos."}
						</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default UploadWithStepper;
