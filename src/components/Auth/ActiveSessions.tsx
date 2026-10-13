import {useCallback, useEffect, useState} from "react";
import {
	ActiveSession,
	getActiveSessionsAction,
	revokeActiveSessionAction,
} from "@/actions/auth";
import Card from "@/components/Common/Card";
import SectionHeader from "@/components/Common/SectionHeader";
import {notifyError, notifySuccess} from "@/utils/toastNotify";

const formatDate = (value: string) =>
	new Intl.DateTimeFormat("es-CO", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));

const DeviceIcon = ({type}: {type: ActiveSession["deviceType"]}) => (
	<svg
		aria-hidden="true"
		className="h-6 w-6"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
	>
		{type === "mobile" ? (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.8}
				d="M8 2.75h8a1.75 1.75 0 011.75 1.75v15A1.75 1.75 0 0116 21.25H8a1.75 1.75 0 01-1.75-1.75v-15A1.75 1.75 0 018 2.75zM10 18h4"
			/>
		) : type === "tablet" ? (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.8}
				d="M6 2.75h12a1.75 1.75 0 011.75 1.75v15A1.75 1.75 0 0118 21.25H6a1.75 1.75 0 01-1.75-1.75v-15A1.75 1.75 0 016 2.75zM11 18.25h2"
			/>
		) : (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.8}
				d="M4 4.75h16a1.75 1.75 0 011.75 1.75v9A1.75 1.75 0 0120 17.25H4a1.75 1.75 0 01-1.75-1.75v-9A1.75 1.75 0 014 4.75zM8.5 21.25h7M12 17.25v4"
			/>
		)}
	</svg>
);

const ActiveSessions: React.FC = () => {
	const [sessions, setSessions] = useState<ActiveSession[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>();
	const [revokingId, setRevokingId] = useState<string>();

	const loadSessions = useCallback(async () => {
		setLoading(true);
		setError(undefined);
		const result = await getActiveSessionsAction();
		if (result.success) setSessions(result.sessions);
		else setError(result.error);
		setLoading(false);
	}, []);

	useEffect(() => {
		let cancelled = false;
		void getActiveSessionsAction().then((result) => {
			if (cancelled) return;
			if (result.success) setSessions(result.sessions);
			else setError(result.error);
			setLoading(false);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	const revokeSession = async (session: ActiveSession) => {
		setRevokingId(session.id);
		const result = await revokeActiveSessionAction(session.id);
		setRevokingId(undefined);
		if (!result.success) {
			notifyError(result.error || "No fue posible cerrar la sesión.");
			return;
		}
		if (result.currentSession) {
			window.location.assign("/login");
			return;
		}
		setSessions((current) => current.filter(({id}) => id !== session.id));
		notifySuccess("La sesión seleccionada fue cerrada.");
	};

	return (
		<Card>
			<SectionHeader
				title="Dispositivos con sesión activa"
				description="Revisa dónde está abierta tu cuenta y cierra cualquier sesión que no reconozcas."
				actions={
					<button
						type="button"
						onClick={() => void loadSessions()}
						disabled={loading}
						className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
					>
						{loading ? "Actualizando..." : "Actualizar"}
					</button>
				}
				className="mb-5"
			/>

			<div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
				El OTP es obligatorio para todos los usuarios y su verificación solo se
				conserva hasta la fecha indicada en cada sesión. Google Authenticator y
				Microsoft Authenticator no comparten con Aura Grade la lista de
				teléfonos que tienen copiada tu clave OTP.
			</div>

			{error && (
				<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					{error}
				</div>
			)}
			{loading && sessions.length === 0 && (
				<p className="py-4 text-sm text-gray-500">
					Cargando sesiones activas...
				</p>
			)}
			{!loading && !error && sessions.length === 0 && (
				<p className="py-4 text-sm text-gray-500">No hay sesiones activas.</p>
			)}

			<div className="divide-y divide-gray-100">
				{sessions.map((session) => (
					<div
						key={session.id}
						className="flex flex-col gap-4 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
					>
						<div className="flex min-w-0 gap-3">
							<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-electric-50 text-electric-600">
								<DeviceIcon type={session.deviceType} />
							</div>
							<div className="min-w-0">
								<div className="flex flex-wrap items-center gap-2">
									<h4 className="truncate font-bold text-gray-900">
										{session.name}
									</h4>
									{session.current && (
										<span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
											Este dispositivo
										</span>
									)}
									{session.rememberMe && (
										<span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
											Recordado
										</span>
									)}
								</div>
								<p className="mt-1 text-sm text-gray-600">
									Última actividad: {formatDate(session.lastActivityAt)}
								</p>
								<p className="mt-0.5 text-xs font-semibold text-electric-700">
									OTP válido hasta: {formatDate(session.mfaExpiresAt)}
								</p>
								<p className="mt-0.5 text-xs text-gray-500">
									Inicio: {formatDate(session.createdAt)}
									{session.ipAddress ? ` · IP ${session.ipAddress}` : ""}
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={() => void revokeSession(session)}
							disabled={Boolean(revokingId)}
							className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-bold transition-colors disabled:opacity-50 ${
								session.current
									? "border-red-200 text-red-700 hover:bg-red-50"
									: "border-gray-300 text-gray-700 hover:bg-gray-50"
							}`}
						>
							{revokingId === session.id
								? "Cerrando..."
								: session.current
									? "Cerrar esta sesión"
									: "Cerrar sesión"}
						</button>
					</div>
				))}
			</div>
		</Card>
	);
};

export default ActiveSessions;
