import { useEffect, useState } from "react";
import Card from "@/components/Common/Card";
import TrainingExport from "./TrainingExport";

type Row = {
	id: string;
	label: string;
	evaluations: number;
	meanAbsoluteDifference: number;
	meanSignedDifference: number;
	unchangedRate: number;
	reevaluationRate?: number;
};
type Insights = {
	evaluations: number;
	reevaluationRate: number;
	overall: Row | null;
	byCourse: Row[];
	byRubric: Row[];
	byCriterion: Row[];
	byPromptVersion: Row[];
	adjustmentReasons: { reason: string; count: number }[];
};

const REASONS: Record<string, string> = {
	AI_TOO_STRICT: "La IA fue demasiado estricta",
	AI_TOO_LENIENT: "La IA fue demasiado generosa",
	AI_MISSED_ERROR: "La IA no detectó un error",
	AI_MISREAD_SUBMISSION: "La IA interpretó mal la entrega",
	RUBRIC_MISAPPLIED: "La rúbrica se aplicó mal",
	FEEDBACK_UNCLEAR: "El comentario era poco claro",
	OTHER: "Otro motivo",
};
const percent = (value: number) => `${Math.round(value * 100)}%`;
const signed = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(2)}`;
const bias = (value: number) =>
	value > 0.05 ? "IA más estricta que el docente" : value < -0.05 ? "IA más generosa que el docente" : "Sin sesgo claro";

const Table = ({ title, rows, extra }: { title: string; rows: Row[]; extra?: boolean }) => (
	<div className="mt-6">
		<h3 className="text-lg font-bold text-gray-900">{title}</h3>
		{rows.length === 0 ? (
			<p className="mt-2 text-sm text-gray-600">Aún no hay datos.</p>
		) : (
			<div className="mt-2 overflow-x-auto">
				<table className="w-full min-w-[36rem] text-left text-sm">
					<thead className="text-xs uppercase text-gray-500">
						<tr>
							<th scope="col" className="py-2 pr-3 font-semibold">Grupo</th>
							<th scope="col" className="py-2 pr-3 text-right font-semibold">Evaluaciones</th>
							<th scope="col" className="py-2 pr-3 text-right font-semibold">Diferencia media</th>
							<th scope="col" className="py-2 pr-3 text-right font-semibold">Sesgo</th>
							<th scope="col" className="py-2 pr-3 text-right font-semibold">Sin cambios</th>
							{extra && <th scope="col" className="py-2 text-right font-semibold">Reevaluaciones</th>}
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{rows.slice(0, 15).map((row) => (
							<tr key={row.id}>
								<th scope="row" className="py-2 pr-3 font-medium text-gray-900">{row.label}</th>
								<td className="py-2 pr-3 text-right tabular-nums">{row.evaluations}</td>
								<td className="py-2 pr-3 text-right tabular-nums">{row.meanAbsoluteDifference.toFixed(2)}</td>
								<td className="py-2 pr-3 text-right tabular-nums" title={bias(row.meanSignedDifference)}>
									{signed(row.meanSignedDifference)}
								</td>
								<td className="py-2 pr-3 text-right tabular-nums">{percent(row.unchangedRate)}</td>
								{extra && (
									<td className="py-2 text-right tabular-nums">{percent(row.reevaluationRate ?? 0)}</td>
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		)}
	</div>
);

/** How close AI drafts are to what teachers publish, plus the consolidated download. */
export default function GradingHistory() {
	const [courseId, setCourseId] = useState("");
	const [courses, setCourses] = useState<Row[]>([]);
	const [state, setState] = useState<{ key: string; data: Insights | null; error: string | null } | null>(null);
	const loading = state?.key !== courseId;

	useEffect(() => {
		const controller = new AbortController();
		fetch(`/api/admin/grading-insights${courseId ? `?courseId=${courseId}` : ""}`, {
			credentials: "same-origin",
			cache: "no-store",
			signal: controller.signal,
		})
			.then(async (response) => {
				const payload = await response.json().catch(() => null);
				if (!response.ok)
					throw new Error(payload?.message || payload?.error || "No fue posible cargar el panel.");
				setState({ key: courseId, data: payload as Insights, error: null });
				// The unfiltered answer is the source of the course list.
				if (!courseId) setCourses((payload as Insights).byCourse);
			})
			.catch((error) => {
				if (controller.signal.aborted) return;
				setState({
					key: courseId,
					data: null,
					error: error instanceof Error ? error.message : "No fue posible cargar el panel.",
				});
			});
		return () => controller.abort();
	}, [courseId]);

	const data = loading ? null : state?.data;
	return (
		<Card>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<h2 className="text-xl font-bold text-gray-900">Precisión de la calificación asistida</h2>
					<p className="mt-1 max-w-2xl text-sm text-gray-600">
						Compara el borrador de la IA con la nota que publicó el docente, en escala de 0 a 5.
						Un sesgo positivo significa que el docente calificó más alto que la IA.
					</p>
				</div>
				<label className="text-sm font-semibold text-gray-700">
					Curso
					<select
						value={courseId}
						onChange={(event) => setCourseId(event.target.value)}
						className="ml-2 min-h-11 rounded-xl border border-gray-300 bg-white px-3"
					>
						<option value="">Todos</option>
						{courses.map((course) => (
							<option key={course.id} value={course.id}>
								{course.label}
							</option>
						))}
					</select>
				</label>
			</div>

			{loading && <p role="status" className="mt-4 text-sm text-gray-600">Cargando…</p>}
			{!loading && state?.error && (
				<p role="alert" className="mt-4 text-sm font-medium text-red-700">{state.error}</p>
			)}
			{data && !data.overall && (
				<p className="mt-4 text-sm text-gray-600">
					Todavía no hay evaluaciones publicadas con borrador de IA para comparar.
				</p>
			)}
			{data?.overall && (
				<>
					<dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						<div className="rounded-xl border border-gray-200 p-4">
							<dt className="text-sm font-semibold text-gray-500">Evaluaciones comparadas</dt>
							<dd className="mt-1 text-3xl font-bold text-gray-900">{data.evaluations}</dd>
						</div>
						<div className="rounded-xl border border-gray-200 p-4">
							<dt className="text-sm font-semibold text-gray-500">Diferencia media</dt>
							<dd className="mt-1 text-3xl font-bold text-gray-900">
								{data.overall.meanAbsoluteDifference.toFixed(2)}
							</dd>
							<dd className="text-xs text-gray-500">{bias(data.overall.meanSignedDifference)}</dd>
						</div>
						<div className="rounded-xl border border-gray-200 p-4">
							<dt className="text-sm font-semibold text-gray-500">Publicadas sin cambiar la nota</dt>
							<dd className="mt-1 text-3xl font-bold text-gray-900">{percent(data.overall.unchangedRate)}</dd>
						</div>
						<div className="rounded-xl border border-gray-200 p-4">
							<dt className="text-sm font-semibold text-gray-500">Con reevaluación solicitada</dt>
							<dd className="mt-1 text-3xl font-bold text-gray-900">{percent(data.reevaluationRate)}</dd>
						</div>
					</dl>
					<Table title="Por versión del prompt y modelo" rows={data.byPromptVersion} extra />
					<Table title="Criterios donde más difiere la IA" rows={[...data.byCriterion].sort((a, b) => b.meanAbsoluteDifference - a.meanAbsoluteDifference)} />
					<Table title="Por rúbrica" rows={data.byRubric} />
					{!courseId && <Table title="Por curso" rows={data.byCourse} />}
					<div className="mt-6">
						<h3 className="text-lg font-bold text-gray-900">Motivos de ajuste indicados</h3>
						{data.adjustmentReasons.length === 0 ? (
							<p className="mt-2 text-sm text-gray-600">Los docentes aún no han indicado motivos.</p>
						) : (
							<ul className="mt-2 space-y-1 text-sm text-gray-700">
								{data.adjustmentReasons.map((item) => (
									<li key={item.reason} className="flex justify-between gap-4">
										<span>{REASONS[item.reason] ?? item.reason}</span>
										<span className="tabular-nums font-semibold">{item.count}</span>
									</li>
								))}
							</ul>
						)}
					</div>
				</>
			)}
			<div className="mt-8 border-t border-gray-200 pt-6">
				<TrainingExport courseId={courseId || undefined} />
			</div>
		</Card>
	);
}
