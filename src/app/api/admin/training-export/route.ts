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

const DATASETS = ["evaluations", "criteria", "jsonl"];
const OPTIONS = ["dataset", "includeSubmissionText", "redactPersonalData", "courseId"];
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const FILENAME =
	/^attachment; filename="aura-grade-(evaluations|criteria|training)-\d{4}-\d{2}-\d{2}\.(csv|jsonl)"$/;

const fail = (message: string, status: number) =>
	NextResponse.json(
		{ message },
		{ status, headers: { "cache-control": "no-store" } },
	);

/**
 * Administrator-only CSV/JSONL download. The backend decides the institution from the session;
 * this route forwards only the export options and never an institution or user id.
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
		!DATASETS.includes(input.dataset as string) ||
		Object.keys(input).some((key) => !OPTIONS.includes(key)) ||
		(input.includeSubmissionText !== undefined &&
			typeof input.includeSubmissionText !== "boolean") ||
		(input.redactPersonalData !== undefined &&
			typeof input.redactPersonalData !== "boolean") ||
		(input.courseId !== undefined &&
			(typeof input.courseId !== "string" || !UUID.test(input.courseId)))
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
					// Redaction stays on unless the administrator turned it off explicitly.
					redactPersonalData: input.redactPersonalData !== false,
					...(input.courseId ? { courseId: input.courseId } : {}),
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
		const jsonl = input.dataset === "jsonl";
		headers.set(
			"content-type",
			jsonl ? "application/x-ndjson; charset=utf-8" : "text/csv; charset=utf-8",
		);
		const disposition = backend.headers.get("content-disposition");
		// Accept only the exact filename shape the backend produces.
		headers.set(
			"content-disposition",
			disposition && FILENAME.test(disposition)
				? disposition
				: `attachment; filename="aura-grade-${jsonl ? "training.jsonl" : `${input.dataset}.csv`}"`,
		);
		return new NextResponse(await backend.arrayBuffer(), { status: 200, headers });
	} catch {
		return fail("No fue posible generar la exportación. Intenta más tarde.", 503);
	}
}
