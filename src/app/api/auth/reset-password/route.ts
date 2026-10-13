import { NextRequest, NextResponse } from "next/server";
import {
	fetchBackendRest,
	forwardedBackendHeaders,
	isTrustedMutationRequest,
} from "@/lib/server/backend";
import { readLimitedJson, RequestBodyError } from "@/lib/server/requestBody";
export async function POST(request: NextRequest) {
	if (!isTrustedMutationRequest(request))
		return NextResponse.json(
			{ error: "Origen no permitido." },
			{ status: 403 },
		);
	try {
		const input = await readLimitedJson(request);
		const backend = await fetchBackendRest(request, "auth/reset-password", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				token: input.token,
				newPassword: input.newPassword,
			}),
		});
		const data = await backend.json();
		return NextResponse.json(
			backend.ok
				? data
				: { error: data.message || "No se pudo procesar la solicitud." },
			{ status: backend.status, headers: forwardedBackendHeaders(backend) },
		);
	} catch (error) {
		return NextResponse.json(
			{
				error:
					error instanceof RequestBodyError
						? error.message
						: "Servicio no disponible. Intenta de nuevo.",
			},
			{ status: error instanceof RequestBodyError ? error.status : 503 },
		);
	}
}
