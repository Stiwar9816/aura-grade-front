import React, {useState} from "react";
import {useRouter} from "next/router";
import {useEvaluationDetail} from "@/hooks";
import Layout from "@/components/Layout";
import {
	EvaluationSummary,
	CriteriaTable,
	ComparisonView,
} from "@/components/Evaluation";
import {ProtectedRoute} from "@/components/Auth";

const EvaluationPage: React.FC = () => {
	const router = useRouter();
	const {submission} = router.query;
	const submissionId = typeof submission === "string" ? submission : null;
	const {loading, error, evaluationData, studentText, aiComments, studentName} =
		useEvaluationDetail(submissionId);
	const [showComparison, setShowComparison] = useState<boolean>(false);

	if (loading) {
		return (
			<ProtectedRoute>
				<Layout title="Evaluación de IA">
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-500"></div>
					</div>
				</Layout>
			</ProtectedRoute>
		);
	}

	if (error || !evaluationData) {
		return (
			<ProtectedRoute>
				<Layout title="Error en Evaluación">
					<div className="max-w-6xl mx-auto text-center py-12">
						<h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
						<p className="text-gray-600">
							{error || "No se encontraron datos de la evaluación."}
						</p>
						<button onClick={() => router.back()} className="mt-4 btn-primary">
							Volver
						</button>
					</div>
				</Layout>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute>
			<Layout title="Evaluación de IA">
				<div className="max-w-6xl mx-auto">
					{/* Resumen de evaluación */}
					<EvaluationSummary
						score={evaluationData.overallScore}
						maxScore={evaluationData.maxScore}
						feedback={evaluationData.generalFeedback}
						evaluationDate={evaluationData.evaluationDate}
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
									criteria={evaluationData.criteria}
									studentName={studentName}
								/>
							</div>
						)}
					</div>

					{/* Acciones adicionales */}
					<div className="mt-8 flex justify-end space-x-4">
						<button className="btn-ghost">Enviar Reporte</button>
						<button className="btn-primary">Solicitar Re-evaluación</button>
					</div>
				</div>
			</Layout>
		</ProtectedRoute>
	);
};

export default EvaluationPage;
