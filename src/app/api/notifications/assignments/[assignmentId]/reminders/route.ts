import {NextRequest} from "next/server";
import {proxyAuthenticatedRest} from "@/lib/server/authenticatedRestProxy";

type RouteContext = {params: Promise<{assignmentId: string}>};

export async function POST(request: NextRequest, context: RouteContext) {
	const {assignmentId} = await context.params;
	return proxyAuthenticatedRest(
		request,
		`notifications/assignments/${encodeURIComponent(assignmentId)}/reminders`,
		{method: "POST"},
	);
}
