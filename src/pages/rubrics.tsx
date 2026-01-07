import React, {useState} from "react";
import Layout from "@/components/Layout";
import RubricBuilder from "@/components/Rubrics/RubricBuilder";
import RubricLibrary from "@/components/Rubrics/RubricLibrary";
import RubricPreview from "@/components/Rubrics/RubricPreview";
import {Rubric, RubricCriteria} from "@/types";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";

const RubricsPage: React.FC = () => {
	const [activeTab, setActiveTab] = useState<"builder" | "library" | "preview">(
		"builder"
	);
	const [currentRubric, setCurrentRubric] = useState<Rubric>({
		id: "1",
		name: "Ensayo Académico",
		description: "Rúbrica estándar para evaluar ensayos universitarios",
		criteria: [
			{
				id: "1",
				name: "Argumentación",
				description: "Calidad y solidez de los argumentos",
				weight: 30,
				maxScore: 10,
			},
			{
				id: "2",
				name: "Estructura",
				description: "Organización y coherencia del texto",
				weight: 25,
				maxScore: 10,
			},
			{
				id: "3",
				name: "Ortografía y Gramática",
				description: "Corrección lingüística",
				weight: 20,
				maxScore: 10,
			},
			{
				id: "4",
				name: "Originalidad",
				description: "Aportes personales y creatividad",
				weight: 15,
				maxScore: 10,
			},
			{
				id: "5",
				name: "Formato",
				description: "Cumplimiento de requisitos formales",
				weight: 10,
				maxScore: 10,
			},
		],
		totalWeight: 100,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		isActive: true,
	});

	const rubricTemplates = [
		{
			id: "1",
			name: "Ensayo Estándar",
			description: "Para evaluar ensayos argumentativos",
			criteriaCount: 5,
			usedCount: 24,
		},
		{
			id: "2",
			name: "Proyecto de Investigación",
			description: "Evaluación de proyectos científicos",
			criteriaCount: 6,
			usedCount: 18,
		},
		{
			id: "3",
			name: "Presentación Oral",
			description: "Habilidades de comunicación",
			criteriaCount: 4,
			usedCount: 32,
		},
		{
			id: "4",
			name: "Portafolio Digital",
			description: "Evaluación de trabajos digitales",
			criteriaCount: 7,
			usedCount: 12,
		},
		{
			id: "5",
			name: "Reflexión Personal",
			description: "Análisis introspectivo",
			criteriaCount: 3,
			usedCount: 28,
		},
	];

	const handleAddCriteria = (criteria: RubricCriteria) => {
		setCurrentRubric((prev: any) => ({
			...prev,
			criteria: [...prev.criteria, criteria],
			totalWeight: prev.totalWeight + criteria.weight,
		}));
	};

	const handleUpdateCriteria = (
		id: string,
		updated: Partial<RubricCriteria>
	) => {
		setCurrentRubric((prev: any) => ({
			...prev,
			criteria: prev.criteria.map((c: any) =>
				c.id === id ? {...c, ...updated} : c
			),
		}));
	};

	const handleDeleteCriteria = (id: string) => {
		const criteria = currentRubric.criteria.find((c: any) => c.id === id);
		setCurrentRubric((prev: any) => ({
			...prev,
			criteria: prev.criteria.filter((c: any) => c.id !== id),
			totalWeight: prev.totalWeight - (criteria?.weight || 0),
		}));
	};

	const handleSaveRubric = () => {
		console.log("Guardando rúbrica:", currentRubric);
		// Aquí iría la lógica para guardar en API
	};

	return (
		<ProtectedRoute requiredRole="teacher">
			<Layout title="Gestor de Rúbricas">
				<div className="max-w-7xl mx-auto">
					{/* Header con Tabs */}
					<div className="mb-8">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
							<div>
								<p className="text-gray-600 mt-2">
									Configura la inteligencia de evaluación de IA
								</p>
							</div>
							<div className="flex gap-3">
								<button className="btn-ghost">
									<span className="mr-2">📥</span>
									Importar
								</button>
								<button onClick={handleSaveRubric} className="btn-primary">
									<span className="mr-2">💾</span>
									Guardar Rúbrica
								</button>
							</div>
						</div>

						{/* Tabs */}
						<div className="border-b border-gray-200">
							<nav className="flex space-x-8">
								{[
									{id: "builder", label: "Constructor", icon: "⚙️"},
									{id: "library", label: "Biblioteca", icon: "📚"},
									{id: "preview", label: "Vista Previa", icon: "👁️"},
								].map((tab) => (
									<button
										key={tab.id}
										onClick={() => setActiveTab(tab.id as any)}
										className={`flex items-center gap-2 py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
											activeTab === tab.id
												? "border-electric-500 text-electric-600"
												: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
										}`}
									>
										<span>{tab.icon}</span>
										<span>{tab.label}</span>
									</button>
								))}
							</nav>
						</div>
					</div>

					{/* Contenido según Tab */}
					{activeTab === "builder" && (
						<RubricBuilder
							rubric={currentRubric}
							onAddCriteria={handleAddCriteria}
							onUpdateCriteria={handleUpdateCriteria}
							onDeleteCriteria={handleDeleteCriteria}
						/>
					)}

					{activeTab === "library" && (
						<RubricLibrary
							templates={rubricTemplates}
							onSelectTemplate={(template: any) => {
								console.log("Seleccionada plantilla:", template);
								setActiveTab("builder");
							}}
						/>
					)}

					{activeTab === "preview" && <RubricPreview rubric={currentRubric} />}

					{/* Stats Footer */}
					<div className="mt-8 pt-8 border-t border-gray-200">
						<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
							<div className="card p-6">
								<div className="flex items-center gap-4">
									<div className="p-3 bg-electric-100 rounded-xl">
										<span className="text-electric-600 text-xl">📊</span>
									</div>
									<div>
										<div className="text-2xl font-bold text-gray-900">
											{currentRubric.criteria.length}
										</div>
										<div className="text-sm text-gray-600">
											Criterios activos
										</div>
									</div>
								</div>
							</div>
							<div className="card p-6">
								<div className="flex items-center gap-4">
									<div className="p-3 bg-green-100 rounded-xl">
										<span className="text-green-600 text-xl">⚖️</span>
									</div>
									<div>
										<div className="text-2xl font-bold text-gray-900">
											{currentRubric.totalWeight}%
										</div>
										<div className="text-sm text-gray-600">
											Ponderación total
										</div>
									</div>
								</div>
							</div>
							<div className="card p-6">
								<div className="flex items-center gap-4">
									<div className="p-3 bg-purple-100 rounded-xl">
										<span className="text-purple-600 text-xl">🎯</span>
									</div>
									<div>
										<div className="text-2xl font-bold text-gray-900">10</div>
										<div className="text-sm text-gray-600">
											Puntuación máxima
										</div>
									</div>
								</div>
							</div>
							<div className="card p-6">
								<div className="flex items-center gap-4">
									<div className="p-3 bg-cyan-100 rounded-xl">
										<span className="text-cyan-600 text-xl">🤖</span>
									</div>
									<div>
										<div className="text-2xl font-bold text-gray-900">92%</div>
										<div className="text-sm text-gray-600">Precisión IA</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Layout>
		</ProtectedRoute>
	);
};

export default RubricsPage;
