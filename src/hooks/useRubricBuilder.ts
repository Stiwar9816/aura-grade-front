import {useState} from "react";
import type {RubricCriteria} from "@/interface";

const defaultLevels = (criterion: string): RubricCriteria["levels"] => [
	{
		label: "Excelente",
		minScore: 4.5,
		maxScore: 5,
		description: `Demuestra un dominio excelente, completo y preciso de ${criterion}.`,
	},
	{
		label: "Bueno",
		minScore: 4,
		maxScore: 4.49,
		description: `Demuestra un buen dominio de ${criterion}, con oportunidades menores de mejora.`,
	},
	{
		label: "Aceptable",
		minScore: 3,
		maxScore: 3.99,
		description: `Cumple de forma aceptable los aspectos esenciales de ${criterion}.`,
	},
	{
		label: "Insuficiente",
		minScore: 0,
		maxScore: 2.99,
		description: `No demuestra todavía el dominio mínimo esperado de ${criterion}.`,
	},
];

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
		maxPoints: 5,
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
			maxPoints: 5,
			levels: defaultLevels(newCriteria.title),
		};

		onAddCriteria(criteria);
		setNewCriteria({
			id: "",
			title: "",
			description: "",
			weight: 10,
			maxPoints: 5,
			levels: [],
		});
		setShowAddForm(false);
	};

	const handleSave = () => {
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
