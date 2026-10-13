import Link from "next/link";
import {useCallback, useEffect, useMemo, useState} from "react";
import type {OnboardingState} from "@/interface";

type Step = {id: string; title: string; description: string; href: string};
const common: Record<string, Step> = {
	security: {id: "security", title: "Protege tu cuenta", description: "Revisa tus sesiones y opciones de seguridad.", href: "/settings"},
	courses: {id: "courses", title: "Conoce tus cursos", description: "Confirma que ves los cursos correctos.", href: "/student/courses"},
	submission: {id: "submission", title: "Haz una entrega", description: "Prueba el flujo de carga de una tarea.", href: "/upload"},
	help: {id: "help", title: "Ubica el centro de ayuda", description: "Conoce dónde resolver dudas y contactar soporte.", href: "/help"},
	course: {id: "course", title: "Configura un curso", description: "Crea o revisa los miembros de tu curso.", href: "/teacher/courses"},
	rubric: {id: "rubric", title: "Prepara una rúbrica", description: "Define criterios claros antes de evaluar.", href: "/rubrics"},
	assignment: {id: "assignment", title: "Publica una tarea", description: "Asocia la tarea con su curso y rúbrica.", href: "/teacher/assignments"},
	review: {id: "review", title: "Revisa una evaluación", description: "Valida el resultado antes de publicarlo.", href: "/teacher"},
	approvals: {id: "approvals", title: "Revisa aprobaciones", description: "Atiende usuarios pendientes de la institución.", href: "/admin/approvals"},
	operations: {id: "operations", title: "Abre el panel operativo", description: "Monitorea fallos y reintenta entregas.", href: "/admin/operations"},
	feedback: {id: "feedback", title: "Gestiona comentarios", description: "Da seguimiento al feedback de los usuarios.", href: "/admin/operations#feedback"},
};

export default function GuidedOnboarding() {
	const [state, setState] = useState<OnboardingState | null>(null);
	const [saving, setSaving] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const load = useCallback(async () => {
		try {
			const response = await fetch("/api/onboarding", {credentials: "same-origin", cache: "no-store"});
			if (!response.ok) return;
			setState(await response.json());
		} catch { /* La guía no bloquea el resto de la aplicación. */ }
	}, []);
	useEffect(() => {
		const request = window.setTimeout(() => void load(), 0);
		return () => window.clearTimeout(request);
	}, [load]);
	const steps = useMemo(() => (state?.allowedSteps ?? []).map((id) => common[id]).filter(Boolean), [state]);
	if (!state || steps.length === 0 || state.completedSteps.length === steps.length) return null;

	const update = async (body: Record<string, unknown>, key: string) => {
		setSaving(key); setError(null);
		try {
			const response = await fetch("/api/onboarding", {method: "PATCH", headers: {"content-type": "application/json"}, credentials: "same-origin", body: JSON.stringify(body)});
			const payload = await response.json().catch(() => null);
			if (!response.ok) throw new Error(payload?.error || payload?.message || "No fue posible guardar el progreso.");
			setState(payload);
		} catch (updateError) {setError(updateError instanceof Error ? updateError.message : "No fue posible guardar el progreso.");}
		finally {setSaving(null);}
	};
	const completed = state.completedSteps.length;
	if (state.dismissedAt) return <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-electric-200 bg-electric-50 p-4"><div><p className="font-semibold text-gray-900">Tu guía inicial está en progreso</p><p className="text-sm text-gray-600">{completed} de {steps.length} pasos completados.</p></div><button type="button" onClick={() => void update({dismissed: false}, "resume")} disabled={saving !== null} className="btn-ghost min-h-11 bg-white">Continuar guía</button></div>;

	const current = steps.find((step) => !state.completedSteps.includes(step.id)) || steps[0];
	return <section aria-labelledby="onboarding-title" className="mb-6 rounded-2xl border border-electric-200 bg-electric-50 p-5">
		<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
			<div><p className="text-sm font-semibold text-electric-700">Primeros pasos · {completed}/{steps.length}</p><h2 id="onboarding-title" className="mt-1 text-xl font-bold text-gray-900">{current.title}</h2><p className="mt-1 text-sm text-gray-600">{current.description}</p></div>
			<div className="flex shrink-0 flex-wrap gap-2"><Link href={current.href} className="btn-primary inline-flex min-h-11 items-center">Ir al paso</Link><button type="button" onClick={() => void update({stepId: current.id, completed: true}, current.id)} disabled={saving !== null} className="btn-ghost min-h-11 bg-white">{saving === current.id ? "Guardando…" : "Marcar completado"}</button></div>
		</div>
		<div className="mt-4 h-2 overflow-hidden rounded-full bg-white" aria-label={`${completed} de ${steps.length} pasos completados`}><div className="h-full rounded-full bg-electric-500 transition-all" style={{width: `${(completed / steps.length) * 100}%`}} /></div>
		<div className="mt-3 flex items-center justify-between gap-3"><p role="status" className="text-sm text-red-700">{error}</p><button type="button" onClick={() => void update({dismissed: true}, "dismiss")} disabled={saving !== null} className="min-h-11 px-3 text-sm font-semibold text-gray-600 hover:text-gray-900">Ocultar por ahora</button></div>
	</section>;
}
