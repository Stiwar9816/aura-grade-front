import {NextRequest} from "next/server";
import {proxyAuthenticatedRest} from "@/lib/server/authenticatedRestProxy";

export async function POST(request: NextRequest, context: {params: Promise<{id: string}>}) {
	const {id} = await context.params;
	return proxyAuthenticatedRest(request, `operations/submissions/${encodeURIComponent(id)}/retry`, {method: "POST"});
}
