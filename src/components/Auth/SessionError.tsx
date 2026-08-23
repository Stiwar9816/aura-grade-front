import type { SessionErrorProps } from "@/interface";

export const SessionError = ({ code, message }: SessionErrorProps) => (
	<div className="min-h-screen flex items-center justify-center bg-background-bone px-6">
		<div className="max-w-md text-center rounded-2xl bg-white p-8 shadow-lg">
			<h1 className="text-xl font-semibold text-gray-900">
				{code === "RATE_LIMITED"
					? "Demasiadas solicitudes"
					: "Servicio temporalmente no disponible"}
			</h1>
			<p className="mt-3 text-gray-600">
				{message ||
					"Conservamos tu sesión. Intenta nuevamente dentro de unos momentos."}
			</p>
			<button
				type="button"
				onClick={() => window.location.reload()}
				className="btn-primary mt-6 px-5 py-2"
			>
				Reintentar
			</button>
		</div>
	</div>
);
