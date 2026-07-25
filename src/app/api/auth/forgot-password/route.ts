import {NextRequest, NextResponse} from "next/server";
import {
	fetchBackendGraphql,
	forwardedBackendHeaders,
	isTrustedMutationRequest,
} from "@/lib/server/backend";

export async function POST(request: NextRequest) {
	if (!isTrustedMutationRequest(request)) {
		return NextResponse.json({error: "Origen no permitido."}, {status: 403});
	}

	try {
		const {email} = (await request.json()) as {email?: string};
		if (!email) {
			return NextResponse.json(
				{error: "El correo electrónico es obligatorio."},
				{status: 400},
			);
		}

		const backendResponse = await fetchBackendGraphql(request, {
			method: "POST",
			headers: {"content-type": "application/json"},
			body: JSON.stringify({
				query: `
					mutation ResetPassword($resetPassword: String!) {
						resetPassword(resetPassword: $resetPassword) {
							id
						}
					}
				`,
				variables: {resetPassword: email},
			}),
		});
		const payload = await backendResponse.json().catch(() => null);
		return NextResponse.json(payload || {}, {
			status: backendResponse.status,
			headers: forwardedBackendHeaders(backendResponse),
		});
	} catch {
		return NextResponse.json(
			{error: "Error de conexión con el servidor"},
			{status: 502},
		);
	}
}
