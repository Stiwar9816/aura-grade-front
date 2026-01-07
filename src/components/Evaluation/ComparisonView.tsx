import React, {useState} from "react";

interface ComparisonViewProps {
	studentText: string;
	aiComments: string;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({
	studentText,
	aiComments,
}) => {
	const [activeTab, setActiveTab] = useState<"student" | "ai">("student");
	const [highlights, setHighlights] = useState<boolean>(true);

	// Simulated highlighted text sections
	const highlightedSections = [
		{
			text: "sistemas adaptativos",
			type: "good",
			comment: "Término técnico correcto",
		},
		{
			text: "retroalimentación personalizada",
			type: "good",
			comment: "Concepto clave bien aplicado",
		},
		{
			text: "aspectos éticos",
			type: "improve",
			comment: "Necesita más desarrollo",
		},
	];

	const aiCommentLines = aiComments.split("\n\n");

	return (
		<div className="card p-6">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-bold text-gray-900">Vista Comparativa</h2>
				<div className="flex items-center gap-2">
					<span className="text-sm text-gray-600">Resaltados:</span>
					<button
						onClick={() => setHighlights(!highlights)}
						className={`relative inline-flex h-6 w-11 items-center rounded-full ${
							highlights ? "bg-electric-500" : "bg-gray-300"
						}`}
					>
						<span
							className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
								highlights ? "translate-x-6" : "translate-x-1"
							}`}
						/>
					</button>
				</div>
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
						<span>👨‍🎓</span>
						<span>Texto Original</span>
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
						<span>🤖</span>
						<span>Análisis IA</span>
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
									<span className="text-white font-semibold">ES</span>
								</div>
								<div>
									<div className="font-semibold text-gray-900">Estudiante</div>
									<div className="text-sm text-gray-600">
										Texto original enviado
									</div>
								</div>
							</div>

							<div className="bg-white border border-gray-200 rounded-lg p-5 text-gray-700 leading-relaxed">
								{studentText.split("\n").map((paragraph, idx) => (
									<p key={idx} className="mb-4">
										{highlights ? (
											<span>
												{paragraph.split(" ").map((word, wordIdx) => {
													const highlight = highlightedSections.find(
														(h) =>
															paragraph
																.toLowerCase()
																.includes(h.text.toLowerCase()) &&
															word
																.toLowerCase()
																.includes(h.text.split(" ")[0].toLowerCase())
													);

													if (highlight) {
														return (
															<span
																key={wordIdx}
																className={`px-1 py-0.5 rounded ${
																	highlight.type === "good"
																		? "bg-green-100 text-green-800"
																		: "bg-yellow-100 text-yellow-800"
																}`}
																title={highlight.comment}
															>
																{word}{" "}
															</span>
														);
													}
													return <span key={wordIdx}>{word} </span>;
												})}
											</span>
										) : (
											paragraph
										)}
									</p>
								))}
							</div>

							{/* Word Count */}
							<div className="mt-4 flex items-center justify-between text-sm text-gray-600">
								<div className="flex items-center gap-4">
									<span>📝 {studentText.split(" ").length} palabras</span>
									<span>📄 {studentText.split("\n").length} párrafos</span>
								</div>
								<span>⏱️ Nivel de lectura: Universitario</span>
							</div>
						</div>

						{/* Legend */}
						{highlights && (
							<div className="bg-gray-50 rounded-xl p-4">
								<h4 className="font-medium text-gray-900 mb-3">
									Leyenda de Resaltados
								</h4>
								<div className="flex flex-wrap gap-3">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
										<span className="text-sm text-gray-700">
											Puntos fuertes
										</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
										<span className="text-sm text-gray-700">
											Áreas a mejorar
										</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
										<span className="text-sm text-gray-700">
											Términos técnicos
										</span>
									</div>
								</div>
							</div>
						)}
					</div>
				) : (
					<div className="space-y-6">
						<div className="bg-gradient-to-r from-electric-50 to-cyan-50 rounded-xl p-6">
							<div className="flex items-center gap-3 mb-6">
								<div className="w-10 h-10 bg-gradient-to-r from-deep-purple to-purple-600 rounded-full flex items-center justify-center">
									<span className="text-white text-xl">🤖</span>
								</div>
								<div>
									<div className="font-semibold text-gray-900">
										Asistente de IA
									</div>
									<div className="text-sm text-gray-600">
										Análisis detallado por sección
									</div>
								</div>
							</div>

							<div className="space-y-4">
								{aiCommentLines.map((line, idx) => {
									if (line.startsWith("🔍")) {
										return (
											<div
												key={idx}
												className="bg-green-50 border border-green-200 rounded-xl p-4"
											>
												<div className="flex items-start gap-3">
													<span className="text-green-600 mt-1">🔍</span>
													<div>
														<div className="font-medium text-gray-900 mb-1">
															Punto Fuerte Detectado
														</div>
														<div className="text-gray-700">
															{line.substring(2)}
														</div>
													</div>
												</div>
											</div>
										);
									}

									if (line.startsWith("💡")) {
										return (
											<div
												key={idx}
												className="bg-blue-50 border border-blue-200 rounded-xl p-4"
											>
												<div className="flex items-start gap-3">
													<span className="text-blue-600 mt-1">💡</span>
													<div>
														<div className="font-medium text-gray-900 mb-1">
															Sugerencia de Mejora
														</div>
														<div className="text-gray-700">
															{line.substring(2)}
														</div>
													</div>
												</div>
											</div>
										);
									}

									if (line.startsWith("⚠️")) {
										return (
											<div
												key={idx}
												className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
											>
												<div className="flex items-start gap-3">
													<span className="text-yellow-600 mt-1">⚠️</span>
													<div>
														<div className="font-medium text-gray-900 mb-1">
															Atención Requerida
														</div>
														<div className="text-gray-700">
															{line.substring(2)}
														</div>
													</div>
												</div>
											</div>
										);
									}

									return (
										<div key={idx} className="text-gray-700 leading-relaxed">
											{line}
										</div>
									);
								})}
							</div>
						</div>

						{/* AI Insights */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="bg-white border border-gray-200 rounded-xl p-4">
								<div className="flex items-center gap-3 mb-3">
									<div className="p-2 bg-cyan-100 rounded-lg">
										<span className="text-cyan-600">🧠</span>
									</div>
									<div>
										<div className="font-medium text-gray-900">
											Nivel de Complejidad
										</div>
										<div className="text-2xl font-bold text-cyan-600">
											8.5/10
										</div>
									</div>
								</div>
								<div className="text-sm text-gray-600">
									Análisis apropiado para nivel universitario
								</div>
							</div>

							<div className="bg-white border border-gray-200 rounded-xl p-4">
								<div className="flex items-center gap-3 mb-3">
									<div className="p-2 bg-green-100 rounded-lg">
										<span className="text-green-600">📚</span>
									</div>
									<div>
										<div className="font-medium text-gray-900">
											Vocabulario Técnico
										</div>
										<div className="text-2xl font-bold text-green-600">
											12 términos
										</div>
									</div>
								</div>
								<div className="text-sm text-gray-600">
									Uso adecuado de terminología especializada
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Navigation Tips */}
			<div className="mt-6 pt-6 border-t border-gray-200">
				<div className="flex items-center justify-between text-sm text-gray-600">
					<div className="flex items-center gap-2">
						<span>💡</span>
						<span>Use las pestañas para comparar texto vs análisis</span>
					</div>
					<button className="text-electric-500 hover:text-electric-600 font-medium">
						Ver Guía Completa →
					</button>
				</div>
			</div>
		</div>
	);
};

export default ComparisonView;
