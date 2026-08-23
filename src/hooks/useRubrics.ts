"use client";

import {useState} from "react";
import {useQuery, useLazyQuery, useMutation} from "@apollo/client/react";
import {
	ALL_RUBRICS,
	RUBRIC_BY_ID,
	CREATE_RUBRIC,
	UPDATE_RUBRIC,
	DELETE_RUBRIC,
	GENERATE_RUBRIC_DRAFT,
	SAVE_RUBRIC_DRAFT,
} from "@/gql/Rubrics";
import {
	notifyError,
	notifyInfo,
	notifyLoading,
	notifySuccess,
	notifyWarning,
} from "@/utils/toastNotify";

import type {
	CreateRubricInput,
	Rubric,
	RubricData,
	RubricsData,
	RubricTemplate,
	UpdateRubricInput,
	RubricCriteria,
	GenerateRubricInput,
	GeneratedRubric,
} from "@/interface";
import {UserRole} from "@/interface";
import {useAuth} from "@/hooks";

const mapTemplateToRubric = (template: RubricTemplate): Rubric => {
	const criteria = (template.criteria || []).map((criterion, index) => ({
		...criterion,
		description: criterion.description || "",
		weight: Number(criterion.weight || 0),
		maxPoints: 5,
		sortOrder: criterion.sortOrder ?? index,
		levels: criterion.levels || [],
	}));
	return {
		id: template.id,
		name: template.title,
		description: template.description,
		criteria,
		totalWeight: Number(
			criteria.reduce((sum, criterion) => sum + criterion.weight, 0).toFixed(2),
		),
		isActive: template.status === "PUBLISHED",
		academicLevel: template.academicLevel,
		status: template.status,
		source: template.source,
		version: template.version,
	};
};

export const useRubrics = () => {
	const [operationLoading, setOperationLoading] = useState(false);
	const [operationError, setOperationError] = useState<Error | null>(null);
	const [currentRubric, setCurrentRubric] = useState<Rubric>({
		id: "",
		name: "",
		description: "",
		criteria: [],
		totalWeight: 0,
		isActive: false,
		academicLevel: "UNIVERSITARIO",
	});
	const [activeTab, setActiveTab] = useState<"builder" | "library" | "create">(
		"library",
	);
	const [isSaving, setIsSaving] = useState(false);

	const {user} = useAuth();

	// Query: Get all rubrics
	const {
		data,
		loading: queryLoading,
		error: queryError,
		refetch,
	} = useQuery<RubricsData>(ALL_RUBRICS, {
		fetchPolicy: "cache-and-network",
		notifyOnNetworkStatusChange: true,
	});

	// Lazy Query: Get single rubric by ID
	const [getRubricById, {data: rubricData, loading: rubricLoading}] =
		useLazyQuery<RubricData>(RUBRIC_BY_ID, {
			fetchPolicy: "network-only",
		});

	// Mutation: Create rubric
	const [createRubricMutation] = useMutation(CREATE_RUBRIC, {
		refetchQueries: [{query: ALL_RUBRICS}],
	});

	// Mutation: Update rubric
	const [updateRubricMutation] = useMutation(UPDATE_RUBRIC, {
		refetchQueries: [{query: ALL_RUBRICS}],
	});

	// Mutation: Delete rubric
	const [deleteRubricMutation] = useMutation(DELETE_RUBRIC, {
		refetchQueries: [{query: ALL_RUBRICS}],
	});

	const [generateRubricMutation, {loading: isGenerating}] = useMutation(
		GENERATE_RUBRIC_DRAFT,
	);
	const [saveRubricDraftMutation] = useMutation(SAVE_RUBRIC_DRAFT, {
		refetchQueries: [{query: ALL_RUBRICS}],
	});

	/**
	 * Load a specific rubric by ID
	 */
	const loadRubric = async (id: string): Promise<RubricTemplate | null> => {
		try {
			setOperationLoading(true);
			setOperationError(null);
			const result = await getRubricById({variables: {rubricId: id}});
			return result.data?.rubric || null;
		} catch (error) {
			setOperationError(error as Error);
			return null;
		} finally {
			setOperationLoading(false);
		}
	};

	/**
	 * Create a new rubric
	 */
	const createRubric = async (
		payload: CreateRubricInput,
	): Promise<RubricTemplate | null> => {
		try {
			setOperationLoading(true);
			setOperationError(null);
			const result = await createRubricMutation({
				variables: {createRubricInput: payload},
			}) as {data?: {createRubric?: RubricTemplate}};
			return result.data?.createRubric || null;
		} catch (error) {
			setOperationError(error as Error);
			throw error;
		} finally {
			setOperationLoading(false);
		}
	};

	/**
	 * Update an existing rubric
	 */
	const updateRubric = async (
		payload: UpdateRubricInput,
	): Promise<RubricTemplate | null> => {
		try {
			setOperationLoading(true);
			setOperationError(null);
			const result = await updateRubricMutation({
				variables: {updateRubricInput: payload},
			}) as {data?: {updateRubric?: RubricTemplate}};
			return result.data?.updateRubric || null;
		} catch (error) {
			setOperationError(error as Error);
			throw error;
		} finally {
			setOperationLoading(false);
		}
	};

	/**
	 * Delete a rubric
	 */
	const deleteRubric = async (id: string): Promise<boolean> => {
		try {
			setOperationLoading(true);
			setOperationError(null);
			await deleteRubricMutation({
				variables: {removeRubricId: id},
			});
			return true;
		} catch (error) {
			setOperationError(error as Error);
			throw error;
		} finally {
			setOperationLoading(false);
		}
	};

	const handleDeleteRubric = async (id: string) => {
		const notificationId = notifyLoading("Eliminando rúbrica...");
		try {
			const success = await deleteRubric(id);
			if (success) {
				notifySuccess("Rúbrica eliminada correctamente.", {
					id: notificationId,
				});
				// If the deleted rubric was the current one, reset it
				if (currentRubric.id === id) {
					setCurrentRubric({
						id: "",
						name: "",
						description: "",
						criteria: [],
						totalWeight: 0,
						isActive: false,
						academicLevel: "UNIVERSITARIO",
					});
				}
			}
		} catch (error) {
			console.error("Error al eliminar rúbrica:", error);
			notifyError("No se pudo eliminar la rúbrica.", {id: notificationId});
		}
	};

	/**
	 * Methods Rubric
	 */

	const handleStartRubric = async (data: {
		title: string;
		description: string;
		academicLevel: Rubric["academicLevel"];
	}) => {
		if (!user?.id) {
			notifyError("No se ha identificado el usuario.");
			return;
		}

		setCurrentRubric({
			id: "",
			name: data.title,
			description: data.description,
			criteria: [],
			totalWeight: 0,
			isActive: false,
			academicLevel: data.academicLevel,
			status: "DRAFT",
			source: "MANUAL",
			version: 1,
		});
		setActiveTab("builder");
		notifyInfo("Borrador manual iniciado. Agrega criterios antes de guardarlo.");
	};

	const handleGenerateRubric = async (input: GenerateRubricInput) => {
		const notificationId = notifyLoading("Generando rúbrica con IA...");
		try {
			const result = (await generateRubricMutation({variables: {input}})) as {
				data?: {generateRubricDraft?: GeneratedRubric};
			};
			const generated = result.data?.generateRubricDraft;
			if (!generated) throw new Error("La IA no devolvió un borrador válido.");
			setCurrentRubric({
				id: "",
				name: generated.title,
				description: generated.description,
				academicLevel: generated.academicLevel,
				criteria: generated.criteria.map((criterion, index) => ({
					...criterion,
					id: `ai-${Date.now()}-${index}`,
					maxPoints: 5,
					sortOrder: index,
				})),
				totalWeight: generated.criteria.reduce(
					(sum, criterion) => sum + criterion.weight,
					0,
				),
				isActive: false,
				status: "DRAFT",
				source: "AI",
				version: 1,
				generationToken: generated.generationToken,
			});
			setActiveTab("builder");
			notifySuccess("Borrador generado. Revísalo antes de guardarlo.", {
				id: notificationId,
			});
		} catch (error) {
			notifyError(
				error instanceof Error ? error.message : "No se pudo generar la rúbrica.",
				{id: notificationId},
			);
			throw error;
		}
	};

	const handleSaveRubric = async (
		rubricToSave: Rubric = currentRubric,
	): Promise<RubricTemplate | null> => {
		if (!user?.id) {
			notifyError("No se ha identificado el usuario.");
			return null;
		}

		setIsSaving(true);
		const notificationId = notifyLoading("Guardando rúbrica y criterios...");
		try {
			if (rubricToSave.totalWeight !== 100)
				throw new Error("Los porcentajes deben sumar exactamente 100%.");
			const result = (await saveRubricDraftMutation({
				variables: {
					input: {
						...(rubricToSave.id ? {id: rubricToSave.id} : {}),
						title: rubricToSave.name,
						description: rubricToSave.description,
						academicLevel: rubricToSave.academicLevel,
						criteria: rubricToSave.criteria.map((criterion) => ({
							title: criterion.title,
							description: criterion.description,
							weight: criterion.weight,
							levels: criterion.levels.map((level) => ({
								label: level.label,
								description: level.description,
							})),
						})),
						...(rubricToSave.generationToken
							? {generationToken: rubricToSave.generationToken}
							: {}),
					},
				},
			})) as {data?: {saveRubricDraft?: RubricTemplate}};
			const saved = result.data?.saveRubricDraft;
			if (!saved) throw new Error("No se pudo guardar la rúbrica.");
			setCurrentRubric(mapTemplateToRubric(saved));
			await refetch();
			notifySuccess(`Rúbrica "${rubricToSave.name}" guardada correctamente.`, {
				id: notificationId,
			});
			return saved;
		} catch (error: unknown) {
			console.error("Error al guardar:", error);
			notifyError(
				error instanceof Error
					? error.message
					: "Error al guardar la rúbrica y sus criterios.",
				{id: notificationId},
			);
			return null;
		} finally {
			setIsSaving(false);
		}
	};

	const handleSelectTemplate = async (template: RubricTemplate) => {
		try {
			const fullRubric = await loadRubric(template.id);
			if (fullRubric) {
				setCurrentRubric(mapTemplateToRubric(fullRubric));
				setActiveTab("builder");
			}
		} catch (error) {
			console.error("Error al cargar la plantilla:", error);
			notifyError("No se pudo cargar la rúbrica seleccionada.");
		}
	};

	/**
	 * Methods Criteria
	 */
	const handleAddCriteria = (criteria: RubricCriteria) => {
		setCurrentRubric((prev) => {
			const potentialWeight =
				prev.criteria.reduce(
					(acc: number, c: RubricCriteria) => acc + (c.weight || 0),
					0,
				) + (criteria.weight || 0);

			if (potentialWeight > 100) {
				notifyWarning(
					`No se puede añadir. Ponderación total (${potentialWeight}%) excedería 100%.`,
				);
				return prev;
			}
			notifyInfo(`Criterio "${criteria.title}" agregado al borrador.`);

			return {
				...prev,
				criteria: [...prev.criteria, criteria],
				totalWeight: potentialWeight,
			};
		});
	};

	const handleUpdateCriteria = (
		id: string,
		updated: Partial<RubricCriteria>,
	) => {
		setCurrentRubric((prev) => {
			const newCriteria = prev.criteria.map((c) =>
				c.id === id ? {...c, ...updated} : c,
			);

			const newTotalWeight = newCriteria.reduce(
				(acc, c) => acc + (c.weight || 0),
				0,
			);

			if (newTotalWeight > 100) {
				notifyWarning("No se puede actualizar. Ponderación total excedería 100%.");
				return prev;
			}

			notifyInfo("Criterio actualizado en el borrador.");
			return {
				...prev,
				criteria: newCriteria,
				totalWeight: newTotalWeight,
			};
		});
	};

	const handleDeleteCriteria = (id: string) => {
		setCurrentRubric((prev) => {
			const criteriaToDelete = prev.criteria.find((c) => c.id === id);
			const newCriteria = prev.criteria.filter((c) => c.id !== id);
			if (criteriaToDelete) {
				notifyInfo(`Criterio "${criteriaToDelete.title}" eliminado del borrador.`);
			}
			return {
				...prev,
				criteria: newCriteria,
				totalWeight: newCriteria.reduce((acc, c) => acc + (c.weight || 0), 0),
			};
		});
	};

	return {
		error: queryError || operationError,
		loading: queryLoading || rubricLoading,
		rubrics:
			user?.role === UserRole.TEACHER && user.id
				? (data?.rubrics || []).filter((rubric) => rubric.user?.id === user.id)
				: data?.rubrics || [],
		rubric: rubricData?.rubric || null,
		createRubric,
		deleteRubric,
		loadRubric,
		refetch,
		updateRubric,
		operationLoading,
		operationError,
		activeTab,
		currentRubric,
		handleSaveRubric,
		handleStartRubric,
		handleGenerateRubric,
		handleSelectTemplate,
		handleDeleteRubric,
		handleAddCriteria,
		handleUpdateCriteria,
		handleDeleteCriteria,
		isSaving,
		isGenerating,
		setActiveTab,
		setCurrentRubric,
	};
};
