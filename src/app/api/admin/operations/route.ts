import {NextRequest} from "next/server";
import {proxyAuthenticatedRest} from "@/lib/server/authenticatedRestProxy";

export function GET(request: NextRequest) {
	return proxyAuthenticatedRest(request, "operations/summary", {method: "GET"});
}
