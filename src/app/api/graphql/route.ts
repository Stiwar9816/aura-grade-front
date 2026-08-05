import {NextRequest, NextResponse} from "next/server";
import {
	fetchBackendGraphql,
	forwardedBackendHeaders,
	isTrustedMutationRequest,
} from "@/lib/server/backend";
import {
	clearSessionCookie,
	readSessionToken,
} from "@/lib/server/authSession";

const isUnauthenticatedError = (payload: unknown) => {
	if (!payload || typeof payload !== "object" || !("errors" in payload)) {
		return false;
	}

	const errors = (payload as {errors?: unknown}).errors;
	if (!Array.isArray(errors)) return false;

	return errors.some((error) => {
		if (!error || typeof error !== "object") return false;
		const candidate = error as {
			message?: string;
			extensions?: {code?: string};
		};
		const code = candidate.extensions?.code?.toUpperCase();
		const message = candidate.message?.toLowerCase() || "";
		return (
			code === "UNAUTHENTICATED" ||
			message.includes("jwt expired") ||
			message.includes("token expired") ||
			message.includes("sesión inválida")
		);
	});
};

export async function POST(request: NextRequest) {
	if (!isTrustedMutationRequest(request)) {
		return NextResponse.json({error: "Origen no permitido."}, {status: 403});
	}

	const sessionToken = readSessionToken(request);
	if (!sessionToken) {
		return NextResponse.json(
			{
				errors: [
					{
						message: "Sesión no válida.",
						extensions: {code: "UNAUTHENTICATED"},
					},
				],
			},
			{status: 401, headers: {"cache-control": "no-store"}},
		);
	}

	try {
		const contentType =
			request.headers.get("content-type") || "application/json";
		const backendHeaders = new Headers({
			accept: request.headers.get("accept") || "application/json",
			"content-type": contentType,
		});
		if (contentType.toLowerCase().startsWith("multipart/form-data")) {
			backendHeaders.set("apollo-require-preflight", "true");
		}
		const backendResponse = await fetchBackendGraphql(request, {
			method: "POST",
			headers: backendHeaders,
			sessionToken,
			body: request.body,
			duplex: "half",
		});
		const body = await backendResponse.arrayBuffer();
		const responseHeaders = forwardedBackendHeaders(backendResponse);
		responseHeaders.set(
			"content-type",
			backendResponse.headers.get("content-type") || "application/json",
		);
		const response = new NextResponse(body, {
			status: backendResponse.status,
			headers: responseHeaders,
		});

		let shouldClearSession = backendResponse.status === 401;
		if (
			!shouldClearSession &&
			backendResponse.headers.get("content-type")?.includes("application/json")
		) {
			try {
				shouldClearSession = isUnauthenticatedError(
					JSON.parse(Buffer.from(body).toString("utf8")),
				);
			} catch {
				shouldClearSession = false;
			}
		}

		if (shouldClearSession) clearSessionCookie(response);
		return response;
	} catch {
		return NextResponse.json(
			{
				errors: [
					{
						message: "No fue posible conectar con GraphQL.",
						extensions: {code: "SERVICE_UNAVAILABLE"},
					},
				],
			},
			{status: 503, headers: {"cache-control": "no-store"}},
		);
	}
}
