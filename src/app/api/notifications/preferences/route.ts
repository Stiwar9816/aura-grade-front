import {NextRequest} from "next/server";
import {proxyAuthenticatedRest} from "@/lib/server/authenticatedRestProxy";

export const GET = (request: NextRequest) =>
	proxyAuthenticatedRest(request, "notifications/preferences", {method: "GET"});

export const PATCH = (request: NextRequest) =>
	proxyAuthenticatedRest(request, "notifications/preferences", {method: "PATCH"});
