import {NextRequest} from "next/server";
import {proxyAuthenticatedRest} from "@/lib/server/authenticatedRestProxy";

export const PATCH = (request: NextRequest) =>
	proxyAuthenticatedRest(request, "notifications/read-all", {method: "PATCH"});
