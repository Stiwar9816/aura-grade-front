import {useEffect, type ReactNode} from "react";
import {useRouter} from "next/router";
import Layout from "@/components/Layout";
import {
	RubricBuilder,
	RubricLibrary,
	RubricsCreate,
} from "@/components/Rubrics";
import {ProtectedRoute} from "@/components/Auth";
import {useRubrics} from "@/hooks";
import {exportToPDF} from "@/utils";
import {UserRole} from "@/interface";
import {notifyError, notifySuccess} from "@/utils/toastNotify";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
	faBook,
	faChartLine,
	faFilePdf,
	faFileText,
	faGears,
	faPercent,
	faStar,
} from "@fortawesome/free-solid-svg-icons";

export const RubricsPage = () => {
	const router = useRouter();
	const {
		rubrics,
		loading,
		error,
		currentRubric,
		activeTab,
		setActiveTab,
		handleStartRubric,
		handleGenerateRubric,
		handleSaveRubric,
		handleSelectTemplate,
		handleAddCriteria,
		handleUpdateCriteria,
		handleDeleteCriteria,
		handleDeleteRubric,
		isSaving,
		isGenerating,
	} = useRubrics();

	const handleExportPDF = async () => {
		try {
			await exportToPDF(currentRubric);
			notifySuccess("Rúbrica exportada en PDF.");
		} catch (error) {
			notifyError(
				error instanceof Error ? error.message : "No se pudo exportar el PDF.",
			);
		}
	};

	// Redirect only when there is no saved or local draft to edit.
	useEffect(() => {
		if (
			activeTab === "builder" &&
			!currentRubric.name.trim()
		) {
			setActiveTab("library");
		}
	}, [activeTab, currentRubric.name, setActiveTab]);

	useEffect(() => {
		if (router.isReady && router.query.copilot === "1") setActiveTab("create");
	}, [router.isReady, router.query.copilot, setActiveTab]);

	const handleSaveAndReturn = async () => {
		const saved = await handleSaveRubric();
		if (
			saved &&
			router.query.returnTo === "/teacher/assignments"
		) {
			await router.push({
				pathname: "/teacher/assignments",
				query: {rubricId: saved.id},
			});
		}
	};

	const tabs: {
		id: "create" | "library" | "builder";
		label: string;
		icon: ReactNode;
	}[] = [
		{
			id: "create",
			label: "Crear Rúbrica",
			icon: <FontAwesomeIcon icon={faFileText} />,
		},
		{
			id: "library",
			label: "Biblioteca",
			icon: <FontAwesomeIcon icon={faBook} />,
		},
		{
			id: "builder",
			label: "Constructor",
			icon: <FontAwesomeIcon icon={faGears} />,
		},
	];

	return (
		<ProtectedRoute requiredRole={UserRole.TEACHER}>
			<Layout title="Gestor de Rúbricas">
				<div className="max-w-7xl mx-auto">
					<div className="mb-8">
						{currentRubric.name.trim() && (
							<div className="flex flex-col md:flex-row md:items-end justify-end gap-4 mb-6">
								<div className="flex gap-3">
									<>
										<button
											onClick={() => void handleExportPDF()}
											className="p-2 text-xl text-gray-500 hover:text-blue-600 hover:bg-electric-50 rounded-lg transition-all"
											title="Exportar PDF"
										>
											<FontAwesomeIcon icon={faFilePdf} />
										</button>

										<button
										onClick={() => void handleSaveAndReturn()}
											disabled={isSaving || currentRubric.totalWeight !== 100}
											className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
										>
											{isSaving
												? "Guardando..."
												: router.query.returnTo === "/teacher/assignments"
													? "Guardar y volver a la tarea"
													: "Guardar Rúbrica"}
										</button>
									</>
								</div>
							</div>
						)}

						<div className="border-b border-gray-200">
							<nav className="flex space-x-8">
								{tabs
									.filter(
										(tab) =>
											tab.id !== "builder" ||
											currentRubric.name.trim(),
									)
									.map((tab) => (
										<button
											key={tab.id}
											onClick={() => setActiveTab(tab.id)}
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
										<span className="text-electric-600 text-xl">
											<FontAwesomeIcon icon={faChartLine} />
										</span>
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
										<span className="text-green-600 text-xl">
											<FontAwesomeIcon icon={faPercent} />
										</span>
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
										<span className="text-purple-600 text-xl">
											<FontAwesomeIcon icon={faStar} />
										</span>
									</div>
									<div>
										<div className="text-2xl font-bold text-gray-900">
											5.0
										</div>
										<div className="text-sm text-gray-600">
											Escala máxima
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
						<RubricsCreate
							onStart={handleStartRubric}
							onGenerate={handleGenerateRubric}
							isGenerating={isGenerating}
							initialData={{
								title:
									typeof router.query.title === "string"
										? router.query.title
										: undefined,
								description:
									typeof router.query.description === "string"
										? router.query.description
										: undefined,
							}}
						/>
					)}
				</div>
			</Layout>
		</ProtectedRoute>
	);
};

export default RubricsPage;
