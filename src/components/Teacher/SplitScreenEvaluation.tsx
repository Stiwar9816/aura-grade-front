import React, {useState} from "react";
import {AIEvaluation} from "@/types";
import {TeacherOverride} from "@/interface";

const SplitScreenEvaluation: React.FC = () => {
	const [aiEvaluation] = useState<AIEvaluation>({
		criteria: [
			{
				name: "Argumentación",
				score: 4,
				maxScore: 5,
				feedback:
					"Argumentos sólidos pero podrían profundizarse más con ejemplos concretos.",
				suggestions: [
					"Añadir 2-3 ejemplos específicos",
					"Desarrollar más el contraargumento",
				],
			},
			{
				name: "Estructura",
				score: 4.5,
				maxScore: 5,
				feedback:
					"Excelente organización y transiciones fluidas entre secciones.",
				suggestions: [],
			},
			{
				name: "Ortografía y Gramática",
				score: 3.5,
				maxScore: 5,
				feedback:
					"Se detectaron algunos errores menores de concordancia y puntuación.",
				suggestions: [
					"Revisar uso de comas en oraciones compuestas",
					"Verificar concordancia sujeto-verbo",
				],
			},
			{
				name: "Originalidad",
				score: 4,
				maxScore: 5,
				feedback:
					"Perspectiva interesante con algunos aportes personales valiosos.",
				suggestions: [
					"Incorporar más referencias actualizadas",
					"Profundizar en la perspectiva personal",
				],
			},
		],
		overallScore: 4.0,
		generalFeedback:
			"Excelente trabajo. El estudiante demuestra comprensión del tema con argumentos bien estructurados. Se sugiere mejorar aspectos de redacción y profundizar en algunos argumentos.",
		confidence: 92,
	});

	const [teacherOverrides, setTeacherOverrides] = useState<TeacherOverride[]>(
		[]
	);
	const [showOverrideForm, setShowOverrideForm] = useState<string | null>(null);
	const [newOverride, setNewOverride] = useState<Partial<TeacherOverride>>({
		newScore: 0,
		reason: "",
		comments: "",
	});

	const studentText = `La inteligencia artificial está transformando radicalmente el panorama educativo contemporáneo. A través de sistemas adaptativos y algoritmos personalizados, los estudiantes pueden recibir retroalimentación inmediata y personalizada, lo que permite un aprendizaje más efectivo y centrado en sus necesidades específicas.

Sin embargo, es crucial considerar los aspectos éticos de esta transformación tecnológica. La privacidad de datos, la equidad en el acceso y la transparencia en los algoritmos deben ser prioridades fundamentales al implementar estas tecnologías en entornos educativos diversos.

En conclusión, mientras la IA ofrece oportunidades sin precedentes para la personalización educativa, su implementación requiere un equilibrio cuidadoso entre innovación y consideraciones éticas.`;

	const handleOverrideSubmit = (criterionId: string, criterionName: string) => {
		if (!newOverride.newScore || !newOverride.reason) return;

		const criterion = aiEvaluation.criteria.find(
			(c) => c.name === criterionName
		);

		const override: TeacherOverride = {
			criterionId,
			originalScore: criterion?.score || 0,
			newScore: newOverride.newScore,
			reason: newOverride.reason,
			comments: newOverride.comments || "",
		};

		setTeacherOverrides([...teacherOverrides, override]);
		setShowOverrideForm(null);
		setNewOverride({newScore: 0, reason: "", comments: ""});
	};

	const calculateFinalScore = () => {
		let total = 0;
		let maxTotal = 0;

		aiEvaluation.criteria.forEach((criterion, index) => {
			const override = teacherOverrides.find(
				(o) => o.criterionId === index.toString()
			);
			total += override?.newScore || criterion.score;
			maxTotal += criterion.maxScore;
		});

		return {
			score: ((total / maxTotal) * 5).toFixed(1),
			isModified: teacherOverrides.length > 0,
		};
	};

	const finalScore = calculateFinalScore();

	return (
		<div className="max-w-7xl mx-auto">
			<div className="card p-6 mb-6">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							Evaluación Comparativa
						</h1>
						<p className="text-gray-600 mt-1">
							Documento del estudiante vs Análisis de IA - Puedes modificar la
							calificación
						</p>
					</div>

					<div className="text-right">
						<div className="text-sm text-gray-600">Calificación final</div>
						<div
							className={`text-3xl font-bold ${
								finalScore.isModified ? "text-purple-600" : "text-electric-500"
							}`}
						>
							{finalScore.score}/5
						</div>
						{finalScore.isModified && (
							<div className="text-sm text-purple-600">
								Modificada por docente
							</div>
						)}
					</div>
				</div>

				{/* Score Comparison */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<div className="bg-gradient-to-r from-electric-50 to-blue-50 p-4 rounded-xl border border-electric-200">
						<div className="text-sm text-gray-600 mb-1">Evaluación IA</div>
						<div className="text-2xl font-bold text-electric-500">
							{aiEvaluation.overallScore.toFixed(1)}/5
						</div>
						<div className="text-sm text-gray-600">
							Confianza: {aiEvaluation.confidence}%
						</div>
					</div>

					<div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
						<div className="text-sm text-gray-600 mb-1">Tu evaluación</div>
						<div className="text-2xl font-bold text-purple-600">
							{finalScore.score}/5
						</div>
						<div className="text-sm text-gray-600">
							{teacherOverrides.length} criterio
							{teacherOverrides.length !== 1 ? "s" : ""} modificado
							{teacherOverrides.length !== 1 ? "s" : ""}
						</div>
					</div>

					<div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
						<div className="text-sm text-gray-600 mb-1">Diferencia</div>
						<div
							className={`text-2xl font-bold ${
								Math.abs(
									parseFloat(finalScore.score) - aiEvaluation.overallScore
								) === 0
									? "text-gray-600"
									: parseFloat(finalScore.score) > aiEvaluation.overallScore
									? "text-green-600"
									: "text-red-600"
							}`}
						>
							{Math.abs(
								parseFloat(finalScore.score) - aiEvaluation.overallScore
							).toFixed(1)}{" "}
							pts
						</div>
						<div className="text-sm text-gray-600">
							{parseFloat(finalScore.score) > aiEvaluation.overallScore
								? "Más generosa"
								: parseFloat(finalScore.score) < aiEvaluation.overallScore
								? "Más estricta"
								: "Sin cambios"}
						</div>
					</div>
				</div>
			</div>

			{/* Split Screen */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
				{/* Left Column - Student Document */}
				<div className="card p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
							<span>👨‍🎓</span>
							<span>Documento del Estudiante</span>
						</h2>
						<div className="text-sm text-gray-600">
							{studentText.split(" ").length} palabras
						</div>
					</div>

					<div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-h-[500px] overflow-y-auto">
						<div className="prose prose-sm max-w-none">
							{studentText.split("\n").map((paragraph, idx) => (
								<p key={idx} className="mb-4 text-gray-700">
									{paragraph}
								</p>
							))}
						</div>
					</div>

					<div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
						<h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
							<span>💡</span>
							<span>Para el docente:</span>
						</h3>
						<ul className="space-y-2 text-sm text-gray-700">
							<li className="flex items-start gap-2">
								<span className="text-blue-500 mt-1">✓</span>
								<span>
									Lee el texto completo antes de revisar la evaluación de IA
								</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-blue-500 mt-1">✓</span>
								<span>Considera el contexto y nivel del estudiante</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-blue-500 mt-1">✓</span>
								<span>
									Puedes anular cualquier criterio si lo consideras necesario
								</span>
							</li>
						</ul>
					</div>
				</div>

				{/* Right Column - AI Evaluation */}
				<div className="card p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
							<span>🤖</span>
							<span>Evaluación de IA</span>
						</h2>
						<div
							className={`px-3 py-1 rounded-full text-sm font-medium ${
								aiEvaluation.confidence >= 90
									? "bg-green-100 text-green-800"
									: aiEvaluation.confidence >= 80
									? "bg-yellow-100 text-yellow-800"
									: "bg-red-100 text-red-800"
							}`}
						>
							{aiEvaluation.confidence}% confianza
						</div>
					</div>

					{/* AI Feedback */}
					<div className="mb-6">
						<h3 className="font-semibold text-gray-900 mb-3">
							Feedback General de IA
						</h3>
						<div className="bg-gradient-to-r from-electric-50 to-cyan-50 border border-electric-200 rounded-xl p-4">
							<p className="text-gray-700">{aiEvaluation.generalFeedback}</p>
						</div>
					</div>

					{/* Criteria Evaluation */}
					<div className="space-y-4">
						<h3 className="font-semibold text-gray-900">
							Desglose por Criterio
						</h3>

						{aiEvaluation.criteria.map((criterion, index) => {
							const override = teacherOverrides.find(
								(o) => o.criterionId === index.toString()
							);

							return (
								<div
									key={index}
									className="p-4 border border-gray-200 rounded-xl"
								>
									<div className="flex items-center justify-between mb-3">
										<div>
											<div className="font-medium text-gray-900">
												{criterion.name}
											</div>
											<div className="text-sm text-gray-600">
												{criterion.feedback}
											</div>
										</div>

										<div className="text-right">
											<div className="flex items-center gap-2">
												{override ? (
													<>
														<div className="text-sm text-gray-400 line-through">
															{criterion.score}/{criterion.maxScore}
														</div>
														<div className="text-lg font-bold text-purple-600">
															{override.newScore}/{criterion.maxScore}
														</div>
													</>
												) : (
													<div className="text-lg font-bold text-gray-900">
														{criterion.score}/{criterion.maxScore}
													</div>
												)}
											</div>
										</div>
									</div>

									{/* Suggestions */}
									{criterion.suggestions.length > 0 && (
										<div className="mb-4">
											<div className="text-sm font-medium text-gray-900 mb-2">
												Sugerencias de IA:
											</div>
											<ul className="space-y-1">
												{criterion.suggestions.map((suggestion, idx) => (
													<li
														key={idx}
														className="flex items-start gap-2 text-sm text-gray-700"
													>
														<span className="text-cyan-500 mt-1">•</span>
														<span>{suggestion}</span>
													</li>
												))}
											</ul>
										</div>
									)}

									{/* Override Controls */}
									<div className="flex items-center justify-between pt-4 border-t border-gray-100">
										{!override ? (
											<button
												onClick={() =>
													setShowOverrideForm(
														showOverrideForm === index.toString()
															? null
															: index.toString()
													)
												}
												className="text-sm text-electric-500 hover:text-electric-600 font-medium"
											>
												Modificar puntuación
											</button>
										) : (
											<div>
												<div className="text-sm text-purple-600 font-medium">
													Modificado
												</div>
												<div className="text-xs text-gray-600">
													Razón: {override.reason}
												</div>
											</div>
										)}

										{override && (
											<button
												onClick={() =>
													setTeacherOverrides((prev) =>
														prev.filter(
															(o) => o.criterionId !== index.toString()
														)
													)
												}
												className="text-sm text-red-500 hover:text-red-600"
											>
												Restaurar original
											</button>
										)}
									</div>

									{/* Override Form */}
									{showOverrideForm === index.toString() && (
										<div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-2">
														Nueva puntuación
													</label>
													<select
														value={newOverride.newScore}
														onChange={(e) =>
															setNewOverride({
																...newOverride,
																newScore: parseInt(e.target.value),
															})
														}
														className="input-primary"
													>
														{Array.from(
															{length: criterion.maxScore + 1},
															(_, i) => i
														).map((score) => (
															<option key={score} value={score}>
																{score} puntos
															</option>
														))}
													</select>
												</div>
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-2">
														Razón del cambio
													</label>
													<select
														value={newOverride.reason}
														onChange={(e) =>
															setNewOverride({
																...newOverride,
																reason: e.target.value,
															})
														}
														className="input-primary"
													>
														<option value="">Seleccionar razón...</option>
														<option value="IA subestimó">
															IA subestimó el trabajo
														</option>
														<option value="IA sobreestimó">
															IA sobreestimó el trabajo
														</option>
														<option value="Contexto especial">
															Consideración de contexto especial
														</option>
														<option value="Error IA">
															Error de interpretación de IA
														</option>
														<option value="Otra">Otra razón</option>
													</select>
												</div>
											</div>

											<div className="mb-4">
												<label className="block text-sm font-medium text-gray-700 mb-2">
													Comentarios adicionales (opcional)
												</label>
												<textarea
													value={newOverride.comments}
													onChange={(e) =>
														setNewOverride({
															...newOverride,
															comments: e.target.value,
														})
													}
													className="input-primary"
													rows={2}
													placeholder="Explica por qué modificas esta calificación..."
												/>
											</div>

											<div className="flex justify-end gap-3">
												<button
													onClick={() => setShowOverrideForm(null)}
													className="px-4 py-2 text-gray-600 hover:text-gray-900"
												>
													Cancelar
												</button>
												<button
													onClick={() =>
														handleOverrideSubmit(
															index.toString(),
															criterion.name
														)
													}
													className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
												>
													Aplicar cambio
												</button>
											</div>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* Final Actions */}
			<div className="card p-6">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div>
						<h3 className="text-lg font-bold text-gray-900 mb-2">
							Guardar evaluación
						</h3>
						<p className="text-gray-600">
							{teacherOverrides.length > 0
								? `Has modificado ${teacherOverrides.length} criterio${
										teacherOverrides.length !== 1 ? "s" : ""
								  }.`
								: "No has realizado modificaciones a la evaluación de IA."}
						</p>
					</div>

					<div className="flex gap-3">
						<button className="btn-ghost">
							<span className="flex items-center gap-2">
								<span>💾</span>
								<span>Guardar borrador</span>
							</span>
						</button>
						<button className="btn-primary">
							<span className="flex items-center gap-2">
								<span>📤</span>
								<span>Publicar evaluación</span>
							</span>
						</button>
					</div>
				</div>

				{/* Override Summary */}
				{teacherOverrides.length > 0 && (
					<div className="mt-6 pt-6 border-t border-gray-200">
						<h4 className="font-semibold text-gray-900 mb-3">
							Resumen de modificaciones
						</h4>
						<div className="space-y-3">
							{teacherOverrides.map((override, idx) => {
								const criterion =
									aiEvaluation.criteria[parseInt(override.criterionId)];

								return (
									<div
										key={idx}
										className="p-3 bg-purple-50 rounded-lg border border-purple-200"
									>
										<div className="flex items-center justify-between">
											<div>
												<div className="font-medium text-gray-900">
													{criterion?.name}
												</div>
												<div className="text-sm text-gray-600">
													{override.reason}
												</div>
												{override.comments && (
													<div className="text-sm text-gray-700 mt-1">
														"{override.comments}"
													</div>
												)}
											</div>
											<div className="text-right">
												<div className="flex items-center gap-2">
													<div className="text-sm text-gray-400 line-through">
														{override.originalScore}/{criterion?.maxScore}
													</div>
													<div className="text-lg font-bold text-purple-600">
														{override.newScore}/{criterion?.maxScore}
													</div>
												</div>
												<div className="text-sm text-purple-600">
													+
													{(override.newScore - override.originalScore).toFixed(
														1
													)}{" "}
													pts
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default SplitScreenEvaluation;
