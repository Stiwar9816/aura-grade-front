import React, {useState} from "react";
import Layout from "@/components/Layout";
import {
	RubricBuilder,
	RubricLibrary,
	RubricsCreate,
} from "@/components/Rubrics";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import {Rubric, RubricCriteria, UserRole, RubricTemplate} from "@/types";
import useAuth from "@/hooks/useAuth";
import useRubrics from "@/hooks/useRubrics";
import {exportToPDF, exportToCSV} from "@/utils/exportUtils";

const RubricsPage: React.FC = () => {
	// Fetch rubrics from API
	const {
		rubrics,
		loading,
		error,
		loadRubric,
		createRubric,
		updateRubric,

		createCriterion,
		updateCriterion,
		deleteCriterion,
		refetch,
	} = useRubrics();
	const {user} = useAuth();

	// New Rubric Form State moved to component

	const handleStartRubric = (data: {title: string; description: string}) => {
		setCurrentRubric({
			id: Date.now().toString(), // Temp ID
			name: data.title,
			description: data.description,
			criteria: [],
			totalWeight: 0,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			isActive: false,
		});

		setActiveTab("builder");
	};
	const [isSaving, setIsSaving] = useState(false);
	const [deletedCriteriaIds, setDeletedCriteriaIds] = useState<string[]>([]);
	const [activeTab, setActiveTab] = useState<"builder" | "library" | "create">(
		"library",
	);
	const [currentRubric, setCurrentRubric] = useState<Rubric>({
		id: "",
		name: "",
		description: "",
		criteria: [],
		totalWeight: 0,
		createdAt: "",
		updatedAt: "",
		isActive: false,
	});

	// Redirect if on builder without rubric
	React.useEffect(() => {
		if (activeTab === "builder" && !currentRubric.id) {
			setActiveTab("library");
		}
	}, [activeTab, currentRubric.id]);

	const handleAddCriteria = (criteria: RubricCriteria) => {
		setCurrentRubric((prev: any) => {
			const potentialWeight =
				prev.criteria.reduce(
					(acc: number, c: any) => acc + (c.weight || 0),
					0,
				) + (criteria.weight || 0);

			const potentialMaxPoints =
				prev.criteria.reduce((acc: number, c: any) => acc + c.maxPoints, 0) +
				criteria.maxPoints;

			if (potentialWeight > 100) {
				alert(
					`No se puede añadir el criterio. La ponderación total (${potentialWeight}%) excedería el 100%.`,
				);
				return prev;
			}

			if (potentialMaxPoints > 100) {
				alert(
					`No se puede añadir el criterio. Los puntos totales (${potentialMaxPoints}) excederían 100.`,
				);
				return prev;
			}

			const newCriteria = [...prev.criteria, criteria];
			return {
				...prev,
				criteria: newCriteria,
				totalWeight: potentialWeight,
			};
		});
	};

	const handleUpdateCriteria = (
		id: string,
		updated: Partial<RubricCriteria>,
	) => {
		setCurrentRubric((prev: any) => {
			// Calculate new weight for the specific criteria
			const criteriaIndex = prev.criteria.findIndex((c: any) => c.id === id);
			if (criteriaIndex === -1) return prev;

			const oldWeight = prev.criteria[criteriaIndex].weight || 0;
			const newWeight =
				updated.weight !== undefined ? updated.weight : oldWeight;

			const oldMaxPoints = prev.criteria[criteriaIndex].maxPoints;
			const newMaxPoints =
				updated.maxPoints !== undefined ? updated.maxPoints : oldMaxPoints;

			const currentTotalWeightWithoutTarget = prev.totalWeight - oldWeight;
			const currentTotalPointsWithoutTarget =
				prev.criteria.reduce((acc: number, c: any) => acc + c.maxPoints, 0) -
				oldMaxPoints;

			if (currentTotalWeightWithoutTarget + newWeight > 100) {
				alert(
					`No se puede actualizar. La ponderación total excedería el 100%.`,
				);
				return prev;
			}

			if (currentTotalPointsWithoutTarget + newMaxPoints > 100) {
				alert(`No se puede actualizar. Los puntos totales excederían 100.`);
				return prev;
			}

			const newCriteria = prev.criteria.map((c: any) =>
				c.id === id ? {...c, ...updated} : c,
			);
			const newTotalWeight = newCriteria.reduce(
				(acc: number, c: any) => acc + (c.weight || 0),
				0,
			);
			return {
				...prev,
				criteria: newCriteria,
				totalWeight: newTotalWeight,
			};
		});
	};

	const handleDeleteCriteria = (id: string) => {
		setCurrentRubric((prev: any) => {
			const criteriaToDelete = prev.criteria.find((c: any) => c.id === id);

			// If it's a real ID (not numeric timestamp), add to deleted list
			// Assuming real IDs are UUIDs and timestamps are numbers converted to string
			// Simple check: if it looks like a UUID or comes from DB
			if (criteriaToDelete && id.length > 20) {
				setDeletedCriteriaIds((prev) => [...prev, id]);
			}

			const newCriteria = prev.criteria.filter((c: any) => c.id !== id);
			return {
				...prev,
				criteria: newCriteria,
				totalWeight: newCriteria.reduce(
					(acc: number, c: any) => acc + (c.weight || 0),
					0,
				),
			};
		});
	};

	const handleSaveRubric = async (rubricToSave: Rubric = currentRubric) => {
		setIsSaving(true);
		try {
			// 1. Save Rubric Header
			if (!user?.id) {
				alert("Error: No se ha identificado el usuario.");
				setIsSaving(false);
				return;
			}

			// Check if it's a real ID (existing rubric) or temp ID (new rubric)
			const isNewRubric = !rubricToSave.id || rubricToSave.id.length < 20;
			let savedRubricId = "";

			if (!isNewRubric) {
				// UPDATE
				const updatePayload = {
					id: rubricToSave.id,
					title: rubricToSave.name,
					description: rubricToSave.description,
					maxTotalScore: rubricToSave.criteria.reduce(
						(acc, c) => acc + c.maxPoints,
						0,
					),
				};
				const updated = await updateRubric(updatePayload);
				if (updated) savedRubricId = updated.id;
				console.log("Rúbrica actualizada");
			} else {
				// CREATE
				const createPayload = {
					title: rubricToSave.name,
					description: rubricToSave.description,
					maxTotalScore: rubricToSave.criteria.reduce(
						(acc, c) => acc + c.maxPoints,
						0,
					),
					userId: user.id,
				};
				const created = await createRubric(createPayload);
				if (created) savedRubricId = created.id;
				console.log("Rúbrica creada", savedRubricId);
			}

			if (!savedRubricId) throw new Error("No se pudo guardar la rúbrica");

			// 2. Process Criteria Deletions
			if (deletedCriteriaIds.length > 0) {
				await Promise.all(deletedCriteriaIds.map((id) => deleteCriterion(id)));
				setDeletedCriteriaIds([]);
			}

			// 3. Process Criteria Upserts
			await Promise.all(
				rubricToSave.criteria.map(async (criterion) => {
					// Prepare payload ensuring description is preserved in levels if needed
					// ... (rest of logic)
					const levelsPayload =
						criterion.levels && criterion.levels.length > 0
							? criterion.levels.map((l: any) => ({
									description: l.description,
									score: l.score,
								}))
							: [
									{
										description: criterion.description || "Criterio General",
										score: criterion.maxPoints,
									},
								];

					const payload = {
						rubric: savedRubricId,
						title: criterion.title,
						maxPoints: criterion.maxPoints,
						levels: levelsPayload,
					};

					console.log("Procesando criterio:", payload); // Debug log

					// Check if it's a new criterion (timestamp ID)
					const isNew = criterion.id.length < 20;

					if (isNew) {
						await createCriterion(payload);
					} else {
						// Update existing
						try {
							await updateCriterion({
								id: criterion.id,
								title: payload.title,
								maxPoints: payload.maxPoints,
								levels: payload.levels,
							});
						} catch (err: any) {
							// Check if error implies "not found" to try recreation
							const errorMessage = err.message || JSON.stringify(err);
							if (
								errorMessage.includes("not found") ||
								errorMessage.includes("no existe")
							) {
								console.warn(
									`Criterio ${criterion.id} no encontrado, intentando recrear...`,
								);
								await createCriterion(payload);
							} else {
								throw err;
							}
						}
					}
				}),
			);

			await refetch();
			// Reload rubric to get fresh IDs for new criteria
			const freshRubric = await loadRubric(savedRubricId);
			if (freshRubric) {
				// Re-sync state
				setCurrentRubric((prev) => ({
					...prev,
					id: freshRubric.id,
					criteria: freshRubric.criteria || [],
					// Maintain other local state if needed
				}));
			}
		} catch (error: any) {
			console.error("Error al guardar:", error);
			alert("Error al guardar la rúbrica y sus criterios.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleSelectTemplate = async (template: RubricTemplate) => {
		try {
			const fullRubric = await loadRubric(template.id);
			if (fullRubric) {
				setCurrentRubric({
					id: fullRubric.id,
					name: fullRubric.title,
					description: fullRubric.description,
					// Map the criteria from API to our RubricCriteria format
					criteria: fullRubric.criteria
						? fullRubric.criteria.map((c: any) => ({
								id: c.id,
								title: c.title,
								description:
									c.description ||
									(c.levels && c.levels[0] ? c.levels[0].description : ""),
								weight: c.weight || 0, // Fallback if weight is missing
								maxPoints: c.maxPoints,
								levels: c.levels,
							}))
						: [],
					totalWeight: fullRubric.criteria
						? fullRubric.criteria.reduce(
								(acc: any, c: any) => acc + (c.weight || 0),
								0,
							)
						: 100,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					isActive: true,
				});
				setActiveTab("builder");
			}
		} catch (error) {
			console.error("Error al cargar la plantilla:", error);
		}
	};

	return (
		<ProtectedRoute requiredRole={UserRole.TEACHER}>
			<Layout title="Gestor de Rúbricas">
				<div className="max-w-7xl mx-auto">
					{/* Header con Tabs */}
					<div className="mb-8">
						<div className="flex flex-col md:flex-row md:items-end justify-end gap-4 mb-6">
							<div className="flex gap-3">
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
							</div>
						</div>

						{/* Tabs */}
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
					{/* Stats */}
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
							templates={rubrics}
							loading={loading}
							error={error}
							onSelectTemplate={handleSelectTemplate}
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
