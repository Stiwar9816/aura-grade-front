import {NextRequest, NextResponse} from "next/server";
import {
	fetchBackendRest,
	forwardedBackendHeaders,
	isTrustedMutationRequest,
} from "@/lib/server/backend";

export async function POST(request: NextRequest) {
	if (!isTrustedMutationRequest(request)) {
		return NextResponse.json({error: "Origen no permitido."}, {status: 403});
	}

	try {
		const input = (await request.json()) as {token?: string; password?: string};
		const backendResponse = await fetchBackendRest(
			request,
			"user-invitations/accept",
			{
				method: "POST",
				headers: {"content-type": "application/json"},
				body: JSON.stringify({token: input.token, password: input.password}),
			},
		);
		const payload = await backendResponse.json().catch(() => ({}));
		return NextResponse.json(payload, {
			status: backendResponse.status,
			headers: forwardedBackendHeaders(backendResponse),
		});
	} catch {
		return NextResponse.json(
			{error: "El servicio de invitaciones no está disponible."},
			{status: 503, headers: {"cache-control": "no-store"}},
		);
	}
}
