import React, {useState} from "react";
import {RubricBuilderProps, RubricCriteria} from "@/types";

export const RubricBuilder: React.FC<RubricBuilderProps> = ({
	rubric,
	onAddCriteria,
	onUpdateCriteria,
	onDeleteCriteria,
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
			id: newCriteria.id!,
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
		// Los cambios ya se aplican en tiempo real
	};

	return (
		<div className="space-y-6">
			{/* Header de la rúbrica */}
			<div className="card p-6">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h2 className="text-xl font-bold text-gray-900">{rubric.name}</h2>
						<p className="text-gray-600 mt-1">{rubric.description}</p>
					</div>
					<div className="text-right">
						<div className="text-sm text-gray-600">Ponderación total</div>
						<div
							className={`text-2xl font-bold ${
								rubric.totalWeight === 100 ? "text-green-600" : "text-red-600"
							}`}
						>
							{rubric.totalWeight}%
						</div>
						{rubric.totalWeight !== 100 && (
							<div className="text-sm text-red-500 mt-1">
								{rubric.totalWeight < 100 ? "Falta " : "Excede "}
								{Math.abs(100 - rubric.totalWeight)}%
							</div>
						)}
					</div>
				</div>

				{/* Barra de progreso de ponderación segmentada */}
				<div className="mb-6">
					<div className="flex justify-between text-sm text-gray-600 mb-2 font-medium">
						<span>Distribución visual de ponderación</span>
						<span>{rubric.totalWeight}/100%</span>
					</div>
					<div className="w-full h-6 bg-gray-100 rounded-xl overflow-hidden flex gap-0.5 p-1 border border-gray-200">
						{rubric.criteria.map((c, idx) => (
							<div
								key={c.id}
								className="h-full rounded-sm transition-all duration-500 hover:opacity-80"
								style={{
									width: `${c.weight}%`,
									backgroundColor: `hsl(${(idx * 137.5) % 360}, 70%, 60%)`,
								}}
								title={`${c.title}: ${c.weight}%`}
							/>
						))}
						{rubric.totalWeight < 100 && (
							<div
								className="h-full bg-gray-200 animate-pulse rounded-sm"
								style={{width: `${100 - rubric.totalWeight}%`}}
							/>
						)}
					</div>
					<div className="flex flex-wrap gap-3 mt-3">
						{rubric.criteria.map((c, idx) => (
							<div
								key={c.id}
								className="flex items-center gap-1.5 text-xs text-gray-500"
							>
								<div
									className="w-2 h-2 rounded-full"
									style={{
										backgroundColor: `hsl(${(idx * 137.5) % 360}, 70%, 60%)`,
									}}
								/>
								<span>{c.title}</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Constructor de criterios (Collapsible) */}
			<div className="card overflow-hidden transition-all duration-300">
				<button
					onClick={() => setShowAddForm(!showAddForm)}
					className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
				>
					<h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
						<span>{showAddForm ? "➖" : "➕"}</span>
						{showAddForm ? "Cerrar Constructor" : "Añadir Nuevo Criterio"}
					</h3>
					{!showAddForm && (
						<span className="text-sm text-electric-500 font-medium">
							Click para expandir →
						</span>
					)}
				</button>

				{showAddForm && (
					<div className="p-6 pt-0 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Nombre del Criterio
								</label>
								<input
									type="text"
									value={newCriteria.title}
									onChange={(e) =>
										setNewCriteria({...newCriteria, title: e.target.value})
									}
									className="input-primary"
									placeholder="Ej: Ortografía y Gramática"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Ponderación (%)
								</label>
								<div className="flex items-center gap-3">
									<input
										type="range"
										min="5"
										max="50"
										step="5"
										value={newCriteria.weight}
										onChange={(e) =>
											setNewCriteria({
												...newCriteria,
												weight: parseInt(e.target.value),
											})
										}
										className="flex-1 accent-electric-500"
									/>
									<span className="w-16 text-center font-bold text-electric-500">
										{newCriteria.weight}%
									</span>
								</div>
							</div>
						</div>

						<div className="mb-6">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Descripción
							</label>
							<textarea
								value={newCriteria.description}
								onChange={(e) =>
									setNewCriteria({...newCriteria, description: e.target.value})
								}
								className="input-primary min-h-[100px]"
								placeholder="Describe qué evalúa este criterio..."
								rows={3}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Puntuación Máxima
								</label>
								<select
									value={newCriteria.maxPoints}
									onChange={(e) =>
										setNewCriteria({
											...newCriteria,
											maxPoints: parseInt(e.target.value),
										})
									}
									className="input-primary"
								>
									{[5, 10, 15, 20, 25].map((score) => (
										<option key={score} value={score}>
											{score} puntos
										</option>
									))}
								</select>
							</div>
							<div className="flex items-end">
								<button
									onClick={handleAdd}
									disabled={!newCriteria.title || !newCriteria.description}
									className={`w-full py-3 rounded-xl font-semibold transition-all ${
										!newCriteria.title || !newCriteria.description
											? "bg-gray-300 text-gray-500 cursor-not-allowed"
											: "btn-primary shadow-lg shadow-electric-200"
									}`}
								>
									Añadir a la Rúbrica
								</button>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Lista de criterios */}
			<div className="card p-6">
				<h3 className="text-lg font-bold text-gray-900 mb-6">
					Criterios Configurados ({rubric.criteria.length})
				</h3>

				<div className="space-y-4">
					{rubric.criteria.map((criteria, index) => (
						<div
							key={criteria.id}
							className="p-4 border border-gray-200 rounded-xl hover:border-electric-500 transition-colors group"
						>
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-2">
										<span className="text-xl">📋</span>
										<div>
											<div className="font-semibold text-gray-900">
												{criteria.title}
											</div>
											<div className="text-sm text-gray-600">
												{criteria.description}
											</div>
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
										<div>
											<label className="text-sm text-gray-600">
												Ponderación
											</label>
											<div className="flex items-center gap-2">
												<input
													type="range"
													min="5"
													max="50"
													step="5"
													value={criteria.weight}
													onChange={(e) =>
														onUpdateCriteria(criteria.id, {
															weight: parseInt(e.target.value),
														})
													}
													className="flex-1"
												/>
												<span className="w-12 text-center font-bold text-electric-500">
													{criteria.weight}%
												</span>
											</div>
										</div>

										<div>
											<label className="text-sm text-gray-600">
												Puntuación máxima
											</label>
											<select
												value={criteria.maxPoints}
												onChange={(e) =>
													onUpdateCriteria(criteria.id, {
														maxPoints: parseInt(e.target.value),
													})
												}
												className="input-primary text-sm"
											>
												{[5, 10, 15, 20, 25].map((score) => (
													<option key={score} value={score}>
														{score} pts
													</option>
												))}
											</select>
										</div>

										<div>
											<label className="text-sm text-gray-600">
												Puntos asignables
											</label>
											<div className="text-lg font-bold text-gray-900">
												{criteria.maxPoints} puntos
											</div>
										</div>
									</div>
								</div>

								<div className="ml-4 flex flex-col gap-2">
									<button
										onClick={() => onDeleteCriteria(criteria.id)}
										className="p-2 text-gray-400 hover:text-red-500"
										title="Eliminar criterio"
									>
										🗑️
									</button>
									<button
										onClick={() =>
											setEditingId(
												editingId === criteria.id ? null : criteria.id,
											)
										}
										className="p-2 text-gray-400 hover:text-electric-500"
										title="Editar criterio"
									>
										✏️
									</button>
								</div>
							</div>

							{editingId === criteria.id && (
								<div className="mt-4 pt-4 border-t border-gray-200">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="text-sm font-medium text-gray-700 mb-2">
												Nombre
											</label>
											<input
												type="text"
												value={criteria.title}
												onChange={(e) =>
													onUpdateCriteria(criteria.id, {title: e.target.value})
												}
												className="input-primary"
											/>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-700 mb-2">
												Descripción
											</label>
											<input
												type="text"
												value={criteria.description}
												onChange={(e) =>
													onUpdateCriteria(criteria.id, {
														description: e.target.value,
													})
												}
												className="input-primary"
											/>
										</div>
									</div>
									<div className="flex justify-end gap-3 mt-4">
										<button
											onClick={() => setEditingId(null)}
											className="px-4 py-2 text-gray-600 hover:text-gray-900"
										>
											Cancelar
										</button>
										<button
											onClick={() => handleSave(criteria.id)}
											className="px-4 py-2 bg-electric-500 text-white rounded-lg hover:bg-electric-600"
										>
											Guardar
										</button>
									</div>
								</div>
							)}
						</div>
					))}
				</div>

				{rubric.criteria.length === 0 && (
					<div className="text-center py-12">
						<div className="text-4xl mb-4">📝</div>
						<h4 className="font-medium text-gray-900 mb-2">
							No hay criterios configurados
						</h4>
						<p className="text-gray-600">
							Añade criterios para comenzar a construir tu rúbrica
						</p>
					</div>
				)}
			</div>

			{/* Quick Tips */}
			<div className="card p-6 bg-gradient-to-r from-electric-50 to-cyan-50 border border-electric-200">
				<h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
					<span>💡</span>
					Consejos para una buena rúbrica
				</h4>
				<ul className="space-y-2 text-sm text-gray-700">
					<li className="flex items-start gap-2">
						<span className="text-green-500 mt-1">✓</span>
						<span>La suma de ponderaciones debe ser exactamente 100%</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-green-500 mt-1">✓</span>
						<span>Define criterios específicos y medibles</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-green-500 mt-1">✓</span>
						<span>
							Incluye descripciones claras para cada nivel de desempeño
						</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-green-500 mt-1">✓</span>
						<span>Considera el tiempo de evaluación que tomará la IA</span>
					</li>
				</ul>
			</div>
		</div>
	);
};
