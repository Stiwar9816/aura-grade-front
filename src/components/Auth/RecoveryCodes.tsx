import { useState } from "react";
import Card from "@/components/Common/Card";
export default function RecoveryCodes() {
	const [otp, setOtp] = useState("");
	const [codes, setCodes] = useState<string[]>([]);
	const [error, setError] = useState("");
	const [busy, setBusy] = useState(false);
	async function generate(event: React.FormEvent) {
		event.preventDefault();
		setBusy(true);
		setError("");
		try {
			const response = await fetch("/api/auth/recovery-codes", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ otp }),
			});
			const data = await response.json();
			if (!response.ok)
				throw new Error(
					data.message || data.error || "No se pudieron generar los códigos.",
				);
			setCodes(data.recoveryCodes);
			setOtp("");
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Servicio no disponible.",
			);
		} finally {
			setBusy(false);
		}
	}
	return (
		<Card className="my-6">
			<section data-sentry-mask>
				<h2 className="text-xl font-bold mb-2">Códigos de recuperación</h2>
				<p className="text-gray-600 mb-4">
					Guárdalos por si pierdes tu autenticador. Generar códigos nuevos
					invalida todos los anteriores. Un código recupera el acceso y obliga a
					configurar un autenticador nuevo.
				</p>
				{codes.length ? (
					<>
						<ul className="font-mono break-all">
							{codes.map((code) => (
								<li key={code}>{code}</li>
							))}
						</ul>
						<button className="btn-primary mt-4" onClick={() => setCodes([])}>
							Ya los guardé. Ocultar
						</button>
					</>
				) : (
					<form
						onSubmit={generate}
						className="flex flex-col gap-3 sm:flex-row sm:items-end"
					>
						<label>
							Código nuevo del autenticador
							<input
								className="block rounded-lg border p-3 mt-1"
								value={otp}
								onChange={(e) =>
									setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
								}
								inputMode="numeric"
								autoComplete="one-time-code"
								pattern="[0-9]{6}"
								required
							/>
						</label>
						<button className="btn-primary" disabled={busy}>
							{busy ? "Generando…" : "Generar códigos"}
						</button>
					</form>
				)}
				{error && (
					<p role="alert" className="mt-3 text-red-700">
						{error}
					</p>
				)}
			</section>
		</Card>
	);
}
