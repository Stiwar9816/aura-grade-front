import "server-only";

import {NextRequest, NextResponse} from "next/server";
import {
	fetchBackendRest,
	forwardedBackendHeaders,
	isTrustedMutationRequest,
} from "./backend";
import {clearSessionCookie, readSessionToken} from "./authSession";

type ProxyOptions = {
	method: "GET" | "POST" | "PATCH" | "DELETE";
};

export const proxyAuthenticatedRest = async (
	request: NextRequest,
	path: string,
	{method}: ProxyOptions,
) => {
	if (method !== "GET" && !isTrustedMutationRequest(request)) {
		return NextResponse.json({error: "Origen no permitido."}, {status: 403});
	}

	const sessionToken = readSessionToken(request);
	if (!sessionToken) {
		return NextResponse.json(
			{error: "Sesión no válida.", code: "UNAUTHENTICATED"},
			{status: 401, headers: {"cache-control": "no-store"}},
		);
	}

	try {
		const body = method === "GET" ? undefined : await request.text();
		const backendResponse = await fetchBackendRest(request, path, {
			method,
			sessionToken,
			headers: body
				? {"content-type": request.headers.get("content-type") || "application/json"}
				: undefined,
			body,
		});
		const responseBody = await backendResponse.arrayBuffer();
		const headers = forwardedBackendHeaders(backendResponse);
		headers.set(
			"content-type",
			backendResponse.headers.get("content-type") || "application/json",
		);
		const response = new NextResponse(responseBody, {
			status: backendResponse.status,
			headers,
		});
		if (backendResponse.status === 401) clearSessionCookie(response);
		return response;
	} catch {
		return NextResponse.json(
			{error: "No fue posible conectar con el servicio administrativo."},
			{status: 503, headers: {"cache-control": "no-store"}},
		);
	}
};
