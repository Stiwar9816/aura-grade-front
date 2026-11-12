import { NextRequest, NextResponse } from "next/server";
import { proxyAuthenticatedRest } from "@/lib/server/authenticatedRestProxy";

export const runtime = "nodejs";

const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

// The institution comes from the session; only an optional course filter is forwarded.
export const GET = (request: NextRequest) => {
	const params = new URL(request.url).searchParams;
	const courseId = params.get("courseId");
	if ([...params.keys()].some((key) => key !== "courseId") || (courseId && !UUID.test(courseId)))
		return NextResponse.json(
			{ message: "Consulta inválida." },
			{ status: 400, headers: { "cache-control": "no-store" } },
		);
	return proxyAuthenticatedRest(
		request,
		`evaluations/grading-insights${courseId ? `?courseId=${courseId}` : ""}`,
		{ method: "GET" },
	);
};
