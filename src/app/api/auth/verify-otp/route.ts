import { readLimitedJson, RequestBodyError } from "@/lib/server/requestBody";
import { NextRequest, NextResponse } from "next/server";
import type { User } from "@/interface";
import {
	fetchBackendRest,
	forwardedBackendHeaders,
	isTrustedMutationRequest,
} from "@/lib/server/backend";
import { setSessionCookie } from "@/lib/server/authSession";

type BackendOtpResponse = {
	recoveryCodes?: string[];
	requiresTwoFactor?: boolean;
	requiresTwoFactorSetup?: boolean;
	challengeToken?: string;
	otpAuthUri?: string;
	setupKey?: string;
	expiresAt?: string;
	message?: string;
	rememberMe?: boolean;
	sessionToken?: string;
	user?: User;
};

export async function POST(request: NextRequest) {
	if (!isTrustedMutationRequest(request)) {
		return NextResponse.json(
			{ error: "Origen no permitido." },
			{ status: 403 },
		);
	}

	try {
		const input = (await readLimitedJson(request)) as {
			challengeToken?: string;
			otp?: string;
		};
		const backendResponse = await fetchBackendRest(request, "auth/verify-otp", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				challengeToken: input.challengeToken,
				otp: input.otp,
			}),
		});
		const data = (await backendResponse
			.json()
			.catch(() => null)) as BackendOtpResponse | null;
		const responseHeaders = forwardedBackendHeaders(backendResponse);

		if (!backendResponse.ok || !data) {
			return NextResponse.json(
				{ error: data?.message || "Código inválido o expirado." },
				{ status: backendResponse.status || 502, headers: responseHeaders },
			);
		}
		if (data.requiresTwoFactor && data.challengeToken)
			return NextResponse.json(
				{
					requiresTwoFactor: true,
					requiresTwoFactorSetup: data.requiresTwoFactorSetup,
					challengeToken: data.challengeToken,
					otpAuthUri: data.otpAuthUri,
					setupKey: data.setupKey,
					expiresAt: data.expiresAt,
				},
				{ headers: responseHeaders },
			);
		if (!data.sessionToken || !data.user?.id) {
			return NextResponse.json(
				{ error: "La validación no produjo una sesión válida." },
				{ status: 502, headers: responseHeaders },
			);
		}

		const response = NextResponse.json(
			{
				success: true,
				user: data.user,
				expiresAt: data.expiresAt,
				recoveryCodes: data.recoveryCodes,
			},
			{ headers: responseHeaders },
		);
		setSessionCookie(response, data.sessionToken, {
			rememberMe: Boolean(data.rememberMe),
			expiresAt: data.expiresAt,
		});
		return response;
	} catch (error) {
		if (error instanceof RequestBodyError)
			return NextResponse.json(
				{ error: error.message },
				{ status: error.status, headers: { "cache-control": "no-store" } },
			);
		return NextResponse.json(
			{ error: "El servicio de segundo factor no está disponible." },
			{ status: 502 },
		);
	}
}
