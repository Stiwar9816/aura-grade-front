import {FormEvent, useEffect, useRef, useState} from "react";
import {useRouter} from "next/router";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCommentDots, faXmark} from "@fortawesome/free-solid-svg-icons";
import type {FeedbackCategory} from "@/interface";

const categories: Array<{value: FeedbackCategory; label: string}> = [
	{value: "BUG", label: "Reportar un problema"},
	{value: "SUGGESTION", label: "Sugerir una mejora"},
	{value: "QUESTION", label: "Hacer una pregunta"},
	{value: "OTHER", label: "Otro comentario"},
];

export default function FeedbackButton() {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [category, setCategory] = useState<FeedbackCategory>("SUGGESTION");
	const [message, setMessage] = useState("");
	const [referenceId, setReferenceId] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [notice, setNotice] = useState<string | null>(null);
	const closeButton = useRef<HTMLButtonElement>(null);
 const dialog = useRef<HTMLDialogElement>(null);

 useEffect(() => {
  if (open) { dialog.current?.showModal(); closeButton.current?.focus(); }
  else dialog.current?.close();
 }, [open]);

	const submit = async (event: FormEvent) => {
		event.preventDefault();
		setSubmitting(true);
		setNotice(null);
		try {
			const response = await fetch("/api/feedback", {
				method: "POST",
				headers: {"content-type": "application/json"},
				credentials: "same-origin",
				body: JSON.stringify({category, message, page: router.pathname.slice(0, 300), referenceId: referenceId || undefined}),
			});
			const payload = await response.json().catch(() => null);
			if (!response.ok) throw new Error(payload?.error || payload?.message || "No fue posible enviar el comentario.");
			setMessage("");
			setReferenceId("");
			setNotice("Gracias. Tu comentario quedó registrado para seguimiento.");
		} catch (error) {
			setNotice(error instanceof Error ? error.message : "No fue posible enviar el comentario.");
		} finally {
			setSubmitting(false);
		}
	};

	return <>
		<button type="button" onClick={() => {setNotice(null); setOpen(true);}} className="min-h-11 rounded-xl border border-gray-300 px-3 text-sm font-semibold text-gray-700 hover:border-electric-500 hover:text-electric-600 focus:outline-none focus:ring-2 focus:ring-electric-300" aria-haspopup="dialog">
			<FontAwesomeIcon icon={faCommentDots} className="mr-2" /><span className="hidden sm:inline">Enviar comentario</span><span className="sr-only sm:hidden">Enviar comentario</span>
		</button>
		<dialog ref={dialog} onKeyDown={(event) => {
            if (event.key !== "Tab") return;
            const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]')).filter((element) => element.getClientRects().length > 0);
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }} onClose={() => setOpen(false)} aria-labelledby="feedback-title" className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl bg-white p-0 text-gray-900 shadow-xl">
			<div className="p-5 sm:p-6">
				<div className="mb-5 flex items-start justify-between gap-4">
					<div><h2 id="feedback-title" className="text-xl font-bold text-gray-900">Cuéntanos qué podemos mejorar</h2><p className="mt-1 text-sm text-gray-600">Incluiremos la pantalla actual. No compartas contraseñas, códigos ni documentos.</p></div>
					<button ref={closeButton} type="button" onClick={() => setOpen(false)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-electric-300" aria-label="Cerrar formulario"><FontAwesomeIcon icon={faXmark} /></button>
				</div>
				<form onSubmit={submit} className="space-y-4">
					<label className="block text-sm font-semibold text-gray-800">Tipo de comentario<select value={category} onChange={(event) => setCategory(event.target.value as FeedbackCategory)} className="input-primary mt-2 min-h-11">{categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
					<label className="block text-sm font-semibold text-gray-800">Detalle<textarea value={message} onChange={(event) => setMessage(event.target.value)} minLength={10} maxLength={2000} required rows={5} className="input-primary mt-2 resize-y" placeholder="Describe qué ocurrió o qué te gustaría encontrar." /><span className="mt-1 block text-right text-xs font-normal text-gray-500">{message.length}/2000</span></label>
					<label className="block text-sm font-semibold text-gray-800">Referencia <span className="font-normal text-gray-500">(opcional)</span><input value={referenceId} onChange={(event) => setReferenceId(event.target.value)} maxLength={120} className="input-primary mt-2 min-h-11" placeholder="ID de tarea, entrega o curso" /></label>
					{notice && <p role="status" className="rounded-xl bg-electric-50 p-3 text-sm text-electric-700">{notice}</p>}
					<div className="flex justify-end gap-3"><button type="button" onClick={() => setOpen(false)} className="btn-ghost min-h-11">Cancelar</button><button type="submit" disabled={submitting || message.trim().length < 10} className="btn-primary min-h-11 disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Enviando…" : "Enviar"}</button></div>
				</form>
			</div>
		</dialog>
	</>;
}
