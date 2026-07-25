import {NextRequest, NextResponse} from "next/server";
import type {RegisterData, User} from "@/interface";
import {
	fetchBackendRest,
	forwardedBackendHeaders,
	isTrustedMutationRequest,
} from "@/lib/server/backend";
import {setSessionCookie} from "@/lib/server/authSession";

type BackendAuthResponse = {
	expiresAt?: string;
	message?: string;
	sessionToken?: string;
	token?: string;
	user?: User;
};

export async function POST(request: NextRequest) {
	if (!isTrustedMutationRequest(request)) {
		return NextResponse.json({error: "Origen no permitido."}, {status: 403});
	}

	try {
		const data = (await request.json()) as RegisterData;
		const backendResponse = await fetchBackendRest(request, "auth/register", {
			method: "POST",
			headers: {"content-type": "application/json"},
			body: JSON.stringify(data),
		});
		const responseData = (await backendResponse.json().catch(() => null)) as
			| BackendAuthResponse
			| null;
		const responseHeaders = forwardedBackendHeaders(backendResponse);

		if (!backendResponse.ok || !responseData) {
			return NextResponse.json(
				{error: responseData?.message || "Error en el registro"},
				{status: backendResponse.status || 502, headers: responseHeaders},
			);
		}

		const sessionToken = responseData.sessionToken || responseData.token;
		if (!sessionToken || !responseData.user?.id) {
			return NextResponse.json(
				{error: "La respuesta de registro no contiene una sesión válida."},
				{status: 502, headers: responseHeaders},
			);
		}

		const response = NextResponse.json(
			{
				success: true,
				user: responseData.user,
				expiresAt: responseData.expiresAt,
			},
			{headers: responseHeaders},
		);
		setSessionCookie(response, sessionToken, {
			expiresAt: responseData.expiresAt,
		});
		return response;
	} catch {
		return NextResponse.json(
			{error: "El servicio de autenticación no está disponible."},
			{status: 502},
		);
	}
}
