import {useState} from "react";
import type {RubricCriteria} from "@/types";

const useRubricBuilder = ({
	onAddCriteria,
}: {
	onAddCriteria: (criteria: RubricCriteria) => void;
}) => {
	const [showAddForm, setShowAddForm] = useState(false);
	const [newCriteria, setNewCriteria] = useState<Partial<RubricCriteria>>({
		id: "",
		title: "",
		description: "",
		weight: 10,
		maxPoints: 10,
		levels: [],
	});
	const [editingId, setEditingId] = useState<string | null>(null);

	const handleAdd = () => {
		if (!newCriteria.title || !newCriteria.description) return;

		const criteria: RubricCriteria = {
			id: newCriteria.id || Date.now().toString(),
			title: newCriteria.title!,
			description: newCriteria.description,
			weight: newCriteria.weight || 10,
			maxPoints: newCriteria.maxPoints || 10,
		};

		onAddCriteria(criteria);
		setNewCriteria({
			id: "",
			title: "",
			description: "",
			weight: 10,
			maxPoints: 10,
		});
		setShowAddForm(false);
	};

	const handleSave = (id: string) => {
		setEditingId(null);
	};

	return {
		showAddForm,
		setShowAddForm,
		newCriteria,
		setNewCriteria,
		editingId,
		setEditingId,
		handleAdd,
		handleSave,
	};
};

export default useRubricBuilder;
