import {NextRequest, NextResponse} from "next/server";
import {
	fetchBackendRest,
	forwardedBackendHeaders,
	isTrustedMutationRequest,
} from "@/lib/server/backend";
import {
	clearSessionCookie,
	readSessionToken,
} from "@/lib/server/authSession";

export async function POST(request: NextRequest) {
	if (!isTrustedMutationRequest(request)) {
		return NextResponse.json({error: "Origen no permitido."}, {status: 403});
	}

	const sessionToken = readSessionToken(request);
	if (!sessionToken) {
		return NextResponse.json(
			{error: "No hay sesión activa.", code: "UNAUTHENTICATED"},
			{status: 401},
		);
	}

	try {
		const backendResponse = await fetchBackendRest(request, "auth/logout-all", {
			method: "POST",
			sessionToken,
		});
		const data = await backendResponse.json().catch(() => ({}));
		const response = NextResponse.json(data, {
			status: backendResponse.status,
			headers: forwardedBackendHeaders(backendResponse),
		});
		if (backendResponse.ok || backendResponse.status === 401) {
			clearSessionCookie(response);
		}
		return response;
	} catch {
		return NextResponse.json(
			{
				error: "No fue posible revocar las sesiones.",
				code: "SERVICE_UNAVAILABLE",
			},
			{status: 503},
		);
	}
}
