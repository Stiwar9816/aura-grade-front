import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, readSessionToken } from "@/lib/server/authSession";
import {
	fetchBackendRest,
	forwardedBackendHeaders,
	isTrustedMutationRequest,
} from "@/lib/server/backend";
import { readLimitedBody, RequestBodyError } from "@/lib/server/requestBody";

export const runtime = "nodejs";

const fail = (message: string, status: number) =>
	NextResponse.json(
		{ message },
		{ status, headers: { "cache-control": "no-store" } },
	);

/**
 * Administrator-only CSV download. The backend decides the institution from the session;
 * this route forwards only the two export options and never an institution or user id.
 */
export async function POST(request: NextRequest) {
	if (!isTrustedMutationRequest(request)) return fail("Origen no permitido.", 403);
	const sessionToken = readSessionToken(request);
	if (!sessionToken) return fail("Sesión no válida.", 401);

	let input: Record<string, unknown>;
	try {
		input = JSON.parse(
			new TextDecoder().decode(await readLimitedBody(request, 1024)) || "{}",
		);
	} catch (error) {
		return error instanceof RequestBodyError
			? fail(error.message, error.status)
			: fail("JSON inválido.", 400);
	}
	if (
		!input ||
		typeof input !== "object" ||
		Array.isArray(input) ||
		(input.dataset !== "evaluations" && input.dataset !== "criteria") ||
		Object.keys(input).some(
			(key) => key !== "dataset" && key !== "includeSubmissionText",
		) ||
		(input.includeSubmissionText !== undefined &&
			typeof input.includeSubmissionText !== "boolean")
	)
		return fail("Solicitud de exportación inválida.", 400);

	try {
		const backend = await fetchBackendRest(
			request,
			"evaluations/training-export",
			{
				method: "POST",
				sessionToken,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					dataset: input.dataset,
					includeSubmissionText: input.includeSubmissionText === true,
				}),
			},
		);
		const headers = forwardedBackendHeaders(backend);
		headers.set("referrer-policy", "no-referrer");
		headers.set("x-content-type-options", "nosniff");
		if (!backend.ok) {
			headers.set("content-type", "application/json");
			const response = new NextResponse(await backend.arrayBuffer(), {
				status: backend.status,
				headers,
			});
			if (backend.status === 401) clearSessionCookie(response);
			return response;
		}
		headers.set("content-type", "text/csv; charset=utf-8");
		const disposition = backend.headers.get("content-disposition");
		// Accept only the exact filename shape the backend produces.
		headers.set(
			"content-disposition",
			disposition &&
				/^attachment; filename="aura-grade-(evaluations|criteria)-\d{4}-\d{2}-\d{2}\.csv"$/.test(
					disposition,
				)
				? disposition
				: `attachment; filename="aura-grade-${input.dataset}.csv"`,
		);
		return new NextResponse(await backend.arrayBuffer(), { status: 200, headers });
	} catch {
		return fail("No fue posible generar la exportación. Intenta más tarde.", 503);
	}
}
