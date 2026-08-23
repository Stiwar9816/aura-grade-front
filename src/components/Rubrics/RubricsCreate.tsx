import React, {useState} from "react";
import type {
	RubricAcademicLevel,
	RubricsCreateProps,
} from "@/interface";

export const RubricsCreate: React.FC<RubricsCreateProps> = ({
	onStart,
	onGenerate,
	isGenerating = false,
	initialData,
}) => {
	const [mode, setMode] = useState<"ai" | "manual">("ai");
	const [data, setData] = useState({
		title: initialData?.title || "",
		description: initialData?.description || "",
		academicLevel:
			initialData?.academicLevel || ("UNIVERSITARIO" as RubricAcademicLevel),
		criterionCount: 4,
		additionalInstructions: "",
	});
	const [loading, setLoading] = useState(false);

	const handleStart = async () => {
		if (!data.title.trim() || !data.description.trim() || loading || isGenerating)
			return;
		setLoading(true);
		try {
			if (mode === "ai") {
				await onGenerate({
					title: data.title,
					taskDescription: data.description,
					academicLevel: data.academicLevel,
					criterionCount: data.criterionCount,
					additionalInstructions: data.additionalInstructions || undefined,
				});
			} else {
				await onStart({
					title: data.title,
					description: data.description,
					academicLevel: data.academicLevel,
				});
			}
		} finally {
			setLoading(false);
		}
	};

	const busy = loading || isGenerating;

	return (
		<div className="max-w-3xl mx-auto card p-8">
			<div className="text-center mb-8">
				<h2 className="text-2xl font-bold text-gray-900">Crear nueva rúbrica</h2>
				<p className="text-gray-600 mt-2">
					Genera un borrador completo con IA o comienza manualmente.
				</p>
			</div>

			<div className="grid grid-cols-2 gap-3 rounded-xl bg-gray-100 p-1 mb-7">
				<button
					type="button"
					onClick={() => setMode("ai")}
					className={`rounded-lg px-4 py-3 text-sm font-bold transition ${
						mode === "ai" ? "bg-white text-electric-600 shadow-sm" : "text-gray-600"
					}`}
				>
					Crear con IA
				</button>
				<button
					type="button"
					onClick={() => setMode("manual")}
					className={`rounded-lg px-4 py-3 text-sm font-bold transition ${
						mode === "manual"
							? "bg-white text-electric-600 shadow-sm"
							: "text-gray-600"
					}`}
				>
					Crear manualmente
				</button>
			</div>

			<div className="space-y-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Título de la tarea o rúbrica
					</label>
					<input
						type="text"
						value={data.title}
						onChange={(event) => setData({...data, title: event.target.value})}
						className="input-primary"
						placeholder="Ej: Ensayo argumentativo sobre ética profesional"
						maxLength={200}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Descripción e instrucciones de la tarea
					</label>
					<textarea
						value={data.description}
						onChange={(event) =>
							setData({...data, description: event.target.value})
						}
						rows={6}
						className="input-primary"
						placeholder="Describe objetivos, producto esperado, requisitos y evidencias..."
						maxLength={12000}
					/>
					<div className="mt-1 text-right text-xs text-gray-400">
						{data.description.length}/12000
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Nivel académico
						</label>
						<select
							value={data.academicLevel}
							onChange={(event) =>
								setData({
									...data,
									academicLevel: event.target.value as RubricAcademicLevel,
								})
							}
							className="input-primary"
						>
							<option value="UNIVERSITARIO">Universitario</option>
							<option value="POSGRADO">Posgrado</option>
						</select>
					</div>

					{mode === "ai" && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Cantidad de criterios
							</label>
							<select
								value={data.criterionCount}
								onChange={(event) =>
									setData({...data, criterionCount: Number(event.target.value)})
								}
								className="input-primary"
							>
								{[2, 3, 4, 5, 6, 7, 8].map((count) => (
									<option key={count} value={count}>
										{count} criterios
									</option>
								))}
							</select>
						</div>
					)}
				</div>

				{mode === "ai" && (
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Indicaciones adicionales para la IA (opcional)
						</label>
						<textarea
							value={data.additionalInstructions}
							onChange={(event) =>
								setData({...data, additionalInstructions: event.target.value})
							}
							rows={3}
							className="input-primary"
							placeholder="Ej: Da mayor peso al análisis crítico y al uso de fuentes."
							maxLength={2000}
						/>
					</div>
				)}

				<button
					type="button"
					onClick={() => void handleStart()}
					disabled={!data.title.trim() || !data.description.trim() || busy}
					className="btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{busy
						? mode === "ai"
							? "Generando borrador..."
							: "Preparando borrador..."
						: mode === "ai"
							? "Generar rúbrica con IA"
							: "Comenzar rúbrica manual"}
				</button>
				{mode === "ai" && (
					<p className="text-center text-xs text-gray-500">
						La IA crea un borrador. Nada se guarda hasta que lo revises y confirmes.
					</p>
				)}
			</div>
		</div>
	);
};
