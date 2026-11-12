import { useState } from "react";
import Card from "@/components/Common/Card";

type Dataset = "evaluations" | "criteria";

const DATASETS: { id: Dataset; title: string; detail: string }[] = [
	{
		id: "evaluations",
		title: "Por evaluación",
		detail: "Una fila por calificación: borrador, nota final, diferencia y motivo del ajuste.",
	},
	{
		id: "criteria",
		title: "Por criterio",
		detail: "Una fila por criterio de rúbrica: puntaje y comentario del borrador y del docente.",
	},
];

/** Downloads the consolidated grading history. The file never touches browser storage. */
export default function TrainingExport() {
	const [includeText, setIncludeText] = useState(false);
	const [working, setWorking] = useState<Dataset | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [done, setDone] = useState<string | null>(null);

	const download = async (dataset: Dataset) => {
		setWorking(dataset);
		setError(null);
		setDone(null);
		try {
			const response = await fetch("/api/admin/training-export", {
				method: "POST",
				credentials: "same-origin",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					dataset,
					includeSubmissionText: dataset === "evaluations" && includeText,
				}),
			});
			if (!response.ok) {
				const payload = await response.json().catch(() => null);
				throw new Error(
					payload?.message || payload?.error || "No fue posible generar la exportación.",
				);
			}
			const name =
				/filename="([^"]+)"/.exec(response.headers.get("content-disposition") || "")?.[1] ||
				`aura-grade-${dataset}.csv`;
			const url = URL.createObjectURL(await response.blob());
			const link = document.createElement("a");
			link.href = url;
			link.download = name;
			document.body.appendChild(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(url);
			setDone(`Descarga lista: ${name}`);
		} catch (downloadError) {
			setError(
				downloadError instanceof Error
					? downloadError.message
					: "No fue posible generar la exportación.",
			);
		} finally {
			setWorking(null);
		}
	};

	return (
		<Card>
			<h2 className="text-xl font-bold text-gray-900">Historial de calificación (CSV)</h2>
			<p className="mt-1 text-sm text-gray-600">
				Consolidado de las evaluaciones publicadas de tu institución. Los estudiantes y docentes
				aparecen con un identificador seudónimo, sin nombre, correo ni documento. Cada descarga
				queda registrada en la auditoría.
			</p>
			<label className="mt-4 flex items-start gap-3 text-sm text-gray-700">
				<input
					type="checkbox"
					checked={includeText}
					onChange={(event) => setIncludeText(event.target.checked)}
					disabled={working !== null}
					className="mt-1"
				/>
				<span>
					Incluir el texto de las entregas en el archivo por evaluación. Es contenido escrito por
					estudiantes: trátalo como información sensible.
				</span>
			</label>
			<div className="mt-4 grid gap-3 md:grid-cols-2">
				{DATASETS.map((dataset) => (
					<div key={dataset.id} className="rounded-xl border border-gray-200 p-4">
						<p className="font-semibold text-gray-900">{dataset.title}</p>
						<p className="mt-1 text-sm text-gray-600">{dataset.detail}</p>
						<button
							type="button"
							onClick={() => void download(dataset.id)}
							disabled={working !== null}
							className="btn-primary mt-3 min-h-11 disabled:opacity-50"
						>
							{working === dataset.id ? "Generando…" : "Descargar CSV"}
						</button>
					</div>
				))}
			</div>
			{error && (
				<p role="alert" className="mt-3 text-sm font-medium text-red-700">
					{error}
				</p>
			)}
			{done && (
				<p role="status" className="mt-3 text-sm font-medium text-green-700">
					{done}
				</p>
			)}
		</Card>
	);
}
