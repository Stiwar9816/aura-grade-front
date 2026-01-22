"use client";

import {useState} from "react";
import {useMutation} from "@apollo/client/react";
import {
	CREATE_CRITERIA,
	UPDATE_CRITERIA,
	DELETE_CRITERIA,
} from "@/gql/Criteria";
import type {
	CreateCriterionInput,
	UpdateCriterionInput,
	RubricCriteria,
} from "@/types";

export const useCriteria = () => {
	const [deletedCriteriaIds, setDeletedCriteriaIds] = useState<string[]>([]);

	// Mutation: Create Criterion
	const [createCriterionMutation] = useMutation(CREATE_CRITERIA);

	// Mutation: Update Criterion
	const [updateCriterionMutation] = useMutation(UPDATE_CRITERIA);

	// Mutation: Delete Criterion
	const [deleteCriterionMutation] = useMutation(DELETE_CRITERIA);

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
		createCriterion,
		updateCriterion,
		deleteCriterion,
		deletedCriteriaIds,
		setDeletedCriteriaIds,
	};
};
