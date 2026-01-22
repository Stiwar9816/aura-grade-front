"use client";

import {useState} from "react";
import {useQuery, useLazyQuery, useMutation} from "@apollo/client/react";
import {
	ALL_RUBRICS,
	RUBRIC_BY_ID,
	CREATE_RUBRIC,
	UPDATE_RUBRIC,
	DELETE_RUBRIC,
} from "@/gql/Rubrics";

import type {
	CreateRubricInput,
	Rubric,
	RubricData,
	RubricsData,
	RubricTemplate,
	UpdateRubricInput,
	RubricCriteria,
} from "@/types";
import {useAuth, useCriteria} from "@/hooks";

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
	});
	const [activeTab, setActiveTab] = useState<"builder" | "library" | "create">(
		"library",
	);
	const [isSaving, setIsSaving] = useState(false);

	const {
		deletedCriteriaIds,
		setDeletedCriteriaIds,
		deleteCriterion,
		createCriterion,
		updateCriterion,
	} = useCriteria();

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
			const result: any = await createRubricMutation({
				variables: {createRubricInput: payload},
			});
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
			const result: any = await updateRubricMutation({
				variables: {updateRubricInput: payload},
			});
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
		try {
			const success = await deleteRubric(id);
			if (success) {
				console.log("Rúbrica eliminada con éxito");
				// If the deleted rubric was the current one, reset it
				if (currentRubric.id === id) {
					setCurrentRubric({
						id: "",
						name: "",
						description: "",
						criteria: [],
						totalWeight: 0,
						isActive: false,
					});
				}
			}
		} catch (error) {
			console.error("Error al eliminar rúbrica:", error);
			alert("No se pudo eliminar la rúbrica.");
		}
	};

	/**
	 * Methods Rubric
	 */

	const handleStartRubric = async (data: {
		title: string;
		description: string;
	}) => {
		if (!user?.id) {
			alert("Error: No se ha identificado el usuario.");
			return;
		}

		try {
			const created = await createRubric({
				title: data.title,
				description: data.description,
				maxTotalScore: 0,
				userId: user.id,
			});

			if (created) {
				setCurrentRubric({
					id: created.id,
					name: created.title,
					description: created.description,
					criteria: [],
					totalWeight: 0,
					isActive: false,
				});
				setActiveTab("builder");
			}
		} catch (error) {
			console.error("Error al iniciar rúbrica:", error);
			alert("Error al iniciar la creación de la rúbrica.");
		}
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

					const isNew = criterion.id.length < 20;

					if (isNew) {
						await createCriterion(payload);
					} else {
						try {
							await updateCriterion({
								id: criterion.id,
								title: payload.title,
								maxPoints: payload.maxPoints,
								levels: payload.levels,
							});
						} catch (err: any) {
							const errorMessage = err.message || JSON.stringify(err);
							if (
								errorMessage.includes("not found") ||
								errorMessage.includes("no existe")
							) {
								await createCriterion(payload);
							} else {
								throw err;
							}
						}
					}
				}),
			);

			await refetch();
			const freshRubric = await loadRubric(savedRubricId);
			if (freshRubric) {
				setCurrentRubric({
					id: freshRubric.id,
					name: freshRubric.title,
					description: freshRubric.description,
					criteria: freshRubric.criteria
						? freshRubric.criteria.map((c: any) => ({
								id: c.id,
								title: c.title,
								description:
									c.description ||
									(c.levels && c.levels[0] ? c.levels[0].description : ""),
								weight: c.weight || 0,
								maxPoints: c.maxPoints,
								levels: c.levels,
							}))
						: [],
					totalWeight: freshRubric.criteria
						? freshRubric.criteria.reduce(
								(acc: number, c: any) => acc + (c.weight || 0),
								0,
							)
						: 0,
					isActive: false,
				});
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
					criteria: fullRubric.criteria
						? fullRubric.criteria.map((c: any) => ({
								id: c.id,
								title: c.title,
								description:
									c.description ||
									(c.levels && c.levels[0] ? c.levels[0].description : ""),
								weight: c.weight || 0,
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
					isActive: true,
				});
				setActiveTab("builder");
			}
		} catch (error) {
			console.error("Error al cargar la plantilla:", error);
		}
	};

	/**
	 * Methods Criteria
	 */
	const handleAddCriteria = (criteria: RubricCriteria) => {
		setCurrentRubric((prev) => {
			const potentialWeight =
				prev.criteria.reduce(
					(acc: number, c: any) => acc + (c.weight || 0),
					0,
				) + (criteria.weight || 0);

			if (potentialWeight > 100) {
				alert(
					`No se puede añadir. Ponderación total (${potentialWeight}%) excedería 100%.`,
				);
				return prev;
			}

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
				alert("No se puede actualizar. Ponderación total excedería 100%.");
				return prev;
			}

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
			if (criteriaToDelete && id.length > 20) {
				setDeletedCriteriaIds((ids) => [...ids, id]);
			}

			const newCriteria = prev.criteria.filter((c) => c.id !== id);
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
		rubrics: data?.rubrics || [],
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
		handleSelectTemplate,
		handleDeleteRubric,
		handleAddCriteria,
		handleUpdateCriteria,
		handleDeleteCriteria,
		isSaving,
		setActiveTab,
		setCurrentRubric,
	};
};
