import React, {useState} from "react";
import {ComparisonViewProps} from "@/interface";

export const ComparisonView: React.FC<ComparisonViewProps> = ({
	studentText,
	aiComments,
	criteria = [],
	studentName = "Estudiante",
}) => {
	const [activeTab, setActiveTab] = useState<"student" | "ai">("student");

	return (
		<div className="card p-6">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-bold text-gray-900">Vista Comparativa</h2>
			</div>

			{/* Tabs */}
			<div className="flex border-b border-gray-200 mb-6">
				<button
					onClick={() => setActiveTab("student")}
					className={`flex-1 py-3 text-center font-medium ${
						activeTab === "student"
							? "text-electric-500 border-b-2 border-electric-500"
							: "text-gray-500 hover:text-gray-700"
					}`}
				>
					<div className="flex items-center justify-center gap-2">
						<span>Texto Del Estudiante</span>
					</div>
				</button>
				<button
					onClick={() => setActiveTab("ai")}
					className={`flex-1 py-3 text-center font-medium ${
						activeTab === "ai"
							? "text-electric-500 border-b-2 border-electric-500"
							: "text-gray-500 hover:text-gray-700"
					}`}
				>
					<div className="flex items-center justify-center gap-2">
						<span>Análisis Detallado IA</span>
					</div>
				</button>
			</div>

			{/* Content */}
			<div className="min-h-[400px]">
				{activeTab === "student" ? (
					<div className="space-y-4">
						<div className="bg-gray-50 rounded-xl p-6">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-electric-500 rounded-full flex items-center justify-center">
									<span className="text-white font-semibold">
										{studentName
											?.split(" ")
											.slice(0, 2)
											.map((n) => n[0])
											.join("")
											.toUpperCase()}
									</span>
								</div>
								<div>
									<div className="font-semibold text-gray-900">
										{studentName}
									</div>
									<div className="text-sm text-gray-600">
										Texto extraído de la entrega
									</div>
								</div>
							</div>

							<div className="bg-white border border-gray-200 rounded-lg p-5 text-gray-700 leading-relaxed font-mono text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto custom-scrollbar">
								{studentText || "No hay texto disponible para mostrar."}
							</div>

							{/* Word Count */}
							<div className="mt-4 flex items-center justify-between text-sm text-gray-600">
								<div className="flex items-center gap-4">
									<span>
										{studentText ? studentText.split(/\s+/).length : 0} palabras
									</span>
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="space-y-6">
						<div className="bg-gradient-to-r from-electric-50 to-cyan-50 rounded-xl p-6">
							<div className="flex items-center gap-3 mb-6">
								<div className="w-10 h-10 bg-gradient-to-r from-deep-purple to-purple-600 rounded-full flex items-center justify-center">
									<span className="text-white text-xl">AI</span>
								</div>
								<div>
									<div className="font-semibold text-gray-900">
										Feedback de IA
									</div>
									<div className="text-sm text-gray-600">
										Desglose de observaciones
									</div>
								</div>
							</div>

							<div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
								{/* General Feedback */}
								<div className="bg-white p-4 rounded-lg border border-gray-200">
									<h4 className="font-bold text-gray-900 mb-2">
										Comentarios Generales
									</h4>
									<p className="text-gray-700">{aiComments}</p>
								</div>

								{/* Criteria specific breakdown */}
								{criteria.map((criterion, idx) => (
									<div
										key={idx}
										className="bg-white p-4 rounded-lg border border-gray-200"
									>
										<div className="flex justify-between items-center mb-2">
											<h4 className="font-bold text-gray-900">
												{criterion.name}
											</h4>
											<span className="text-sm font-semibold bg-gray-100 px-2 py-1 rounded">
												{criterion.score} / {criterion.maxScore}
											</span>
										</div>
										{criterion.feedback && (
											<div className="mb-2">
												<span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
													Observación
												</span>
												<p className="text-gray-700 text-sm mt-1">
													{criterion.feedback}
												</p>
											</div>
										)}
										{criterion.suggestion && (
											<div className="bg-blue-50 p-3 rounded mt-3">
												<div className="flex items-start gap-2">
													<span className="text-blue-500 mt-0.5">💡</span>
													<div>
														<span className="font-medium text-blue-900 text-sm block">
															Sugerencia
														</span>
														<p className="text-blue-800 text-sm">
															{criterion.suggestion}
														</p>
													</div>
												</div>
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
