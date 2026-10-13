import {NextRequest} from "next/server";
import {proxyAuthenticatedRest} from "@/lib/server/authenticatedRestProxy";

type RouteContext = {params: Promise<{assignmentId: string}>};

export async function GET(request: NextRequest, context: RouteContext) {
	const {assignmentId} = await context.params;
	return proxyAuthenticatedRest(
		request,
		`notifications/assignments/${encodeURIComponent(assignmentId)}/reminder-preview`,
		{method: "GET"},
	);
}
