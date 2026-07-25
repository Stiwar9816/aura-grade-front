import {NextRequest, NextResponse} from "next/server";
import type {LoginCredentials, User} from "@/interface";
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
		const credentials = (await request.json()) as Pick<
			LoginCredentials,
			"email" | "password" | "rememberMe"
		>;
		const backendResponse = await fetchBackendRest(request, "auth/login", {
			method: "POST",
			headers: {"content-type": "application/json"},
			body: JSON.stringify({
				email: credentials.email,
				password: credentials.password,
				rememberMe: Boolean(credentials.rememberMe),
			}),
		});
		const data = (await backendResponse.json().catch(() => null)) as
			| BackendAuthResponse
			| null;
		const responseHeaders = forwardedBackendHeaders(backendResponse);

		if (!backendResponse.ok || !data) {
			return NextResponse.json(
				{error: data?.message || "Credenciales incorrectas"},
				{status: backendResponse.status || 502, headers: responseHeaders},
			);
		}

		const sessionToken = data.sessionToken || data.token;
		if (!sessionToken || !data.user?.id) {
			return NextResponse.json(
				{error: "La respuesta de autenticación no contiene una sesión válida."},
				{status: 502, headers: responseHeaders},
			);
		}

		const response = NextResponse.json(
			{success: true, user: data.user, expiresAt: data.expiresAt},
			{headers: responseHeaders},
		);
		setSessionCookie(response, sessionToken, {
			rememberMe: Boolean(credentials.rememberMe),
			expiresAt: data.expiresAt,
		});
		return response;
	} catch {
		return NextResponse.json(
			{error: "El servicio de autenticación no está disponible."},
			{status: 502},
		);
	}
}
