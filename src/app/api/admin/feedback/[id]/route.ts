import {NextRequest} from "next/server";
import {proxyAuthenticatedRest} from "@/lib/server/authenticatedRestProxy";

export async function PATCH(request: NextRequest, context: {params: Promise<{id: string}>}) {
	const {id} = await context.params;
	return proxyAuthenticatedRest(request, `feedback/admin/${encodeURIComponent(id)}`, {method: "PATCH"});
}
