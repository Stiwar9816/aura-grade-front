import {NextRequest, NextResponse} from "next/server";
import type {User} from "@/interface";
import {
	fetchBackendRest,
	forwardedBackendHeaders,
	isTrustedMutationRequest,
} from "@/lib/server/backend";
import {setSessionCookie} from "@/lib/server/authSession";

type BackendOtpResponse = {
	expiresAt?: string;
	message?: string;
	rememberMe?: boolean;
	sessionToken?: string;
	user?: User;
};

export async function POST(request: NextRequest) {
	if (!isTrustedMutationRequest(request)) {
		return NextResponse.json({error: "Origen no permitido."}, {status: 403});
	}

	try {
		const input = (await request.json()) as {
			challengeToken?: string;
			otp?: string;
		};
		const backendResponse = await fetchBackendRest(request, "auth/verify-otp", {
			method: "POST",
			headers: {"content-type": "application/json"},
			body: JSON.stringify({
				challengeToken: input.challengeToken,
				otp: input.otp,
			}),
		});
		const data = (await backendResponse.json().catch(() => null)) as
			| BackendOtpResponse
			| null;
		const responseHeaders = forwardedBackendHeaders(backendResponse);

		if (!backendResponse.ok || !data) {
			return NextResponse.json(
				{error: data?.message || "Código inválido o expirado."},
				{status: backendResponse.status || 502, headers: responseHeaders},
			);
		}
		if (!data.sessionToken || !data.user?.id) {
			return NextResponse.json(
				{error: "La validación no produjo una sesión válida."},
				{status: 502, headers: responseHeaders},
			);
		}

		const response = NextResponse.json(
			{success: true, user: data.user, expiresAt: data.expiresAt},
			{headers: responseHeaders},
		);
		setSessionCookie(response, data.sessionToken, {
			rememberMe: Boolean(data.rememberMe),
			expiresAt: data.expiresAt,
		});
		return response;
	} catch {
		return NextResponse.json(
			{error: "El servicio de segundo factor no está disponible."},
			{status: 502},
		);
	}
}
