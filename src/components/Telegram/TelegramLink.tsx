import { useCallback, useEffect, useState } from "react";
import Card from "@/components/Common/Card";
import SectionHeader from "@/components/Common/SectionHeader";
import { notifyError, notifySuccess } from "@/utils/toastNotify";

type Status = { enabled: boolean; linked: boolean; linkedAt?: string };
type Code = { url: string; expiresAt: string };

const BASE = "/api/telegram/link";
const POLL_MS = 4000;

/**
 * Links the signed-in student's Telegram account. The one-use code only lives in component
 * state: it is never written to storage and disappears on expiry, navigation or success.
 */
export default function TelegramLink() {
	const [status, setStatus] = useState<Status | null>(null);
	const [code, setCode] = useState<Code | null>(null);
	const [busy, setBusy] = useState(false);

	const fetchStatus = useCallback(async (): Promise<Status | null> => {
		try {
			const response = await fetch(BASE, { cache: "no-store" });
			return response.ok ? ((await response.json()) as Status) : null;
		} catch {
			return null;
		}
	}, []);

	const refresh = useCallback(async () => {
		const next = await fetchStatus();
		setStatus(next);
		if (next?.linked) setCode(null);
	}, [fetchStatus]);

	useEffect(() => {
		let active = true;
		void fetchStatus().then((next) => {
			if (active) setStatus(next);
		});
		return () => {
			active = false;
		};
	}, [fetchStatus]);

	// While a code is open, watch for the bot to confirm the link and drop it once expired.
	useEffect(() => {
		if (!code) return;
		const poll = window.setInterval(() => void refresh(), POLL_MS);
		const remaining = new Date(code.expiresAt).getTime() - Date.now();
		const expire = window.setTimeout(() => setCode(null), Math.max(remaining, 0));
		return () => {
			window.clearInterval(poll);
			window.clearTimeout(expire);
		};
	}, [code, refresh]);

	const generate = async () => {
		setBusy(true);
		try {
			const response = await fetch(`${BASE}/token`, { method: "POST" });
			if (!response.ok) {
				const body = await response.json().catch(() => ({}));
				throw new Error(body.message || "No se pudo generar el código.");
			}
			setCode((await response.json()) as Code);
		} catch (error) {
			notifyError(
				error instanceof Error ? error.message : "No se pudo generar el código.",
			);
		} finally {
			setBusy(false);
		}
	};

	const unlink = async () => {
		setBusy(true);
		try {
			const response = await fetch(BASE, { method: "DELETE" });
			if (!response.ok) throw new Error();
			notifySuccess("Telegram desvinculado.");
			setCode(null);
			await refresh();
		} catch {
			notifyError("No se pudo desvincular Telegram.");
		} finally {
			setBusy(false);
		}
	};

	if (!status?.enabled) return null;

	return (
		<Card>
			<SectionHeader
				title="Telegram"
				description="Consulta tus fechas de entrega, notas y los documentos del curso desde Telegram"
				className="mb-6"
			/>
			{status.linked ? (
				<div className="space-y-3">
					<p className="text-sm text-gray-700">
						Tu cuenta está vinculada. Escribe /ayuda al bot para ver los
						comandos.
					</p>
					<button
						type="button"
						onClick={() => void unlink()}
						disabled={busy}
						className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700"
					>
						Desvincular Telegram
					</button>
				</div>
			) : code ? (
				<div className="space-y-3">
					<p className="text-sm text-gray-700">
						Abre el enlace en Telegram y pulsa «Iniciar». El código se usa una
						sola vez y vence en 10 minutos.
					</p>
					<a
						href={code.url}
						target="_blank"
						rel="noopener noreferrer"
						className="btn-primary inline-block"
					>
						Abrir Telegram
					</a>
				</div>
			) : (
				<div className="space-y-3">
					<p className="text-sm text-gray-700">
						Vincula este Telegram con tu cuenta. Solo funciona en chat privado
						con el bot.
					</p>
					<button
						type="button"
						onClick={() => void generate()}
						disabled={busy}
						className="btn-primary"
					>
						Vincular Telegram
					</button>
				</div>
			)}
		</Card>
	);
}
