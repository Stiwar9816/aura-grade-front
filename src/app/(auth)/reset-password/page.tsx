"use client";
import { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/Auth";
export default function ResetPasswordPage() {
	const [token, setToken] = useState("");
	const [password, setPassword] = useState("");
	const [confirmation, setConfirmation] = useState("");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const [done, setDone] = useState(false);
	useEffect(() => {
		const value =
			new URLSearchParams(window.location.hash.slice(1)).get("token") || "";
		startTransition(() => setToken((current) => current || value));
		window.history.replaceState(null, "", window.location.pathname);
	}, []);
	async function submit(event: React.FormEvent) {
		event.preventDefault();
		setError("");
		if (password !== confirmation) {
			setError("Las contraseñas no coinciden.");
			return;
		}
		setBusy(true);
		try {
			const response = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ token, newPassword: password }),
			});
			const data = await response.json();
			if (!response.ok)
				throw new Error(
					Array.isArray(data.error)
						? data.error.join(" ")
						: data.error || "No se pudo restablecer la contraseña.",
				);
			setDone(true);
			setPassword("");
			setConfirmation("");
			setToken("");
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Servicio no disponible.",
			);
		} finally {
			setBusy(false);
		}
	}
	return (
		<AuthLayout
			title="Elige una contraseña nueva"
			subtitle="El enlace es de un solo uso y vence a los 30 minutos."
		>
			{done ? (
				<div role="status">
					<p>
						Tu contraseña fue actualizada. Inicia sesión y completa el segundo
						factor.
					</p>
					<Link href="/login" className="btn-primary mt-4 inline-block">
						Ir al inicio de sesión
					</Link>
				</div>
			) : (
				<form onSubmit={submit} className="space-y-4" data-sentry-mask>
					<p className="text-sm text-gray-600">
						Usa una contraseña única de 15 a 128 caracteres, sin espacios. Evita
						las contraseñas comunes.
					</p>
					<label className="block">
						Nueva contraseña
						<input
							className="mt-2 w-full rounded-lg border p-3"
							type="password"
							autoComplete="new-password"
							minLength={15}
							maxLength={128}
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</label>
					<label className="block">
						Confirmar contraseña
						<input
							className="mt-2 w-full rounded-lg border p-3"
							type="password"
							autoComplete="new-password"
							required
							value={confirmation}
							onChange={(e) => setConfirmation(e.target.value)}
						/>
					</label>
					{error && (
						<p role="alert" className="text-red-700">
							{error}
						</p>
					)}
					<button
						disabled={busy || !token}
						className="btn-primary w-full disabled:opacity-50"
					>
						{busy ? "Guardando…" : "Guardar contraseña"}
					</button>
					{!token && (
						<p>
							Abre el enlace de tu correo o{" "}
							<Link href="/forgot-password" className="underline">
								solicita uno nuevo
							</Link>
							.
						</p>
					)}
				</form>
			)}
		</AuthLayout>
	);
}
