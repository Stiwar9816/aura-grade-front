import {NextRequest} from "next/server";
import {proxyAuthenticatedRest} from "@/lib/server/authenticatedRestProxy";

export const GET = (request: NextRequest) =>
	proxyAuthenticatedRest(request, "institutions", {method: "GET"});

export const POST = (request: NextRequest) =>
	proxyAuthenticatedRest(request, "institutions", {method: "POST"});
