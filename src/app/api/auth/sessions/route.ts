import {NextRequest} from "next/server";
import {proxyAuthenticatedRest} from "@/lib/server/authenticatedRestProxy";

export async function GET(request: NextRequest) {
	return proxyAuthenticatedRest(request, "auth/sessions", {method: "GET"});
}
