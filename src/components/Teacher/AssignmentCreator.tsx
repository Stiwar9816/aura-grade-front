import React, {useState} from "react";
import {AssignmentForm, RubricCriterion} from "@/types";

const AssignmentCreator: React.FC = () => {
	const [form, setForm] = useState<AssignmentForm>({
		title: "",
		description: "",
		dueDate: "",
		maxScore: 10,
		rubric: {
			name: "Rúbrica Personalizada",
			description: "",
			criteria: [],
		},
	});

	const [activeTab, setActiveTab] = useState<"details" | "rubric" | "preview">(
		"details"
	);
	const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

	const rubricTemplates = [
		{
			id: "essay",
			name: "Ensayo Académico",
			description: "Para evaluar ensayos argumentativos",
			criteria: [
				{
					id: "1",
					name: "Argumentación",
					description: "Calidad y solidez de los argumentos",
					weight: 30,
					maxScore: 10,
				},
				{
					id: "2",
					name: "Estructura",
					description: "Organización y coherencia del texto",
					weight: 25,
					maxScore: 10,
				},
				{
					id: "3",
					name: "Ortografía y Gramática",
					description: "Corrección lingüística",
					weight: 20,
					maxScore: 10,
				},
				{
					id: "4",
					name: "Originalidad",
					description: "Aportes personales y creatividad",
					weight: 15,
					maxScore: 10,
				},
				{
					id: "5",
					name: "Formato",
					description: "Cumplimiento de requisitos formales",
					weight: 10,
					maxScore: 10,
				},
			],
		},
		{
			id: "project",
			name: "Proyecto de Investigación",
			description: "Evaluación de proyectos científicos",
			criteria: [
				{
					id: "1",
					name: "Metodología",
					description: "Adecuación del método científico",
					weight: 30,
					maxScore: 10,
				},
				{
					id: "2",
					name: "Análisis de Datos",
					description: "Profundidad del análisis",
					weight: 25,
					maxScore: 10,
				},
				{
					id: "3",
					name: "Conclusiones",
					description: "Relevancia de las conclusiones",
					weight: 20,
					maxScore: 10,
				},
				{
					id: "4",
					name: "Presentación",
					description: "Claridad en la exposición",
					weight: 15,
					maxScore: 10,
				},
				{
					id: "5",
					name: "Bibliografía",
					description: "Calidad de las referencias",
					weight: 10,
					maxScore: 10,
				},
			],
		},
	];

	const handleAddCriterion = () => {
		const newCriterion: RubricCriterion = {
			id: Date.now().toString(),
			name: `Criterio ${form.rubric.criteria.length + 1}`,
			description: "",
			weight: 10,
			maxScore: 10,
		};

		setForm((prev) => ({
			...prev,
			rubric: {
				...prev.rubric,
				criteria: [...prev.rubric.criteria, newCriterion],
			},
		}));
	};

	const handleUpdateCriterion = (
		id: string,
		updates: Partial<RubricCriterion>
	) => {
		setForm((prev) => ({
			...prev,
			rubric: {
				...prev.rubric,
				criteria: prev.rubric.criteria.map((criterion) =>
					criterion.id === id ? {...criterion, ...updates} : criterion
				),
			},
		}));
	};

	const handleDeleteCriterion = (id: string) => {
		setForm((prev) => ({
			...prev,
			rubric: {
				...prev.rubric,
				criteria: prev.rubric.criteria.filter(
					(criterion) => criterion.id !== id
				),
			},
		}));
	};

	const handleTemplateSelect = (templateId: string) => {
		const template = rubricTemplates.find((t) => t.id === templateId);
		if (template) {
			setSelectedTemplate(templateId);
			setForm((prev) => ({
				...prev,
				rubric: {
					name: template.name,
					description: template.description,
					criteria: [...template.criteria],
				},
			}));
		}
	};

	const calculateTotalWeight = () => {
		return form.rubric.criteria.reduce(
			(total, criterion) => total + criterion.weight,
			0
		);
	};

	const handleSubmit = () => {
		const totalWeight = calculateTotalWeight();
		if (totalWeight !== 100) {
			alert(`La suma de ponderaciones debe ser 100%. Actual: ${totalWeight}%`);
			return;
		}

		console.log("Creando tarea:", form);
		// Aquí iría la llamada a la API
	};

	return (
		<div className="max-w-6xl mx-auto">
			<div className="card p-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							Crear Nueva Tarea
						</h1>
						<p className="text-gray-600 mt-2">
							Configura todos los detalles y la rúbrica de evaluación
						</p>
					</div>
					<button onClick={handleSubmit} className="btn-primary">
						<span className="flex items-center gap-2">
							<span>🚀</span>
							<span>Publicar Tarea</span>
						</span>
					</button>
				</div>

				{/* Tabs */}
				<div className="border-b border-gray-200 mb-8">
					<nav className="flex space-x-8">
						{[
							{id: "details", label: "Detalles", icon: "📝"},
							{id: "rubric", label: "Rúbrica", icon: "📋"},
							{id: "preview", label: "Vista Previa", icon: "👁️"},
						].map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id as any)}
								className={`flex items-center gap-2 py-4 px-1 font-medium border-b-2 transition-colors ${
									activeTab === tab.id
										? "border-electric-500 text-electric-600"
										: "border-transparent text-gray-500 hover:text-gray-700"
								}`}
							>
								<span>{tab.icon}</span>
								<span>{tab.label}</span>
							</button>
						))}
					</nav>
				</div>

				{/* Content */}
				{activeTab === "details" && (
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Título de la Tarea *
								</label>
								<input
									type="text"
									value={form.title}
									onChange={(e) =>
										setForm((prev) => ({...prev, title: e.target.value}))
									}
									className="input-primary"
									placeholder="Ej: Ensayo sobre Inteligencia Artificial"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Fecha de Entrega *
								</label>
								<input
									type="datetime-local"
									value={form.dueDate}
									onChange={(e) =>
										setForm((prev) => ({...prev, dueDate: e.target.value}))
									}
									className="input-primary"
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Descripción Detallada *
							</label>
							<textarea
								value={form.description}
								onChange={(e) =>
									setForm((prev) => ({...prev, description: e.target.value}))
								}
								className="input-primary min-h-[150px]"
								placeholder="Describe los objetivos, requisitos y expectativas de la tarea..."
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Puntuación Máxima
							</label>
							<select
								value={form.maxScore}
								onChange={(e) =>
									setForm((prev) => ({
										...prev,
										maxScore: parseInt(e.target.value),
									}))
								}
								className="input-primary"
							>
								{[5, 10, 15, 20, 25, 30, 40, 50].map((score) => (
									<option key={score} value={score}>
										{score} puntos
									</option>
								))}
							</select>
						</div>
					</div>
				)}

				{activeTab === "rubric" && (
					<div className="space-y-6">
						{/* Template Selection */}
						<div className="bg-gray-50 rounded-xl p-6">
							<h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<span>🚀</span>
								<span>¿Empezar desde una plantilla?</span>
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{rubricTemplates.map((template) => (
									<button
										key={template.id}
										onClick={() => handleTemplateSelect(template.id)}
										className={`p-4 border-2 rounded-xl text-left transition-all ${
											selectedTemplate === template.id
												? "border-electric-500 bg-electric-50"
												: "border-gray-300 hover:border-gray-400"
										}`}
									>
										<div className="font-medium text-gray-900 mb-1">
											{template.name}
										</div>
										<div className="text-sm text-gray-600 mb-2">
											{template.description}
										</div>
										<div className="text-xs text-gray-500">
											{template.criteria.length} criterios predefinidos
										</div>
									</button>
								))}
							</div>
						</div>

						{/* Rubric Builder */}
						<div>
							<div className="flex items-center justify-between mb-6">
								<h3 className="text-xl font-bold text-gray-900">
									Constructor de Rúbrica
								</h3>
								<button
									onClick={handleAddCriterion}
									className="flex items-center gap-2 text-electric-500 hover:text-electric-600"
								>
									<span>➕</span>
									<span>Añadir Criterio</span>
								</button>
							</div>

							<div className="space-y-4">
								{form.rubric.criteria.map((criterion, index) => (
									<div
										key={criterion.id}
										className="p-4 border border-gray-200 rounded-xl"
									>
										<div className="flex items-start justify-between mb-4">
											<div className="flex-1">
												<input
													type="text"
													value={criterion.name}
													onChange={(e) =>
														handleUpdateCriterion(criterion.id, {
															name: e.target.value,
														})
													}
													className="text-lg font-semibold text-gray-900 bg-transparent border-b border-gray-300 focus:border-electric-500 outline-none w-full"
													placeholder="Nombre del criterio"
												/>
												<textarea
													value={criterion.description}
													onChange={(e) =>
														handleUpdateCriterion(criterion.id, {
															description: e.target.value,
														})
													}
													className="text-sm text-gray-600 bg-transparent border-b border-gray-200 focus:border-gray-400 outline-none w-full mt-2"
													placeholder="Descripción del criterio"
													rows={2}
												/>
											</div>
											<button
												onClick={() => handleDeleteCriterion(criterion.id)}
												className="ml-4 p-2 text-gray-400 hover:text-red-500"
											>
												🗑️
											</button>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											<div>
												<label className="block text-sm text-gray-600 mb-2">
													Ponderación (%)
												</label>
												<div className="flex items-center gap-3">
													<input
														type="range"
														min="5"
														max="50"
														step="5"
														value={criterion.weight}
														onChange={(e) =>
															handleUpdateCriterion(criterion.id, {
																weight: parseInt(e.target.value),
															})
														}
														className="flex-1"
													/>
													<span className="w-16 text-center font-bold text-electric-500">
														{criterion.weight}%
													</span>
												</div>
											</div>
											<div>
												<label className="block text-sm text-gray-600 mb-2">
													Puntuación máxima
												</label>
												<select
													value={criterion.maxScore}
													onChange={(e) =>
														handleUpdateCriterion(criterion.id, {
															maxScore: parseInt(e.target.value),
														})
													}
													className="input-primary"
												>
													{[5, 10, 15, 20].map((score) => (
														<option key={score} value={score}>
															{score} puntos
														</option>
													))}
												</select>
											</div>
											<div className="flex items-end">
												<div className="text-right">
													<div className="text-sm text-gray-600">
														Puntos ponderados
													</div>
													<div className="text-lg font-bold text-gray-900">
														{((criterion.weight / 100) * form.maxScore).toFixed(
															1
														)}
													</div>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>

							{form.rubric.criteria.length === 0 && (
								<div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
									<div className="text-4xl mb-4">📋</div>
									<h4 className="font-medium text-gray-900 mb-2">
										No hay criterios definidos
									</h4>
									<p className="text-gray-600 mb-6">
										Añade criterios para construir tu rúbrica de evaluación
									</p>
									<button onClick={handleAddCriterion} className="btn-primary">
										<span className="flex items-center gap-2">
											<span>➕</span>
											<span>Añadir Primer Criterio</span>
										</span>
									</button>
								</div>
							)}

							{/* Weight Summary */}
							{form.rubric.criteria.length > 0 && (
								<div
									className={`mt-6 p-4 rounded-xl ${
										calculateTotalWeight() === 100
											? "bg-green-50 border border-green-200"
											: "bg-yellow-50 border border-yellow-200"
									}`}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div
												className={`text-xl ${
													calculateTotalWeight() === 100
														? "text-green-600"
														: "text-yellow-600"
												}`}
											>
												{calculateTotalWeight() === 100 ? "✅" : "⚠️"}
											</div>
											<div>
												<div className="font-medium text-gray-900">
													{calculateTotalWeight() === 100
														? "¡Ponderación perfecta!"
														: "Ajuste de ponderación necesario"}
												</div>
												<div className="text-sm text-gray-600">
													Suma total: {calculateTotalWeight()}% / 100%
												</div>
											</div>
										</div>
										<div className="text-2xl font-bold text-gray-900">
											{calculateTotalWeight()}%
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{activeTab === "preview" && (
					<div className="space-y-6">
						<div className="bg-gradient-to-r from-electric-50 to-cyan-50 border border-electric-200 rounded-2xl p-8">
							<h2 className="text-2xl font-bold text-gray-900 mb-2">
								{form.title || "Título de la Tarea"}
							</h2>
							<p className="text-gray-600 mb-6">
								{form.description || "Descripción de la tarea..."}
							</p>

							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
								<div className="bg-white p-4 rounded-xl text-center">
									<div className="text-sm text-gray-600">Puntuación máxima</div>
									<div className="text-2xl font-bold text-electric-500">
										{form.maxScore}
									</div>
								</div>
								<div className="bg-white p-4 rounded-xl text-center">
									<div className="text-sm text-gray-600">Criterios</div>
									<div className="text-2xl font-bold text-green-500">
										{form.rubric.criteria.length}
									</div>
								</div>
								<div className="bg-white p-4 rounded-xl text-center">
									<div className="text-sm text-gray-600">Ponderación</div>
									<div className="text-2xl font-bold text-purple-500">
										{calculateTotalWeight()}%
									</div>
								</div>
								<div className="bg-white p-4 rounded-xl text-center">
									<div className="text-sm text-gray-600">
										Entregas esperadas
									</div>
									<div className="text-2xl font-bold text-cyan-500">~25</div>
								</div>
							</div>

							<h3 className="text-xl font-bold text-gray-900 mb-4">
								Vista del Estudiante
							</h3>
							<div className="bg-white border border-gray-300 rounded-xl p-6">
								<div className="space-y-4">
									<div>
										<h4 className="font-semibold text-gray-900 mb-2">
											📋 Lo que los estudiantes verán:
										</h4>
										<p className="text-gray-700">
											Antes de subir su trabajo, los estudiantes podrán ver
											claramente los criterios de evaluación y su ponderación,
											eliminando la incertidumbre sobre cómo serán calificados.
										</p>
									</div>

									<div>
										<h4 className="font-semibold text-gray-900 mb-2">
											🤖 Proceso de evaluación:
										</h4>
										<ul className="space-y-2 text-sm text-gray-700">
											<li className="flex items-start gap-2">
												<span className="text-green-500 mt-1">✓</span>
												<span>Entrega instantánea con confirmación visual</span>
											</li>
											<li className="flex items-start gap-2">
												<span className="text-green-500 mt-1">✓</span>
												<span>Feedback de IA en menos de 30 segundos</span>
											</li>
											<li className="flex items-start gap-2">
												<span className="text-green-500 mt-1">✓</span>
												<span>Desglose detallado por criterio</span>
											</li>
											<li className="flex items-start gap-2">
												<span className="text-green-500 mt-1">✓</span>
												<span>Sugerencias específicas para mejora</span>
											</li>
										</ul>
									</div>
								</div>
							</div>
						</div>

						{/* Rubric Preview */}
						<div className="card p-6">
							<h3 className="text-xl font-bold text-gray-900 mb-6">
								Previsualización de Rúbrica
							</h3>

							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b border-gray-200">
											<th className="text-left py-3 px-4 font-semibold text-gray-700">
												Criterio
											</th>
											<th className="text-left py-3 px-4 font-semibold text-gray-700">
												Ponderación
											</th>
											<th className="text-left py-3 px-4 font-semibold text-gray-700">
												Puntos
											</th>
											<th className="text-left py-3 px-4 font-semibold text-gray-700">
												Descripción
											</th>
										</tr>
									</thead>
									<tbody>
										{form.rubric.criteria.map((criterion, index) => (
											<tr
												key={criterion.id}
												className="border-b border-gray-100"
											>
												<td className="py-4 px-4 font-medium text-gray-900">
													{criterion.name}
												</td>
												<td className="py-4 px-4">
													<div className="flex items-center gap-2">
														<div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
															<div
																className="h-full bg-electric-500"
																style={{width: `${criterion.weight}%`}}
															/>
														</div>
														<span className="font-bold text-electric-500">
															{criterion.weight}%
														</span>
													</div>
												</td>
												<td className="py-4 px-4">
													<div className="text-lg font-bold text-gray-900">
														{criterion.maxScore}
													</div>
													<div className="text-sm text-gray-600">
														puntos máx.
													</div>
												</td>
												<td className="py-4 px-4 text-gray-600">
													{criterion.description}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				)}

				{/* Navigation */}
				<div className="flex justify-between mt-8 pt-8 border-t border-gray-200">
					<button
						onClick={() => {
							if (activeTab === "rubric") setActiveTab("details");
							if (activeTab === "preview") setActiveTab("rubric");
						}}
						className={`px-6 py-3 rounded-xl font-medium ${
							activeTab === "details"
								? "text-gray-400 cursor-not-allowed"
								: "text-gray-700 hover:text-gray-900"
						}`}
						disabled={activeTab === "details"}
					>
						← Anterior
					</button>

					<div className="text-center">
						<div className="text-sm text-gray-600">Progreso</div>
						<div className="text-lg font-bold text-electric-500">
							{activeTab === "details"
								? "33%"
								: activeTab === "rubric"
								? "66%"
								: "100%"}
						</div>
					</div>

					<button
						onClick={() => {
							if (activeTab === "details") setActiveTab("rubric");
							if (activeTab === "rubric") setActiveTab("preview");
						}}
						className="btn-primary"
					>
						{activeTab === "preview" ? "Finalizar" : "Continuar →"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default AssignmentCreator;
