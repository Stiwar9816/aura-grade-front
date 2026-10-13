import {NextRequest} from "next/server";
import {proxyAuthenticatedRest} from "@/lib/server/authenticatedRestProxy";

export function GET(request: NextRequest) {
	return proxyAuthenticatedRest(request, "onboarding", {method: "GET"});
}

export function PATCH(request: NextRequest) {
	return proxyAuthenticatedRest(request, "onboarding", {method: "PATCH"});
}
