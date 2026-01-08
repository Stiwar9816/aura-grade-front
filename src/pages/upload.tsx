import React, {useState} from "react";
import Layout from "@/components/Layout";
import UploadZone from "@/components/Upload/UploadZone";
import UploadStepper from "@/components/Upload/UploadStepper";
import Toast from "@/components/Common/Toast";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import {UserRole} from "@/types";

const UploadPage: React.FC = () => {
	const [currentStep, setCurrentStep] = useState<number>(0);
	const [uploadProgress, setUploadProgress] = useState<number>(0);
	const [file, setFile] = useState<File | null>(null);
	const [toasts, setToasts] = useState<
		Array<{
			id: number;
			message: string;
			type: "success" | "error" | "info" | "warning";
		}>
	>([]);

	const steps = [
		{
			id: 1,
			title: "Subir archivo",
			description: "Selecciona o arrastra tu documento",
			icon: "📤",
		},
		{
			id: 2,
			title: "Escaneando contenido",
			description: "IA está extrayendo texto",
			icon: "🔍",
		},
		{
			id: 3,
			title: "Evaluando con IA",
			description: "Analizando según rúbrica",
			icon: "🤖",
		},
		{
			id: 4,
			title: "Calificación lista",
			description: "Feedback generado",
			icon: "✅",
		},
	];

	const addToast = (
		message: string,
		type: "success" | "error" | "info" | "warning"
	) => {
		const id = Date.now();
		setToasts((prev) => [...prev, {id, message, type}]);

		setTimeout(() => {
			setToasts((prev) => prev.filter((toast) => toast.id !== id));
		}, 5000);
	};

	const handleUploadStart = (selectedFile: File) => {
		setFile(selectedFile);
		setCurrentStep(1);
		setUploadProgress(0);
		addToast("Iniciando subida del archivo...", "info");

		// Simular progreso de subida
		const uploadInterval = setInterval(() => {
			setUploadProgress((prev) => {
				const newProgress = prev + 10;
				if (newProgress >= 100) {
					clearInterval(uploadInterval);
					addToast("Archivo subido exitosamente", "success");
					setTimeout(() => startScanning(), 500);
					return 100;
				}
				return newProgress;
			});
		}, 200);
	};

	const startScanning = () => {
		setCurrentStep(2);
		addToast("Escaneando contenido del documento...", "info");

		setTimeout(() => {
			addToast("Texto extraído exitosamente", "success");
			setTimeout(() => startEvaluation(), 1000);
		}, 3000);
	};

	const startEvaluation = () => {
		setCurrentStep(3);
		addToast("Iniciando evaluación con IA...", "info");

		setTimeout(() => {
			addToast("Evaluación completada", "success");
			setTimeout(() => completeProcess(), 1500);
		}, 4000);
	};

	const completeProcess = () => {
		setCurrentStep(4);
		addToast("¡Evaluación lista! Redirigiendo...", "success");
	};

	const resetProcess = () => {
		setCurrentStep(0);
		setUploadProgress(0);
		setFile(null);
		addToast("Proceso reiniciado", "info");
	};

	return (
		<ProtectedRoute requiredRole={UserRole.STUDENT}>
			<Layout title="Centro de Entregas">
				<div className="max-w-6xl mx-auto">
					{/* Toast Notifications */}
					<div className="fixed top-4 right-4 z-50 max-w-md">
						{toasts.map((toast) => (
							<Toast
								key={toast.id}
								message={toast.message}
								type={toast.type}
								onClose={() =>
									setToasts((prev) => prev.filter((t) => t.id !== toast.id))
								}
							/>
						))}
					</div>

					{/* Stepper */}
					<UploadStepper steps={steps} currentStep={currentStep} />

					{/* Main Content */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Left Column - Upload Zone */}
						<div className="lg:col-span-12">
							{currentStep === 0 ? (
								<UploadZone onUploadStart={handleUploadStart} />
							) : (
								<div className="card p-4 md:p-6">
									<div className="flex flex-col items-center text-center">
										{/* Animated Icon */}
										<div className="mb-6 relative">
											<div
												className={`w-24 h-24 rounded-full flex items-center justify-center ${
													currentStep === 1
														? "bg-gradient-to-r from-electric-500 to-cyan-500"
														: currentStep === 2
														? "bg-gradient-to-r from-cyan-500 to-purple-500"
														: currentStep === 3
														? "bg-gradient-to-r from-purple-500 to-pink-500"
														: "bg-gradient-to-r from-green-500 to-emerald-500"
												}`}
											>
												<span className="text-white text-4xl">
													{steps[currentStep - 1].icon}
												</span>
											</div>

											{/* Progress Ring for Step 1 */}
											{currentStep === 1 && (
												<div className="absolute inset-0">
													<svg className="w-24 h-24" viewBox="0 0 100 100">
														<circle
															cx="50"
															cy="50"
															r="48"
															fill="none"
															stroke="rgba(255,255,255,0.3)"
															strokeWidth="4"
														/>
														<circle
															cx="50"
															cy="50"
															r="48"
															fill="none"
															stroke="white"
															strokeWidth="4"
															strokeLinecap="round"
															strokeDasharray={`${uploadProgress * 3.02} 302`}
															transform="rotate(-90 50 50)"
														/>
													</svg>
												</div>
											)}
										</div>

										{/* Step Title */}
										<h2 className="text-2xl font-bold text-gray-900 mb-2">
											{steps[currentStep - 1].title}
										</h2>
										<p className="text-gray-600 mb-8 max-w-md">
											{steps[currentStep - 1].description}
										</p>

										{/* File Info */}
										{file && (
											<div className="w-full max-w-md bg-gray-50 rounded-xl p-4 mb-6">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-3">
														<div className="p-2 bg-white rounded-lg">
															<span className="text-gray-700">
																{file.type.includes("pdf") ? "📄" : "📝"}
															</span>
														</div>
														<div className="text-left">
															<div className="font-medium text-gray-900 truncate max-w-xs">
																{file.name}
															</div>
															<div className="text-sm text-gray-600">
																{(file.size / 1024 / 1024).toFixed(2)} MB
															</div>
														</div>
													</div>
													<div
														className={`px-3 py-1 rounded-full text-sm font-medium ${
															currentStep === 4
																? "bg-green-100 text-green-800"
																: "bg-electric-100 text-electric-800"
														}`}
													>
														{currentStep === 4 ? "Completado" : "Procesando"}
													</div>
												</div>
											</div>
										)}

										{/* Progress Bar for Step 1 */}
										{currentStep === 1 && (
											<div className="w-full max-w-md mb-6">
												<div className="flex justify-between text-sm text-gray-600 mb-2">
													<span>Subiendo...</span>
													<span>{uploadProgress}%</span>
												</div>
												<div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
													<div
														className="h-full bg-gradient-to-r from-electric-500 to-cyan-500 transition-all duration-300"
														style={{width: `${uploadProgress}%`}}
													/>
												</div>
											</div>
										)}

										{/* Status Messages */}
										{currentStep === 2 && (
											<div className="w-full max-w-md space-y-4 mb-6">
												<div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
													<span className="text-blue-600 animate-pulse">
														🔍
													</span>
													<div className="text-left">
														<div className="font-medium text-gray-900">
															Extrayendo texto
														</div>
														<div className="text-sm text-gray-600">
															Analizando estructura del documento...
														</div>
													</div>
												</div>
												<div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
													<span className="text-purple-600">📊</span>
													<div className="text-left">
														<div className="font-medium text-gray-900">
															Detectando secciones
														</div>
														<div className="text-sm text-gray-600">
															Identificando introducción, desarrollo y
															conclusión...
														</div>
													</div>
												</div>
											</div>
										)}

										{/* Status Messages for Step 3 */}
										{currentStep === 3 && (
											<div className="w-full max-w-md space-y-4 mb-6">
												<div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
													<span className="text-purple-600 animate-pulse">
														🤖
													</span>
													<div className="text-left">
														<div className="font-medium text-gray-900">
															Evaluando con IA
														</div>
														<div className="text-sm text-gray-600">
															Comparando con rúbrica establecida...
														</div>
													</div>
												</div>
												<div className="grid grid-cols-2 gap-4">
													<div className="p-3 bg-white border border-gray-200 rounded-lg text-center">
														<div className="text-lg font-bold text-electric-500">
															5
														</div>
														<div className="text-sm text-gray-600">
															Criterios
														</div>
													</div>
													<div className="p-3 bg-white border border-gray-200 rounded-lg text-center">
														<div className="text-lg font-bold text-cyan-500">
															12
														</div>
														<div className="text-sm text-gray-600">
															Puntos analizados
														</div>
													</div>
												</div>
											</div>
										)}

										{/* Result Box for Step 4 */}
										{currentStep === 4 && (
											<div className="w-full max-w-md mb-6">
												<div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
													<div className="text-center">
														<div className="text-4xl mb-4 animate-bounce">
															🎉
														</div>
														<h3 className="text-xl font-bold text-gray-900 mb-2">
															¡Evaluación Completada!
														</h3>
														<p className="text-gray-600 mb-6">
															Tu trabajo ha sido evaluado exitosamente. Revisa
															los resultados detallados.
														</p>
														<div className="grid grid-cols-2 gap-4">
															<div className="text-center p-3 bg-white rounded-lg">
																<div className="text-2xl font-bold text-green-600">
																	8.7
																</div>
																<div className="text-sm text-gray-600">
																	Puntuación
																</div>
															</div>
															<div className="text-center p-3 bg-white rounded-lg">
																<div className="text-2xl font-bold text-cyan-500">
																	92%
																</div>
																<div className="text-sm text-gray-600">
																	Confianza IA
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
										)}

										{/* Actions */}
										<div className="flex gap-3">
											<button
												onClick={resetProcess}
												className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
											>
												{currentStep === 4 ? "Nueva Evaluación" : "Cancelar"}
											</button>

											{currentStep === 4 && (
												<button className="btn-primary">
													Ver Resultados Completos →
												</button>
											)}
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</Layout>
		</ProtectedRoute>
	);
};

export default UploadPage;
