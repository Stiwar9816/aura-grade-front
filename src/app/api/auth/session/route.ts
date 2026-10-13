import {NextRequest, NextResponse} from "next/server";
import type {User} from "@/interface";
import {
	fetchBackendRest,
	forwardedBackendHeaders,
} from "@/lib/server/backend";
import {
	clearSessionCookie,
	readSessionToken,
} from "@/lib/server/authSession";

type MeResponse = {
	message?: string;
	user?: User;
};

export async function GET(request: NextRequest) {
	const sessionToken = readSessionToken(request);
	if (!sessionToken) {
		return NextResponse.json(
			{user: null, code: "UNAUTHENTICATED"},
			{status: 401, headers: {"cache-control": "no-store"}},
		);
	}

	try {
		const backendResponse = await fetchBackendRest(request, "auth/me", {
			method: "GET",
			sessionToken,
		});
		const data = (await backendResponse.json().catch(() => null)) as
			| MeResponse
			| null;
		const responseHeaders = forwardedBackendHeaders(backendResponse);

		if (!backendResponse.ok || !data?.user) {
			const publicStatus =
				backendResponse.status === 403 ? 503 : backendResponse.status || 502;
			const response = NextResponse.json(
				{
					user: null,
					code:
						backendResponse.status === 401
							? "UNAUTHENTICATED"
							: backendResponse.status === 429
								? "RATE_LIMITED"
								: backendResponse.status === 503 ||
									  backendResponse.status === 403
									? "SERVICE_UNAVAILABLE"
									: "SESSION_ERROR",
					error:
						backendResponse.status === 403
							? "El servicio de sesiones no está configurado correctamente."
							: data?.message || "No fue posible validar la sesión.",
				},
				{status: publicStatus, headers: responseHeaders},
			);
			if (backendResponse.status === 401) clearSessionCookie(response);
			return response;
		}

		return NextResponse.json(
			{user: data.user},
			{headers: responseHeaders},
		);
	} catch {
		return NextResponse.json(
			{
				user: null,
				code: "SERVICE_UNAVAILABLE",
				error: "No fue posible conectar con el servicio de sesiones.",
			},
			{status: 503, headers: {"cache-control": "no-store"}},
		);
	}
}
