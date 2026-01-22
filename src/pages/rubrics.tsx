import {useEffect} from "react";
import Layout from "@/components/Layout";
import {
	RubricBuilder,
	RubricLibrary,
	RubricsCreate,
} from "@/components/Rubrics";
import {ProtectedRoute} from "@/components/Auth";
import {useRubrics} from "@/hooks";
import {exportToPDF, exportToCSV} from "@/utils";
import {UserRole} from "@/types";

export const RubricsPage = () => {
	const {
		rubrics,
		loading,
		error,
		currentRubric,
		activeTab,
		setActiveTab,
		handleStartRubric,
		handleSaveRubric,
		handleSelectTemplate,
		handleAddCriteria,
		handleUpdateCriteria,
		handleDeleteCriteria,
		handleDeleteRubric,
	} = useRubrics();

	// Redirect if on builder without rubric
	useEffect(() => {
		if (
			activeTab === "builder" &&
			(!currentRubric.id || currentRubric.id === "")
		) {
			setActiveTab("library");
		}
	}, [activeTab, currentRubric.id, setActiveTab]);

	return (
		<ProtectedRoute requiredRole={UserRole.TEACHER}>
			<Layout title="Gestor de Rúbricas">
				<div className="max-w-7xl mx-auto">
					<div className="mb-8">
						{currentRubric.id && currentRubric.id !== "" && (
							<div className="flex flex-col md:flex-row md:items-end justify-end gap-4 mb-6">
								<div className="flex gap-3">
									<>
										<button
											onClick={() => exportToCSV(currentRubric)}
											className="btn-ghost text-sm"
											title="Exportar CSV"
										>
											CSV
										</button>
										<button
											onClick={() => exportToPDF(currentRubric)}
											className="btn-ghost text-sm"
											title="Exportar PDF"
										>
											PDF
										</button>

										<button
											onClick={() => handleSaveRubric()}
											className="btn-primary"
										>
											Guardar Rúbrica
										</button>
									</>
								</div>
							</div>
						)}

						<div className="border-b border-gray-200">
							<nav className="flex space-x-8">
								{[
									{id: "create", label: "Crear Rúbrica", icon: "✨"},
									{id: "library", label: "Biblioteca", icon: "📚"},
									{id: "builder", label: "Constructor", icon: "⚙️"},
								]
									.filter(
										(tab) =>
											tab.id !== "builder" ||
											(currentRubric.id && currentRubric.id !== ""),
									)
									.map((tab) => (
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

					<div className="my-8">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
										<div className="text-2xl font-bold text-gray-900">
											{currentRubric.criteria.reduce(
												(acc: any, c: any) => acc + c.maxPoints,
												0,
											)}
										</div>
										<div className="text-sm text-gray-600">
											Puntuación máxima
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

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
							templates={rubrics}
							loading={loading}
							error={error}
							onSelectTemplate={handleSelectTemplate}
							onDeleteTemplate={handleDeleteRubric}
							onCreateNew={() => setActiveTab("create")}
						/>
					)}

					{activeTab === "create" && (
						<RubricsCreate onStart={handleStartRubric} />
					)}
				</div>
			</Layout>
		</ProtectedRoute>
	);
};

export default RubricsPage;
