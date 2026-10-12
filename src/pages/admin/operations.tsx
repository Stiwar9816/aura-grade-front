import {useCallback, useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowsRotate, faCommentDots, faServer, faTriangleExclamation} from "@fortawesome/free-solid-svg-icons";
import Layout from "@/components/Layout";
import Card from "@/components/Common/Card";
import Badge from "@/components/Common/Badge";
import {ProtectedRoute} from "@/components/Auth";
import type {FeedbackEntry, FeedbackPage, FeedbackStatus, OperationsSummary} from "@/interface";
import {UserRole} from "@/interface";

const dateFormatter = new Intl.DateTimeFormat("es-CO", {dateStyle: "medium", timeStyle: "short"});
const statusLabels: Record<FeedbackStatus, string> = {OPEN: "Abierto", IN_REVIEW: "En revisión", RESOLVED: "Resuelto"};
const categoryLabels = {BUG: "Problema", SUGGESTION: "Sugerencia", QUESTION: "Pregunta", OTHER: "Otro"};
const variantForStatus = (status: FeedbackStatus) => status === "RESOLVED" ? "success" as const : status === "IN_REVIEW" ? "warning" as const : "info" as const;

const OperationsPage = () => {
	const [summary, setSummary] = useState<OperationsSummary | null>(null);
	const [feedback, setFeedback] = useState<FeedbackPage | null>(null);
	const [filter, setFilter] = useState<"" | FeedbackStatus>("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [working, setWorking] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true); setError(null);
		try {
			const params = new URLSearchParams({limit: "25"}); if (filter) params.set("status", filter);
			const [summaryResponse, feedbackResponse] = await Promise.all([
				fetch("/api/admin/operations", {credentials: "same-origin", cache: "no-store"}),
				fetch(`/api/admin/feedback?${params}`, {credentials: "same-origin", cache: "no-store"}),
			]);
			const [summaryPayload, feedbackPayload] = await Promise.all([summaryResponse.json().catch(() => null), feedbackResponse.json().catch(() => null)]);
			if (!summaryResponse.ok) throw new Error(summaryPayload?.error || summaryPayload?.message || "No fue posible cargar el estado operativo.");
			if (!feedbackResponse.ok) throw new Error(feedbackPayload?.error || feedbackPayload?.message || "No fue posible cargar el feedback.");
			setSummary(summaryPayload); setFeedback(feedbackPayload);
		} catch (loadError) {setError(loadError instanceof Error ? loadError.message : "No fue posible cargar el panel.");}
		finally {setLoading(false);}
	}, [filter]);
	useEffect(() => {
		const request = window.setTimeout(() => void load(), 0);
		return () => window.clearTimeout(request);
	}, [load]);

	const retry = async (id: string) => {
		setWorking(id); setError(null);
		try {
			const response = await fetch(`/api/admin/operations/submissions/${encodeURIComponent(id)}/retry`, {method: "POST", credentials: "same-origin"});
			const payload = await response.json().catch(() => null);
			if (!response.ok) throw new Error(payload?.error || payload?.message || "No fue posible reintentar la entrega.");
			await load();
		} catch (retryError) {setError(retryError instanceof Error ? retryError.message : "No fue posible reintentar la entrega.");}
		finally {setWorking(null);}
	};
	const updateFeedback = async (item: FeedbackEntry, status: FeedbackStatus) => {
		setWorking(item.id); setError(null);
		try {
			const response = await fetch(`/api/admin/feedback/${encodeURIComponent(item.id)}`, {method: "PATCH", headers: {"content-type": "application/json"}, credentials: "same-origin", body: JSON.stringify({status, adminNote: item.adminNote || undefined})});
			const payload = await response.json().catch(() => null);
			if (!response.ok) throw new Error(payload?.error || payload?.message || "No fue posible actualizar el comentario.");
			await load();
		} catch (updateError) {setError(updateError instanceof Error ? updateError.message : "No fue posible actualizar el comentario.");}
		finally {setWorking(null);}
	};

	return <ProtectedRoute requiredRole={UserRole.ADMIN}><Layout title="Panel operativo">
		<div className="mb-6 flex flex-wrap items-center justify-between gap-3"><p className="max-w-2xl text-sm text-gray-600">Supervisa evaluaciones automáticas, entrega de eventos y comentarios de usuarios desde un solo lugar.</p><button type="button" onClick={() => void load()} disabled={loading} className="btn-ghost inline-flex min-h-11 items-center gap-2"><FontAwesomeIcon icon={faArrowsRotate} className={loading ? "animate-spin" : ""} />Actualizar</button></div>
		{error && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
		{loading && !summary ? <div role="status" className="py-12 text-center text-gray-600">Cargando estado operativo…</div> : summary && <>
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<Card><p className="text-sm font-semibold text-gray-500">En procesamiento</p><p className="mt-2 text-3xl font-bold text-gray-900">{summary.submissions.active}</p><p className="mt-1 text-xs text-gray-500">Pendientes y en progreso</p></Card>
				<Card><p className="text-sm font-semibold text-gray-500">Fallos por atender</p><p className="mt-2 text-3xl font-bold text-red-700">{summary.submissions.failed}</p><p className="mt-1 text-xs text-gray-500">Entregas que admiten reintento</p></Card>
				<Card><p className="text-sm font-semibold text-gray-500">Feedback abierto</p><p className="mt-2 text-3xl font-bold text-electric-700">{summary.openFeedback}</p><p className="mt-1 text-xs text-gray-500">Comentarios pendientes de revisión</p></Card>
				<Card><p className="text-sm font-semibold text-gray-500">Evaluaciones publicadas</p><p className="mt-2 text-3xl font-bold text-green-700">{summary.submissions.byStatus.PUBLISHED}</p><p className="mt-1 text-xs text-gray-500">Histórico disponible</p></Card>
			</div>
			{summary.infrastructure && <section aria-labelledby="infrastructure-title" className="mt-6"><h2 id="infrastructure-title" className="mb-3 flex items-center gap-2 text-xl font-bold text-gray-900"><FontAwesomeIcon icon={faServer} />Infraestructura</h2>{summary.infrastructure.available && summary.infrastructure.queues ? <div className="grid gap-4 md:grid-cols-3"><Card><p className="font-semibold text-gray-900">Cola de evaluación</p><p className="mt-2 text-sm text-gray-600">{summary.infrastructure.queues.grading.waiting} en espera · {summary.infrastructure.queues.grading.active} activos · {summary.infrastructure.queues.grading.failed} fallidos</p></Card><Card><p className="font-semibold text-gray-900">Cola de notificaciones</p><p className="mt-2 text-sm text-gray-600">{summary.infrastructure.queues.notifications.waiting} en espera · {summary.infrastructure.queues.notifications.active} activos · {summary.infrastructure.queues.notifications.failed} fallidos</p></Card><Card><p className="font-semibold text-gray-900">Entrega confiable</p><p className="mt-2 text-sm text-gray-600">{summary.infrastructure.outboxPending} eventos pendientes · {summary.infrastructure.failedDeliveries24h} notificaciones fallidas en 24 h</p></Card></div> : <div className="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800">Las métricas de infraestructura no están disponibles en este momento.</div>}</section>}
			<section aria-labelledby="failures-title" className="mt-8"><h2 id="failures-title" className="mb-3 flex items-center gap-2 text-xl font-bold text-gray-900"><FontAwesomeIcon icon={faTriangleExclamation} />Entregas fallidas recientes</h2><Card noPadding>{summary.recentFailures.length === 0 ? <p className="p-6 text-sm text-gray-600">No hay entregas fallidas por atender.</p> : <div className="divide-y divide-gray-100">{summary.recentFailures.map((failure) => <article key={failure.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"><div className="min-w-0"><p className="font-semibold text-gray-900">{failure.assignmentTitle}</p><p className="text-sm text-gray-600">{failure.studentName} · {dateFormatter.format(new Date(failure.lastAttemptAt))}</p><p className="mt-2 text-sm text-red-700">{failure.reason}</p><p className="mt-1 text-xs text-gray-500">{failure.attemptCount} intento(s) automático(s)</p></div><button type="button" onClick={() => void retry(failure.id)} disabled={working !== null} className="btn-primary min-h-11 shrink-0 disabled:opacity-50">{working === failure.id ? "Reintentando…" : "Reintentar"}</button></article>)}</div>}</Card></section>
		</>}
		<section id="feedback" aria-labelledby="feedback-title" className="mt-8 scroll-mt-6"><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 id="feedback-title" className="flex items-center gap-2 text-xl font-bold text-gray-900"><FontAwesomeIcon icon={faCommentDots} />Feedback de usuarios</h2><label className="text-sm font-semibold text-gray-700">Estado<select value={filter} onChange={(event) => setFilter(event.target.value as "" | FeedbackStatus)} className="ml-2 min-h-11 rounded-xl border border-gray-300 bg-white px-3"><option value="">Todos</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div><Card noPadding>{!feedback?.items.length ? <p className="p-6 text-sm text-gray-600">No hay comentarios con este filtro.</p> : <div className="divide-y divide-gray-100">{feedback.items.map((item) => <article key={item.id} className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><Badge variant={variantForStatus(item.status)}>{statusLabels[item.status]}</Badge><Badge>{categoryLabels[item.category]}</Badge></div><p className="mt-3 whitespace-pre-wrap text-sm text-gray-800">{item.message}</p><p className="mt-2 text-xs text-gray-500">{item.user ? `${item.user.name} ${item.user.last_name} · ${item.user.email}` : "Usuario"} · {dateFormatter.format(new Date(item.createdAt))}</p><p className="mt-1 break-all text-xs text-gray-500">Pantalla: {item.page}{item.referenceId ? ` · Referencia: ${item.referenceId}` : ""}</p></div><div className="flex shrink-0 flex-wrap gap-2">{item.status === "OPEN" && <button type="button" onClick={() => void updateFeedback(item, "IN_REVIEW")} disabled={working !== null} className="btn-ghost min-h-11">Tomar caso</button>}{item.status !== "RESOLVED" && <button type="button" onClick={() => void updateFeedback(item, "RESOLVED")} disabled={working !== null} className="btn-primary min-h-11">Resolver</button>}</div></div></article>)}</div>}</Card></section>
		{summary && <p className="mt-4 text-right text-xs text-gray-500" aria-live="polite">Actualizado {dateFormatter.format(new Date(summary.generatedAt))}</p>}
	</Layout></ProtectedRoute>;
};
export default OperationsPage;
