import {NextRequest, NextResponse} from "next/server";
import {
	fetchBackendRest,
	forwardedBackendHeaders,
	getRequestContext,
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
	let responseHeaders = new Headers({"cache-control": "no-store"});
	let revoked = !sessionToken;

	try {
		const backendResponse = await fetchBackendRest(request, "auth/logout", {
			method: "POST",
			sessionToken,
		});
		responseHeaders = forwardedBackendHeaders(backendResponse);
		revoked = backendResponse.ok;

		if (!backendResponse.ok) {
			console.error("Backend session revocation failed", {
				requestId:
					backendResponse.headers.get("x-request-id") ||
					getRequestContext(request).requestId,
				status: backendResponse.status,
			});
		}
	} catch (error) {
		console.error("Backend session revocation was unavailable", {
			requestId: getRequestContext(request).requestId,
			message: error instanceof Error ? error.message : "Unknown error",
		});
	}

	const response = NextResponse.json(
		{success: true, revoked},
		{headers: responseHeaders},
	);
	clearSessionCookie(response);
	return response;
}
