import {NextRequest} from "next/server";
import {proxyAuthenticatedRest} from "@/lib/server/authenticatedRestProxy";

type RouteContext = {params: Promise<{id: string}>};

export async function PATCH(request: NextRequest, context: RouteContext) {
	const {id} = await context.params;
	return proxyAuthenticatedRest(
		request,
		`notifications/${encodeURIComponent(id)}/read`,
		{method: "PATCH"},
	);
}
