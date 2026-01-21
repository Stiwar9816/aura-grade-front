"use client";

// Use client directive

import {useState} from "react";
import {useQuery, useLazyQuery, useMutation} from "@apollo/client/react";
import {
	ALL_RUBRICS,
	RUBRIC_BY_ID,
	CREATE_RUBRIC,
	UPDATE_RUBRIC,
	DELETE_RUBRIC,
} from "@/gql/Rubrics";
import {
	CREATE_CRITERIA,
	UPDATE_CRITERIA,
	DELETE_CRITERIA,
} from "@/gql/Criteria";
import type {
	CreateRubricInput,
	RubricData,
	RubricsData,
	RubricTemplate,
	UpdateRubricInput,
	CreateCriterionInput,
	UpdateCriterionInput,
	RubricCriteria,
} from "@/types";

/**
 * Unified hook for all rubric operations
 * Centralizes queries and mutations for rubrics
 */
export const useRubrics = () => {
	const [operationLoading, setOperationLoading] = useState(false);
	const [operationError, setOperationError] = useState<Error | null>(null);

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

	// Mutation: Create Criterion
	const [createCriterionMutation] = useMutation(CREATE_CRITERIA);

	// Mutation: Update Criterion
	const [updateCriterionMutation] = useMutation(UPDATE_CRITERIA);

	// Mutation: Delete Criterion
	const [deleteCriterionMutation] = useMutation(DELETE_CRITERIA);

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

	/**
	 * Create a new criterion
	 */
	const createCriterion = async (
		payload: CreateCriterionInput,
	): Promise<RubricCriteria | null> => {
		try {
			const result: any = await createCriterionMutation({
				variables: {createCriterionInput: payload},
			});
			return result.data?.createCriterion || null;
		} catch (error) {
			console.error("Error creating criterion:", error);
			throw error;
		}
	};

	/**
	 * Update an existing criterion
	 */
	const updateCriterion = async (
		payload: UpdateCriterionInput,
	): Promise<RubricCriteria | null> => {
		try {
			const result: any = await updateCriterionMutation({
				variables: {updateCriterionInput: payload},
			});
			return result.data?.updateCriterion || null;
		} catch (error) {
			console.error("Error updating criterion:", error);
			throw error;
		}
	};

	/**
	 * Delete a criterion
	 */
	const deleteCriterion = async (id: string): Promise<boolean> => {
		try {
			await deleteCriterionMutation({
				variables: {removeCriterionId: id},
			});
			return true;
		} catch (error) {
			console.error("Error deleting criterion:", error);
			throw error;
		}
	};

	return {
		// Query data
		rubrics: data?.rubrics || [],
		loading: queryLoading || rubricLoading,
		error: queryError || operationError,

		// Single rubric
		currentRubric: rubricData?.rubric || null,

		// Operations
		loadRubric,
		createRubric,
		updateRubric,
		deleteRubric,
		createCriterion,
		updateCriterion,
		deleteCriterion,
		refetch,

		// Operation states
		operationLoading,
		operationError,
	};
};

export default useRubrics;
