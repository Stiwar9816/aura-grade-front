import {NextRequest} from "next/server";
import {proxyAuthenticatedRest} from "@/lib/server/authenticatedRestProxy";

export function GET(request: NextRequest) {
	return proxyAuthenticatedRest(request, "feedback/mine", {method: "GET"});
}

export function POST(request: NextRequest) {
	return proxyAuthenticatedRest(request, "feedback", {method: "POST"});
}
