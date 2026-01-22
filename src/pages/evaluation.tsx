import React, {useState} from "react";
import Layout from "@/components/Layout";
import EvaluationSummary from "@/components/Evaluation/EvaluationSummary";
import CriteriaTable from "@/components/Evaluation/CriteriaTable";
import ComparisonView from "@/components/Evaluation/ComparisonView";
import {ProtectedRoute} from "@/components/Auth";

const EvaluationPage: React.FC = () => {
	const [showComparison, setShowComparison] = useState<boolean>(false);

	const evaluationData = {
		overallScore: 8.7,
		maxScore: 10,
		generalFeedback:
			"Excelente trabajo. El estudiante demuestra un entendimiento profundo del tema con argumentos sólidos y bien estructurados. La investigación es exhaustiva y las referencias son apropiadas. Se sugiere mejorar la conclusión para reforzar los puntos principales.",
		criteria: [
			{
				id: "1",
				name: "Ortografía y Gramática",
				score: 9,
				maxScore: 10,
				feedback:
					"Muy buen manejo del lenguaje, solo dos errores menores detectados.",
				suggestion: "Revisar uso de comas en oraciones compuestas.",
			},
			{
				id: "2",
				name: "Argumentación",
				score: 9.5,
				maxScore: 10,
				feedback:
					"Argumentos sólidos y bien sustentados con evidencia relevante.",
				suggestion: "Podría incluir un contraargumento para mayor profundidad.",
			},
			{
				id: "3",
				name: "Estructura",
				score: 8,
				maxScore: 10,
				feedback:
					"Buena organización general, pero la transición entre secciones podría mejorar.",
				suggestion: "Usar frases de transición más claras.",
			},
			{
				id: "4",
				name: "Originalidad",
				score: 8.5,
				maxScore: 10,
				feedback: "Perspectiva única con aportes personales valiosos.",
				suggestion:
					"Explorar más fuentes alternativas para enriquecer el análisis.",
			},
			{
				id: "5",
				name: "Formato",
				score: 9,
				maxScore: 10,
				feedback: "Cumple con todos los requisitos de formato solicitados.",
				suggestion: "Considerar el uso de subtítulos descriptivos.",
			},
		],
	};

	const studentText = `La inteligencia artificial está transformando radicalmente el panorama educativo. A través de sistemas adaptativos, los estudiantes pueden recibir retroalimentación personalizada en tiempo real, lo que permite un aprendizaje más efectivo y centrado en sus necesidades específicas.

Sin embargo, es crucial considerar los aspectos éticos de esta transformación. La privacidad de datos y la equidad en el acceso deben ser prioridades fundamentales al implementar estas tecnologías en entornos educativos.`;

	const aiComments = `Excelente introducción al tema. El estudiante identifica correctamente los beneficios principales de la IA en educación.

🔍 Punto fuerte: Menciona específicamente "sistemas adaptativos" y "retroalimentación personalizada", lo que demuestra investigación.

💡 Sugerencia: Podría desarrollar más el ejemplo de cómo funcionan estos sistemas adaptativos en la práctica.

⚠️ Aspecto a mejorar: La sección sobre aspectos éticos es breve. Se beneficiaría de ejemplos concretos de problemas de privacidad en educación.`;

	return (
		<ProtectedRoute>
			<Layout title="Evaluación de IA">
				<div className="max-w-6xl mx-auto">
					{/* Resumen ejecutivo */}
					<EvaluationSummary
						score={evaluationData.overallScore}
						maxScore={evaluationData.maxScore}
						feedback={evaluationData.generalFeedback}
					/>

					{/* Controles de vista */}
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-xl font-bold text-gray-900">
							Desglose por Rúbrica
						</h2>
						<button
							onClick={() => setShowComparison(!showComparison)}
							className={`px-4 py-2 rounded-lg font-medium ${
								showComparison
									? "bg-electric-500 text-white"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
						>
							{showComparison ? "Ocultar Comparación" : "Ver Modo Comparativo"}
						</button>
					</div>

					{/* Vista principal */}
					<div
						className={`grid gap-6 ${
							showComparison ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
						}`}
					>
						{/* Tabla de criterios */}
						<div className={showComparison ? "lg:col-span-1" : ""}>
							<CriteriaTable criteria={evaluationData.criteria} />
						</div>

						{/* Vista comparativa */}
						{showComparison && (
							<div className="lg:col-span-1">
								<ComparisonView
									studentText={studentText}
									aiComments={aiComments}
								/>
							</div>
						)}
					</div>

					{/* Acciones adicionales */}
					<div className="mt-8 flex justify-end space-x-4">
						<button className="btn-ghost">
							<span className="mr-2">📥</span>
							Descargar Reporte
						</button>
						<button className="btn-primary">
							<span className="mr-2">🔄</span>
							Solicitar Re-evaluación
						</button>
					</div>
				</div>
			</Layout>
		</ProtectedRoute>
	);
};

export default EvaluationPage;
