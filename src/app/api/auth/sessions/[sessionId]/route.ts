import {NextRequest, NextResponse} from "next/server";
import {
	fetchBackendRest,
	forwardedBackendHeaders,
	isTrustedMutationRequest,
} from "@/lib/server/backend";
import {clearSessionCookie, readSessionToken} from "@/lib/server/authSession";

type RouteContext = {params: Promise<{sessionId: string}>};

export async function DELETE(request: NextRequest, context: RouteContext) {
	if (!isTrustedMutationRequest(request)) {
		return NextResponse.json({error: "Origen no permitido."}, {status: 403});
	}

	const sessionToken = readSessionToken(request);
	if (!sessionToken) {
		return NextResponse.json(
			{error: "Sesión no válida.", code: "UNAUTHENTICATED"},
			{status: 401, headers: {"cache-control": "no-store"}},
		);
	}

	const {sessionId} = await context.params;
	if (!/^[a-f0-9]{64}$/.test(sessionId)) {
		return NextResponse.json(
			{error: "Identificador de sesión inválido."},
			{status: 400, headers: {"cache-control": "no-store"}},
		);
	}

	try {
		const backendResponse = await fetchBackendRest(
			request,
			`auth/sessions/${sessionId}`,
			{method: "DELETE", sessionToken},
		);
		const data = (await backendResponse.json().catch(() => ({}))) as {
			currentSession?: boolean;
		};
		const response = NextResponse.json(data, {
			status: backendResponse.status,
			headers: forwardedBackendHeaders(backendResponse),
		});
		if (
			backendResponse.status === 401 ||
			(backendResponse.ok && data.currentSession)
		) {
			clearSessionCookie(response);
		}
		return response;
	} catch {
		return NextResponse.json(
			{error: "No fue posible cerrar la sesión seleccionada."},
			{status: 503, headers: {"cache-control": "no-store"}},
		);
	}
}
