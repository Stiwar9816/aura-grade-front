import { NextRequest, NextResponse } from "next/server";
import { proxyAuthenticatedRest } from "@/lib/server/authenticatedRestProxy";

const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

type RouteContext = { params: Promise<{ assignmentId: string }> };

/** Teacher-only JSON with the published grades keyed by RA, for the SGA browser extension. */
export async function POST(request: NextRequest, context: RouteContext) {
	const { assignmentId } = await context.params;
	if (!UUID.test(assignmentId))
		return NextResponse.json(
			{ error: "Tarea no válida." },
			{ status: 400, headers: { "cache-control": "no-store" } },
		);
	return proxyAuthenticatedRest(
		request,
		`assignments/${assignmentId}/sga-grades`,
		{ method: "POST" },
	);
}
